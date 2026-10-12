import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import MetaData from '../Layout/MetaData'
import CheckoutSteps from './CheckoutSteps'
import { useDispatch, useSelector } from 'react-redux'
import { createOrder, clearErrors } from '../../actions/orderActions'
import { formatPrice } from '../Utils/helpers'
import './Checkout.css'

const Payment = () => {
    const dispatch = useDispatch();
    const { cartItems, shippingInfo } = useSelector(state => state.cart)
    const { error } = useSelector(state => state.newOrder)
    let navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState('COD')
    const [gcashNumber, setGcashNumber] = useState('')
    const [gcashName, setGcashName] = useState('')

    useEffect(() => {
        if (error) {
            console.log(error)
            dispatch(clearErrors())
        }

    }, [dispatch, error])

    const orderInfo = JSON.parse(sessionStorage.getItem('orderInfo'));

    const submitHandler = async (e) => {
        e.preventDefault();
        document.querySelector('#pay_btn').disabled = true;

        const isCOD = paymentMethod === 'COD'
        const paymentInfo = isCOD
            ? {
                id: `COD-${Date.now()}`,
                status: 'pending',
                method: 'COD'
            }
            : {
                id: `GCASH-${Date.now()}`,
                status: 'succeeded',
                method: 'GCash'
            }

        const order = {
            orderItems: cartItems,
            shippingInfo,
            itemsPrice: orderInfo ? orderInfo.itemsPrice : 0,
            shippingPrice: orderInfo ? orderInfo.shippingPrice : 0,
            taxPrice: orderInfo ? orderInfo.taxPrice : 0,
            totalPrice: orderInfo ? orderInfo.totalPrice : 0,
            paymentInfo
        };
        dispatch(createOrder(order))
        navigate('/success')
    }

    return (
        <>
            <MetaData title={'Payment'} />
            <div className="checkout-page">
                <div className="checkout-container">
                    <CheckoutSteps shipping confirmOrder payment />

                    <div className="row justify-content-center">
                        <div className="col-12 col-lg-6">
                            <div className="checkout-card">
                                <h1 className="checkout-title" style={{ fontSize: '1.5rem' }}>Payment Method</h1>
                                <p className="checkout-subtitle" style={{ marginBottom: '1.5rem' }}>
                                    Choose how you'd like to pay.
                                </p>

                                <form onSubmit={submitHandler}>
                                    <div className="payment-options">
                                        {/* Cash on Delivery */}
                                        <label className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value="COD"
                                                checked={paymentMethod === 'COD'}
                                                onChange={() => setPaymentMethod('COD')}
                                            />
                                            <div className="payment-option-header">
                                                <span className="payment-option-icon">
                                                    <i className="fa fa-money" aria-hidden="true"></i>
                                                </span>
                                                <span className="payment-option-text">
                                                    <span className="payment-option-title">Cash on Delivery</span>
                                                    <span className="payment-option-desc">Pay with cash when your order arrives</span>
                                                </span>
                                                <span className="payment-option-radio"></span>
                                            </div>

                                            {paymentMethod === 'COD' && (
                                                <div className="payment-panel">
                                                    <div className="payment-note">
                                                        <i className="fa fa-info-circle" aria-hidden="true"></i>
                                                        <span>Our courier will collect the exact amount in cash upon delivery. No advance payment needed.</span>
                                                    </div>
                                                </div>
                                            )}
                                        </label>

                                        {/* GCash */}
                                        <label className={`payment-option ${paymentMethod === 'GCash' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value="GCash"
                                                checked={paymentMethod === 'GCash'}
                                                onChange={() => setPaymentMethod('GCash')}
                                            />
                                            <div className="payment-option-header">
                                                <span className="payment-option-icon gcash">
                                                    <i className="fa fa-mobile" aria-hidden="true"></i>
                                                </span>
                                                <span className="payment-option-text">
                                                    <span className="payment-option-title">GCash</span>
                                                    <span className="payment-option-desc">Pay instantly with your GCash wallet</span>
                                                </span>
                                                <span className="payment-option-radio"></span>
                                            </div>

                                            {paymentMethod === 'GCash' && (
                                                <div className="payment-panel">
                                                    <div className="payment-note">
                                                        <i className="fa fa-info-circle" aria-hidden="true"></i>
                                                        <span>Send the exact amount to <b>Step Central</b> (0917 555 1234). Enter your GCash details below for verification.</span>
                                                    </div>

                                                    <div className="form-group mt-3">
                                                        <label htmlFor="gcash_name_field">GCash Account Name</label>
                                                        <input
                                                            type="text"
                                                            id="gcash_name_field"
                                                            className="form-control"
                                                            placeholder="Juan Dela Cruz"
                                                            value={gcashName}
                                                            onChange={(e) => setGcashName(e.target.value)}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label htmlFor="gcash_number_field">GCash Number</label>
                                                        <input
                                                            type="tel"
                                                            id="gcash_number_field"
                                                            className="form-control"
                                                            placeholder="09XX XXX XXXX"
                                                            value={gcashNumber}
                                                            onChange={(e) => setGcashNumber(e.target.value)}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="payment-amount">
                                                        <span>Amount to pay</span>
                                                        <span>₱{formatPrice(orderInfo && orderInfo.totalPrice)}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </label>
                                    </div>

                                    <button
                                        id="pay_btn"
                                        type="submit"
                                        className="checkout-btn"
                                    >
                                        {paymentMethod === 'COD'
                                            ? 'Place Order'
                                            : `Pay ₱${formatPrice(orderInfo && orderInfo.totalPrice)} with GCash`}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Payment
