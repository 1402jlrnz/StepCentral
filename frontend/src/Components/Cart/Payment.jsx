import React, { useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import MetaData from '../Layout/MetaData'
import CheckoutSteps from './CheckoutSteps'
import { useDispatch, useSelector } from 'react-redux'
import { createOrder, clearErrors } from '../../actions/orderActions'

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
            <CheckoutSteps shipping confirmOrder payment />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler}>
                        <h1 className="mb-4">Card Info</h1>
                        <div className="form-group">
                            <label htmlFor="card_num_field">Card Number</label>
                            <input
                                type="text"
                                id="card_num_field"
                                className="form-control"

                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="card_exp_field">Card Expiry</label>
                            <input
                                type="text"
                                id="card_exp_field"
                                className="form-control"

                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="card_cvc_field">Card CVC</label>
                            <input
                                type="text"
                                id="card_cvc_field"
                                className="form-control"

                            />
                        </div>
                        <button
                            id="pay_btn"
                            type="submit"
                            className="btn btn-block py-3"
                        >
                            Pay {` - ${orderInfo && orderInfo.totalPrice}`}
                        </button>

                    </form>
                </div>
            </div>

        </>
    )
}

export default Payment