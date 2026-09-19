import { useEffect, useState } from "react";
import { Bell, LogOut } from "lucide-react";
import { useAuth } from "../pages/context/AuthContext";
import { API_URL } from "../config";
import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Logo from "/logo-domiflex.jpg";
import Notificaciones from "../components/Notificaciones";
import { useSocket } from "../pages/context/SocketContext";

import theme from "../styles/theme";

function Header() {
  const navigate = useNavigate();
  const { usuario, logout, token } = useAuth();
  const { socket } = useSocket();
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      if (usuario?.rol === 'ADMIN' && token) {
        try {
          const response = await fetch(`${API_URL}/vehiculos/solicitudes/pendientes/count`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setPendingRequests(data.count);
          }
        } catch (err) {
          console.error("Error fetching pending requests count:", err);
        }
      }
    };

    fetchPendingCount();

    if (socket && usuario?.rol === 'ADMIN') {
      const handleNewRequest = () => setPendingRequests(prev => prev + 1);
      const handleRequestProcessed = () => fetchPendingCount();

      socket.on("new_vehicle_change_request", handleNewRequest);
      socket.on("vehicle_change_processed", handleRequestProcessed);

      return () => {
        socket.off("new_vehicle_change_request", handleNewRequest);
        socket.off("vehicle_change_processed", handleRequestProcessed);
      };
    }
  }, [socket, usuario, token]);

  useEffect(() => {
    const fetchNotificaciones = async () => {
      if (!usuario?.idUsuarios || !token) return;

      try {
        const response = await fetch(
          `${API_URL}/notificaciones/usuario/${usuario.idUsuarios}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("📬 Notificaciones recibidas en Header:", data);

          const notificacionesArray = Array.isArray(data) ? data : (data.notificaciones || []);

          setNotificaciones(notificacionesArray);

          const noLeidasCount = notificacionesArray.filter(n => !n.leido).length;
          setNoLeidas(noLeidasCount);

        } else if (response.status === 404) {
          setNotificaciones([]);
          setNoLeidas(0);
        }
      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
      }
    };

    fetchNotificaciones();
    const intervalId = setInterval(fetchNotificaciones, 30000);
    return () => clearInterval(intervalId);
  }, [usuario, token]);

  const getInitial = () => {
    if (!usuario?.nombre) return "A";
    return usuario.nombre.charAt(0).toUpperCase();
  };

  const getFullName = () => {
    if (!usuario?.nombre) return "Administrador";
    return usuario.nombre;
  };

  const getUserEmail = () => {
    if (!usuario?.email) return "admin@domiflex.com";
    return usuario.email;
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="py-3" style={{
      backgroundColor: theme.colors.bgPrimary,
      borderBottom: `1px solid ${theme.colors.border}`
    }}>
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div className="text-center mb-2">
              <img
                src={Logo}
                alt="Logo DomiFlexx"
                style={{
                  width: '100px',
                  height: 'auto',
                  marginLeft: '20px'
                }}
              />
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            {usuario?.rol === 'ADMIN' && pendingRequests > 0 && (
              <div
                className="d-flex align-items-center justify-content-center p-2 rounded-circle"
                style={{
                  backgroundColor: `${theme.colors.warning}20`,
                  color: theme.colors.warning,
                  cursor: 'pointer',
                  border: `1px solid ${theme.colors.warning}40`,
                  animation: 'pulse 2s infinite'
                }}
                onClick={() => navigate('/admin/solicitudes-vehiculos')}
                title={`${pendingRequests} solicitudes pendientes`}
              >
                <Bell size={20} />
                <span className="ms-1 fw-bold" style={{ fontSize: '0.8rem' }}>{pendingRequests}</span>
                <style>
                  {`
                    @keyframes pulse {
                      0% { transform: scale(1); }
                      50% { transform: scale(1.1); }
                      100% { transform: scale(1); }
                    }
                  `}
                </style>
              </div>
            )}
            <Notificaciones />

            <Dropdown align="end">
              <Dropdown.Toggle
                as="div"
                className="d-flex align-items-center"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
                id="dropdown-user"
              >
                <div className="text-end me-3 d-none d-md-block">
                  <p className="mb-0 fw-medium" style={{ color: theme.colors.textPrimary }}>{getFullName()}</p>
                  <small style={{ color: theme.colors.textSecondary }}>{getUserEmail()}</small>
                </div>

                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: '45px',
                    height: '45px',
                    border: `1px solid ${theme.colors.border}`,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                    backgroundColor: theme.colors.bgCard
                  }}
                >
                  <span style={{ color: theme.colors.accent, fontWeight: 'bold' }}>{getInitial()}</span>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu
                className="mt-2"
                style={{
                  minWidth: '200px',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '10px',
                  backgroundColor: theme.colors.bgCard
                }}
              >
                <Dropdown.Header className="text-center border-bottom pb-2" style={{ borderColor: theme.colors.border }}>
                  <strong style={{ color: theme.colors.textPrimary }}>{getFullName()}</strong><br />
                  <small style={{ color: theme.colors.textSecondary }}>{getUserEmail()}</small>
                </Dropdown.Header>

                <Dropdown.Item
                  onClick={handleLogout}
                  className="py-2 d-flex justify-content-center"
                  style={{ color: theme.colors.danger }}
                >
                  <LogOut size={14} aria-hidden="true" style={{ marginRight: "8px" }} />
                  Cerrar sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
