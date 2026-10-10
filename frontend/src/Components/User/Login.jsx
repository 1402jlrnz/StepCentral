import React, { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

import Loader from '../Layout/Loader'
import MetaData from '../Layout/MetaData';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { login, firebaseLogin, clearErrors } from '../../actions/userActions'
import { firebaseAuth, isFirebaseConfigured, googleProvider, facebookProvider, signInWithSocial } from '../../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

// YUP validation schema
const loginSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email format')
        .required('Email is required'),
    password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters')
})

const Login = () => {
    const { isAuthenticated, error, loading } = useSelector(state => state.auth)
    let navigate = useNavigate()
    let location = useLocation()
    const dispatch = useDispatch()

    const redirect = location.search ? new URLSearchParams(location.search).get('redirect') : ''

    // Formik submit handler
    const onSubmit = (values, { setSubmitting }) => {
        dispatch(login(values.email, values.password))
        setSubmitting(false)
    }

    // Login with Firebase Authentication (email + password)
    const firebaseLoginHandler = async (e, formikHelpers) => {
        e.preventDefault();

        if (!isFirebaseConfigured) {
            toast.error('Firebase is not configured yet. Add VITE_FIREBASE_* keys to frontend/.env', {
                position: 'bottom-right'
            });
            formikHelpers.setSubmitting(false)
            return
        }

        const { email, password } = formikHelpers.values;
        try {
            const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password)
            const idToken = await userCredential.user.getIdToken()
            dispatch(firebaseLogin(idToken))
        } catch (err) {
            toast.error(err.message, { position: 'bottom-right' })
        } finally {
            formikHelpers.setSubmitting(false)
        }
    }

    // Social login handlers
    const socialLoginHandler = async (provider, formikHelpers) => {
        if (!isFirebaseConfigured) {
            toast.error('Firebase is not configured yet', { position: 'bottom-right' });
            formikHelpers.setSubmitting(false)
            return
        }
        try {
            const userCredential = await signInWithSocial(provider)
            const idToken = await userCredential.user.getIdToken()
            dispatch(firebaseLogin(idToken, userCredential.user.displayName))
        } catch (err) {
            toast.error(err.message, { position: 'bottom-right' })
        } finally {
            formikHelpers.setSubmitting(false)
        }
    }

    const googleLoginHandler = (e, formikHelpers) => { e.preventDefault(); socialLoginHandler(googleProvider, formikHelpers) }
    const facebookLoginHandler = (e, formikHelpers) => { e.preventDefault(); socialLoginHandler(facebookProvider, formikHelpers) }

    useEffect(() => {
        if (isAuthenticated && redirect === 'shipping') {
            navigate(`/${redirect}`)
        }
        else if (isAuthenticated)
            navigate('/')
        if (error) {
            toast.error(error, { position: 'bottom-right' });
            dispatch(clearErrors());
        }
    }, [error, isAuthenticated, dispatch, navigate, redirect])

    return (
        <>
            {loading ? <Loader /> : (
                <>
                    <MetaData title={'Login'} />
                    <div className="row wrapper">
                        <div className="col-10 col-lg-5">
                            <Formik
                                initialValues={{ email: '', password: '' }}
                                validationSchema={loginSchema}
                                onSubmit={onSubmit}
                            >
                                {({ errors, touched, isSubmitting, setSubmitting }) => (
                                    <Form className="shadow-lg">
                                        <h1 className="mb-3">Login</h1>
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

                                        <Link to="/password/forgot" className="float-right mb-4">Forgot Password?</Link>

                                        <button
                                            id="login_button"
                                            type="submit"
                                            className="btn btn-block py-3"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'LOGGING IN...' : 'LOGIN'}
                                        </button>

                                        <hr />
                                        <button
                                            id="firebase_login_button"
                                            type="button"
                                            className="btn btn-block py-2 btn-outline-danger"
                                            onClick={(e) => firebaseLoginHandler(e, { setSubmitting })}
                                            disabled={isSubmitting}
                                        >
                                            <i className="fa fa-google mr-2"></i> LOGIN WITH FIREBASE
                                        </button>

                                        <hr />
                                        {isFirebaseConfigured && (
                                            <>
                                                <button
                                                    id="google_login_button"
                                                    type="button"
                                                    className="btn btn-block py-2 btn-outline-primary"
                                                    onClick={(e) => googleLoginHandler(e, { setSubmitting })}
                                                    disabled={isSubmitting}
                                                >
                                                    <i className="fa fa-google mr-2"></i> CONTINUE WITH GOOGLE
                                                </button>
                                                <button
                                                    id="facebook_login_button"
                                                    type="button"
                                                    className="btn btn-block py-2 btn-primary mt-2"
                                                    onClick={(e) => facebookLoginHandler(e, { setSubmitting })}
                                                    disabled={isSubmitting}
                                                >
                                                    <i className="fa fa-facebook mr-2"></i> CONTINUE WITH FACEBOOK
                                                </button>
                                            </>
                                        )}

                                        <Link to="/register" className="float-right mt-3">New User?</Link>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
export default Login