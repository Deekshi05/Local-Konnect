import { Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import api from './api';
import { useState, useEffect } from 'react';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';

function ProtectedRoute({ children }) {
    const [authorised, setAuthorised] = useState(null);

    useEffect(() => {
        auth().catch(() => setAuthorised(false));
    }, []);

    const refresh = async () => {
        const ref = localStorage.getItem(REFRESH_TOKEN);
        if (!ref) {
            setAuthorised(false);
            return;
        }

        try {
            const res = await api.post("api/token/refresh/", { refresh: ref }); // Fix: Await the API call
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setAuthorised(true);
            } else {
                setAuthorised(false);
            }
        } catch (error) {
            console.log("Token refresh failed:", error.response?.data || error.message);
            setAuthorised(false);
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setAuthorised(false);
            return;
        }

        try {
            const decode = jwtDecode(token);
            const expired = decode.exp;
            const timeNow = Date.now() / 1000;

            if (expired <= timeNow) {
                await refresh();
            } else {
                setAuthorised(true);
            }
        } catch (error) {
            console.log("Invalid token:", error);
            setAuthorised(false);
        }
    };

    if (authorised === null) {
        return <h3>Loading...</h3>;
    }

    return authorised ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
