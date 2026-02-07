// Layout.jsx
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Layout() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 780);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 780);
            if (window.innerWidth < 780) setIsSidebarOpen(false);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="layout">
            <Navbar onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isMobile={isMobile} isSidebarOpen={isSidebarOpen} />
            <main className={`main-content ${isSidebarOpen && !isMobile ? "shifted" : ""} mt-5`}>
                <Outlet />
            </main>
        </div>
    );
}
