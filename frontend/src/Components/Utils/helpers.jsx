import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export const getUser = () => {
    if (typeof window !== 'undefined') {
        if (sessionStorage.getItem('user')) {
            try {
                return JSON.parse(sessionStorage.getItem('user'));
            } catch (e) {
                return false;
            }
        } else {
            return false;
        }
    }
};

export const authenticate = (data, next) => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('token', JSON.stringify(data.token));
        sessionStorage.setItem('user', JSON.stringify(data.user));
    }
    if (next) next();
};

export const logout = next => {
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
    }
    if (next) next();
};

export const getToken = () => {
    if (typeof window !== 'undefined') {
        if (sessionStorage.getItem('token')) {
            try {
                return JSON.parse(sessionStorage.getItem('token'));
            } catch (e) {
                return false;
            }
        } else {
            return false;
        }
    }
};

export const errMsg = (message = '') => toast.error(message, {
    position: 'bottom-center'
});
export const successMsg = (message = '') => toast.success(message, {
    position: 'bottom-center'
});
// Format a number as Philippine Peso (₱) with thousand separators
export const formatPrice = (value) => {
    const num = Number(value) || 0;
    return num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
