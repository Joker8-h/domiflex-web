import React, { useState, useEffect } from "react";
import { CircleUserRound, FileText, QrCode, IdCard, Star, User, Save, Car } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../../components/Navbar";
import { Container, Row, Col, Form, Spinner } from "react-bootstrap";

import QRModal from "../../components/QRModal";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import { API_URL } from "../../config";
import fondo from "../Imagenes/AutoresContacto.png";

// Componentes personalizados
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

function DriverProfile() {
  const { usuario, token, setUsuario } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [telefono, setTelefono] = useState(usuario?.telefono || '');
  const [nombreEmergencia, setNombreEmergencia] = useState(usuario?.nombreEmergencia || '');
  const [numeroEmergencia, setNumeroEmergencia] = useState(usuario?.numeroEmergencia || '');
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehiculo, setVehiculo] = useState(null);
  const [cargandoVehiculo, setCargandoVehiculo] = useState(true);
  const [datosCalificacion, setDatosCalificacion] = useState({
    promedio: 0,
    total: 0
  });
  const [totalPedidos, setTotalPedidos] = useState(0);

  const [documentos, setDocumentos] = useState([]);
  const [cargandoDocumentos, setCargandoDocumentos] = useState(false);
  const [errorDocumentos, setErrorDocumentos] = useState("");
  const [licencia, setLicencia] = useState(null);

  useEffect(() => {
    const obtenerVehiculo = async () => {
      if (!token) return;
      try {
        const respuesta = await fetch(`${API_URL}/vehiculos/mis-vehiculos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (respuesta.ok) {
          const data = await respuesta.json();
          if (Array.isArray(data) && data.length > 0) {
            setVehiculo(data[0]);
          } else if (data && typeof data === 'object') {
            setVehiculo(data);
          }
        }
      } catch (error) {
        console.error("Error al obtener vehículo:", error);
      } finally {
        setCargandoVehiculo(false);
      }
    };
    obtenerVehiculo();
  }, [token]);

  useEffect(() => {
    const obtenerCalificaciones = async () => {
      if (!token || !usuario?.idUsuarios) return;
      try {
        const respuesta = await fetch(`${API_URL}/calificaciones/${usuario.idUsuarios}/promedio`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (respuesta.ok) {
          const data = await respuesta.json();
          console.log("📊 Calificaciones recibidas:", data);

      
          if (data && data.promedio) {
            setDatosCalificacion({ 
              promedio: data.promedio.promedio || 0, 
              total: data.promedio.total || 0
            });
          } else {
            setDatosCalificacion({ promedio: 0, total: 0 });
          }
        } else {
          console.log("Error en respuesta:", respuesta.status);
          setDatosCalificacion({ promedio: 0, total: 0 });
        }
      } catch (error) {
        console.error("Error al obtener calificaciones:", error);
        setDatosCalificacion({ promedio: 0, total: 0 });
      }
    };
    obtenerCalificaciones();
  }, [token, usuario?.idUsuarios]);

  useEffect(() => {
    const obtenerEstadisticasPedidos = async () => {
      if (!token || !usuario?.idUsuarios) return;
      try {
        const respuesta = await fetch(`${API_URL}/pedidos/mis-pedidos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (respuesta.ok) {
          const data = await respuesta.json();
          console.log("🚗 Pedidos recibidos:", data);

          if (Array.isArray(data)) {
            const pedidosEntregados = data.filter(v => v.estado === 'ENTREGADO');
            setTotalPedidos(pedidosEntregados.length);
          } else if (data && data.totalPedidos) {
            setTotalPedidos(data.totalPedidos);
          } else {
            setTotalPedidos(0);
          }
        }
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        setTotalPedidos(0);
      }
    };
    obtenerEstadisticasPedidos();
  }, [token, usuario?.idUsuarios]);

  useEffect(() => {
    const obtenerDocumentos = async () => {
      if (!token || !usuario?.idUsuarios) return;
      try {
        setCargandoDocumentos(true);
        setErrorDocumentos("");

        const response = await fetch(`${API_URL}/documentacion/documentacion_mis`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log("📄 Documentos recibidos:", data);

          let docsArray = [];
          if (Array.isArray(data)) {
            docsArray = data;
          } else if (data && Array.isArray(data.documentos)) {
            docsArray = data.documentos;
          } else if (data && typeof data === 'object') {
            docsArray = [data];
          }

          setDocumentos(docsArray);

          const licenciaEncontrada = docsArray.find(doc =>
            doc.tipoDocumento?.toLowerCase().includes('licencia') ||
            doc.tipoDocumento?.toLowerCase().includes('conducir') ||
            doc.tipoDocumento === 'LICENCIA_CONDUCCION'
          );

          console.log("🎯 Licencia encontrada:", licenciaEncontrada);
          setLicencia(licenciaEncontrada || null);

        } else if (response.status === 404) {
          console.log("No se encontraron documentos");
          setDocumentos([]);
          setLicencia(null);
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error al obtener documentos:", error);
        setErrorDocumentos(error.message);
      } finally {
        setCargandoDocumentos(false);
      }
    };

    obtenerDocumentos();
  }, [token, usuario?.idUsuarios]);

  const guardarCambios = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  const getBadgeColor = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'APROBADO':
      case 'VÁLIDO':
      case 'VALIDO':
        return 'success';
      case 'PENDIENTE':
      case 'REVISION':
        return 'warning';
      case 'RECHAZADO':
      case 'VENCIDO':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const formatearFechaExpedicion = (fecha) => {
    if (!fecha) return 'No disponible';
    return fecha;
  };

  const formatearFechaSubida = (fecha) => {
    if (!fecha) return 'No disponible';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return fecha;
    }
  };

  // Función para formatear el promedio de manera segura
  const formatearPromedio = (promedio) => {
    if (promedio === undefined || promedio === null) return '0.0';
    if (typeof promedio === 'number') return promedio.toFixed(1);
    if (typeof promedio === 'string') {
      const num = parseFloat(promedio);
      return isNaN(num) ? '0.0' : num.toFixed(1);
    }
    return '0.0';
  };

  // Función para renderizar estrellas
  const renderStars = (promedio) => {
    const stars = [];
    const fullStars = Math.floor(promedio);
    const hasHalfStar = promedio % 1 >= 0.5;
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) stars.push(<Star key={i} style={{ color: '#62d8d9', fontSize: '14px', marginRight: '2px' }} />);
      else if (i === fullStars + 1 && hasHalfStar) stars.push(<Star key={i} style={{ color: '#62d8d9', fontSize: '14px', marginRight: '2px', opacity: 0.5 }} />);
      else stars.push(<Star key={i} style={{ color: '#e9ecef', fontSize: '14px', marginRight: '2px' }} />);
    }
    return <div style={{ display: 'flex' }}>{stars}</div>;
  };

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
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
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
                  <h2 style={{ fontWeight: 'bold', margin: 0, color: '#113d69' }}>Mi Perfil de Repartidor</h2>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: window.innerWidth < 992 ? '1fr' : '1fr 2fr',
                  gap: '0'
                }}>
                  {/* Columna izquierda */}
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
                            border: `3px solid #62d8d9`,
                            maxWidth: '100%'
                          }} 
                        />
                      ) : (
                        <CircleUserRound size={150} color="#62d8d9" style={{ boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.075)', borderRadius: '50%', backgroundColor: 'white', padding: '0.25rem', maxWidth: '100%', width: '150px', height: '150px' }} />
                      )}
                    </div>

                    <h3 style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: '#113d69', fontSize: window.innerWidth < 576 ? '1.25rem' : '1.5rem' }}>{nombre || usuario?.nombre}</h3>
                    
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      backgroundColor: '#62d8d9',
                      color: '#ffffff',
                      padding: '0.25rem 1rem',
                      borderRadius: '2rem',
                      marginBottom: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <Star /> {formatearPromedio(datosCalificacion.promedio)} ({datosCalificacion.total || 0} reseñas)
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <CustomButton variant="outline-success" onClick={() => navigate("/documentacion")}>
                        <FileText style={{ marginRight: '0.5rem' }} /> Subir Documentación
                      </CustomButton>

                      <CustomButton 
                        variant="outline-primary" 
                        onClick={() => { setQrValue(`${token}|${usuario?.nombre}`); setShowQRModal(true); }}
                      >
                        <QrCode style={{ marginRight: '0.5rem' }} /> Generar QR
                      </CustomButton>
                    </div>

                    <hr style={{ margin: '1rem 0' }} />
                    
                    <div style={{ textAlign: 'left', padding: '0 1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>PEDIDOS ENTREGADOS</p>
                      <p style={{ fontWeight: 'bold', color: '#113d69', margin: 0 }}>{totalPedidos} servicios</p>
                    </div>
                  </div>

                  {/* Columna derecha */}
                  <div style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                    <h4 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#113d69' }}>Información de Cuenta</h4>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: window.innerWidth < 576 ? '1fr' : '1fr 1fr',
                      gap: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#113d69', display: 'block', marginBottom: '0.25rem' }}>NOMBRE COMPLETO</label>
                        <input
                          type="text"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          placeholder="Tu nombre completo"
                          style={{
                            width: '100%',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #ced4da'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#113d69', display: 'block', marginBottom: '0.25rem' }}>TELÉFONO</label>
                        <input
                          type="text"
                          value={telefono}
                          onChange={(e) => setTelefono(e.target.value)}
                          placeholder="Tu número de teléfono"
                          style={{
                            width: '100%',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #ced4da'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: window.innerWidth < 576 ? '1fr' : '1fr 1fr',
                      gap: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#113d69', display: 'block', marginBottom: '0.25rem' }}>NOMBRE EMERGENCIA</label>
                        <input
                          type="text"
                          value={nombreEmergencia}
                          onChange={(e) => setNombreEmergencia(e.target.value)}
                          placeholder="Nombre del contacto"
                          style={{
                            width: '100%',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #ced4da'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#113d69', display: 'block', marginBottom: '0.25rem' }}>NÚMERO EMERGENCIA</label>
                        <input
                          type="text"
                          value={numeroEmergencia}
                          onChange={(e) => setNumeroEmergencia(e.target.value)}
                          placeholder="Número del contacto"
                          style={{
                            width: '100%',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #ced4da'
                          }}
                        />
                      </div>
                    </div>

                    <h4 style={{ fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '1rem', color: '#113d69' }}>Credenciales y Vehículo</h4>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: window.innerWidth < 576 ? '1fr' : '1fr 1fr',
                      gap: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      {/* Licencia */}
                      <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        height: '100%'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <IdCard style={{ marginRight: '0.5rem', color: '#62d8d9' }} />
                          <span style={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#113d69' }}>LICENCIA DE CONDUCIR</span>
                        </div>

                        {cargandoDocumentos ? (
                          <p style={{ marginBottom: 0, fontSize: '0.875rem', color: '#6c757d' }}>Cargando...</p>
                        ) : licencia ? (
                          <CustomListGroup>
                            <CustomListItem>
                              <span style={{ color: '#6c757d', fontSize: '0.75rem' }}>Número:</span>
                              <span style={{ fontWeight: 'bold', fontSize: '0.75rem', color: '#113d69' }}>{licencia.numeroDocumento || 'No disponible'}</span>
                            </CustomListItem>
                            <CustomListItem>
                              <span style={{ color: '#6c757d', fontSize: '0.75rem' }}>Expedición:</span>
                              <span style={{ fontWeight: 'bold', fontSize: '0.75rem', color: '#113d69' }}>{formatearFechaExpedicion(licencia.fechaExpedicion)}</span>
                            </CustomListItem>
                            <CustomListItem>
                              <span style={{ color: '#6c757d', fontSize: '0.75rem' }}>Subida:</span>
                              <span style={{ fontWeight: 'bold', fontSize: '0.75rem', color: '#113d69' }}>{formatearFechaSubida(licencia.fechaSubida)}</span>
                            </CustomListItem>
                            <CustomListItem>
                              <span style={{ color: '#6c757d', fontSize: '0.75rem' }}>Estado:</span>
                              <CustomBadge estado={licencia.estado}>
                                {licencia.estado || 'N/A'}
                              </CustomBadge>
                            </CustomListItem>
                            {licencia.observaciones && (
                              <div style={{ marginTop: '0.5rem' }}>
                                <small style={{ color: '#6c757d', display: 'block' }}>Observaciones:</small>
                                <small style={{ color: '#113d69' }}>{licencia.observaciones}</small>
                              </div>
                            )}
                          </CustomListGroup>
                        ) : (
                          <p style={{ marginBottom: 0, fontSize: '0.875rem', color: '#6c757d', marginTop: '0.5rem' }}>
                            No hay licencia registrada
                          </p>
                        )}
                      </div>

                      {/* Vehículo */}
                      <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        height: '100%'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <Car style={{ marginRight: '0.5rem', color: '#62d8d9' }} />
                          <span style={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#113d69' }}>VEHÍCULO</span>
                        </div>
                        
                        {cargandoVehiculo ? (
                          <p style={{ marginBottom: 0, fontSize: '0.875rem', color: '#6c757d' }}>Cargando...</p>
                        ) : vehiculo ? (
                          <>
                            <p style={{ marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                              Placa: <span style={{ fontWeight: 'bold', color: '#113d69' }}>{vehiculo.placa || 'No registrada'}</span>
                            </p>
                            <p style={{ marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                              Modelo: <span style={{ fontWeight: 'bold', color: '#113d69' }}>
                                {vehiculo.marca || ''} {vehiculo.modelo || ''}
                              </span>
                            </p>
                            <p style={{ marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                              Tipo: <span style={{ fontWeight: 'bold', color: '#113d69' }}>{vehiculo.tipo || 'No registrado'}</span>
                            </p>
                            <p style={{ marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                              Capacidad: <span style={{ fontWeight: 'bold', color: '#113d69' }}>{vehiculo.capacidad || 'N/A'} kg</span>
                            </p>
                            <p style={{ marginBottom: '0.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span style={{ color: '#6c757d' }}>Estado:</span>
                              <CustomBadge estado={vehiculo.estado === 'ACTIVO' ? 'APROBADO' : 'PENDIENTE'}>
                                {vehiculo.estado || 'N/A'}
                              </CustomBadge>
                            </p>
                          </>
                        ) : (
                          <p style={{ marginBottom: 0, fontSize: '0.875rem', color: '#6c757d' }}>No hay vehículo registrado</p>
                        )}
                      </div>
                    </div>

                    <CustomButton
                      variant="success"
                      onClick={guardarCambios}
                      disabled={loading}
                      style={{ width: '100%' }}
                    >
                      <Save style={{ marginRight: '0.5rem' }} /> {loading ? 'Guardando...' : 'GUARDAR CAMBIOS'}
                    </CustomButton>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <QRModal show={showQRModal} onHide={() => setShowQRModal(false)} qrValue={qrValue} usuario={usuario} />
    </div>
  );
}

export default DriverProfile;