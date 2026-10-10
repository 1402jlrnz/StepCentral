import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import { getProductDetails, createReview, getProductReviews, clearErrors } from '../../actions/productActions'

const ProductDetails = () => {
    const dispatch = useDispatch()
    const { product: productDetails, loading: productDetailsLoading } = useSelector(state => state.productDetails)
    const { user } = useSelector(state => state.auth)
    const { reviews, loading: reviewsLoading } = useSelector(state => state.productReviews)
    const { success: reviewSuccess, loading: reviewLoading } = useSelector(state => state.newReview)

    const { id } = useParams()

    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [hoverRating, setHoverRating] = useState(0)

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

    useEffect(() => {
        if (reviewSuccess) {
            dispatch(clearErrors())
            setRating(0)
            setComment('')
        }
    }, [dispatch, reviewSuccess])

    const stars = [1, 2, 3, 4, 5]

    return (
        <>
            {(productDetailsLoading || reviewsLoading) ? <Loader /> : (
                <>
                    <MetaData title={productDetails.name} />
                    <div className="row f-flex justify-content-around">
                        <div className="col-12 col-lg-5 img-fluid" id="product_image">
                            <img src={productDetails.images && productDetails.images[0] ? productDetails.images[0].url : ''}
                                alt={productDetails.name} height="450" width="450" />
                        </div>

                        <div className="col-12 col-lg-5 mt-5">
                            <h3>{productDetails.name}</h3>
                            <p id="product_id">Product #{productDetails._id}</p>

                            <hr />

                            <div className="rating-outer">
                                <div className="rating-inner" style={{ width: `${(productDetails.ratings / 5) * 100}%` }}></div>
                            </div>
                            <span id="no_of_reviews">({productDetails.numOfReviews} Reviews)</span>

                            <hr />

                            <p id="product_price">${productDetails.price}</p>

                            <hr />

                            <p>{productDetails.description}</p>

                            <hr />

                            <div className="stockCounter d-inline">
                                <span className="btn btn-outline-danger minus">-</span>

                                <input type="number" className="form-control count d-inline" value="1" readOnly />

                                <span className="btn btn-outline-success plus">+</span>
                            </div>

                            <button type="button" id="cart_btn" className="btn btn-primary d-inline ml-4"
                                disabled={productDetails.stock === 0 ? true : false}>
                                Add to Cart
                            </button>

                            <hr />

                            <p>Status: <span id="stock_status" className={productDetails.stock > 0 ? 'greenColor' : 'redColor'}>
                                {productDetails.stock > 0 ? 'In Stock' : 'Out of Stock'}</span></p>

                            <hr />

                            <h4 className="mt-2">Seller:</h4>
                            <p id="product_seller">{productDetails.seller}</p>

                            <hr />

                        </div>

                    </div>

                    {/* Reviews Section */}
                    <div className="container mt-5">
                        <h3 className="mb-4">Customer Reviews</h3>

                        {/* Write a Review */}
                        {user && (
                            <div className="card mb-4">
                                <div className="card-header bg-light">
                                    <h4>Write a Review</h4>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={submitReview}>
                                        <div className="form-group mb-3">
                                            <label>Your Rating</label>
                                            <div className="star-rating">
                                                {stars.map(star => (
                                                    <span
                                                        key={star}
                                                        className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                                                        onClick={() => setRating(star)}
                                                        onMouseEnter={() => setHoverRating(star)}
                                                        onMouseLeave={() => setHoverRating(0)}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="form-group mb-3">
                                            <label>Your Review</label>
                                            <textarea
                                                className="form-control"
                                                rows="4"
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder="Share your experience with this product..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={reviewLoading}
                                        >
                                            {reviewLoading ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {!user && (
                            <div className="alert alert-info mb-4">
                                <a href="/login">Login</a> to write a review
                            </div>
                        )}

                        {/* Reviews List */}
                        <div className="reviews-list">
                            {reviews.length === 0 ? (
                                <p className="text-muted">No reviews yet. Be the first to review!</p>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review._id} className="card mb-3 review-card">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between mb-2">
                                                <div>
                                                    <strong>{review.name}</strong>
                                                    <div className="review-rating">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i} className={i < review.rating ? 'text-warning' : 'text-muted'}>★</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <small className="text-muted">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </small>
                                            </div>
                                            <p className="mb-0">{review.comment}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </>
            )}
        </>
    )
}

export default ProductDetails