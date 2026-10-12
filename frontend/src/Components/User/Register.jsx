import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

import MetaData from '../Layout/MetaData'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { register, firebaseLogin, clearErrors } from '../../actions/userActions'
import { firebaseAuth, isFirebaseConfigured, googleProvider, facebookProvider, signInWithSocial } from '../../firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'

// YUP validation schema
const registerSchema = Yup.object().shape({
    name: Yup.string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters'),
    email: Yup.string()
        .email('Invalid email format')
        .required('Email is required'),
    password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: Yup.string()
        .required('Please confirm your password')
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
})

const Register = () => {
    const dispatch = useDispatch()
    const { isAuthenticated, user, error } = useSelector(state => state.auth);
    const [avatar, setAvatar] = useState('')
    const [avatarPreview, setAvatarPreview] = useState('/images/default_avatar.jpg')

    let navigate = useNavigate()

    // Redirect after successful registration (mirrors Login.jsx behavior)
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'admin') {
                navigate('/dashboard')
            } else {
                navigate('/')
            }
        }
    }, [isAuthenticated, user, navigate])

    useEffect(() => {
        if (error) {
            toast.error(error, { position: 'bottom-right' });
            dispatch(clearErrors());
        }
    }, [error, dispatch])

    // Formik submit handler for standard register
    const onSubmit = (values, { setSubmitting }) => {
        const userData = { name: values.name, email: values.email, password: values.password, avatar }
        dispatch(register(userData))
        setSubmitting(false)
        toast.success('Account created successfully! Redirecting...', { position: 'bottom-right' })
    }

    // Register with Firebase Authentication (email + password)
    const firebaseRegisterHandler = async (e, formikHelpers) => {
        e.preventDefault();

        if (!isFirebaseConfigured) {
            toast.error('Firebase is not configured yet. Add VITE_FIREBASE_* keys to frontend/.env', {
                position: 'bottom-right'
            });
            formikHelpers.setSubmitting(false)
            return
        }

        const { name, email, password } = formikHelpers.values;
        try {
            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
            const idToken = await userCredential.user.getIdToken()
            dispatch(firebaseLogin(idToken, name))
            toast.success('Registered with Firebase!', { position: 'bottom-right' })
        } catch (err) {
            toast.error(err.message, { position: 'bottom-right' })
        } finally {
            formikHelpers.setSubmitting(false)
        }
    }

    // Social register handlers
    const socialRegisterHandler = async (provider, formikHelpers) => {
        if (!isFirebaseConfigured) {
            toast.error('Firebase is not configured yet', { position: 'bottom-right' });
            formikHelpers.setSubmitting(false)
            return
        }
        try {
            const userCredential = await signInWithSocial(provider)
            const idToken = await userCredential.user.getIdToken()
            dispatch(firebaseLogin(idToken, userCredential.user.displayName))
            toast.success('Registered with ' + (provider.providerId === 'google.com' ? 'Google' : 'Facebook') + '!', { position: 'bottom-right' })
        } catch (err) {
            toast.error(err.message, { position: 'bottom-right' })
        } finally {
            formikHelpers.setSubmitting(false)
        }
    }

    const googleRegisterHandler = (e, formikHelpers) => { e.preventDefault(); socialRegisterHandler(googleProvider, formikHelpers) }
    const facebookRegisterHandler = (e, formikHelpers) => { e.preventDefault(); socialRegisterHandler(facebookProvider, formikHelpers) }

    const handleAvatarChange = (e) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.readyState === 2) {
                setAvatarPreview(reader.result)
                setAvatar(reader.result)
            }
        }
        reader.readAsDataURL(e.target.files[0])
    }

    return (
        <>
            <MetaData title={'Register User'} />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <Formik
                        initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
                        validationSchema={registerSchema}
                        onSubmit={onSubmit}
                        validateOnChange={false}
                        validateOnBlur={false}
                    >
                        {({ errors, touched, isSubmitting, setSubmitting, values }) => (
                            <Form className="shadow-lg">
                                <h1 className="mb-3">Register</h1>

                                <div className="form-group">
                                    <label htmlFor="name_field">Name</label>
                                    <Field
                                        type="text"
                                        id="name_field"
                                        name="name"
                                        className={`form-control ${errors.name && touched.name ? 'is-invalid' : ''}`}
                                    />
                                    <ErrorMessage name="name" component="div" className="invalid-feedback" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email_field">Email</label>
                                    <Field
                                        type="email"
                                        id="email_field"
                                        name="email"
                                        className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
                                    />
                                    <ErrorMessage name="email" component="div" className="invalid-feedback" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password_field">Password</label>
                                    <Field
                                        type="password"
                                        id="password_field"
                                        name="password"
                                        className={`form-control ${errors.password && touched.password ? 'is-invalid' : ''}`}
                                    />
                                    <ErrorMessage name="password" component="div" className="invalid-feedback" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirm_password_field">Confirm Password</label>
                                    <Field
                                        type="password"
                                        id="confirm_password_field"
                                        name="confirmPassword"
                                        className={`form-control ${errors.confirmPassword && touched.confirmPassword ? 'is-invalid' : ''}`}
                                    />
                                    <ErrorMessage name="confirmPassword" component="div" className="invalid-feedback" />
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
                                                onChange={handleAvatarChange}
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
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'REGISTERING...' : 'REGISTER'}
                                </button>

                                <hr />
                                <button
                                    id="firebase_register_button"
                                    type="button"
                                    className="btn btn-block py-2 btn-outline-danger"
                                    onClick={(e) => firebaseRegisterHandler(e, { setSubmitting, values })}
                                    disabled={isSubmitting}
                                >
                                    <i className="fa fa-google mr-2"></i> REGISTER WITH FIREBASE
                                </button>

                                <hr />
                                {isFirebaseConfigured && (
                                    <>
                                        <button
                                            id="google_register_button"
                                            type="button"
                                            className="btn btn-block py-2 btn-outline-primary"
                                            onClick={(e) => googleRegisterHandler(e, { setSubmitting, values })}
                                            disabled={isSubmitting}
                                        >
                                            <i className="fa fa-google mr-2"></i> CONTINUE WITH GOOGLE
                                        </button>
                                        <button
                                            id="facebook_register_button"
                                            type="button"
                                            className="btn btn-block py-2 btn-primary mt-2"
                                            onClick={(e) => facebookRegisterHandler(e, { setSubmitting, values })}
                                            disabled={isSubmitting}
                                        >
                                            <i className="fa fa-facebook mr-2"></i> CONTINUE WITH FACEBOOK
                                        </button>
                                    </>
                                )}
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </>
    )
}

export default Register