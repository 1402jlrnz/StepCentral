import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";
import MetaData from '../Layout/MetaData'
import CheckoutSteps from './CheckoutSteps'
import { useDispatch, useSelector } from 'react-redux'
import { saveShippingInfo } from '../../actions/cartActions'
import './Checkout.css'

const Shipping = () => {
    const dispatch = useDispatch();
    const { shippingInfo } = useSelector(state => state.cart)

    const [address, setAddress] = useState(shippingInfo.address || '')
    const [city, setCity] = useState(shippingInfo.city || '')
    const [postalCode, setPostalCode] = useState(shippingInfo.postalCode || '')
    const [phoneNo, setPhoneNo] = useState(shippingInfo.phoneNo || '')
    const [country, setCountry] = useState(shippingInfo.country || '')
    let navigate = useNavigate();

    const submitHandler = (e) => {
        e.preventDefault()

        dispatch(saveShippingInfo({ address, city, phoneNo, postalCode, country }))
        navigate('/confirm')
    }

    return (
        <>
            <MetaData title={'Shipping Info'} />
            <div className="checkout-page">
                <div className="checkout-container">
                    <CheckoutSteps shipping />

                    <div className="row justify-content-center">
                        <div className="col-12 col-lg-6">
                            <div className="checkout-card">
                                <h1 className="checkout-title" style={{ fontSize: '1.5rem' }}>Shipping Info</h1>
                                <p className="checkout-subtitle" style={{ marginBottom: '1.5rem' }}>
                                    Where should we deliver your kicks?
                                </p>

                                <form onSubmit={submitHandler}>
                                    <div className="form-group">
                                        <label htmlFor="address_field">Address</label>
                                        <input
                                            type="text"
                                            id="address_field"
                                            className="form-control"
                                            placeholder="Street, barangay, unit"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="city_field">City / Municipality</label>
                                        <input
                                            type="text"
                                            id="city_field"
                                            className="form-control"
                                            placeholder="e.g. Quezon City"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="phone_field">Phone No</label>
                                        <input
                                            type="tel"
                                            id="phone_field"
                                            className="form-control"
                                            placeholder="09XX XXX XXXX"
                                            value={phoneNo}
                                            onChange={(e) => setPhoneNo(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="postal_code_field">Postal Code</label>
                                        <input
                                            type="text"
                                            id="postal_code_field"
                                            className="form-control"
                                            placeholder="e.g. 1100"
                                            value={postalCode}
                                            onChange={(e) => setPostalCode(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="country_field">Country</label>
                                        <select
                                            id="country_field"
                                            className="form-control"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            required
                                        >
                                            <option value="">Select Country</option>
                                            <option value="Philippines">Philippines</option>
                                            <option value="United States">United States</option>
                                            <option value="Canada">Canada</option>
                                            <option value="United Kingdom">United Kingdom</option>
                                            <option value="Australia">Australia</option>
                                            <option value="Germany">Germany</option>
                                            <option value="France">France</option>
                                            <option value="Japan">Japan</option>
                                            <option value="Singapore">Singapore</option>
                                        </select>
                                    </div>

                                    <button
                                        id="shipping_btn"
                                        type="submit"
                                        className="checkout-btn"
                                    >
                                        CONTINUE
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

export default Shipping
