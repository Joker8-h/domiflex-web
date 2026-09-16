import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "../pages/context/AuthContext";
import { Navigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import theme from "../styles/theme";
import { useIsMobile } from "../hooks/useMediaQuery";
import "../design/admin.css";

const DashboardLayout = ({ children, openSidebarToggle, OpenSidebar }) => {
    const { token } = useAuth();
    const isMobile = useIsMobile();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const rafRef = useRef(0);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => setMousePos({ x: clientX, y: clientY }));
        };
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            backgroundColor: theme.colors.bgPrimary,
            position: 'relative'
        }}>
            <style>
                {`
                @keyframes floatBubble {
                    0% { transform: translateY(0) translateX(0); }
                    50% { transform: translateY(-30px) translateX(15px); }
                    100% { transform: translateY(0) translateX(0); }
                }
                `}
            </style>

            <div style={{
                position: 'fixed',
                top: mousePos.y - 150,
                left: mousePos.x - 150,
                width: '300px',
                height: '300px',
                background: `${theme.colors.accent}10`,
                borderRadius: '50%',
                filter: 'blur(80px)',
                pointerEvents: 'none',
                zIndex: 1,
                transition: 'top 0.1s ease, left 0.1s ease'
            }}></div>

            <div style={{ position: 'fixed', top: '15%', left: '10%', width: '120px', height: '120px', background: `${theme.colors.accent}08`, borderRadius: '50%', filter: 'blur(40px)', animation: 'floatBubble 10s infinite ease-in-out', zIndex: 0 }}></div>
            <div style={{ position: 'fixed', bottom: '20%', right: '12%', width: '180px', height: '180px', background: `${theme.colors.border}05`, borderRadius: '50%', filter: 'blur(60px)', animation: 'floatBubble 14s infinite ease-in-out reverse', zIndex: 0 }}></div>

            <Header />
            <div style={{ display: 'flex', flex: 1, position: 'relative', width: '100%', overflow: 'hidden', zIndex: 2 }}>
                <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
                <div className="admin-shell" style={{
                    flex: 1,
                    marginLeft: openSidebarToggle && !isMobile ? '280px' : '0px',
                    transition: 'margin-left 0.3s ease-in-out',
                    backgroundColor: 'transparent',
                    height: '100%',
                    overflow: 'auto'
                }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
