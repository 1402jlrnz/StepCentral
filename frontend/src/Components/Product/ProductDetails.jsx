import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
    Box,
    Typography,
    Rating,
    Button,
    Card,
    CardContent,
    TextField,
    Grid,
    Chip,
    Divider,
    Tabs,
    Tab,
    IconButton
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import { getProductDetails, createReview, getProductReviews, clearErrors } from '../../actions/productActions'
import { addItemToCart } from '../../actions/cartActions'
import { formatPrice } from '../Utils/helpers'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductDetails = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { product: productDetails, loading: productDetailsLoading } = useSelector(state => state.productDetails)
    const { user } = useSelector(state => state.auth)
    const { reviews, loading: reviewsLoading } = useSelector(state => state.productReviews)
    const { success: reviewSuccess, loading: reviewLoading } = useSelector(state => state.newReview)

    const { id } = useParams()

    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [hoverRating, setHoverRating] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [activeTab, setActiveTab] = useState(0)

    useEffect(() => {
        dispatch(getProductDetails(id))
        dispatch(getProductReviews(id))
    }, [dispatch, id])

    const submitReview = (e) => {
        e.preventDefault()
        if (rating === 0) {
            alert('Please select a rating')
            return
        }
        if (!comment.trim()) {
            alert('Please write a review')
            return
        }
        dispatch(createReview({ rating, comment, productId: id }))
    }

    // Adding to cart requires login first
    const addToCart = () => {
        if (!user) {
            toast.info('Please login to add items to your cart', {
                position: 'bottom-right'
            })
            navigate('/login?redirect=product/' + id)
            return
        }
        dispatch(addItemToCart(id, quantity))
        toast.success(`${productDetails.name} added to cart!`, {
            position: 'bottom-right'
        })
    }

    useEffect(() => {
        if (reviewSuccess) {
            dispatch(clearErrors())
            setRating(0)
            setComment('')
        }
    }, [dispatch, reviewSuccess])

    return (
        <>
            {(productDetailsLoading || reviewsLoading) ? <Loader /> : (
                <>
                    <MetaData title={productDetails.name} />

                    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
                        {/* Back button */}
                        <IconButton
                            id="back_btn"
                            onClick={() => navigate(-1)}
                            sx={{ color: '#a1a1aa', mb: 2, border: '1px solid #262626', '&:hover': { color: '#ff3b3b', borderColor: '#ff3b3b' } }}
                        >
                            <ArrowBack />
                            <Typography sx={{ ml: 1, fontWeight: 600, fontSize: '0.9rem' }}>Back</Typography>
                        </IconButton>

                        <Card sx={{ p: { xs: 2, md: 4 } }}>
                            <Grid container spacing={4}>
                                {/* Product image */}
                                <Grid item xs={12} md={6}>
                                    <Box
                                        component="img"
                                        id="product_image"
                                        src={productDetails.images && productDetails.images[0] ? productDetails.images[0].url : ''}
                                        alt={productDetails.name}
                                        sx={{
                                            width: '100%',
                                            maxHeight: 450,
                                            objectFit: 'contain',
                                            borderRadius: 3,
                                            backgroundColor: '#0f0f0f',
                                            border: '1px solid #262626'
                                        }}
                                    />
                                </Grid>

                                {/* Product info */}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h4" fontWeight={800} gutterBottom>
                                        {productDetails.name}
                                    </Typography>
                                    <Typography id="product_id" variant="body2" color="text.secondary" gutterBottom>
                                        Product #{productDetails._id}
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2 }}>
                                        <Rating value={productDetails.ratings} precision={0.5} readOnly />
                                        <Typography id="no_of_reviews" variant="body2" color="text.secondary">
                                            ({productDetails.numOfReviews} reviews)
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ mb: 2 }} />

                                    <Typography id="product_price" variant="h4" sx={{ color: '#ff3b3b', fontWeight: 800, my: 2 }}>
                                        ₱{formatPrice(productDetails.price)}
                                    </Typography>

                                    <Divider sx={{ mb: 2 }} />

                                    {/* Quantity selector */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                        <Box className="stockCounter qty-pill">
                                            <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                                            <input type="number" className="qty-input" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
                                            <button className="qty-btn" onClick={() => setQuantity(q => Math.min(productDetails.stock, q + 1))} aria-label="Increase quantity">+</button>
                                        </Box>

                                        <Button
                                            id="cart_btn"
                                            variant="contained"
                                            size="large"
                                            onClick={addToCart}
                                            disabled={productDetails.stock === 0}
                                        >
                                            {productDetails.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                        </Button>
                                    </Box>

                                    <Typography variant="body2">
                                        Status:{' '}
                                        <Chip
                                            id="stock_status"
                                            size="small"
                                            label={productDetails.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                            sx={{
                                                fontWeight: 700,
                                                color: productDetails.stock > 0 ? '#22c55e' : '#ef4444',
                                                border: `1px solid ${productDetails.stock > 0 ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
                                                backgroundColor: 'transparent'
                                            }}
                                        />
                                    </Typography>

                                    <Typography variant="body2" sx={{ mt: 2 }}>
                                        Seller: <span id="product_seller" style={{ fontWeight: 700 }}>{productDetails.seller}</span>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Card>

                        {/* Tabs: Description & Reviews */}
                        <Box sx={{ mt: 4 }}>
                            <Tabs
                                value={activeTab}
                                onChange={(e, v) => setActiveTab(v)}
                                sx={{ borderBottom: '1px solid #262626' }}
                            >
                                <Tab label="Description" sx={{ color: '#a1a1aa', fontWeight: 700 }} />
                                <Tab label={`Reviews (${productDetails.numOfReviews})`} sx={{ color: '#a1a1aa', fontWeight: 700 }} />
                            </Tabs>

                            {/* Description tab */}
                            {activeTab === 0 && (
                                <Card sx={{ p: 3, mt: 2 }}>
                                    <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                                        {productDetails.description}
                                    </Typography>
                                </Card>
                            )}

                            {/* Reviews tab */}
                            {activeTab === 1 && (
                                <Box sx={{ mt: 2 }}>
                                    {/* Write a Review */}
                                    {user ? (
                                        <Card sx={{ p: 3, mb: 3 }}>
                                            <Typography variant="h6" sx={{ mb: 2 }}>Write a Review</Typography>
                                            <form onSubmit={submitReview}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                        Your Rating
                                                    </Typography>
                                                    <Rating
                                                        name="review_rating"
                                                        value={hoverRating || rating}
                                                        onChange={(e, v) => setRating(v)}
                                                        onChangeActive={(e, v) => setHoverRating(v)}
                                                        size="large"
                                                    />
                                                </Box>

                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={4}
                                                    label="Your Review"
                                                    placeholder="Share your experience with this product..."
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                    sx={{ mb: 2 }}
                                                />

                                                <Button variant="contained" type="submit" disabled={reviewLoading}>
                                                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                                                </Button>
                                            </form>
                                        </Card>
                                    ) : (
                                        <Card sx={{ p: 2, mb: 3, textAlign: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                <Link to="/login" sx={{ color: '#ff3b3b', fontWeight: 700 }}>Login</Link> to write a review
                                            </Typography>
                                        </Card>
                                    )}

                                    {/* Reviews list */}
                                    {reviews.length === 0 ? (
                                        <Card sx={{ p: 3, textAlign: 'center' }}>
                                            <Typography color="text.secondary">No reviews yet. Be the first to review!</Typography>
                                        </Card>
                                    ) : (
                                        reviews.map((review) => (
                                            <Card
                                                key={review._id}
                                                sx={{ p: 3, mb: 2 }}
                                                className="review-card-mui"
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Box>
                                                        <Typography fontWeight={700}>{review.name}</Typography>
                                                        <Rating value={review.rating} readOnly size="small" />
                                                    </Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2">{review.comment}</Typography>
                                            </Card>
                                        ))
                                    )}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </>
            )}
        </>
    )
}

export default ProductDetails
