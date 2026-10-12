import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import { useDispatch } from 'react-redux'
import { clearCart } from '../../actions/cartActions';
import './Checkout.css'

const OrderSuccess = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        localStorage.clear();
        sessionStorage.removeItem('orderInfo')
        dispatch(clearCart());
    }, [dispatch]);

    return (
        <>
            <MetaData title={'Order Success'} />
            <div className="checkout-page">
                <div className="checkout-container">
                    <div className="success-card">
                        <div className="success-icon">
                            <i className="fa fa-check" aria-hidden="true"></i>
                        </div>

                        <h2>Order Placed!</h2>
                        <p>Your order has been placed successfully.<br />A confirmation email with your PDF receipt is on its way.</p>

                        <div className="success-actions">
                            <Link to="/orders/me" className="checkout-btn">Go to Orders</Link>
                            <Link to="/" className="checkout-btn checkout-btn-secondary">Continue Shopping</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default OrderSuccess
