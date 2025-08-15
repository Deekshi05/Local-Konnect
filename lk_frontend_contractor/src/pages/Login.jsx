import React, { useState, useEffect } from "react";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import { jwtDecode } from 'jwt-decode';

function Login() {

    useEffect(() => {
        localStorage.clear();
    }, []);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const userData = {
        email,
        password,
    };
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const url = "http://localhost:8000/api/login/";
    const options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(url, options);
            const data = await res.json();
            console.log(data);

            if (!data.access) {
                setError("Invalid credentials");
                return;
            }

            // Try to get user info from backend response
            let userRole = null;
            if (data.user && data.user.role) {
                userRole = data.user.role;
            } else {
                // Fallback: decode JWT
                try {
                    const decoded = jwtDecode(data.access);
                    userRole = decoded.role || decoded.user_type || null;
                } catch (err) {
                    setError("Could not determine user role.");
                    return;
                }
            }

            if (userRole !== "CONTRACTOR") {
                setError("Access denied. Contractor credentials required.");
                return;
            }

            localStorage.setItem(ACCESS_TOKEN, data.access);
            localStorage.setItem(REFRESH_TOKEN, data.refresh);
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            console.log("Login successful!");
            navigate("/Home");
        } catch (error) {
            console.log("Error Response:", error.response?.data || error.message);
            setError("Invalid email or password");
        }
    };

    return (
        <div>
            <div className="login-container">
                <div className="login-card">
                    <h2 className="login-title">Login</h2>
                    {error && <p className="login-error">{error}</p>}
                    <form onSubmit={handleSubmit} className="login-form">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            placeholder="Enter your Email"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            placeholder="Enter your Password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Login</button>

                        <p style={{ textAlign: 'center', marginTop: '20px' }}>
                            Don't have an account?{" "}
                            <span
                                style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={() => navigate('/Register')}
                            >
                                Register
                            </span>
                        </p>
                        {/* <p style={{ textAlign: 'center', marginTop: '20px' }}>
                            <span
                                style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={() => navigate('/Forgot')}
                            >
                                Forgot Password
                            </span>
                        </p> */}
                    </form>
                </div>
            </div>
            
        </div>
    );
}

export default Login;
