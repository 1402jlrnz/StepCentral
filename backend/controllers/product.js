const Product = require('../models/product')
const cloudinary = require('cloudinary')
const APIFeatures = require('../utils/apiFeatures');

exports.newProduct = async (req, res, next) => {
    let images = []

    if (typeof req.body.images === 'string') {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }

    if (!images || images.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Please upload at least one image'
        })
    }

    let imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
        try {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: 'products',
                width: 150,
                crop: "scale",
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url
            })

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                message: 'Image upload failed'
            })
        }

    }

    req.body.images = imagesLinks

    const product = await Product.create(req.body);

    if (!product)
        return res.status(400).json({
            success: false,
            message: 'Product not created'
        })


    return res.status(201).json({
        success: true,
        product
    })
}

exports.getSingleProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }
    return res.status(200).json({
        success: true,
        product
    })
}

exports.getProducts = async (req, res) => {

    const resPerPage = 4;
    const productsCount = await Product.countDocuments();

    const apiFeatures = new APIFeatures(Product.find(), req.query).search().filter()

    // Count filtered products (before pagination is applied)
    const filteredProductsCount = await new APIFeatures(Product.find(), req.query).search().filter().query.countDocuments();

    apiFeatures.pagination(resPerPage);
    const products = await apiFeatures.query;

    if (!products)
        return res.status(400).json({ message: 'error loading products' })
    return res.status(200).json({
        success: true,
        products,
        filteredProductsCount,
        resPerPage,
        productsCount,

    })
}

exports.updateProduct = async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }
    let images = []

    if (typeof req.body.images === 'string') {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }

    // Only re-upload if new images were provided; otherwise keep old ones
    if (images && images.length > 0) {
        let imagesLinks = [];
        for (let i = 0; i < images.length; i++) {
            // Remove old images from cloudinary
            if (product.images[i]) {
                await cloudinary.v2.uploader.destroy(product.images[i].public_id);
            }
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: 'products',
                width: 150,
                crop: "scale",
            });
            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url
            })

        }
        req.body.images = imagesLinks
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindandModify: false
    })
    return res.status(200).json({
        success: true,
        product
    })
}

exports.deleteProduct = async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }

    return res.status(200).json({
        success: true,
        message: 'Product deleted'
    })
}

// Bulk delete products (checkbox selection on admin datatable)
exports.deleteProducts = async (req, res, next) => {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No products selected'
        })
    }

    const result = await Product.deleteMany({ _id: { $in: productIds } })

    if (result.deletedCount === 0) {
        return res.status(404).json({
            success: false,
            message: 'No products found to delete'
        })
    }

    return res.status(200).json({
        success: true,
        message: `${result.deletedCount} product(s) deleted`
    })
}

exports.getAdminProducts = async (req, res, next) => {

    const products = await Product.find();
    if (!products) {
        return res.status(404).json({
            success: false,
            message: 'Products not found'
        })
    }
    return res.status(200).json({
        success: true,
        products
    })

}

const filter = require('../utils/badWords');

exports.createProductReview = async (req, res, next) => {
    const { rating, comment, productId } = req.body;
    
    // Apply bad-words filter to the comment
    const cleanComment = filter.clean(comment);
    console.log('[createProductReview] original:', comment, '-> clean:', cleanComment);
    
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment: cleanComment
    }
    const product = await Product.findById(productId);
    const isReviewed = product.reviews.find(
        r => r.user.toString() === req.user._id.toString()
    )
    if (isReviewed) {
        product.reviews.forEach(review => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = cleanComment;
                review.rating = rating;
            }
        })
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length
    }
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length
    await product.save({ validateBeforeSave: false });
    if (!product)
        return res.status(400).json({
            success: false,
            message: 'review not posted'
        })
    return res.status(200).json({
        success: true
    })
}

exports.getProductReviews = async (req, res, next) => {
    const product = await Product.findById(req.query.id);
    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
}

exports.deleteReview = async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());
    const numOfReviews = reviews.length;

    const ratings = reviews.length > 0
        ? product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
        : 0

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    return res.status(200).json({
        success: true
    })
}
