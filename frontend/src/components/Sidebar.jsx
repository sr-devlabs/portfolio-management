import React from "react";
import { NavLink } from "react-router-dom";
import {
    BarChart3,
    Users,
    LineChart,
    Megaphone,
    ScrollText,
    Home,
    Bookmark,
    Newspaper,
    Lightbulb,
    Wallet,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import ProtectedRoute from "./ProtectedRoute.jsx";
import "../styles/Layout.css";

const Sidebar = ({ isMobile, isSidebarOpen }) => {
    const { user } = useAuthStore();
    const role = user?.role || "Guest";

    const roleLinks = {
        // Admin: [
        // { path: "/layout", label: "Dashboard", icon: <BarChart3 size={20} /> },
        // { path: "/layout/manage-users", label: "Manage Users", icon: <Users size={20} /> },
        // { path: "/layout/analysis", label: "Analysis", icon: <LineChart size={20} /> },
        // { path: "/layout/announcements", label: "Announcements", icon: <Megaphone size={20} /> },
        // { path: "/layout/activity-logs", label: "Activity Logs", icon: <ScrollText size={20} /> },
        // ],
        Consultant: [
            { path: "/layout", label: "Dashboard", icon: <BarChart3 size={20} />, end: true },
            { path: "/layout/analysis", label: "Analysis", icon: <LineChart size={20} /> },
            { path: "/layout/customers", label: "Customers", icon: <Users size={20} /> },
            { path: "/layout/activity-logs", label: "Activity Logs", icon: <ScrollText size={20} /> },
        ],
        Customer: [
            { path: "/layout", label: "Dashboard", icon: <Home size={20} />, end: true },
            // { path: "/layout/watchlist", label: "Watchlist", icon: <Bookmark size={20} /> },
            // { path: "/layout/news", label: "News", icon: <Newspaper size={20} /> },
            { path: "/layout/suggestions", label: "Suggestions", icon: <Lightbulb size={20} /> },
            { path: "/layout/holdings", label: "Holdings", icon: <Wallet size={20} /> },
        ],
    };

    const links = roleLinks[role] || [];

    return (
        <>
            {!isMobile && (
                <nav className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
                    <div className="d-md-none d-flex justify-content-end p-3">
                         {/* Close button for mobile slide-out */}
                    </div>
                    <ul>
                        {links.map((link) => (
                            <li key={link.path}>
                                <ProtectedRoute allowedRoles={[role]}>
                                    <NavLink to={link.path} end={link.end} className={({ isActive }) => isActive ? "active" : ""}>
                                        {link.icon} <span className="ms-2">{link.label}</span>
                                    </NavLink>
                                </ProtectedRoute>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}

            {isMobile && (
                <nav className="bottom-nav">
                    <ul>
                        {links.map((link) => (
                            <li key={link.path}>
                                <ProtectedRoute allowedRoles={[role]}>
                                    <NavLink
                                        to={link.path}
                                        end={link.end}
                                        className={({ isActive }) =>
                                            isActive ? "active-link" : ""
                                        }
                                    >
                                        {link.icon}
                                    </NavLink>
                                </ProtectedRoute>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </>
    );
};

export default Sidebar;
