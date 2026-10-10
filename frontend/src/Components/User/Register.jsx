import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { register, firebaseLogin, clearErrors } from '../../actions/userActions'
import { firebaseAuth, isFirebaseConfigured } from '../../firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'

const Register = () => {
    const dispatch = useDispatch()
    const { isAuthenticated, error } = useSelector(state => state.auth);
    const [user, setUser] = useState({
        name: '',
        email: '',
        password: '',
    })

    const { name, email, password } = user;

    const [avatar, setAvatar] = useState('')
    const [avatarPreview, setAvatarPreview] = useState('/images/default_avatar.jpg')

    let navigate = useNavigate()
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/')
        }

        if (error) {
            toast.error(error, {
                position: 'bottom-right'
            });
            dispatch(clearErrors());

        }

    }, [error, navigate, isAuthenticated, dispatch])

    const submitHandler = (e) => {
        e.preventDefault();

        const userData = { name, email, password, avatar }

        dispatch(register(userData))
    }

    // Register with Firebase Authentication (email + password)
    const firebaseRegisterHandler = async (e) => {
        e.preventDefault();

        if (!isFirebaseConfigured) {
            toast.error('Firebase is not configured yet. Add VITE_FIREBASE_* keys to frontend/.env', {
                position: 'bottom-right'
            });
            return
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
            const idToken = await userCredential.user.getIdToken()
            dispatch(firebaseLogin(idToken, name))
            toast.success('Registered with Firebase!', {
                position: 'bottom-right'
            })
        } catch (err) {
            toast.error(err.message, {
                position: 'bottom-right'
            })
        }
    }

    const onChange = e => {
        if (e.target.name === 'avatar') {

            const reader = new FileReader();

            reader.onload = () => {
                if (reader.readyState === 2) {
                    setAvatarPreview(reader.result)
                    setAvatar(reader.result)
                }
            }

            reader.readAsDataURL(e.target.files[0])

        } else {
            setUser({ ...user, [e.target.name]: e.target.value })
        }
    }

    return (
        <>

            <MetaData title={'Register User'} />

            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler}>
                        <h1 className="mb-3">Register</h1>

                        <div className="form-group">
                            <label htmlFor="name_field">Name</label>
                            <input
                                type="text"
                                id="name_field"
                                className="form-control"
                                name='name'
                                value={name}
                                onChange={onChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email_field">Email</label>
                            <input
                                type="email"
                                id="email_field"
                                className="form-control"
                                name='email'
                                value={email}
                                onChange={onChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password_field">Password</label>
                            <input
                                type="password"
                                id="password_field"
                                className="form-control"
                                name='password'
                                value={password}
                                onChange={onChange}
                            />
                        </div>

                        <div className='form-group'>
                            <label htmlFor='avatar_upload'>Avatar</label>
                            <div className='d-flex align-items-center'>
                                <div>
                                    <figure className='avatar mr-3 item-rtl'>
                                        <img
                                            src={avatarPreview}
                                            className='rounded-circle'
                                            alt='Avatar Preview'
                                        />
                                    </figure>
                                </div>
                                <div className='custom-file'>
                                    <input
                                        type='file'
                                        name='avatar'
                                        className='custom-file-input'
                                        id='customFile'
                                        accept="image/*"
                                        onChange={onChange}
                                    />
                                    <label className='custom-file-label' htmlFor='customFile'>
                                        Choose Avatar
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button
                            id="register_button"
                            type="submit"
                            className="btn btn-block py-3"
                        >
                            REGISTER
                        </button>

                        <hr />
                        <button
                            id="firebase_register_button"
                            type="button"
                            className="btn btn-block py-2 btn-outline-danger"
                            onClick={firebaseRegisterHandler}
                        >
                            <i className="fa fa-google mr-2"></i> REGISTER WITH FIREBASE
                        </button>
                    </form>
                </div>
            </div>

        </>
    )
}

export default Register
