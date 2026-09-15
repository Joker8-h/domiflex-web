import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../../components/Navbar";
import { API_URL } from "../../config";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { FaUser, FaStar, FaQrcode, FaUserCircle, FaCalendarAlt, FaRoute, FaWallet, FaIdCard, FaHistory, FaSave, FaPhone } from "react-icons/fa";
import QRModal from "../../components/QRModal";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import fondo from "../Imagenes/AutoresContacto.png";

// Componentes personalizados (igual que en DriverProfile)
const CustomBadge = ({ estado, children }) => {
    const estilos = {
        APROBADO: { backgroundColor: '#62d8d9', color: '#ffffff' },
        VÁLIDO: { backgroundColor: '#62d8d9', color: '#ffffff' },
        VALIDO: { backgroundColor: '#62d8d9', color: '#ffffff' },
        PENDIENTE: { backgroundColor: '#cccbd2af', color: '#113d69' },
        REVISION: { backgroundColor: '#cccbd2af', color: '#113d69' },
        RECHAZADO: { backgroundColor: '#113d69', color: '#ffffff' },
        VENCIDO: { backgroundColor: '#113d69', color: '#ffffff' }
    };

    const estilo = estilos[estado?.toUpperCase()] || { backgroundColor: '#cccbd2af', color: '#113d69' };

    return (
        <span style={{
            ...estilo,
            padding: '0.25rem 0.75rem',
            borderRadius: '2rem',
            fontSize: '0.75rem',
            fontWeight: '500',
            display: 'inline-block'
        }}>
            {children}
        </span>
    );
};

const CustomButton = ({ variant, onClick, children, disabled, style, className }) => {
    const getButtonStyle = () => {
        const baseStyle = {
            padding: '0.5rem 1rem',
            borderRadius: '2rem',
            border: '1px solid',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            transition: 'all 0.2s',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%'
        };

        switch (variant) {
            case 'primary':
                return {
                    ...baseStyle,
                    backgroundColor: '#62d8d9',
                    color: '#ffffff',
                    borderColor: '#62d8d9'
                };
            case 'outline-primary':
                return {
                    ...baseStyle,
                    backgroundColor: 'transparent',
                    color: '#62d8d9',
                    borderColor: '#62d8d9'
                };
            case 'outline-success':
                return {
                    ...baseStyle,
                    backgroundColor: 'transparent',
                    color: '#62d8d9',
                    borderColor: '#62d8d9'
                };
            case 'success':
                return {
                    ...baseStyle,
                    backgroundColor: '#62d8d9',
                    color: '#ffffff',
                    borderColor: '#62d8d9'
                };
            case 'outline-secondary':
                return {
                    ...baseStyle,
                    backgroundColor: 'transparent',
                    color: '#113d69',
                    borderColor: '#113d69'
                };
            case 'secondary':
                return {
                    ...baseStyle,
                    backgroundColor: '#113d69',
                    color: '#ffffff',
                    borderColor: '#113d69'
                };
            default:
                return baseStyle;
        }
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{ ...getButtonStyle(), ...style }}
            className={className}
        >
            {children}
        </button>
    );
};

const StatsCard = ({ icon, title, value, iconBgColor, iconColor }) => {
    return (
        <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '1rem',
            border: 'none',
            boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.075)',
            height: '100%',
            padding: '1.5rem'
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                    padding: '0.75rem',
                    borderRadius: '50%',
                    backgroundColor: iconBgColor,
                    color: iconColor,
                    marginRight: '1rem'
                }}>
                    {icon}
                </div>
                <div>
                    <h6 style={{ color: '#6c757d', marginBottom: '0.25rem', fontSize: '0.875rem' }}>{title}</h6>
                    <h3 style={{ fontWeight: 'bold', margin: 0, color: '#113d69' }}>{value}</h3>
                </div>
            </div>
        </div>
    );
};

const CustomListGroup = ({ children }) => {
    return (
        <div style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {children}
        </div>
    );
};

const CustomListItem = ({ children, style }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.25rem 0',
            borderBottom: 'none',
            ...style
        }}>
            {children}
        </div>
    );
};

function Profile() {
  const { usuario, token, setUsuario } = useAuth();
  const navigate = useNavigate();

  // Colores exactos del DriverProfile
  const brandColor = "#113d69"; // Azul oscuro
  const accentColor = "#62d8d9"; // Verde turquesa (cambiado de #56bca7 a #62d8d9)

  const [showQRModal, setShowQRModal] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [telefono, setTelefono] = useState(usuario?.telefono || '');
  const [nombreEmergencia, setNombreEmergencia] = useState(usuario?.nombreEmergencia || '');
  const [numeroEmergencia, setNumeroEmergencia] = useState(usuario?.numeroEmergencia || '');

  const [estadisticas, setEstadisticas] = useState({
    totalPedidos: 0,
    pedidosEntregados: 0,
    pedidosCancelados: 0,
    totalGastado: 0,
    promedioCalificacion: 0,
    totalCalificaciones: 0
  });

  const [cargando, setCargando] = useState({
    pedidos: true,
    calificaciones: true,
    pagos: true
  });

  // Obtener pedidos
  useEffect(() => {
    const obtenerPedidos = async () => {
      if (!token || !usuario?.idUsuarios) return;
      try {
        setCargando(prev => ({ ...prev, pedidos: true }));
        const respuesta = await fetch(
          `${API_URL}/pedidos/mis-pedidos`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (respuesta.ok) {
          const data = await respuesta.json();
          const pedidosData = Array.isArray(data) ? data : [];
          const entregados = pedidosData.filter(v => v.estado === 'ENTREGADO' || v.estado === 'ENTREGADO').length;
          const cancelados = pedidosData.filter(v => v.estado === 'CANCELADO').length;
          const totalGastado = pedidosData.reduce((sum, v) => sum + (v.total || 0), 0);

          setEstadisticas(prev => ({
            ...prev,
            totalPedidos: pedidosData.length,
            pedidosEntregados: entregados,
            pedidosCancelados: cancelados,
            totalGastado
          }));
        }
      } catch (error) {
        console.error("Error en obtenerPedidos:", error);
      } finally {
        setCargando(prev => ({ ...prev, pedidos: false }));
      }
    };
    obtenerPedidos();
  }, [token, usuario?.idUsuarios]);

  // Obtener calificaciones - CORREGIDO
  useEffect(() => {
    const obtenerCalificaciones = async () => {
      if (!token || !usuario?.idUsuarios) return;
      try {
        setCargando(prev => ({ ...prev, calificaciones: true }));
        const respuesta = await fetch(
          `${API_URL}/calificaciones/${usuario.idUsuarios}/promedio`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (respuesta.ok) {
          const data = await respuesta.json();
          console.log("📊 Calificaciones recibidas:", data);
          
          // CORRECCIÓN: La estructura es { promedio: { promedio: X, total: Y } }
          if (data && data.promedio) {
            setEstadisticas(prev => ({
              ...prev,
              promedioCalificacion: data.promedio.promedio || 0,
              totalCalificaciones: data.promedio.total || 0
            }));
          } else {
            setEstadisticas(prev => ({
              ...prev,
              promedioCalificacion: 0,
              totalCalificaciones: 0
            }));
          }
        } else {
          console.log("Error en respuesta:", respuesta.status);
          setEstadisticas(prev => ({
            ...prev,
            promedioCalificacion: 0,
            totalCalificaciones: 0
          }));
        }
      } catch (error) {
        console.error("Error al obtener calificaciones:", error);
        setEstadisticas(prev => ({
          ...prev,
          promedioCalificacion: 0,
          totalCalificaciones: 0
        }));
      } finally {
        setCargando(prev => ({ ...prev, calificaciones: false }));
      }
    };
    obtenerCalificaciones();
  }, [token, usuario?.idUsuarios]);

  const formatearFecha = (fecha) => {
    if (!fecha) return '---';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return '---';
    }
  };

  const formatearMoneda = (valor) => {
    try {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(valor || 0);
    } catch (error) {
      return '$0';
    }
  };

  const formatearCalificacion = (valor) => {
    if (valor === null || valor === undefined) return '0.0';
    const num = Number(valor);
    return isNaN(num) ? '0.0' : num.toFixed(1);
  };

  // Función para renderizar estrellas (igual que en DriverProfile)
  const renderStars = (promedio) => {
    const stars = [];
    const fullStars = Math.floor(promedio);
    const hasHalfStar = promedio % 1 >= 0.5;
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) stars.push(<FaStar key={i} style={{ color: accentColor, fontSize: '14px', marginRight: '2px' }} />);
      else if (i === fullStars + 1 && hasHalfStar) stars.push(<FaStar key={i} style={{ color: accentColor, fontSize: '14px', marginRight: '2px', opacity: 0.5 }} />);
      else stars.push(<FaStar key={i} style={{ color: '#e9ecef', fontSize: '14px', marginRight: '2px' }} />);
    }
    return <div style={{ display: 'flex' }}>{stars}</div>;
  };
  
  const guardarCambios = async () => {
    try {
      setLoadingUpdate(true);
      const response = await fetch(`${API_URL}/auth/${usuario.idUsuarios}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, telefono, nombreEmergencia, numeroEmergencia })
      });

      if (response.ok) {
        setUsuario({ ...usuario, nombre, telefono, nombreEmergencia, numeroEmergencia });
        toast.success('Datos actualizados correctamente');
      } else {
        toast.error('Error al actualizar los datos');
      }
    } catch (error) {
      toast.error('Error al guardar los cambios');
    } finally {
      setLoadingUpdate(false);
    }
  };
 
  const generarQr = () => {
    if (!token) return toast.error("No hay Token disponible.");
    setQrValue(`${token}|${usuario?.nombre || ''}`);
    setShowQRModal(true);
  };

  const estaCargando = cargando.pedidos || cargando.calificaciones;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `url(${fondo})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Overlay blanco semitransparente como en DriverProfile */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.65)',
        zIndex: 0
      }} />

      <Toaster position="top-right" />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <Navbar transparent={true} />

        <Container className="py-5">
          <Row className="justify-content-center">
            <Col lg={10}>
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '1rem',
                border: 'none',
                boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.075)',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '1.5rem',
                  borderBottom: '1px solid #e9ecef',
                  backgroundColor: '#ffffff'
                }}>
                  <h2 style={{ fontWeight: 'bold', margin: 0, color: brandColor }}>
                    Mi Perfil de Cliente
                  </h2>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: window.innerWidth < 992 ? '1fr' : '1fr 2fr',
                  gap: '0'
                }}>
                  {/* Columna izquierda - Foto y resumen */}
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '1.5rem',
                    textAlign: 'center',
                    borderRight: window.innerWidth < 992 ? 'none' : '1px solid #e9ecef',
                    borderBottom: window.innerWidth < 992 ? '1px solid #e9ecef' : 'none'
                  }}>
                    <div style={{ marginBottom: '1rem' }}>
                      {usuario?.fotoPerfil ? (
                        <img
                          src={usuario.fotoPerfil}
                          alt="Perfil"
                          style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.075)',
                            border: `3px solid ${brandColor}`,
                            maxWidth: '100%'
                          }}
                        />
                      ) : (
                        <FaUserCircle size={150} color={brandColor} style={{ boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.075)', borderRadius: '50%', backgroundColor: 'white', padding: '0.25rem', maxWidth: '100%', width: '150px', height: '150px' }} />
                      )}
                    </div>

                    <h3 style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: brandColor, fontSize: window.innerWidth < 576 ? '1.25rem' : '1.5rem' }}>
                      {usuario?.nombre}
                    </h3>

                    {estaCargando ? (
                      <div style={{ marginBottom: '1rem' }}>
                        <Spinner size="sm" style={{ color: accentColor }} />
                      </div>
                    ) : (
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        backgroundColor: accentColor,
                        color: '#ffffff',
                        padding: '0.25rem 1rem',
                        borderRadius: '2rem',
                        marginBottom: '1rem',
                        flexWrap: 'wrap'
                      }}>
                        <FaStar />
                        {formatearCalificacion(estadisticas.promedioCalificacion)}
                        ({estadisticas.totalCalificaciones || 0})
                      </div>
                    )}

                    {/* Botón de QR */}
                    <CustomButton
                      variant="outline-primary"
                      onClick={generarQr}
                      style={{ marginBottom: '1rem' }}
                    >
                      <FaQrcode style={{ marginRight: '0.5rem' }} />
                      Generar QR de acceso
                    </CustomButton>

                    <hr style={{ margin: '1rem 0' }} />

                    {/* Información de estadísticas */}
                    <div style={{ textAlign: 'left', padding: '0 1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        <FaCalendarAlt style={{ marginRight: '0.5rem', color: accentColor }} />
                        Miembro desde
                      </p>
                      <p style={{ fontWeight: 'bold', marginBottom: '1rem', color: brandColor, wordBreak: 'break-word' }}>{formatearFecha(usuario?.creadoEn)}</p>

                      <p style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        <FaRoute style={{ marginRight: '0.5rem', color: accentColor }} />
                        Pedidos realizados
                      </p>
                      <p style={{ fontWeight: 'bold', marginBottom: '1rem', color: brandColor }}>{estadisticas.totalPedidos} pedidos</p>

                      <p style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        <FaWallet style={{ marginRight: '0.5rem', color: accentColor }} />
                        Total Gastado
                      </p>
                      <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: accentColor, wordBreak: 'break-word' }}>
                        {formatearMoneda(estadisticas.totalGastado)}
                      </p>
                    </div>
                  </div>

                  {/* Columna derecha - Información detallada */}
                  <div style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                    <h4 style={{ fontWeight: 'bold', marginBottom: '1rem', color: brandColor }}>
                      Información de Cuenta
                    </h4>

                    {/* Tarjetas de información */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: window.innerWidth < 576 ? '1fr' : '1fr 1fr',
                      gap: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        height: '100%'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <FaUser style={{ marginRight: '0.5rem', color: accentColor }} />
                          <span style={{ fontWeight: 'bold', fontSize: '0.875rem', color: brandColor, textTransform: 'uppercase' }}>
                            Nombre Completo
                          </span>
                        </div>
                        <p style={{ fontWeight: 'bold', marginBottom: 0, fontSize: '1.1rem', color: brandColor, wordBreak: 'break-word' }}>
                          {usuario?.nombre}
                        </p>
                      </div>

                      <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        height: '100%'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <FaIdCard style={{ marginRight: '0.5rem', color: accentColor }} />
                          <span style={{ fontWeight: 'bold', fontSize: '0.875rem', color: brandColor, textTransform: 'uppercase' }}>
                            Teléfono
                          </span>
                        </div>
                        <p style={{ fontWeight: 'bold', marginBottom: 0, fontSize: '1.1rem', color: brandColor, wordBreak: 'break-word' }}>
                          {usuario?.telefono || 'No registrado'}
                        </p>
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: window.innerWidth < 576 ? '1fr' : '1fr 1fr',
                      gap: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        height: '100%'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <FaUser style={{ marginRight: '0.5rem', color: accentColor }} />
                          <span style={{ fontWeight: 'bold', fontSize: '0.875rem', color: brandColor, textTransform: 'uppercase' }}>
                            Nombre Emergencia
                          </span>
                        </div>
                        <input
                          type="text"
                          value={nombreEmergencia}
                          onChange={(e) => setNombreEmergencia(e.target.value)}
                          placeholder="Nombre del contacto"
                          className="form-control"
                          style={{
                            backgroundColor: 'transparent',
                            border: '1px solid #ced4da',
                            borderRadius: '0.375rem',
                            padding: '0.375rem 0.75rem',
                            fontWeight: 'bold',
                            color: brandColor,
                            width: '100%'
                          }}
                        />
                      </div>

                      <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        height: '100%'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <FaPhone style={{ marginRight: '0.5rem', color: accentColor }} />
                          <span style={{ fontWeight: 'bold', fontSize: '0.875rem', color: brandColor, textTransform: 'uppercase' }}>
                            Número Emergencia
                          </span>
                        </div>
                        <input
                          type="text"
                          value={numeroEmergencia}
                          onChange={(e) => setNumeroEmergencia(e.target.value)}
                          placeholder="Número del contacto"
                          className="form-control"
                          style={{
                            backgroundColor: 'transparent',
                            border: '1px solid #ced4da',
                            borderRadius: '0.375rem',
                            padding: '0.375rem 0.75rem',
                            fontWeight: 'bold',
                            color: brandColor,
                            width: '100%'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: 'none'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <FaWallet style={{ marginRight: '0.5rem', color: accentColor }} />
                          <span style={{ fontWeight: 'bold', fontSize: '0.875rem', color: brandColor, textTransform: 'uppercase' }}>
                            Correo Electrónico
                          </span>
                        </div>
                        <p style={{ fontWeight: 'bold', marginBottom: 0, fontSize: '1.1rem', color: brandColor, wordBreak: 'break-word' }}>
                          {usuario?.email}
                        </p>
                      </div>
                    </div>

                    <div className="d-flex gap-2 mb-4">
                        <CustomButton
                            variant="success"
                            onClick={guardarCambios}
                            disabled={loadingUpdate}
                            style={{ flex: 1 }}
                        >
                            <FaSave style={{ marginRight: '0.5rem' }} /> 
                            {loadingUpdate ? 'Guardando...' : 'Guardar Cambios Profile'}
                        </CustomButton>
                    </div>

                    <h4 style={{ fontWeight: 'bold', marginBottom: '1rem', color: brandColor }}>
                      Resumen de Actividad
                    </h4>

                    {/* Tarjetas de estadísticas */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: window.innerWidth < 576 ? '1fr' : window.innerWidth < 768 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                      gap: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{
                        backgroundColor: '#ffffff',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.075)',
                        textAlign: 'center',
                        height: '100%'
                      }}>
                        <h5 style={{ fontWeight: 'bold', marginBottom: 0, color: accentColor, fontSize: '2rem' }}>
                          {estadisticas.pedidosEntregados}
                        </h5>
                        <small style={{ color: '#6c757d', fontWeight: 'bold', textTransform: 'uppercase' }}>Entregados</small>
                      </div>
                      <div style={{
                        backgroundColor: '#ffffff',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.075)',
                        textAlign: 'center',
                        height: '100%'
                      }}>
                        <h5 style={{ fontWeight: 'bold', marginBottom: 0, color: accentColor, fontSize: '2rem' }}>
                          {estadisticas.pedidosCancelados}
                        </h5>
                        <small style={{ color: '#6c757d', fontWeight: 'bold', textTransform: 'uppercase' }}>Cancelados</small>
                      </div>
                      <div style={{
                        backgroundColor: '#ffffff',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.075)',
                        textAlign: 'center',
                        height: '100%'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <FaStar style={{ marginRight: '0.5rem', color: accentColor }} />
                          <h5 style={{ fontWeight: 'bold', marginBottom: 0, color: accentColor, fontSize: '2rem' }}>
                            {formatearCalificacion(estadisticas.promedioCalificacion)}
                          </h5>
                        </div>
                        <small style={{ color: '#6c757d', fontWeight: 'bold', textTransform: 'uppercase' }}>Calificación</small>
                      </div>
                    </div>

                    {/* Botón de volver */}
                    <CustomButton
                      variant="success"
                      onClick={() => navigate('/user-home')}
                    >
                      <FaHistory style={{ marginRight: '0.5rem' }} />
                      Volver al Inicio
                    </CustomButton>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <QRModal
        show={showQRModal}
        onHide={() => setShowQRModal(false)}
        qrValue={qrValue}
        usuario={usuario}
        titulo="Tu QR de Acceso"
        mensajeExpiracion="Valido para recibir tu domicilio"
      />
    </div>
  );
}

export default Profile;