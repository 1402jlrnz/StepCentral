const Order = require('../models/order');
const OrderDetail = require('../models/orderDetail');
const Product = require('../models/product');
const sendEmail = require('../utils/sendEmail');
const PDFDocument = require('pdfkit');

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

// ₱ formatter
const peso = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Restore stock for each line item (used on cancel)
async function restoreStock(items) {
    for (const item of items) {
        if (item.product && item.quantity > 0) {
            await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
        }
    }
}

// Build the itemized block used in order emails
function itemsBlock(items) {
    return items.map(i => `  • ${i.name} x ${i.quantity} — ${peso(i.price * i.quantity)}`).join('\n');
}

// Create a new order   =>  /api/v1/order/new
exports.newOrder = async (req, res, next) => {
    try {
        const {
            orderItems,
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo
        } = req.body;

        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // 1. Create the order header
        const order = await Order.create({
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo,
            paidAt: Date.now(),
            user: req.user._id
        });

        try {
            // 2. Create normalized line items (order_details style)
            await OrderDetail.insertMany(orderItems.map(item => ({
                orderId: order._id,
                product: item.product,
                name: item.name,
                image: item.image,
                quantity: item.quantity,
                price: item.price
            })));

            // 3. Decrement stock
            for (const item of orderItems) {
                await Product.updateOne(
                    { _id: item.product },
                    { $inc: { stock: -Math.abs(Number(item.quantity)) } }
                );
            }
        } catch (err) {
            // Compensate: roll the header back so we never ship an empty order
            await Order.findByIdAndDelete(order._id);
            throw err;
        }

        // 4. Populate line items for the response / email / PDF
        await order.populate('orderItems');

        // 5. Send order confirmation email with PDF receipt
        try {
            const user = req.user;
            const pdfBuffer = await generateOrderReceiptPDF(order, user);
            await sendEmail({
                email: user.email,
                subject: `Step Central - Order Confirmation #${order._id}`,
                message: `Hi ${user.name},\n\nThank you for your order! Your order #${order._id} has been confirmed and is being processed.\n\nItems:\n${itemsBlock(order.orderItems)}\n\nSubtotal: ${peso(order.itemsPrice)}\nShipping: ${peso(order.shippingPrice)}\nGrand Total: ${peso(order.totalPrice)}\n\nA PDF receipt is attached.\n\nThank you for shopping with Step Central!`,
                attachments: [{
                    filename: `receipt-${order._id}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }]
            });
        } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
            // Don't fail the order if email fails
        }

        res.status(200).json({
            success: true,
            order
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Generate PDF receipt
async function generateOrderReceiptPDF(order, user) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(24).fillColor('#232f3e').text('Step Central', { align: 'center' });
        doc.fontSize(12).fillColor('#666').text('Online Footwear Store', { align: 'center' });
        doc.moveDown();

        // Order info
        doc.fontSize(16).fillColor('#000').text('Order Receipt', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#666').text(`Order ID: ${order._id}`, { align: 'center' });
        doc.fontSize(10).fillColor('#666').text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'center' });
        doc.fontSize(10).fillColor('#666').text(`Status: ${order.orderStatus}`, { align: 'center' });
        doc.moveDown();

        // Customer info
        doc.fontSize(12).fillColor('#232f3e').text('Customer Information', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(10).fillColor('#000').text(`Name: ${user.name}`);
        doc.fontSize(10).fillColor('#000').text(`Email: ${user.email}`);
        doc.moveDown(0.3);
        doc.fontSize(10).fillColor('#000').text(`Shipping Address:`);
        doc.fontSize(10).fillColor('#000').text(`${order.shippingInfo.address}`);
        doc.fontSize(10).fillColor('#000').text(`${order.shippingInfo.city}, ${order.shippingInfo.postalCode}`);
        doc.fontSize(10).fillColor('#000').text(`${order.shippingInfo.country}`);
        doc.fontSize(10).fillColor('#000').text(`Phone: ${order.shippingInfo.phoneNo}`);
        doc.moveDown();

        // Items table header
        doc.fontSize(12).fillColor('#232f3e').text('Order Items', { underline: true });
        doc.moveDown(0.3);

        const tableTop = doc.y;
        const col1 = 50;  // Item
        const col2 = 280; // Qty
        const col3 = 330; // Price
        const col4 = 420; // Total

        doc.fontSize(9).fillColor('#fff');
        doc.rect(50, tableTop, 500, 25).fill('#232f3e');
        doc.text('Item', col1, tableTop + 5);
        doc.text('Qty', col2, tableTop + 5);
        doc.text('Price', col3, tableTop + 5);
        doc.text('Total', col4, tableTop + 5);

        // Items
        let y = tableTop + 25;
        const items = order.orderItems || [];
        items.forEach((item, index) => {
            if (y > 700) {
                doc.addPage();
                y = 50;
            }
            const bgColor = index % 2 === 0 ? '#f5f5f5' : '#fff';
            doc.rect(50, y, 500, 25).fill(bgColor);
            doc.fontSize(9).fillColor('#000');
            doc.text(item.name.substring(0, 35), col1, y + 5);
            doc.text(item.quantity.toString(), col2, y + 5);
            doc.text(peso(item.price), col3, y + 5);
            doc.text(peso(item.price * item.quantity), col4, y + 5);
            y += 25;
        });

        y += 15;

        // Totals
        doc.fontSize(10).fillColor('#000');
        doc.text(`Subtotal:`, 350, y);
        doc.text(peso(order.itemsPrice), 450, y);
        y += 20;
        doc.text(`Shipping:`, 350, y);
        doc.text(peso(order.shippingPrice), 450, y);
        y += 20;
        doc.text(`Tax (5%):`, 350, y);
        doc.text(peso(order.taxPrice), 450, y);
        y += 20;
        doc.fontSize(12).fillColor('#232f3e');
        doc.text(`Total:`, 350, y);
        doc.text(peso(order.totalPrice), 450, y);

        y += 30;

        // Payment info
        doc.fontSize(12).fillColor('#232f3e').text('Payment Information', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(10).fillColor('#000').text(`Method: ${order.paymentInfo.method || 'N/A'}`);
        doc.fontSize(10).fillColor('#000').text(`Reference: ${order.paymentInfo.reference || order.paymentInfo.id || 'N/A'}`);
        doc.fontSize(10).fillColor('#000').text(`Status: ${order.paymentInfo.status || 'N/A'}`);
        doc.fontSize(10).fillColor('#000').text(`Paid At: ${order.paidAt ? new Date(order.paidAt).toLocaleDateString() : 'N/A'}`);

        // Footer
        doc.fontSize(9).fillColor('#999').text('Thank you for shopping with Step Central!', { align: 'center', y: y + 40 });
        doc.fontSize(9).fillColor('#999').text('Contact: support@stepcentral.com | www.stepcentral.com', { align: 'center' });

        doc.end();
    });
}

exports.myOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.id }).populate('orderItems');
        res.status(200).json({
            success: true,
            orders
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getSingleOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('orderItems');
        if (!order) {
            return res.status(404).json({
                message: 'No Order found with this ID',
            })
        }
        res.status(200).json({
            success: true,
            order
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.allOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().populate('orderItems');
        let totalAmount = 0;

        orders.forEach(order => {
            totalAmount += order.totalPrice
        })

        res.status(200).json({
            success: true,
            totalAmount,
            orders
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.deleteOrder = async (req, res, next) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id)

        if (!order) {
            return res.status(400).json({
                message: 'No Order found with this ID',
            })
        }

        // Remove normalized line items too
        await OrderDetail.deleteMany({ orderId: order._id });

        res.status(200).json({
            success: true
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Admin status update   =>  PUT /api/v1/admin/order/:id
exports.updateOrder = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!ORDER_STATUSES.includes(status)) {
            return res.status(400).json({ message: 'Invalid order status' });
        }

        const order = await Order.findById(req.params.id).populate('orderItems');

        if (!order) {
            return res.status(404).json({
                message: 'No Order found with this ID',
            })
        }

        if (order.orderStatus === 'Delivered') {
            return res.status(400).json({
                message: 'You have already delivered this order',
            })
        }

        const oldStatus = order.orderStatus;

        // Cancelled -> put the stock back (it was decremented at order creation)
        if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
            await restoreStock(order.orderItems);
        }

        order.orderStatus = status;

        if (status === 'Delivered') {
            order.deliveredAt = Date.now();
            order.dateReceived = Date.now();
        }

        await order.save();

        // Send status update email with items / subtotal / grand total
        if (oldStatus !== status) {
            try {
                const user = await order.populate('user', 'name email');
                const pdfBuffer = await generateOrderReceiptPDF(order, user.user);
                await sendEmail({
                    email: user.user.email,
                    subject: `Step Central - Order Status Update #${order._id}`,
                    message: `Hi ${user.user.name},\n\nYour order #${order._id} status has been updated from "${oldStatus}" to "${status}".\n\nItems:\n${itemsBlock(order.orderItems)}\n\nSubtotal: ${peso(order.itemsPrice)}\nShipping: ${peso(order.shippingPrice)}\nTax: ${peso(order.taxPrice)}\nGrand Total: ${peso(order.totalPrice)}\n\n${status === 'Delivered' ? 'Your order has been delivered! Thank you for shopping with us.' : ''}\nTrack your order: http://localhost:5173/order/${order._id}\n\nThank you for shopping with Step Central!`,
                    attachments: [{
                        filename: `receipt-${order._id}.pdf`,
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }]
                });
            } catch (emailError) {
                console.error('Failed to send status update email:', emailError);
            }
        }

        res.status(200).json({
            success: true,
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Customer self-cancel (Pending orders only)   =>  PUT /api/v1/order/:id/cancel
exports.cancelMyOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('orderItems');

        if (!order) {
            return res.status(404).json({ message: 'No Order found with this ID' });
        }

        if (String(order.user) !== String(req.user._id)) {
            return res.status(403).json({ message: 'You can only cancel your own orders' });
        }

        if (order.orderStatus !== 'Pending') {
            return res.status(400).json({ message: `Only Pending orders can be cancelled (this order is ${order.orderStatus})` });
        }

        // Put the stock back, then mark cancelled
        await restoreStock(order.orderItems);
        order.orderStatus = 'Cancelled';
        await order.save();

        try {
            await sendEmail({
                email: req.user.email,
                subject: `Step Central - Order Cancelled #${order._id}`,
                message: `Hi ${req.user.name},\n\nYour order #${order._id} has been cancelled and its stock has been returned.\n\nItems:\n${itemsBlock(order.orderItems)}\n\nGrand Total (voided): ${peso(order.totalPrice)}\n\nSorry to see you go — you can reorder anytime.\n\nThank you for shopping with Step Central!`
            });
        } catch (emailError) {
            console.error('Failed to send cancellation email:', emailError);
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.totalOrders = async (req, res, next) => {
    const totalOrders = await Order.aggregate([
        {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }
    ])
    res.status(200).json({
        success: true,
        totalOrders
    })
}

exports.totalSales = async (req, res, next) => {
    const totalSales = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalSales: { $sum: "$totalPrice" }
            }
        }
    ])
    res.status(200).json({
        success: true,
        totalSales
    })
}

exports.customerSales = async (req, res, next) => {
    const customerSales = await Order.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userDetails'
            },
        },
        { $unwind: "$userDetails" },
        {
            $group: {
                _id: "$user",
                total: { $sum: "$totalPrice" },
                doc: { "$first": "$$ROOT" },
            }
        },
        {
            $replaceRoot: {
                newRoot: { $mergeObjects: [{ total: '$total' }, '$doc'] },
            },
        },
        {
            $project: {
                _id: 0,
                "userDetails.name": true,
                total: true,
            }
        },
        { $sort: { total: 1 } },
    ])
    res.status(200).json({
        success: true,
        customerSales
    })
}

exports.salesPerMonth = async (req, res, next) => {
    const salesPerMonth = await Order.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: "$paidAt" },
                    month: { $month: "$paidAt" }
                },
                total: { $sum: "$totalPrice" },
            },
        },
        {
            $addFields: {
                month: {
                    $let: {
                        vars: {
                            monthsInString: [, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                        },
                        in: {
                            $arrayElemAt: ['$$monthsInString', "$_id.month"]
                        }
                    }
                }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        {
            $project: {
                _id: 0,
                month: true,
                total: true,
            }
        }
    ])
    res.status(200).json({
        success: true,
        salesPerMonth
    })
}

// Sales by date range (for Quiz 2 date-range filter chart)  =>  /api/v1/admin/sales
exports.salesByDateRange = async (req, res, next) => {
    const { startDate, endDate } = req.query;

    // Build date filter on paidAt
    const match = {};
    if (startDate || endDate) {
        match.paidAt = {};
        if (startDate) match.paidAt.$gte = new Date(startDate);
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // include the whole end day
            match.paidAt.$lte = end;
        }
    }

    // Group sales by day
    const sales = await Order.aggregate([
        { $match: match },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
                total: { $sum: "$totalPrice" },
                orders: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                _id: 0,
                date: "$_id",
                total: 1,
                orders: 1
            }
        }
    ])

    // Totals for the filtered range
    const totals = sales.reduce((acc, day) => {
        acc.total += day.total;
        acc.orders += day.orders;
        return acc;
    }, { total: 0, orders: 0 })

    res.status(200).json({
        success: true,
        sales,
        totalSales: totals.total,
        totalOrders: totals.orders
    })
}

// Product sales distribution (percentage per product)
// Line items live in their own `orderdetails` collection now, so $lookup first.
exports.productSales = async (req, res, next) => {
    const productSales = await Order.aggregate([
        {
            $lookup: {
                from: 'orderdetails',
                localField: '_id',
                foreignField: 'orderId',
                as: 'items'
            }
        },
        { $unwind: "$items" },
        {
            $group: {
                _id: "$items.name",
                totalQuantity: { $sum: "$items.quantity" },
                totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
            }
        },
        {
            $group: {
                _id: null,
                totalQuantity: { $sum: "$totalQuantity" },
                items: { $push: { name: "$_id", quantity: "$totalQuantity", revenue: "$totalRevenue" } }
            }
        },
        { $unwind: "$items" },
        {
            $project: {
                name: "$items.name",
                quantity: "$items.quantity",
                revenue: "$items.revenue",
                percent: {
                    $multiply: [
                        { $divide: ["$items.quantity", "$totalQuantity"] },
                        100
                    ]
                }
            }
        },
        { $sort: { percent: -1 } }
    ])

    res.status(200).json({
        success: true,
        totalPercentage: productSales
    })
}
