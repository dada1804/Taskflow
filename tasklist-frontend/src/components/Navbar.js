import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Import the CSS file for Navbar

const Navbar = ({ authenticated, setAuthenticated }) => {

    const handleLogout = () => {
        setAuthenticated(false);
        localStorage.removeItem('token'); // Clear the token on logout
        localStorage.removeItem('name'); // Clear the user's name on logout
    };

    const userName = localStorage.getItem('name');

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">TaskFlow</Link>
                <div className="navbar-center">
                    {authenticated && <span className="navbar-user">Welcome, {userName}</span>}
                </div>
                <div className="navbar-links">
                    {authenticated ? (
                        <>
                            <Link to="/tasks" className="navbar-link">Tasks</Link>
                            <Link to="/tasks/new" className="navbar-link">New Task</Link>
                            <Link to="/mytasks" className="navbar-link">My Tasks</Link> {/* New Link */}
                            <button onClick={handleLogout} className="navbar-link">Logout</button>
                        </>
                    ) : (
                        <>
                            <span className="navbar-engaging-text">Manage your tasks efficiently with TaskFlow!</span>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
