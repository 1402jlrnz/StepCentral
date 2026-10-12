import React, { useEffect } from 'react'
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

        const order = {
            orderItems: cartItems,
            shippingInfo,
            itemsPrice: orderInfo ? orderInfo.itemsPrice : 0,
            shippingPrice: orderInfo ? orderInfo.shippingPrice : 0,
            taxPrice: orderInfo ? orderInfo.taxPrice : 0,
            totalPrice: orderInfo ? orderInfo.totalPrice : 0,
            paymentInfo: {
                id: 'pi_1DpdYh2eZvKYlo2CYIynhU32',
                status: 'succeeded'
            }
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
                                <h1 className="checkout-title" style={{ fontSize: '1.5rem' }}>Card Info</h1>
                                <p className="checkout-subtitle" style={{ marginBottom: '1.5rem' }}>
                                    <i className="fa fa-lock mr-2" aria-hidden="true"></i>
                                    Secure payment — your details are encrypted.
                                </p>

                                <form onSubmit={submitHandler}>
                                    <div className="form-group">
                                        <label htmlFor="card_num_field">Card Number</label>
                                        <input
                                            type="text"
                                            id="card_num_field"
                                            className="form-control"
                                            placeholder="4242 4242 4242 4242"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="card_exp_field">Card Expiry</label>
                                        <input
                                            type="text"
                                            id="card_exp_field"
                                            className="form-control"
                                            placeholder="MM / YY"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="card_cvc_field">Card CVC</label>
                                        <input
                                            type="text"
                                            id="card_cvc_field"
                                            className="form-control"
                                            placeholder="123"
                                            required
                                        />
                                    </div>

                                    <button
                                        id="pay_btn"
                                        type="submit"
                                        className="checkout-btn"
                                    >
                                        Pay {` - ₱${formatPrice(orderInfo && orderInfo.totalPrice)}`}
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
