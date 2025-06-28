import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import '../../styles/layout_styles/Navbar.css';

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access'));

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('access'));
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setIsLoggedIn(false);
        navigate('/login');
    };

    return (
        <div className="navbox">
            <nav>
                <ul>
                    <li>
                        <NavLink to="/make-tender" className="maketen">Make a Tender</NavLink>
                    </li>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <NavLink to="/about">About</NavLink>
                    </li>
                    <li>
                        <NavLink to="/Contractors">Contractors</NavLink>
                    </li>
                    <li>
                        <NavLink to="/services">Services</NavLink>
                    </li>
                    <li>
                        <NavLink to="/visualize">Visualizer</NavLink>
                    </li>

                    {!isLoggedIn ? (
                        <>
                            <li><NavLink to="/Login">Login</NavLink></li>
                            <li><NavLink to="/Register">Register</NavLink></li>
                        </>
                    ) : (
                        <>
                            <li>
                               <span className="logout-link" onClick={handleLogout}>Logout</span>
                            </li>
                            <li>
                                <NavLink to="/profile" className="profile-icon">
                                    <FaUserCircle size={24} title="Profile" />
                                </NavLink>
                            </li>
                        </>
                    )}

                    <li>
                        <NavLink to="/mytendors" className="tendors">My Tenders</NavLink>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default Navbar;
