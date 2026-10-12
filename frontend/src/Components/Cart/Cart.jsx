import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import { useDispatch, useSelector } from 'react-redux'
import { addItemToCart, removeItemFromCart } from '../../actions/cartActions'
import { formatPrice } from '../Utils/helpers'
import './Checkout.css'

const Cart = () => {
    const dispatch = useDispatch();
    const { cartItems } = useSelector(state => state.cart)
    const navigate = useNavigate()

    const increaseQty = (id, quantity, stock) => {
        const newQty = quantity + 1;
        if (newQty > stock) return;
        dispatch(addItemToCart(id, newQty))
    }

    const decreaseQty = (id, quantity) => {
        const newQty = quantity - 1;
        if (newQty <= 0) return;
        dispatch(addItemToCart(id, newQty))
    }

    const removeCartItemHandler = (id) => {
        dispatch(removeItemFromCart(id))
    }

    const checkoutHandler = () => {
        navigate('/login?redirect=shipping')
    }

    const totalPrice = cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0)

    return (
        <>
            <MetaData title={'Your Cart'} />

            {cartItems.length === 0 ? (
                <div className="checkout-page">
                    <div className="checkout-container">
                        <div className="cart-empty">
                            <div className="cart-empty-icon">
                                <i className="fa fa-shopping-bag" aria-hidden="true"></i>
                            </div>
                            <h2>Your Cart is Empty</h2>
                            <p>Browse our collection and find your next pair of kicks.</p>
                            <Link to="/" className="checkout-btn">
                                <i className="fa fa-arrow-left mr-2" aria-hidden="true"></i>
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="checkout-page">
                    <div className="checkout-container">
                        <h1 className="checkout-title">Your Cart</h1>
                        <p className="checkout-subtitle">
                            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} ready for checkout
                        </p>

                        <div className="row d-flex justify-content-between">
                            <div className="col-12 col-lg-8">
                                <div className="checkout-card">
                                    {cartItems.map(item => (
                                        <div className="cart-item-row" key={item.product}>
                                            <img
                                                className="cart-item-img"
                                                src={item.image}
                                                alt={item.name}
                                            />

                                            <div className="cart-item-info">
                                                <Link to={`/product/${item.product}`} className="cart-item-name">
                                                    {item.name}
                                                </Link>
                                                <p className="cart-item-stock">
                                                    {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                                                </p>
                                            </div>

                                            <span className="cart-item-price">₱{formatPrice(item.price)}</span>

                                            <div className="qty-pill">
                                                <button
                                                    type="button"
                                                    className="qty-btn"
                                                    onClick={() => decreaseQty(item.product, item.quantity)}
                                                    aria-label="Decrease quantity"
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="number"
                                                    className="qty-input"
                                                    value={item.quantity}
                                                    readOnly
                                                />
                                                <button
                                                    type="button"
                                                    className="qty-btn"
                                                    onClick={() => increaseQty(item.product, item.quantity, item.stock)}
                                                    aria-label="Increase quantity"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                className="cart-remove-btn"
                                                onClick={() => removeCartItemHandler(item.product)}
                                                aria-label="Remove item"
                                                title="Remove item"
                                            >
                                                <i className="fa fa-trash" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="col-12 col-lg-4 mt-4 mt-lg-0">
                                <div className="checkout-summary">
                                    <h4>Order Summary</h4>

                                    <p className="summary-line">
                                        <span>Subtotal</span>
                                        <span className="order-summary-values">
                                            {cartItems.reduce((acc, item) => (acc + Number(item.quantity)), 0)} (Units)
                                        </span>
                                    </p>
                                    <p className="summary-line">
                                        <span>Est. total</span>
                                        <span className="order-summary-values">₱{formatPrice(totalPrice)}</span>
                                    </p>
                                    <p className="summary-line">
                                        <span>Shipping</span>
                                        <span className="order-summary-values">Calculated at checkout</span>
                                    </p>

                                    <hr className="summary-divider" />

                                    <button id="checkout_btn" className="checkout-btn" onClick={checkoutHandler}>
                                        Proceed to Checkout
                                    </button>

                                    <Link to="/" className="checkout-btn checkout-btn-secondary mt-3">
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Cart
