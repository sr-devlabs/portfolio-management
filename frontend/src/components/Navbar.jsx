import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import "../styles/Navbar.css";
import { 
    Menu, 
    Bell, 
    Search, 
    User, 
    LogOut, 
    Settings, 
    CreditCard, 
    ChevronDown,
    LayoutDashboard
} from "lucide-react";

function Navbar({ onSidebarToggle }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { user, clearUser } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        clearUser();
        navigate("/logout");
    };

    return (
        <nav className="navbar navbar-expand-lg fixed-top custom-navbar">
            <div className="d-flex align-items-center w-100">
                {/* Toggle Button */}
                <button 
                    className="btn btn-icon btn-ghost me-3 text-secondary" 
                    onClick={onSidebarToggle}
                    title="Toggle Sidebar"
                >
                    <Menu size={24} />
                </button>

                {/* Brand / Logo */}
                <div className="d-flex align-items-center gap-2">
                    <div className="bg-primary rounded p-1 d-flex align-items-center justify-content-center" style={{width: 32, height: 32}}>
                        <LayoutDashboard size={20} className="text-white" />
                    </div>
                    <span className="navbar-brand mb-0 h1 fw-bold text-dark d-none d-sm-block">
                        Stock<span className="text-primary">Predictor</span>
                    </span>
                </div>

                {/* Search Bar (Desktop) */}
                {/* <div className="d-none d-md-block mx-auto position-relative" style={{width: '320px'}}>
                    <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-muted ps-3">
                            <Search size={18} />
                        </span>
                        <input 
                            type="text" 
                            className="form-control bg-light border-start-0 ps-0 text-dark" 
                            placeholder="Search stocks, news..."
                            style={{fontSize: '0.95rem'}}
                        />
                    </div>
                </div> */}

                {/* Right Actions */}
                <div className="ms-auto d-flex align-items-center gap-3">
                    {/* Notifications */}
                    {/* <button className="btn btn-icon btn-ghost text-secondary position-relative">
                        <Bell size={22} />
                        <span className="position-absolute top-0 start-50 translate-middle p-1 bg-danger border border-light rounded-circle">
                            <span className="visually-hidden">New alerts</span>
                        </span>
                    </button> */}

                    {/* Profile Dropdown */}
                    <div className="dropdown position-relative" ref={dropdownRef}>
                        <button
                            className="btn btn-light d-flex align-items-center gap-2 p-1 pe-3 rounded-pill border dropdown-toggle-custom"
                            onClick={() => setIsDropdownOpen((prev) => !prev)}
                        >
                            <div className="avatar-circle bg-primary-subtle text-primary fw-bold">
                                {user?.full_name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <span className="d-none d-md-block small fw-medium text-dark">
                                {user?.full_name?.split(" ")[0] || "User"}
                            </span>
                            <ChevronDown size={14} className="text-muted d-none d-md-block" />
                        </button>

                        {isDropdownOpen && (
                            <div className="dropdown-menu dropdown-menu-end profile-dropdown show shadow-lg border-0 rounded-4 mt-2 p-2 animate-slide-in" style={{minWidth: '220px'}}>
                                <div className="px-3 py-2 border-bottom mb-2">
                                    <p className="mb-0 fw-bold text-dark">{user?.full_name || "User"}</p>
                                    <p className="mb-0 small text-muted">{user?.role || "Guest"}</p>
                                </div>
                                
                                <Link className="dropdown-item rounded-2 d-flex align-items-center gap-2 py-2" to="/layout/profile">
                                    <User size={16} /> Edit Profile
                                </Link>
                                <Link className="dropdown-item rounded-2 d-flex align-items-center gap-2 py-2" to="/layout/holdings">
                                    <LayoutDashboard size={16} /> My Portfolio
                                </Link>
                                <Link className="dropdown-item rounded-2 d-flex align-items-center gap-2 py-2" to="/settings">
                                    <Settings size={16} /> Settings
                                </Link>
                                
                                <div className="dropdown-divider my-2"></div>
                                
                                <button className="dropdown-item rounded-2 d-flex align-items-center gap-2 py-2 text-danger" onClick={handleLogout}>
                                    <LogOut size={16} /> Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
