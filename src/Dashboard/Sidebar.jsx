import React, { useState, useEffect, useCallback } from "react";
import {
  BsGrid1X2Fill, BsFillGrid3X3GapFill, BsPeopleFill, BsListCheck, BsMenuButtonWideFill, BsChevronRight,
  BsChevronLeft, BsQrCode, BsFileEarmarkTextFill, BsArrowRepeat, BsCashCoin
} from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../pages/context/AuthContext";
import { useSocket } from "../pages/context/SocketContext";
import { API_URL } from "../config";
import Logo from "../pages/Imagenes/BANNER COMPLETO CON TRANSPARENCIA.png";
import fondo from "../pages/Imagenes/AutoresContacto.png";

// Helper para sessionStorage
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

  // Badge counters per section
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

  // Persist badges to sessionStorage
  useEffect(() => {
    saveBadges(badges);
  }, [badges]);

  // Fetch initial solicitudes pendientes count
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

  // Socket event listeners
  useEffect(() => {
    if (socket && (usuario?.rol === 'ADMIN' || usuario?.rol?.nombre === 'ADMIN' || usuario?.idRol === 1)) {

      // Nuevo usuario registrado
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

      // Nuevo documento subido
      const handleNewDocument = (data) => {
        console.log("[SIDEBAR] new_document_uploaded:", data);
        setBadges(prev => ({ ...prev, documentos: prev.documentos + 1 }));
      };

      // Nueva solicitud de cambio de vehículo
      const handleNewRequest = () => {
        console.log("[SIDEBAR] new_vehicle_change_request");
        setBadges(prev => ({ ...prev, solicitudes: prev.solicitudes + 1 }));
      };

      // Solicitud procesada → refetch count
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

  // Clear badge when navigating to a section
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
    { icon: <BsGrid1X2Fill />, label: "Dashboard", path: "/dashboard/home", badgeKey: null },
    { icon: <BsPeopleFill />, label: "Clientes", path: "/admin/clientes", badgeKey: "clientes" },
    { icon: <BsFillGrid3X3GapFill />, label: "Repartidores", path: "/admin/repartidores", badgeKey: "repartidores" },
    { icon: <BsListCheck />, label: "Usuarios", path: "/admin/usuarios", badgeKey: "usuarios" },
    { icon: <BsMenuButtonWideFill />, label: "Vehículos", path: "/admin/vehiculos", badgeKey: null },
    { icon: <BsFileEarmarkTextFill />, label: "Documentos", path: "/admin/documentos", badgeKey: "documentos" },
    { icon: <BsArrowRepeat />, label: "Solicitudes", path: "/admin/solicitudes-vehiculos", badgeKey: "solicitudes" },
    { icon: <BsCashCoin />, label: "Reportes de Pago", path: "/admin/reportes-pago", badgeKey: "reportesPago" }
  ];

  const isActive = (path) => location.pathname === path;

  // Clear badge automatically when user is already on that page
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
          <BsChevronRight className="text-secondary" size={15} />
        </button>
      )}

      {openSidebarToggle && (
        <div
          className="d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-25"
          onClick={OpenSidebar}
          style={{ zIndex: 999 }}
        />
      )}

      <aside
        className={`position-fixed top-0 start-0 vh-100 overflow-y-auto shadow-sm
          ${openSidebarToggle ? 'd-block' : ''} col-md-3 col-lg-2 p-0`}
        style={{
          zIndex: 1000,
          backgroundImage: `url(${fondo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backgroundBlendMode: 'overlay',
          width: '280px',
          transition: 'transform 0.3s ease-in-out',
          transform: openSidebarToggle ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
        <div className="sidebar-header d-flex justify-content-between align-items-center container-fluid px-3" style={{
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          minHeight: '91px'
        }}>
          <img src={Logo} alt="Logo DomiFlex" style={{ width: '100px', height: 'auto' }} />
          <button className="btn btn-link text-muted p-0" onClick={OpenSidebar}>
            <BsChevronLeft size={15} />
          </button>
        </div>


        <ul className="nav flex-column p-3 mt-3">
          {menuItems.map((item, index) => {
            const badgeCount = item.badgeKey ? (badges[item.badgeKey] || 0) : 0;
            return (
              <li className="nav-item mb-2" key={index}>
                <button
                  className="nav-link d-flex align-items-center p-2 rounded-3 border-0 w-100 text-start position-relative"
                  onClick={() => handleNavigation(item.path, item.badgeKey)}
                  style={{
                    background: isActive(item.path) ? 'rgba(84, 199, 184, 0.1)' : 'transparent',
                    color: isActive(item.path) ? '#56bca7' : '#666',
                    fontSize: '0.9rem',
                    borderLeft: isActive(item.path) ? '4px solid #56bca7' : '4px solid transparent'
                  }}
                >
                  <span className="me-3" style={{ fontSize: '1.2rem' }}>
                    {item.icon}
                  </span>
                  <span className={isActive(item.path) ? 'fw-bold' : ''}>{item.label}</span>
                  {badgeCount > 0 && (
                    <span
                      className="position-absolute end-0 me-3 badge rounded-pill"
                      style={{
                        fontSize: '0.65rem',
                        backgroundColor: '#ff4757',
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
              color: '#999',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '0.8rem'
            }}
          >
            <i className="bi bi-box-arrow-right me-2"></i>
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