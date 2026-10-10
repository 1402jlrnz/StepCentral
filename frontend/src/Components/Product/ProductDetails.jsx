import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'

const ProductDetails = () => {
    const [product, setProduct] = useState({})
    const [loading, setLoading] = useState(true)
    const { id } = useParams()

    const getProductDetails = async (id) => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${id}`)
            setProduct(data.product)
            setLoading(false)
        } catch (error) {
            console.log(error.response && error.response.data.message)
            setLoading(false)
        }
    }

    useEffect(() => {
        getProductDetails(id)
    }, [id])

    return (
        <>
            {loading ? <Loader /> : (
                <>
                    <MetaData title={product.name} />
                    <div className="row f-flex justify-content-around">
                        <div className="col-12 col-lg-5 img-fluid" id="product_image">
                            <img src={product.images && product.images[0] ? product.images[0].url : ''}
                                alt={product.name} height="450" width="450" />
                        </div>

                        <div className="col-12 col-lg-5 mt-5">
                            <h3>{product.name}</h3>
                            <p id="product_id">Product #{product._id}</p>

                            <hr />

                            <div className="rating-outer">
                                <div className="rating-inner" style={{ width: `${(product.ratings / 5) * 100}%` }}></div>
                            </div>
                            <span id="no_of_reviews">({product.numOfReviews} Reviews)</span>

                            <hr />

                            <p id="product_price">${product.price}</p>

                            <hr />

                            <p>{product.description}</p>

                            <hr />

                            <div className="stockCounter d-inline">
                                <span className="btn btn-outline-danger minus">-</span>

                                <input type="number" className="form-control count d-inline" value="1" readOnly />

                                <span className="btn btn-outline-success plus">+</span>
                            </div>

                            <button type="button" id="cart_btn" className="btn btn-primary d-inline ml-4"
                                disabled={product.stock === 0 ? true : false}>
                                Add to Cart
                            </button>

                            <hr />

                            <p>Status: <span id="stock_status" className={product.stock > 0 ? 'greenColor' : 'redColor'}>
                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span></p>

                            <hr />

                            <h4 className="mt-2">Seller:</h4>
                            <p id="product_seller">{product.seller}</p>

                            <hr />

                        </div>

                    </div>

                </>
            )}
        </>
    )
}

export default ProductDetails
