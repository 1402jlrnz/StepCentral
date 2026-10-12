import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import CheckoutSteps from './CheckoutSteps'
import { useSelector } from 'react-redux'
import { formatPrice } from '../Utils/helpers'
import './Checkout.css'

const ConfirmOrder = () => {
    let navigate = useNavigate();
    const { cartItems, shippingInfo } = useSelector(state => state.cart)
    const { user } = useSelector(state => state.auth)

    // Calculate Order Prices
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const shippingPrice = itemsPrice > 200 ? 0 : 25
    const taxPrice = Number((0.05 * itemsPrice).toFixed(2))
    const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2)

    const processToPayment = () => {
        const data = {
            itemsPrice: itemsPrice.toFixed(2),
            shippingPrice,
            taxPrice,
            totalPrice
        }

        sessionStorage.setItem('orderInfo', JSON.stringify(data))
        navigate('/payment')
    }

    return (
        <>
            <MetaData title={'Confirm Order'} />
            <div className="checkout-page">
                <div className="checkout-container">
                    <CheckoutSteps shipping confirmOrder />

                    <h1 className="checkout-title">Confirm <span>Order</span></h1>
                    <p className="checkout-subtitle">Review your delivery details and items before payment.</p>

                    <div className="row d-flex justify-content-between">
                        <div className="col-12 col-lg-8">
                            <div className="checkout-card">
                                <h3 className="checkout-card-header">Shipping Info</h3>
                                <div className="info-grid">
                                    {user && (
                                        <p>
                                            <b>Name</b>
                                            {user.name}
                                        </p>
                                    )}
                                    <p>
                                        <b>Phone</b>
                                        {shippingInfo.phoneNo}
                                    </p>
                                    <p style={{ gridColumn: '1 / -1' }}>
                                        <b>Address</b>
                                        {`${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`}
                                    </p>
                                </div>
                            </div>

                            <div className="checkout-card">
                                <h3 className="checkout-card-header">Your Cart Items</h3>

                                {cartItems.map(item => (
                                    <div className="confirm-item" key={item.product}>
                                        <img src={item.image} alt={item.name} className="confirm-item-img" />

                                        <Link to={`/product/${item.product}`} className="confirm-item-name">
                                            {item.name}
                                        </Link>

                                        <span className="confirm-item-qty">
                                            {item.quantity} × ₱{formatPrice(item.price)}
                                        </span>

                                        <span className="confirm-item-total">
                                            ₱{formatPrice(item.quantity * item.price)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col-12 col-lg-4 mt-4 mt-lg-0">
                            <div className="checkout-summary">
                                <h4>Order Summary</h4>

                                <p className="summary-line">
                                    <span>Subtotal</span>
                                    <span className="order-summary-values">₱{formatPrice(itemsPrice)}</span>
                                </p>
                                <p className="summary-line">
                                    <span>Shipping</span>
                                    <span className="order-summary-values">
                                        {shippingPrice === 0 ? 'FREE' : `₱${formatPrice(shippingPrice)}`}
                                    </span>
                                </p>
                                <p className="summary-line">
                                    <span>Tax</span>
                                    <span className="order-summary-values">₱{formatPrice(taxPrice)}</span>
                                </p>

                                <hr className="summary-divider" />

                                <p className="summary-total">
                                    <span>Total</span>
                                    <span className="order-summary-values">₱{formatPrice(totalPrice)}</span>
                                </p>

                                <hr className="summary-divider" />

                                <button id="checkout_btn" className="checkout-btn" onClick={processToPayment}>
                                    Proceed to Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ConfirmOrder
