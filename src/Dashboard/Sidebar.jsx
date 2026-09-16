import React, { useState, useEffect, useCallback } from "react";
import { FileText, LayoutGrid, Car, ChevronRight, LayoutDashboard, Repeat, ChevronLeft, Users, ListChecks, Coins, QrCode, LogOut } from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../pages/context/AuthContext";
import { useSocket } from "../pages/context/SocketContext";
import { API_URL } from "../config";
import Logo from "/logo-domiflex.jpg";
import theme from "../styles/theme";

const STORAGE_KEY = "admin_badge_counts";
const loadBadges = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
};
const saveBadges = (badges) => {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(badges)); } catch { }
};

function Sidebar({ openSidebarToggle, OpenSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, token, logout } = useAuth();
  const { socket } = useSocket();

  const [badges, setBadges] = useState(() => {
    const saved = loadBadges();
    return {
      clientes: saved.clientes || 0,
      repartidores: saved.repartidores || 0,
      usuarios: saved.usuarios || 0,
      documentos: saved.documentos || 0,
      solicitudes: saved.solicitudes || 0,
      reportesPago: saved.reportesPago || 0,
    };
  });

  useEffect(() => {
    saveBadges(badges);
  }, [badges]);

  const fetchPendingCount = useCallback(async () => {
    if (usuario?.rol === 'ADMIN' && token) {
      try {
        const response = await fetch(`${API_URL}/vehiculos/solicitudes/pendientes/count`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setBadges(prev => ({ ...prev, solicitudes: data.count || 0 }));
        }
      } catch (err) {
        console.error("Error fetching pending requests count:", err);
      }
    }
  }, [usuario, token]);

  useEffect(() => {
    fetchPendingCount();
  }, [fetchPendingCount]);

  useEffect(() => {
    if (socket && (usuario?.rol === 'ADMIN' || usuario?.rol?.nombre === 'ADMIN' || usuario?.idRol === 1)) {
      const handleNewUser = (data) => {
        console.log("[SIDEBAR] new_user_registration:", data);
        const rol = (data.rol || '').toUpperCase();
        setBadges(prev => {
          const updated = { ...prev, usuarios: prev.usuarios + 1 };
          if (rol === 'REPARTIDOR' || rol === 'DRIVER') {
            updated.repartidores = prev.repartidores + 1;
          } else if (rol === 'CLIENTE' || rol === 'CLIENTE' || rol === 'CLIENTE') {
            updated.clientes = prev.clientes + 1;
          }
          return updated;
        });
      };

      const handleNewDocument = (data) => {
        console.log("[SIDEBAR] new_document_uploaded:", data);
        setBadges(prev => ({ ...prev, documentos: prev.documentos + 1 }));
      };

      const handleNewRequest = () => {
        console.log("[SIDEBAR] new_vehicle_change_request");
        setBadges(prev => ({ ...prev, solicitudes: prev.solicitudes + 1 }));
      };

      const handleRequestProcessed = () => {
        console.log("[SIDEBAR] vehicle_change_processed");
        fetchPendingCount();
      };

      socket.on("new_user_registration", handleNewUser);
      socket.on("new_document_uploaded", handleNewDocument);
      socket.on("new_vehicle_change_request", handleNewRequest);
      socket.on("vehicle_change_processed", handleRequestProcessed);

      return () => {
        socket.off("new_user_registration", handleNewUser);
        socket.off("new_document_uploaded", handleNewDocument);
        socket.off("new_vehicle_change_request", handleNewRequest);
        socket.off("vehicle_change_processed", handleRequestProcessed);
      };
    }
  }, [socket, usuario, fetchPendingCount]);

  const handleNavigation = (path, badgeKey) => {
    navigate(path);
    if (badgeKey) {
      setBadges(prev => ({ ...prev, [badgeKey]: 0 }));
    }
    if (window.innerWidth < 768) {
      OpenSidebar();
    }
  };

  const menuItems = [
    { icon: <LayoutDashboard />, label: "Dashboard", path: "/dashboard/home", badgeKey: null },
    { icon: <Users />, label: "Clientes", path: "/admin/clientes", badgeKey: "clientes" },
    { icon: <LayoutGrid />, label: "Repartidores", path: "/admin/repartidores", badgeKey: "repartidores" },
    { icon: <ListChecks />, label: "Usuarios", path: "/admin/usuarios", badgeKey: "usuarios" },
    { icon: <Car />, label: "Vehículos", path: "/admin/vehiculos", badgeKey: null },
    { icon: <FileText />, label: "Documentos", path: "/admin/documentos", badgeKey: "documentos" },
    { icon: <Repeat />, label: "Solicitudes", path: "/admin/solicitudes-vehiculos", badgeKey: "solicitudes" },
    { icon: <Coins />, label: "Reportes de Pago", path: "/admin/reportes-pago", badgeKey: "reportesPago" }
  ];

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    if (currentItem?.badgeKey && badges[currentItem.badgeKey] > 0) {
      setBadges(prev => ({ ...prev, [currentItem.badgeKey]: 0 }));
    }
  }, [location.pathname]);

  return (
    <>
      {!openSidebarToggle && (
        <button
          className="btn position-fixed start-0"
          onClick={OpenSidebar}
          style={{
            zIndex: 999, width: '45px', height: '45px', top: '20px', left: '20px',
            backgroundColor: 'transparent', border: 'none', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}
        >
          <ChevronRight size={15} style={{ color: theme.colors.textSecondary }} />
        </button>
      )}

      {openSidebarToggle && (
        <div
          className="d-md-none position-fixed top-0 start-0 w-100 h-100"
          onClick={OpenSidebar}
          style={{ zIndex: 999, backgroundColor: theme.colors.overlay }}
        />
      )}

      <aside
        aria-label="Navegación de administración"
        className={`position-fixed top-0 start-0 vh-100 overflow-y-auto shadow-sm
          ${openSidebarToggle ? 'd-block' : ''} col-md-3 col-lg-2 p-0`}
        style={{
          zIndex: 1000,
          width: '280px',
          transition: 'transform 0.3s ease-in-out',
          transform: openSidebarToggle ? 'translateX(0)' : 'translateX(-100%)',
          backgroundColor: theme.colors.bgCard,
          borderRight: `1px solid ${theme.colors.border}`
        }}
      >
        <div className="sidebar-header d-flex justify-content-between align-items-center container-fluid px-3" style={{
          borderBottom: `1px solid ${theme.colors.border}`,
          minHeight: '91px',
          backgroundColor: theme.colors.bgPrimary
        }}>
          <img src={Logo} alt="Logo DomiFlex" style={{ width: '100px', height: 'auto' }} />
          <button className="btn btn-link p-0" onClick={OpenSidebar} style={{ color: theme.colors.textSecondary }}>
            <ChevronLeft size={15} />
          </button>
        </div>

        <ul className="nav flex-column p-3 mt-3">
          {menuItems.map((item, index) => {
            const badgeCount = item.badgeKey ? (badges[item.badgeKey] || 0) : 0;
            const active = isActive(item.path);
            return (
              <li className="nav-item mb-2" key={index}>
                <button
                  className="nav-link d-flex align-items-center p-2 rounded-3 border-0 w-100 text-start position-relative"
                  onClick={() => handleNavigation(item.path, item.badgeKey)}
                  style={{
                    background: active ? `${theme.colors.accent}15` : 'transparent',
                    color: active ? theme.colors.accent : theme.colors.textSecondary,
                    fontSize: '0.9rem',
                    borderLeft: active ? `4px solid ${theme.colors.accent}` : '4px solid transparent'
                  }}
                >
                  <span className="me-3" style={{ fontSize: '1.2rem' }}>
                    {item.icon}
                  </span>
                  <span className={active ? 'fw-bold' : ''}>{item.label}</span>
                  {badgeCount > 0 && (
                    <span
                      className="position-absolute end-0 me-3 badge rounded-pill"
                      style={{
                        fontSize: '0.65rem',
                        backgroundColor: theme.colors.danger,
                        color: 'white',
                        minWidth: '20px',
                        padding: '3px 6px',
                        animation: 'badgePulse 2s infinite'
                      }}
                    >
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="p-2 mt-auto border-top aling-items-center d-flex justify-content-center">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="btn w-100 d-flex align-items-center justify-content-center p-2"
            style={{
              backgroundColor: 'transparent',
              color: theme.colors.textSecondary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '6px',
              fontSize: '0.8rem'
            }}
          >
            <LogOut size={14} aria-hidden="true" style={{ marginRight: "8px" }} />
            CERRAR SESIÓN
          </button>
        </div>
      </aside>

      <style>{`
        @keyframes badgePulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
}

export default Sidebar;
