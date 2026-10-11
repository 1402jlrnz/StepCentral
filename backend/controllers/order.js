const Order = require('../models/order');
const Product = require('../models/product');
const sendEmail = require('../utils/sendEmail');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create a new order   =>  /api/v1/order/new
exports.newOrder = async (req, res, next) => {
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo

    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id
    })

    // Update product stock
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
            product.stock = product.stock - item.quantity;
            await product.save({ validateBeforeSave: false });
        }
    }

    // Send order confirmation email
    try {
        const user = await req.user.populate('name email');
        const pdfBuffer = await generateOrderReceiptPDF(order, user);
        await sendEmail({
            email: user.email,
            subject: `Step Central - Order Confirmation #${order._id}`,
            message: `Hi ${user.name},\n\nThank you for your order! Your order #${order._id} has been confirmed and is being processed.\n\nOrder Total: $${order.totalPrice}\n\nA PDF receipt is attached.\n\nThank you for shopping with Step Central!`,
            attachments: [{
                filename: `receipt-${order._id}.pdf`,
                content: pdfBuffer
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
        order.orderItems.forEach((item, index) => {
            if (y > 700) {
                doc.addPage();
                y = 50;
            }
            const bgColor = index % 2 === 0 ? '#f5f5f5' : '#fff';
            doc.rect(50, y, 500, 25).fill(bgColor);
            doc.fontSize(9).fillColor('#000');
            doc.text(item.name.substring(0, 35), col1, y + 5);
            doc.text(item.quantity.toString(), col2, y + 5);
            doc.text(`$${item.price.toFixed(2)}`, col3, y + 5);
            doc.text(`$${(item.price * item.quantity).toFixed(2)}`, col4, y + 5);
            y += 25;
        });

        y += 15;

        // Totals
        doc.fontSize(10).fillColor('#000');
        doc.text(`Subtotal:`, 350, y);
        doc.text(`$${order.itemsPrice.toFixed(2)}`, 450, y);
        y += 20;
        doc.text(`Shipping:`, 350, y);
        doc.text(`$${order.shippingPrice.toFixed(2)}`, 450, y);
        y += 20;
        doc.text(`Tax (5%):`, 350, y);
        doc.text(`$${order.taxPrice.toFixed(2)}`, 450, y);
        y += 20;
        doc.fontSize(12).fillColor('#232f3e');
        doc.text(`Total:`, 350, y);
        doc.text(`$${order.totalPrice.toFixed(2)}`, 450, y);

        y += 30;

        // Payment info
        doc.fontSize(12).fillColor('#232f3e').text('Payment Information', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(10).fillColor('#000').text(`Payment ID: ${order.paymentInfo.id || 'N/A'}`);
        doc.fontSize(10).fillColor('#000').text(`Status: ${order.paymentInfo.status || 'N/A'}`);
        doc.fontSize(10).fillColor('#000').text(`Paid At: ${order.paidAt ? new Date(order.paidAt).toLocaleDateString() : 'N/A'}`);

        y += 30;

        // Footer
        doc.fontSize(9).fillColor('#999').text('Thank you for shopping with Step Central!', { align: 'center' });
        doc.fontSize(9).fillColor('#999').text('Contact: support@stepcentral.com | www.stepcentral.com', { align: 'center' });

        doc.end();
    });
}

exports.myOrders = async (req, res, next) => {
    const orders = await Order.find({ user: req.user.id })
    res.status(200).json({
        success: true,
        orders
    })
}

exports.getSingleOrder = async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')
    if (!order) {
        return res.status(404).json({
            message: 'No Order found with this ID',
        })
    }
    res.status(200).json({
        success: true,
        order
    })
}

exports.allOrders = async (req, res, next) => {
    const orders = await Order.find()
    let totalAmount = 0;

    orders.forEach(order => {
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
}

exports.deleteOrder = async (req, res, next) => {
    const order = await Order.findByIdAndDelete(req.params.id)

    if (!order) {
        return res.status(400).json({
            message: 'No Order found with this ID',
        })
    }
    res.status(200).json({
        success: true
    })
}

exports.updateOrder = async (req, res, next) => {
    const order = await Order.findById(req.params.id)

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

    // Update stock when order is delivered
    if (req.body.status === 'Delivered' && order.orderStatus !== 'Delivered') {
        order.orderItems.forEach(async item => {
            await updateStock(item.product, item.quantity)
        })
    }

    const oldStatus = order.orderStatus;
    order.orderStatus = req.body.status

    if (req.body.status === 'Delivered') {
        order.deliveredAt = Date.now()
    }

    await order.save()

    // Send status update email
    if (oldStatus !== req.body.status) {
        try {
            const user = await order.populate('user');
            await sendEmail({
                email: user.user.email,
                subject: `Step Central - Order Status Update #${order._id}`,
                message: `Hi ${user.user.name},\n\nYour order #${order._id} status has been updated from "${oldStatus}" to "${req.body.status}".\n\n${req.body.status === 'Delivered' ? 'Your order has been delivered! Thank you for shopping with us.' : ''}\n\nTrack your order: http://localhost:5173/order/${order._id}\n\nThank you for shopping with Step Central!`
            });
        } catch (emailError) {
            console.error('Failed to send status update email:', emailError);
        }
    }

    res.status(200).json({
        success: true,
    })
}

async function updateStock(id, quantity) {
    const product = await Product.findById(id);
    if (product) {
        product.stock = product.stock - quantity;
        await product.save({ validateBeforeSave: false });
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
exports.productSales = async (req, res, next) => {
    const productSales = await Order.aggregate([
        { $unwind: "$orderItems" },
        {
            $group: {
                _id: "$orderItems.name",
                totalQuantity: { $sum: "$orderItems.quantity" },
                totalRevenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
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