import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        const userData = localStorage.getItem('user');

        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp < currentTime) {
                logout();
                return;
            }

            setUser(userData ? JSON.parse(userData) : { role: decoded.role || decoded.user_type });
        } catch (error) {
            console.error('Auth error:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    return { user, loading, logout, checkAuth };
};

export default useAuth;
