import { useEffect, useState } from "react";
import { useAuth } from "../pages/context/AuthContext";
import { API_URL } from "../config";
import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Logo from "../pages/Imagenes/BANNER COMPLETO CON TRANSPARENCIA.png";
import Notificaciones from "../components/Notificaciones";
import { useSocket } from "../pages/context/SocketContext";
import { BsBellFill } from "react-icons/bs";

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
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div className="container-fluid px-4" style={{
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
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
                  backgroundColor: '#fffbeb',
                  color: '#f59e0b',
                  cursor: 'pointer',
                  border: '1px solid #fef3c7',
                  animation: 'pulse 2s infinite'
                }}
                onClick={() => navigate('/admin/solicitudes-vehiculos')}
                title={`${pendingRequests} solicitudes pendientes`}
              >
                <BsBellFill size={20} />
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
                  <p className="mb-0 text-black fw-medium">{getFullName()}</p>
                  <small className="text-black opacity-75">{getUserEmail()}</small>
                </div>

                <div
                  className="rounded-circle d-flex align-items-center bg-white justify-content-center"
                  style={{
                    width: '45px',
                    height: '45px',
                    border: '1px solid black',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}
                >
                  <span className="text-black fw-bold">{getInitial()}</span>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu
                className="mt-2"
                style={{
                  minWidth: '200px',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
                  border: 'none',
                  borderRadius: '10px'
                }}
              >
                <Dropdown.Header className="text-center border-bottom pb-2">
                  <strong>{getFullName()}</strong><br />
                  <small className="text-muted">{getUserEmail()}</small>
                </Dropdown.Header>

                <Dropdown.Item
                  onClick={handleLogout}
                  className="py-2 text-danger d-flex justify-content-center"
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
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