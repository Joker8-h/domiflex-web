import React, { useState, useEffect, useCallback } from 'react';
import { Container, Modal, Form, Card, Row, Col, Spinner } from 'react-bootstrap';
import {
    BsCheckCircleFill,
    BsXCircleFill,
    BsEyeFill,
    BsCalendar3,
    BsFunnelFill,
    BsExclamationTriangleFill,
    BsEnvelopeFill,
    BsCashStack
} from 'react-icons/bs';
import { useAuth } from '../../pages/context/AuthContext';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';

// Componentes personalizados
const CustomBadge = ({ estado, children }) => {
    const estilos = {
        PENDIENTE: { backgroundColor: '#cccbd2af', color: '#113d69' },
        APROBADO: { backgroundColor: '#62d8d9', color: '#ffffff' },
        RECHAZADO: { backgroundColor: '#113d69', color: '#ffffff' }
    };

    const estilo = estilos[estado] || { backgroundColor: '#cccbd2af', color: '#113d69' };

    return (
        <span style={{
            ...estilo,
            padding: '0.25rem 0.75rem',
            borderRadius: '1rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            display: 'inline-block'
        }}>
            {children}
        </span>
    );
};

const CustomButton = ({ variant, onClick, children, disabled, style, className, size }) => {
    const getButtonStyle = () => {
        const baseStyle = {
            padding: size === 'sm' ? '0.25rem 0.5rem' : '0.5rem 1rem',
            borderRadius: '50px',
            border: variant.includes('outline') ? '2px solid' : 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            transition: 'all 0.2s',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem'
        };

        switch (variant) {
            case 'primary':
                return {
                    ...baseStyle,
                    backgroundColor: '#62d8d9',
                    color: '#ffffff',
                    borderColor: '#62d8d9'
                };
            case 'success':
                return {
                    ...baseStyle,
                    backgroundColor: '#62d8d9',
                    color: '#ffffff',
                    borderColor: '#62d8d9'
                };
            case 'danger':
                return {
                    ...baseStyle,
                    backgroundColor: '#113d69',
                    color: '#ffffff',
                    borderColor: '#113d69'
                };
            case 'outline-warning':
                return {
                    ...baseStyle,
                    backgroundColor: 'transparent',
                    color: '#113d69',
                    borderColor: '#113d69'
                };
            case 'outline-danger':
                return {
                    ...baseStyle,
                    backgroundColor: 'transparent',
                    color: '#113d69',
                    borderColor: '#113d69'
                };
            case 'outline-secondary':
                return {
                    ...baseStyle,
                    backgroundColor: 'transparent',
                    color: '#62d8d9',
                    borderColor: '#62d8d9'
                };
            case 'secondary':
                return {
                    ...baseStyle,
                    backgroundColor: '#cccbd2af',
                    color: '#113d69',
                    borderColor: 'transparent'
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
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                {children}
            </span>
        </button>
    );
};

const StatsCard = ({ color, bgColor, borderColor, count, label }) => {
    return (
        <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '1rem',
            border: 'none',
            boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.075)',
            textAlign: 'center',
            borderLeft: `4px solid ${borderColor}`,
            padding: '1rem'
        }}>
            <h2 style={{ fontWeight: 'bold', color: color, margin: 0 }}>
                {count}
            </h2>
            <small style={{ color: '#6c757d' }}>{label}</small>
        </div>
    );
};

function AdminReportesPago() {
    const { token } = useAuth();
    const [reportes, setReportes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroMes, setFiltroMes] = useState('');

    // Modal estados
    const [showModal, setShowModal] = useState(false);
    const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
    const [showRechazarModal, setShowRechazarModal] = useState(false);
    const [showVerificarModal, setShowVerificarModal] = useState(false);
    const [observaciones, setObservaciones] = useState('');
    const [procesando, setProcesando] = useState(false);

    const cargarReportes = useCallback(async () => {
        try {
            setLoading(true);
            let url = `${API_URL}/reportes-pago?`;
            if (filtroEstado) url += `estado=${filtroEstado}&`;
            if (filtroMes) url += `mes=${filtroMes}&`;

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setReportes(data);
            }
        } catch (err) {
            console.error('Error cargando reportes:', err);
            toast.error('Error al cargar reportes');
        } finally {
            setLoading(false);
        }
    }, [token, filtroEstado, filtroMes]);

    useEffect(() => {
        cargarReportes();
    }, [cargarReportes]);

    const aprobarReporte = async (id) => {
        try {
            setProcesando(true);
            const res = await fetch(`${API_URL}/reportes-pago/${id}/aprobar`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Reporte aprobado exitosamente');
                cargarReportes();
                setShowModal(false);
            } else {
                const err = await res.json();
                toast.error(err.message);
            }
        } catch (err) {
            toast.error('Error al aprobar reporte');
        } finally {
            setProcesando(false);
        }
    };

    const rechazarReporte = async (id) => {
        try {
            setProcesando(true);
            const res = await fetch(`${API_URL}/reportes-pago/${id}/rechazar`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ observaciones })
            });
            if (res.ok) {
                toast.success('Reporte rechazado');
                cargarReportes();
                setShowRechazarModal(false);
                setShowModal(false);
                setObservaciones('');
            } else {
                const err = await res.json();
                toast.error(err.message);
            }
        } catch (err) {
            toast.error('Error al rechazar reporte');
        } finally {
            setProcesando(false);
        }
    };

    const verificarMensuales = async () => {
        try {
            setProcesando(true);
            setShowVerificarModal(false);
            const res = await fetch(`${API_URL}/reportes-pago/verificar-mensuales`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                toast.success(`Verificación completada. ${data.suspendidos} repartidores suspendidos de ${data.verificados} verificados.`);
                cargarReportes();
            }
        } catch (err) {
            toast.error('Error en verificación mensual');
        } finally {
            setProcesando(false);
        }
    };

    const enviarRecordatorios = async () => {
        try {
            setProcesando(true);
            const res = await fetch(`${API_URL}/reportes-pago/enviar-recordatorios`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                toast.success(data.message);
            } else {
                const err = await res.json();
                toast.error(err.message);
            }
        } catch (err) {
            toast.error('Error al enviar recordatorios');
        } finally {
            setProcesando(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleModalExited = () => {
        setReporteSeleccionado(null);
    };

    const handleCloseRechazarModal = () => {
        setShowRechazarModal(false);
    };

    const handleRechazarModalExited = () => {
        setObservaciones('');
    };

    const handleCloseVerificarModal = () => {
        setShowVerificarModal(false);
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-CO', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const formatearMes = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-CO', {
            year: 'numeric', month: 'long'
        });
    };

    return (
        <div style={{ padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: '#113d69' }}>
                        <BsCashStack style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        Reportes de Pago
                    </h3>
                    <p style={{ color: '#6c757d', margin: 0 }}>Gestión de comprobantes de pago de repartidores</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <CustomButton
                        variant="outline-warning"
                        onClick={enviarRecordatorios}
                        disabled={procesando}
                    >
                        <span>
                            {procesando ? <Spinner size="sm" style={{ marginRight: '0.25rem' }} /> :
                                <BsEnvelopeFill style={{ marginRight: '0.25rem' }} />}
                        </span>
                        <span>Enviar Recordatorios</span>
                    </CustomButton>
                    <CustomButton
                        variant="outline-danger"
                        onClick={() => setShowVerificarModal(true)}
                        disabled={procesando}
                    >
                        <span>{procesando && <Spinner size="sm" style={{ marginRight: '0.25rem' }} />}</span>
                        <span>Verificar Pagos Mensuales</span>
                    </CustomButton>
                </div>
            </div>

            {/* Filtros */}
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '1rem',
                border: 'none',
                boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.075)',
                marginBottom: '1.5rem',
                padding: '1rem'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', alignItems: 'end' }}>
                    <div>
                        <label style={{ fontSize: '0.875rem', color: '#6c757d', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                            <BsFunnelFill /> Estado
                        </label>
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.375rem 0.75rem',
                                borderRadius: '50px',
                                border: '1px solid #ced4da'
                            }}
                        >
                            <option value="">Todos</option>
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="APROBADO">Aprobado</option>
                            <option value="RECHAZADO">Rechazado</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.875rem', color: '#6c757d', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                            <BsCalendar3 /> Mes
                        </label>
                        <input
                            type="month"
                            value={filtroMes}
                            onChange={(e) => setFiltroMes(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.375rem 0.75rem',
                                borderRadius: '50px',
                                border: '1px solid #ced4da'
                            }}
                        />
                    </div>
                    <div>
                        <CustomButton
                            variant="outline-secondary"
                            onClick={() => { setFiltroEstado(''); setFiltroMes(''); }}
                            style={{ width: '100%' }}
                        >
                            Limpiar filtros
                        </CustomButton>
                    </div>
                </div>
            </div>

            {/* Resumen rápido */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatsCard
                    count={reportes.filter(r => r.estado === 'PENDIENTE').length}
                    label="Pendientes"
                    color="#113d69"
                    borderColor="#62d8d9"
                />
                <StatsCard
                    count={reportes.filter(r => r.estado === 'APROBADO').length}
                    label="Aprobados"
                    color="#62d8d9"
                    borderColor="#62d8d9"
                />
                <StatsCard
                    count={reportes.filter(r => r.estado === 'RECHAZADO').length}
                    label="Rechazados"
                    color="#113d69"
                    borderColor="#113d69"
                />
            </div>

            {/* Tabla */}
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '1rem',
                border: 'none',
                boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.075)',
                overflow: 'hidden'
            }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <Spinner animation="border" style={{ color: '#62d8d9' }} />
                    </div>
                ) : reportes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ color: '#6c757d' }}>No hay reportes de pago</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#f8f9fa' }}>
                                <tr>
                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#113d69' }}>Repartidor</th>
                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#113d69' }}>Mes</th>
                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#113d69' }}>Monto Comisión</th>
                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#113d69' }}>Cant. Enviada</th>
                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#113d69' }}>Fecha Envío</th>
                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#113d69' }}>Estado</th>
                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#113d69' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportes.map(reporte => (
                                    <tr key={reporte.idReporte} style={{ borderBottom: '1px solid #e9ecef' }}>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                {reporte.usuario?.fotoPerfil ? (
                                                    <img
                                                        src={reporte.usuario.fotoPerfil}
                                                        alt=""
                                                        style={{
                                                            width: '35px',
                                                            height: '35px',
                                                            borderRadius: '50%',
                                                            marginRight: '0.5rem',
                                                            objectFit: 'cover',
                                                            border: `2px solid #62d8d9`
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: '35px',
                                                        height: '35px',
                                                        borderRadius: '50%',
                                                        marginRight: '0.5rem',
                                                        backgroundColor: '#62d8d9',
                                                        color: '#ffffff',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 'bold',
                                                        border: `2px solid #62d8d9`
                                                    }}>
                                                        {reporte.usuario?.nombre?.charAt(0) || 'C'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: '600', color: '#113d69' }}>{reporte.usuario?.nombre}</div>
                                                    <small style={{ color: '#6c757d' }}>{reporte.usuario?.email}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#113d69' }}>{formatearMes(reporte.mesCorrespondiente)}</td>
                                        <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold', color: '#62d8d9' }}>${Number(reporte.montoComision).toLocaleString()} COP</td>
                                        <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold', color: '#113d69' }}>
                                            {reporte.cantidadEnviada ? `$${Number(reporte.cantidadEnviada).toLocaleString()} COP` : '---'}
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#113d69' }}>{formatearFecha(reporte.fechaEnvio)}</td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <CustomBadge estado={reporte.estado}>
                                                {reporte.estado}
                                            </CustomBadge>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                            <CustomButton
                                                size="sm"
                                                variant="outline-secondary"
                                                onClick={() => { setReporteSeleccionado(reporte); setShowModal(true); }}
                                                style={{ marginRight: '0.25rem' }}
                                            >
                                                <BsEyeFill /> Ver
                                            </CustomButton>
                                            {reporte.estado === 'PENDIENTE' && (
                                                <>
                                                    <CustomButton
                                                        size="sm"
                                                        variant="success"
                                                        onClick={() => aprobarReporte(reporte.idReporte)}
                                                        disabled={procesando}
                                                        style={{ marginRight: '0.25rem' }}
                                                    >
                                                        <BsCheckCircleFill />
                                                    </CustomButton>
                                                    <CustomButton
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => { setReporteSeleccionado(reporte); setShowRechazarModal(true); }}
                                                    >
                                                        <BsXCircleFill />
                                                    </CustomButton>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Ver Detalle */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1050
                }} onClick={handleCloseModal}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '1rem',
                        maxWidth: '800px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflow: 'hidden'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            padding: '1rem',
                            borderBottom: `2px solid #62d8d9`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h5 style={{ margin: 0, color: '#113d69' }}>Detalle del Reporte de Pago</h5>
                            <button
                                onClick={handleCloseModal}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#6c757d'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
                            {reporteSeleccionado && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#113d69' }}>Repartidor:</strong> <span style={{ color: '#113d69' }}>{reporteSeleccionado.usuario?.nombre}</span></p>
                                        <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#113d69' }}>Email:</strong> <span style={{ color: '#113d69' }}>{reporteSeleccionado.usuario?.email}</span></p>
                                        <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#113d69' }}>Mes:</strong> <span style={{ color: '#113d69' }}>{formatearMes(reporteSeleccionado.mesCorrespondiente)}</span></p>
                                        <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#113d69' }}>Monto Esperado:</strong> <span style={{ fontWeight: 'bold', color: '#62d8d9' }}>${Number(reporteSeleccionado.montoComision).toLocaleString()} COP</span></p>
                                        <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#113d69' }}>Cantidad Enviada:</strong> <span style={{ fontWeight: 'bold', color: '#113d69' }}>{reporteSeleccionado.cantidadEnviada ? `$${Number(reporteSeleccionado.cantidadEnviada).toLocaleString()} COP` : 'No reportada'}</span></p>
                                        <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#113d69' }}>Estado:</strong> <CustomBadge estado={reporteSeleccionado.estado}>{reporteSeleccionado.estado}</CustomBadge></p>
                                        <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#113d69' }}>Fecha de envío:</strong> <span style={{ color: '#113d69' }}>{formatearFecha(reporteSeleccionado.fechaEnvio)}</span></p>
                                        {reporteSeleccionado.fechaRevision && (
                                            <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#113d69' }}>Fecha revisión:</strong> <span style={{ color: '#113d69' }}>{formatearFecha(reporteSeleccionado.fechaRevision)}</span></p>
                                        )}
                                        {reporteSeleccionado.observaciones && (
                                            <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#113d69' }}>Observaciones:</strong> <span style={{ color: '#113d69' }}>{reporteSeleccionado.observaciones}</span></p>
                                        )}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 'bold', color: '#113d69' }}>Comprobante de pago:</p>
                                        <img
                                            src={reporteSeleccionado.fotoComprobante}
                                            alt="Comprobante"
                                            style={{
                                                width: '100%',
                                                borderRadius: '0.5rem',
                                                maxHeight: '400px',
                                                objectFit: 'contain',
                                                border: '1px solid #62d8d9'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '1rem', borderTop: '1px solid #e9ecef', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            {reporteSeleccionado?.estado === 'PENDIENTE' && (
                                <>
                                    <CustomButton
                                        variant="success"
                                        onClick={() => aprobarReporte(reporteSeleccionado.idReporte)}
                                        disabled={procesando}
                                    >
                                        <span>{procesando ? <Spinner size="sm" style={{ marginRight: '0.25rem' }} /> : <BsCheckCircleFill style={{ marginRight: '0.25rem' }} />}</span>
                                        <span>Aprobar</span>
                                    </CustomButton>
                                    <CustomButton
                                        variant="danger"
                                        onClick={() => setShowRechazarModal(true)}
                                    >
                                        <BsXCircleFill style={{ marginRight: '0.25rem' }} /> Rechazar
                                    </CustomButton>
                                </>
                            )}
                            <CustomButton variant="secondary" onClick={handleCloseModal}>
                                Cerrar
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Rechazar */}
            {showRechazarModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1060
                }} onClick={handleCloseRechazarModal}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '1rem',
                        maxWidth: '500px',
                        width: '90%',
                        padding: '1.5rem'
                    }} onClick={(e) => e.stopPropagation()}>
                        <h5 style={{ marginBottom: '1rem', color: '#113d69', borderBottom: `2px solid #113d69`, paddingBottom: '0.5rem' }}>
                            Rechazar Reporte
                        </h5>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#113d69', display: 'block', marginBottom: '0.25rem' }}>
                                Motivo del rechazo
                            </label>
                            <textarea
                                rows={3}
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                placeholder="Ingrese el motivo del rechazo..."
                                style={{
                                    width: '100%',
                                    padding: '0.375rem 0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #ced4da'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <CustomButton variant="secondary" onClick={handleCloseRechazarModal}>
                                Cancelar
                            </CustomButton>
                            <CustomButton
                                variant="danger"
                                onClick={() => rechazarReporte(reporteSeleccionado?.idReporte)}
                                disabled={procesando}
                            >
                                <span>{procesando && <Spinner size="sm" style={{ marginRight: '0.25rem' }} />}</span>
                                <span>Confirmar Rechazo</span>
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Verificar Pagos Mensuales */}
            {showVerificarModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1070
                }} onClick={handleCloseVerificarModal}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '1rem',
                        maxWidth: '450px',
                        width: '90%',
                        padding: '2rem',
                        textAlign: 'center'
                    }} onClick={(e) => e.stopPropagation()}>
                        <BsExclamationTriangleFill size={48} style={{ color: '#113d69', marginBottom: '1rem' }} />
                        <h4 style={{ color: '#113d69', marginBottom: '1rem', fontWeight: '600' }}>
                            Verificar Pagos Mensuales
                        </h4>
                        <p style={{ color: '#6c757d', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            ¿Está seguro de ejecutar la verificación mensual?<br />
                            Los repartidores sin pago aprobado serán suspendidos.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <CustomButton
                                variant="secondary"
                                onClick={handleCloseVerificarModal}
                            >
                                Cancelar
                            </CustomButton>
                            <CustomButton
                                variant="danger"
                                onClick={verificarMensuales}
                                disabled={procesando}
                            >
                                <span>{procesando && <Spinner size="sm" style={{ marginRight: '0.25rem' }} />}</span>
                                <span>Confirmar Verificación</span>
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminReportesPago;