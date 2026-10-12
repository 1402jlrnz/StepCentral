import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../actions/userActions'
import { logout as clearSession, getUser } from '../Utils/helpers'

import Search from './Search'
export const Header = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth)
    const { cartItems } = useSelector(state => state.cart)
    const [dropdownOpen, setDropdownOpen] = useState(false);
    let navigate = useNavigate()

    const currentUser = (user && (user._id || user.name)) ? user : getUser();

    const logoutHandler = () => {
        setDropdownOpen(false);
        dispatch(logout());
        clearSession(() => { })
        toast.success('Logged out', {
            position: 'bottom-right'
        });
        navigate('/')
    }

    return (
        <>
            <nav className="navbar row">
                <div className="col-12 col-md-3">
                    <div className="navbar-brand">
                        <Link to="/">
                            <span style={{ fontSize: '1.6rem', fontWeight: 'bold', textDecoration: 'none' }}>
                                <span style={{ color: '#ff3b3b' }}>Step</span>
                                <span style={{ color: '#ffffff' }}>Central</span>
                            </span>
                        </Link>

                    </div>

                </div>
                <Search />
                <div className="col-12 col-md-3 mt-4 mt-md-0 text-center">

                    {currentUser ? (<div className="ml-4 dropdown d-inline">
                        <Link
                            to="#!"
                            className="btn dropdown-toggle text-white mr-4"
                            type="button"
                            id="dropDownMenuButton"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded={dropdownOpen}
                            onClick={(e) => { e.preventDefault(); setDropdownOpen(!dropdownOpen); }}
                        >
                            <figure className="avatar avatar-nav">
                                <img
                                    src={currentUser.avatar && (currentUser.avatar.url || currentUser.avatar.secure_url)}
                                    alt={currentUser && currentUser.name}
                                    className="rounded-circle"
                                />
                            </figure>
                            <span>{currentUser && currentUser.name}</span>
                        </Link>

                        <div className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`} aria-labelledby="dropDownMenuButton">
                            {currentUser && currentUser.role === 'admin' && (
                                <>
                                    <Link className="dropdown-item" to="/dashboard" onClick={() => setDropdownOpen(false)}>Dashboard</Link>
                                    <Link className="dropdown-item" to="/admin/products" onClick={() => setDropdownOpen(false)}>All Products</Link>
                                    <Link className="dropdown-item" to="/admin/product" onClick={() => setDropdownOpen(false)}>Create Product</Link>
                                </>
                            )}
                            <Link className="dropdown-item" to="/orders/me" onClick={() => setDropdownOpen(false)}>Orders</Link>
                            <Link className="dropdown-item" to="/me" onClick={() => setDropdownOpen(false)}>Profile</Link>

                            <Link
                                className="dropdown-item text-danger" to="/"
                                onClick={logoutHandler}
                            >
                                Logout
                            </Link>
                        </div>
                    </div>) : <Link to="/login" className="btn ml-4" id="login_btn">Login</Link>}

                    <Link to="/cart" style={{ textDecoration: 'none' }} className="cart-link">
                        <span id="cart" className="ml-3">
                            <i className="fa fa-shopping-cart" aria-hidden="true"></i>
                        </span>
                        <span className="ml-1" id="cart_count">{cartItems ? cartItems.length : null}</span>
                    </Link>
                </div>

            </nav>
        </>
    )
}
