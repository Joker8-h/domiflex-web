import { useState, useEffect, useCallback } from "react";
import { CircleCheck, Info, ArrowRight, History, FileText, Funnel, Wallet, Search, IdCard, Route, Clock, Check, List, Car } from "lucide-react";
import { Container, Row, Col, Card, Modal, Alert, Spinner, Form, Image } from "react-bootstrap";

import {
    BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import Navbar from "../../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { API_URL, API_BASE_URL } from "../../config";
import fondo from "../Imagenes/AutoresContacto.png";
import toast from "react-hot-toast";

const EstadoPedidoBadge = ({ estado }) => {
    const estilos = {
        ENTREGADO: { backgroundColor: '#62d8d9', color: '#ffffff' },
        EN_CAMINO: { backgroundColor: '#113d69', color: '#ffffff' },
        RECOGIENDO: { backgroundColor: '#113d69', color: '#ffffff' },
        ASIGNADO: { backgroundColor: '#62d8d9', color: '#ffffff' },
        CANCELADO: { backgroundColor: '#cccbd2af', color: '#113d69' },
        CREADO: { backgroundColor: '#cccbd2af', color: '#113d69' }
    };

    const estilo = estilos[estado] || { backgroundColor: '#cccbd2af', color: '#113d69' };

    const getTexto = () => {
        switch(estado) {
            case 'ENTREGADO': return 'Entregado';
            case 'EN_CAMINO': return 'En camino';
            case 'RECOGIENDO': return 'Recogiendo';
            case 'ASIGNADO': return 'Asignado';
            case 'CANCELADO': return 'Cancelado';
            case 'CREADO': return 'Creado';
            default: return estado || 'Desconocido';
        }
    };

    return (
        <span style={{
            ...estilo,
            padding: '0.25rem 0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.8rem',
            fontWeight: '500',
            display: 'inline-block'
        }}>
            {getTexto()}
        </span>
    );
};

const DocumentoBadge = ({ estado }) => {
    const estilos = {
        APROBADO: { backgroundColor: '#62d8d9', color: '#ffffff' },
        RECHAZADO: { backgroundColor: '#dc3545', color: '#ffffff' },
        PENDIENTE: { backgroundColor: '#ffc107', color: '#113d69' }
    };

    const estilo = estilos[estado] || { backgroundColor: '#cccbd2af', color: '#113d69' };

    return (
        <span style={{
            ...estilo,
            padding: '0.25rem 0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.8rem',
            fontWeight: '500',
            display: 'inline-block'
        }}>
            {estado || 'No disponible'}
        </span>
    );
};

const StatsCard = ({ icon, title, value, color, bgColor }) => {
    return (
        <Card style={{
            background: "#ffffff",
            borderRadius: '20px',
            border: 'none',
            boxShadow: "0 10px 30px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.02)",
            borderBottom: `4px solid ${color}`,
            height: '100%'
        }}>
            <Card.Body className="d-flex align-items-center p-4">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: '50px', height: '50px', backgroundColor: bgColor, color: color }}>
                    {icon}
                </div>
                <div>
                    <h6 className="text-muted mb-0 small">{title}</h6>
                    <h4 className="fw-bold mb-0" style={{ color: '#113d69' }}>{value}</h4>
                </div>
            </Card.Body>
        </Card>
    );
};

const StatsBadge = ({ children, bgColor, color, isWhite = false }) => {
    if (isWhite) {
        return (
            <span style={{
                backgroundColor: '#ffffff',
                color: '#62d8d9',
                border: '1px solid #62d8d9',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                display: 'inline-block'
            }}>
                {children}
            </span>
        );
    }

    return (
        <span style={{
            backgroundColor: bgColor,
            color: color,
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            fontSize: '0.9rem',
            fontWeight: '500',
            display: 'inline-block'
        }}>
            {children}
        </span>
    );
};

const AccionButton = ({ variant, onClick, children, disabled, style }) => {
    const getButtonStyle = () => {
        if (variant === 'outline-primary') {
            return {
                backgroundColor: 'transparent',
                color: '#62d8d9',
                borderColor: '#62d8d9'
            };
        } else if (variant === 'primary') {
            return {
                backgroundColor: '#62d8d9',
                color: '#ffffff',
                borderColor: '#62d8d9'
            };
        } else if (variant === 'outline-secondary') {
            return {
                backgroundColor: 'transparent',
                color: '#113d69',
                borderColor: '#113d69'
            };
        } else if (variant === 'secondary') {
            return {
                backgroundColor: '#113d69',
                color: '#ffffff',
                borderColor: '#113d69'
            };
        }
        return {};
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                transition: 'all 0.2s',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: '1px solid',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                ...getButtonStyle(),
                ...style
            }}
        >
            {children}
        </button>
    );
};

const PeriodoBadge = ({ periodo, actual, onClick, children }) => {
    const isActive = periodo === actual;
    return (
        <span
            onClick={onClick}
            style={{
                cursor: 'pointer',
                backgroundColor: isActive ? '#62d8d9' : 'transparent',
                color: isActive ? '#ffffff' : '#113d69',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                display: 'inline-block',
                transition: 'all 0.2s'
            }}
        >
            {children}
        </span>
    );
};

const VehiculoImage = ({ vehiculo, size = 40, onClick }) => {
    const [imageError, setImageError] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        if (vehiculo?.fotoVehiculo) {
            const url = vehiculo.fotoVehiculo.startsWith('http')
                ? vehiculo.fotoVehiculo
                : `${API_BASE_URL}${vehiculo.fotoVehiculo}`;
            setImageUrl(url);
            setImageError(false);
        } else {
            setImageUrl(null);
        }
    }, [vehiculo]);

    if (!vehiculo) {
        return (
            <div style={{
                width: size,
                height: size,
                borderRadius: '12px',
                backgroundColor: '#62d8d915',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: onClick ? 'pointer' : 'default'
            }} onClick={onClick}>
                <Car size={size * 0.4} color="#62d8d9" />
            </div>
        );
    }

    if (vehiculo.fotoVehiculo && !imageError && imageUrl) {
        return (
            <div style={{
                width: size,
                height: size,
                borderRadius: '12px',
                overflow: 'hidden',
                border: `2px solid #62d8d9`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: onClick ? 'pointer' : 'default'
            }} onClick={onClick}>
                <img
                    src={imageUrl}
                    alt={`${vehiculo.marca} ${vehiculo.modelo}`}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                    onError={() => {
                        setImageError(true);
                    }}
                />
            </div>
        );
    }

    return (
        <div style={{
            width: size,
            height: size,
            borderRadius: '12px',
            backgroundColor: '#62d8d915',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            fontSize: size * 0.2,
            fontWeight: 'bold',
            color: '#62d8d9',
            cursor: onClick ? 'pointer' : 'default'
        }} onClick={onClick}>
            {vehiculo.marca && vehiculo.modelo ? (
                <>
                    <span>{vehiculo.marca.charAt(0)}{vehiculo.modelo.charAt(0)}</span>
                    <Car size={size * 0.3} color="#62d8d9" style={{ marginTop: 2 }} />
                </>
            ) : (
                <Car size={size * 0.4} color="#62d8d9" />
            )}
        </div>
    );
};

const SIGUIENTE_ESTADO = { ASIGNADO: 'RECOGIENDO', RECOGIENDO: 'EN_CAMINO', EN_CAMINO: 'ENTREGADO' };

const DriverHome = () => {
    const { usuario, token } = useAuth();
    const { socket } = useSocket();
    const navigate = useNavigate();

    const [showTutorial, setShowTutorial] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [vehiculos, setVehiculos] = useState([]);
    const [cargandoVehiculo, setCargandoVehiculo] = useState(true);
    const [errorVehiculo, setErrorVehiculo] = useState("");

    const [showVehiculosModal, setShowVehiculosModal] = useState(false);
    const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);

    const [ganancias, setGanancias] = useState({
        hoy: 0,
        estaSemana: 0,
        esteMes: 0
    });
    const [documentos, setDocumentos] = useState([]);
    const [cargandoDocumentos, setCargandoDocumentos] = useState(false);
    const [errorDocumentos, setErrorDocumentos] = useState("");

    const [pedidosRecientes, setPedidosRecientes] = useState([]);
    const [todosLosPedidos, setTodosLosPedidos] = useState([]);
    const [cargandoPedidos, setCargandoPedidos] = useState(false);
    const [errorPedidos, setErrorPedidos] = useState("");
    const [showHistorialCompleto, setShowHistorialCompleto] = useState(false);
    const [estadisticasPedidos, setEstadisticasPedidos] = useState({
        entregados: 0,
        cancelados: 0,
        enCamino: 0
    });

    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState("");

    const [busquedaPedidos, setBusquedaPedidos] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("TODOS");
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [showDetallePedido, setShowDetallePedido] = useState(false);

    const [statsAvanzadas, setStatsAvanzadas] = useState({
        ganancias: { total: 0, historial: [] },
        tiempoEnLinea: { totalHoras: 0, historial: [] },
        rutasFrecuentes: [],
        resumenPedidos: { total: 0, rol: '' }
    });
    const [periodo, setPeriodo] = useState('mensual');
    const [cargandoStats, setCargandoStats] = useState(false);

    const [showSolicitudModal, setShowSolicitudModal] = useState(false);
    const [formDataSolicitud, setFormDataSolicitud] = useState({
        marca: '',
        modelo: '',
        placa: '',
        tipo: 'MOTO',
        capacidad: ''
    });
    const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
    const [mensajeSolicitud, setMensajeSolicitud] = useState({ tipo: '', texto: '' });

    // Pedidos en CREADO disponibles para auto-asignación + acciones sobre mis pedidos
    const [pedidosDisponibles, setPedidosDisponibles] = useState([]);
    const [cargandoDisponibles, setCargandoDisponibles] = useState(false);
    const [asignandoId, setAsignandoId] = useState(null);
    const [accionPedidoId, setAccionPedidoId] = useState(null);
    const [paradasPedido, setParadasPedido] = useState([]);

    const [comisionInfo, setComisionInfo] = useState(null);
    const [cargandoComision, setCargandoComision] = useState(false);
    const [fotoComprobante, setFotoComprobante] = useState('');
    const [montoADepositar, setMontoADepositar] = useState('');
    const [enviandoReporte, setEnviandoReporte] = useState(false);
    const [misReportes, setMisReportes] = useState([]);

    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem("tutorial_repartidor_visto");
        if (!hasSeenTutorial) setShowTutorial(true);
    }, []);

    const cargarComision = useCallback(async () => {
        if (!token) return;
        try {
            setCargandoComision(true);
            const res = await fetch(`${API_URL}/reportes-pago/comision`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setComisionInfo(data);
                if (data.totalComision !== undefined) {
                    setMontoADepositar(data.totalComision.toString());
                }
            }
        } catch (err) {
            console.error('Error cargando comisión:', err);
        } finally {
            setCargandoComision(false);
        }
    }, [token]);

    const cargarMisReportes = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/reportes-pago`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMisReportes(data);
            }
        } catch (err) {
            console.error('Error cargando reportes:', err);
        }
    }, [token]);

    const enviarReportePago = async () => {
        if (!fotoComprobante) {
            toast.error('Debes adjuntar la foto del comprobante');
            return;
        }
        try {
            setEnviandoReporte(true);
            const payload = { 
                fotoComprobante,
                cantidad: montoADepositar 
            };

            const res = await fetch(`${API_URL}/reportes-pago`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success('Comprobante enviado exitosamente. El administrador lo revisará.');
                setFotoComprobante('');
                cargarComision();
                cargarMisReportes();
            } else {
                const errText = await res.text();
                try {
                    const errJson = JSON.parse(errText);
                    toast.error(`Error del servidor: ${errJson.message || errJson.error || 'Petición rechazada'}`);
                } catch (e) {
                    toast.error(`Error del servidor (Código: ${res.status})`);
                }
            }
        } catch (err) {
            toast.error('Error de conexión al enviar comprobante');
        } finally {
            setEnviandoReporte(false);
        }
    };

    const comprimirImagen = (base64, maxSizeKB = 300) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDimension = 1200;
                if (width > height && width > maxDimension) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                } else if (height > maxDimension) {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                let calidad = 0.8;
                let comprimida = canvas.toDataURL('image/jpeg', calidad);
                while (comprimida.length > maxSizeKB * 1024 && calidad > 0.3) {
                    calidad -= 0.1;
                    comprimida = canvas.toDataURL('image/jpeg', calidad);
                }
                resolve(comprimida);
            };
            img.onerror = () => resolve(base64);
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('La imagen no debe superar 5MB');
                return;
            }
            const loadingToastId = toast.loading('Procesando imagen...');
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const base64Comprimido = await comprimirImagen(reader.result, 300);
                    setFotoComprobante(base64Comprimido);
                    toast.success('Imagen lista para enviar', { id: loadingToastId });
                } catch (error) {
                    setFotoComprobante(reader.result);
                    toast.dismiss(loadingToastId);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        cargarComision();
        cargarMisReportes();
    }, [cargarComision, cargarMisReportes]);

    useEffect(() => {
        const obtenerGanancias = async () => {
            if (!token || !usuario?.idUsuarios) return;
            try {
                const respuesta = await fetch(`${API_URL}/estadisticas/ganancias`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (respuesta.ok) {
                    const data = await respuesta.json();
                    setGanancias({
                        hoy: data.hoy || 0,
                        estaSemana: data.estaSemana || 0,
                        esteMes: data.esteMes || 0
                    });
                }
            } catch (error) {
                console.error("Error al obtener ganancias:", error);
            }
        };
        obtenerGanancias();
        const intervaloGanancias = setInterval(obtenerGanancias, 60000);
        return () => clearInterval(intervaloGanancias);
    }, [token, usuario?.idUsuarios]);

    async function obtenerDocumentos() {
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

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error("No tienes permisos para ver documentos");
                }
                if (response.status === 404) {
                    setDocumentos([]);
                    setCargandoDocumentos(false);
                    return;
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            let documentosArray = [];

            if (Array.isArray(data)) {
                documentosArray = data;
            } else if (data && Array.isArray(data.documentos)) {
                documentosArray = data.documentos;
            } else if (data && typeof data === 'object') {
                documentosArray = [data];
            }

            setDocumentos(documentosArray);

        } catch (error) {
            setErrorDocumentos(error.message);
            setDocumentos([]);
        } finally {
            setCargandoDocumentos(false);
        }
    }

    useEffect(() => {
        obtenerDocumentos();
    }, [token, usuario?.idUsuarios]);

    useEffect(() => {
        const obtenerPedidos = async () => {
            if (!token || !usuario?.idUsuarios) return;

            try {
                setCargandoPedidos(true);
                setErrorPedidos("");

                const respuesta = await fetch(`${API_URL}/pedidos/mis-pedidos`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (respuesta.ok) {
                    const data = await respuesta.json();

                    const pedidosData = Array.isArray(data) ? data : [];

                    setTodosLosPedidos(pedidosData);
                    setPedidosRecientes(pedidosData.slice(0, 3));

                    const entregados = pedidosData.filter(v => v.estado === 'ENTREGADO').length;
                    const cancelados = pedidosData.filter(v => v.estado === 'CANCELADO').length;
                    const enCamino = pedidosData.filter(v => v.estado === 'EN_CAMINO').length;

                    setEstadisticasPedidos({ entregados, cancelados, enCamino });

                } else if (respuesta.status === 404) {
                    setPedidosRecientes([]);
                    setTodosLosPedidos([]);
                } else {
                    setErrorPedidos(`Error ${respuesta.status}: No se pudieron cargar los pedidos`);
                }
            } catch (error) {
                setErrorPedidos("Error de conexión con el servidor");
            } finally {
                setCargandoPedidos(false);
            }
        };

        obtenerPedidos();

        const intervaloPedidos = setInterval(obtenerPedidos, 60000);
        return () => clearInterval(intervaloPedidos);

    }, [token, usuario?.idUsuarios]);

    const filtrarPedidos = (pedidos) => {
        return pedidos.filter(pedido => {
            const textoBusqueda = busquedaPedidos.toLowerCase();
            const coincideBusqueda = textoBusqueda === '' ||
                pedido.idPedido.toString().includes(textoBusqueda) ||
                (pedido.ruta?.nombre?.toLowerCase().includes(textoBusqueda));

            const coincideEstado = filtroEstado === 'TODOS' || pedido.estado === filtroEstado;

            return coincideBusqueda && coincideEstado;
        });
    };

    const pedidosFiltrados = filtrarPedidos(todosLosPedidos);

    // --- COMISIÓN BASADA RECTAMENTE EN GANANCIAS ---
    const totalGananciasBackend = Number(statsAvanzadas.ganancias.total || 0);

    const displayComisionEnBaseABackend = comisionInfo;
    // -----------------------------------------------------------

    const traerEstadisticasAvanzadas = async () => {
        if (!token) return;
        try {
            setCargandoStats(true);
            const headers = { "Authorization": "Bearer " + token };

            const [resGanancias, resTime, resRutas, resPedidosHistory] = await Promise.all([
                fetch(`${API_URL}/estadisticas/ganancias?periodo=${periodo}`, { headers }),
                fetch(`${API_URL}/estadisticas/online-time?periodo=${periodo}`, { headers }),
                fetch(`${API_URL}/estadisticas/rutas`, { headers }),
                fetch(`${API_URL}/estadisticas/pedidos?periodo=${periodo}`, { headers })
            ]);

            const nuevasStats = { ...statsAvanzadas };

            if (resGanancias.ok) nuevasStats.ganancias = await resGanancias.json();
            if (resTime.ok) nuevasStats.tiempoEnLinea = await resTime.json();
            if (resRutas.ok) nuevasStats.rutasFrecuentes = await resRutas.json();
            if (resPedidosHistory.ok) nuevasStats.resumenPedidos = await resPedidosHistory.json();

            setStatsAvanzadas(nuevasStats);
        } catch (error) {
            console.error("Error al traer estadísticas avanzadas:", error);
        } finally {
            setCargandoStats(false);
        }
    };

    useEffect(() => {
        traerEstadisticasAvanzadas();
    }, [token, periodo]);

    const obtenerVehiculos = useCallback(async () => {
        if (!token) return;
        try {
            setCargandoVehiculo(true);
            setErrorVehiculo("");

            const respuesta = await fetch(`${API_URL}/vehiculos/mis-vehiculos`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (respuesta.ok) {
                const data = await respuesta.json();

                let vehiculosArray = [];
                if (Array.isArray(data)) {
                    vehiculosArray = data;
                } else if (data && typeof data === 'object') {
                    vehiculosArray = [data];
                }

                const vehiculosUsuario = vehiculosArray.filter(v => v.idUsuario === usuario?.idUsuarios);
                setVehiculos(vehiculosUsuario);
            } else if (respuesta.status === 404) {
                setVehiculos([]);
            } else {
                setErrorVehiculo(`Error ${respuesta.status}: No se pudieron cargar los datos`);
            }
        } catch (error) {
            setErrorVehiculo("Error de conexión con el servidor");
        } finally {
            setCargandoVehiculo(false);
        }
    }, [token, usuario?.idUsuarios]);

    useEffect(() => {
        obtenerVehiculos();
    }, [obtenerVehiculos]);

    const verTodosLosVehiculos = () => {
        setShowVehiculosModal(true);
    };

    const seleccionarVehiculoPrincipal = (vehiculo) => {
        setVehiculoSeleccionado(vehiculo);
        localStorage.setItem('vehiculoPrincipalId', vehiculo.idVehiculos);
        toast.success(`Vehículo ${vehiculo.marca} ${vehiculo.modelo} seleccionado como principal`);
        setShowVehiculosModal(false);
    };

    useEffect(() => {
        if (socket) {
            const handleProcessed = (data) => {
                toast(data.aprobado ? '¡Tu cambio de vehículo fue aprobado!' : 'Tu cambio de vehículo fue rechazado.', {
                    icon: data.aprobado ? '✅' : '❌',
                    duration: 6000
                });
                obtenerVehiculos();
            };

            socket.on("vehicle_change_processed", handleProcessed);
            return () => socket.off("vehicle_change_processed", handleProcessed);
        }
    }, [socket, obtenerVehiculos]);

    const handleAbrirSolicitud = () => {
        const v = vehiculoPrincipal || (vehiculos.length > 0 ? vehiculos[0] : null);
        if (v) {
            setFormDataSolicitud({
                marca: v.marca || '',
                modelo: v.modelo || '',
                placa: v.placa || '',
                tipo: v.tipo || 'MOTO',
                capacidad: v.capacidad || ''
            });
        }
        setMensajeSolicitud({ tipo: '', texto: '' });
        setShowSolicitudModal(true);
    };

    const enviarSolicitudCambio = async (e) => {
        e.preventDefault();
        const v = vehiculoPrincipal || (vehiculos.length > 0 ? vehiculos[0] : null);
        if (!v) return;

        try {
            setEnviandoSolicitud(true);
            setMensajeSolicitud({ tipo: '', texto: '' });

            const response = await fetch(`${API_URL}/vehiculos/${v.idVehiculos}/solicitar-cambio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formDataSolicitud)
            });

            if (response.ok) {
                setMensajeSolicitud({
                    tipo: 'success',
                    texto: 'Tu solicitud ha sido enviada al administrador. Recibirás una notificación cuando sea revisada.'
                });
                setTimeout(() => setShowSolicitudModal(false), 3000);
            } else {
                const err = await response.json();
                setMensajeSolicitud({ tipo: 'danger', texto: err.error || 'Error al enviar la solicitud' });
            }
        } catch (error) {
            setMensajeSolicitud({ tipo: 'danger', texto: 'Error de conexión con el servidor' });
        } finally {
            setEnviandoSolicitud(false);
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'Fecha no disponible';
        const date = new Date(fecha);
        const hoy = new Date();
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);

        if (date.toDateString() === hoy.toDateString()) {
            return `Hoy, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (date.toDateString() === ayer.toDateString()) {
            return `Ayer, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
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

    // --- DomiFlex: disponibles, asignación, avance de estado, chat y paradas ---
    const cargarDisponibles = useCallback(async () => {
        if (!token) return;
        try {
            setCargandoDisponibles(true);
            const resp = await fetch(`${API_URL}/pedidos/buscar`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resp.ok) {
                const data = await resp.json();
                const lista = Array.isArray(data) ? data : [];
                setPedidosDisponibles(lista.filter(p => p.estado === 'CREADO'));
            }
        } catch (e) { console.error('Error cargando pedidos disponibles:', e); }
        finally { setCargandoDisponibles(false); }
    }, [token]);

    useEffect(() => { cargarDisponibles(); }, [cargarDisponibles]);

    const refrescarPedidoEnListas = (actualizado) => {
        setTodosLosPedidos(prev => prev.map(p => p.idPedido === actualizado.idPedido ? { ...p, ...actualizado } : p));
        setPedidosRecientes(prev => prev.map(p => p.idPedido === actualizado.idPedido ? { ...p, ...actualizado } : p));
        setPedidoSeleccionado(prev => prev && prev.idPedido === actualizado.idPedido ? { ...prev, ...actualizado } : prev);
    };

    const asignarmePedido = async (idPedido) => {
        try {
            setAsignandoId(idPedido);
            const resp = await fetch(`${API_URL}/pedidos/${idPedido}/asignar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ idRepartidor: usuario.idUsuarios })
            });
            const data = await resp.json();
            if (data?.error) throw new Error(data.error);
            const pedido = data.pedido || { idPedido, estado: 'ASIGNADO', idRepartidor: usuario.idUsuarios };
            setPedidosDisponibles(prev => prev.filter(p => p.idPedido !== idPedido));
            setTodosLosPedidos(prev => [pedido, ...prev]);
            toast.success(`Pedido #${idPedido} asignado. Ve a recogerlo.`);
        } catch (e) { toast.error(e.message || 'No se pudo asignar el pedido'); }
        finally { setAsignandoId(null); }
    };

    const avanzarEstado = async (pedido) => {
        const siguiente = SIGUIENTE_ESTADO[pedido.estado];
        if (!siguiente) return;
        try {
            setAccionPedidoId(pedido.idPedido);
            const resp = await fetch(`${API_URL}/pedidos/${pedido.idPedido}/estado`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: siguiente })
            });
            const data = await resp.json();
            if (data?.error) throw new Error(data.error);
            refrescarPedidoEnListas(data.pedido || { idPedido: pedido.idPedido, estado: siguiente });
            toast.success(`Pedido #${pedido.idPedido} → ${siguiente.replace('_', ' ')}`);
        } catch (e) { toast.error(e.message || 'No se pudo actualizar el estado'); }
        finally { setAccionPedidoId(null); }
    };

    const cancelarPedidoRep = async (idPedido) => {
        try {
            setAccionPedidoId(idPedido);
            const resp = await fetch(`${API_URL}/pedidos/${idPedido}/cancelar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            const data = await resp.json();
            if (data?.error) throw new Error(data.error);
            refrescarPedidoEnListas(data.pedido || { idPedido, estado: 'CANCELADO' });
            toast.success('Pedido cancelado');
        } catch (e) { toast.error(e.message || 'No se pudo cancelar el pedido'); }
        finally { setAccionPedidoId(null); }
    };

    const iniciarChatRep = async (pedido) => {
        if (!pedido?.idCliente) { toast.error('El pedido no tiene cliente asociado'); return; }
        try {
            const resp = await fetch(`${API_URL}/chat/conversaciones`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ idPedido: pedido.idPedido, idCliente: pedido.idCliente, idRepartidor: usuario.idUsuarios })
            });
            const data = await resp.json();
            if (data?.error) throw new Error(data.error);
            toast.success(`Chat del pedido #${pedido.idPedido} listo`);
        } catch (e) { toast.error(e.message || 'No se pudo iniciar el chat'); }
    };

    const cargarParadasRep = useCallback(async (idPedido) => {
        try {
            const resp = await fetch(`${API_URL}/pedido-paradas/pedido/${idPedido}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setParadasPedido(resp.ok ? await resp.json() : []);
        } catch (e) { setParadasPedido([]); }
    }, [token]);

    useEffect(() => {
        if (pedidoSeleccionado?.idPedido) cargarParadasRep(pedidoSeleccionado.idPedido);
        else setParadasPedido([]);
    }, [pedidoSeleccionado?.idPedido, cargarParadasRep]);

    const completarParada = async (idPedido, idParada, completada) => {
        try {
            const resp = await fetch(`${API_URL}/pedido-paradas/completar`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ idPedido, idParada, completada })
            });
            const data = await resp.json();
            if (data?.error) throw new Error(data.error);
            cargarParadasRep(idPedido);
            toast.success(completada ? 'Parada completada' : 'Parada marcada pendiente');
        } catch (e) { toast.error(e.message || 'No se pudo actualizar la parada'); }
    };

    const obtenerLicencia = () => {
        if (!documentos || documentos.length === 0) return null;
        const licencia = documentos.find(doc =>
            doc.tipoDocumento?.toLowerCase().includes('licencia') ||
            doc.tipoDocumento?.toLowerCase().includes('conducir') ||
            !doc.tipoDocumento
        );

        return licencia;
    };

    const licencia = obtenerLicencia();

    const manejarSiguiente = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
        else {
            localStorage.setItem("tutorial_repartidor_visto", "true");
            setShowTutorial(false);
            navigate("/documentacion");
        }
    };

    const manejarAtras = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };
    const saltarTutorial = () => { localStorage.setItem("tutorial_repartidor_visto", "true"); setShowTutorial(false); };
    const repetirTutorial = () => { setCurrentStep(1); setShowTutorial(true); };

    const stepCircleStyle = (stepNumber) => ({
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        zIndex: 2,
        transition: "all 0.3s ease",
        background: currentStep >= stepNumber ? "#62d8d9" : "#fff",
        color: currentStep >= stepNumber ? "#fff" : "#113d69",
        border: "none",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
    });

    const stepLineStyle = (stepNumber) => ({
        flex: 1,
        height: "2px",
        background: "#e0e0e0",
        opacity: currentStep > stepNumber ? 1 : 0.3,
        zIndex: 1
    });

    const cardStyle = {
        background: "#ffffff",
        borderRadius: '20px',
        border: 'none',
        boxShadow: "0 10px 30px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.02)",
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease"
    };

    const vehiculoPrincipalId = localStorage.getItem('vehiculoPrincipalId');
    const vehiculoPrincipal = vehiculoSeleccionado ||
        (vehiculoPrincipalId ? vehiculos.find(v => v.idVehiculos === parseInt(vehiculoPrincipalId)) : null) ||
        (vehiculos.length > 0 ? vehiculos[0] : null);

    const handleImageClick = (vehiculo) => {
        if (vehiculo?.fotoVehiculo) {
            const url = vehiculo.fotoVehiculo.startsWith('http')
                ? vehiculo.fotoVehiculo
                : `${API_BASE_URL}${vehiculo.fotoVehiculo}`;
            setSelectedPhoto(url);
            setShowPhotoModal(true);
        }
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
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                zIndex: 0
            }} />

            <Navbar transparent={true} />

            <Container className="py-5" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                    ...cardStyle,
                    marginBottom: '1.5rem'
                }}>
                    <div style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
                        gap: window.innerWidth < 768 ? '1rem' : '0'
                    }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <h2 style={{ fontWeight: 'bold', margin: 0, color: '#113d69' }}>Panel de Repartidor</h2>
                                <button
                                    onClick={repetirTutorial}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#62d8d9',
                                        fontWeight: 'bold',
                                        textDecoration: 'none',
                                        cursor: 'pointer',
                                        marginLeft: '0.5rem'
                                    }}
                                >
                                    <Info style={{ marginRight: '0.25rem' }} /> Ayuda
                                </button>
                            </div>
                            <p style={{ color: '#6c757d', margin: 0 }}>Bienvenido, gestiona tu actividad diaria</p>
                        </div>
                        <div style={{
                            display: 'flex',
                            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                            alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
                            gap: '1rem',
                            width: window.innerWidth < 768 ? '100%' : 'auto'
                        }}>
                            <div style={{
                                textAlign: window.innerWidth < 768 ? 'left' : 'right',
                                marginRight: window.innerWidth < 768 ? '0' : '1rem',
                                display: 'none',
                                '@media (minWidth: 768px)': { display: 'block' }
                            }}>
                                <span style={{ fontSize: '0.875rem', textTransform: 'uppercase', fontWeight: 'bold', color: '#6c757d', display: 'block' }}>Ganancias {periodo}</span>
                                <h3 style={{ fontWeight: 'bold', margin: 0, color: '#62d8d9' }}>${totalGananciasBackend.toLocaleString()}</h3>
                            </div>
                            <div style={{
                                backgroundColor: '#f8f9fa',
                                padding: '0.25rem',
                                borderRadius: '0.375rem',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.25rem',
                                border: '1px solid #dee2e6',
                                width: window.innerWidth < 768 ? '100%' : 'auto'
                            }}>
                                <PeriodoBadge periodo="diario" actual={periodo} onClick={() => setPeriodo('diario')}>Día</PeriodoBadge>
                                <PeriodoBadge periodo="mensual" actual={periodo} onClick={() => setPeriodo('mensual')}>Mes</PeriodoBadge>
                                <PeriodoBadge periodo="anual" actual={periodo} onClick={() => setPeriodo('anual')}>Año</PeriodoBadge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tarjetas de estadísticas */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth < 768 ? '1fr' : window.innerWidth < 992 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                    gap: '1.5rem',
                    marginBottom: '1.5rem'
                }}>
                    <StatsCard
                        icon={<Wallet size={20} />}
                        title="Ganancias"
                        value={`$${totalGananciasBackend.toLocaleString()}`}
                        color="#62d8d9"
                        bgColor="#62d8d915"
                    />
                    <StatsCard
                        icon={<Clock size={20} />}
                        title="Tiempo en Línea"
                        value={`${statsAvanzadas.tiempoEnLinea.totalHoras}h`}
                        color="#113d69"
                        bgColor="#113d6915"
                    />
                    <StatsCard
                        icon={<CircleCheck size={20} />}
                        title="Pedidos Entregados"
                        value={statsAvanzadas.resumenPedidos.total}
                        color="#62d8d9"
                        bgColor="#62d8d915"
                    />
                    <StatsCard
                        icon={<Route size={20} />}
                        title="Ruta Principal"
                        value={statsAvanzadas.rutasFrecuentes[0]?.name || 'N/A'}
                        color="#113d69"
                        bgColor="#113d6915"
                    />
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(3, 1fr)',
                    gap: '1.5rem',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{ ...cardStyle, height: '100%' }}>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <h5 style={{ fontWeight: 'bold', margin: 0, color: '#62d8d9' }}>Ganancias</h5>
                                <StatsBadge bgColor="#f8f9fa" color="#113d69">Tendencia {periodo}</StatsBadge>
                            </div>
                            <div style={{ height: '250px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={statsAvanzadas.ganancias.historial}>
                                        <defs>
                                            <linearGradient id="colorGanancias" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#113d69" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#113d69" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 10 }} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Area type="monotone" dataKey="value" stroke="#113d69" fillOpacity={1} fill="url(#colorGanancias)" name="Ganancias ($)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, height: '100%' }}>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <h5 style={{ fontWeight: 'bold', margin: 0, color: '#113d69' }}>Frecuencia</h5>
                                <StatsBadge bgColor="#f8f9fa" color="#113d69">Pedidos {periodo}</StatsBadge>
                            </div>
                            <div style={{ height: '250px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={statsAvanzadas.resumenPedidos.historial}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 10 }} />
                                        <Tooltip cursor={{ fill: 'rgba(84, 199, 184, 0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="value" fill="#62d8d9" radius={[4, 4, 0, 0]} name="Pedidos" barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, height: '100%' }}>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <h5 style={{ fontWeight: 'bold', margin: 0, color: '#62d8d9' }}>Actividad</h5>
                                <StatsBadge bgColor="#f8f9fa" color="#113d69">Horas {periodo}</StatsBadge>
                            </div>
                            <div style={{ height: '250px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={statsAvanzadas.tiempoEnLinea.historial}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 10 }} />
                                        <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="value" fill="#113d69" radius={[4, 4, 0, 0]} name="Horas" barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)',
                    gap: '1.5rem',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{ ...cardStyle, height: '100%' }}>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '12px',
                                    backgroundColor: '#62d8d915', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', marginRight: '12px'
                                }}>
                                    <Wallet size={20} style={{ color: '#62d8d9' }} />
                                </div>
                                <h5 style={{ margin: 0, fontWeight: 'bold', color: '#113d69' }}>Comisión del Mes (10%)</h5>
                            </div>

                            {cargandoComision ? (
                                <div style={{ textAlign: 'center', padding: '1rem' }}><Spinner size="sm" style={{ color: '#62d8d9' }} /></div>
                            ) : displayComisionEnBaseABackend ? (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '0.375rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                        <span style={{ color: '#6c757d' }}>Ingresos del mes</span>
                                        <span style={{ fontWeight: 'bold', color: '#113d69' }}>${displayComisionEnBaseABackend.totalIngresos?.toLocaleString()} COP</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#62d8d915', borderRadius: '0.375rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                        <span style={{ fontWeight: '600' }}>Comisión a pagar (10%)</span>
                                        <span style={{ fontWeight: 'bold', color: '#62d8d9' }}>${displayComisionEnBaseABackend.totalComision?.toLocaleString()} COP</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '0.375rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                        <span style={{ color: '#6c757d' }}>Pedidos entregados</span>
                                        <span style={{ fontWeight: 'bold', color: '#113d69' }}>{displayComisionEnBaseABackend.pedidosEntregados}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: (displayComisionEnBaseABackend.tieneReportePendiente || displayComisionEnBaseABackend.estadoReporte) ? '#62d8d915' : '#cccbd2af', borderRadius: '0.375rem', flexWrap: 'wrap' }}>
                                        <span>Estado del reporte</span>
                                        <DocumentoBadge estado={displayComisionEnBaseABackend.estadoReporte || 'Sin enviar'} />
                                    </div>
                                </>
                            ) : (
                                <p style={{ color: '#6c757d' }}>No hay datos disponibles</p>
                            )}
                        </div>
                    </div>

                    <div style={{ ...cardStyle, height: '100%' }}>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '12px',
                                    backgroundColor: '#113d6915', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', marginRight: '12px'
                                }}>
                                    <FileText size={20} style={{ color: '#113d69' }} />
                                </div>
                                <h5 style={{ margin: 0, fontWeight: 'bold', color: '#62d8d9' }}>Enviar Comprobante de Pago</h5>
                            </div>

                            {(displayComisionEnBaseABackend?.tieneReportePendiente || (displayComisionEnBaseABackend?.estadoReporte && displayComisionEnBaseABackend?.estadoReporte !== 'RECHAZADO')) ? (
                                <div style={{
                                    padding: '1rem',
                                    backgroundColor: displayComisionEnBaseABackend.estadoReporte === 'APROBADO' ? '#d4edda' : '#cce5ff',
                                    borderRadius: '0.375rem',
                                    color: displayComisionEnBaseABackend.estadoReporte === 'APROBADO' ? '#155724' : '#004085'
                                }}>
                                    {displayComisionEnBaseABackend.estadoReporte === 'APROBADO'
                                        ? '✅ Tu comprobante ha sido aprobado. ¡Gracias!'
                                        : '⏳ Tu comprobante está pendiente de revisión por el administrador.'}
                                </div>
                            ) : (
                                <>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ fontSize: '0.875rem', color: '#6c757d', display: 'block', marginBottom: '0.5rem' }}>Foto del comprobante de pago</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.375rem 0.75rem',
                                                    borderRadius: '0.375rem',
                                                    border: '1px solid #ced4da'
                                                }}
                                            />
                                        </div>

                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ fontSize: '0.875rem', color: '#6c757d', display: 'block', marginBottom: '0.5rem' }}>Cantidad que envías (COP)</label>
                                            <input
                                                type="number"
                                                value={montoADepositar}
                                                onChange={(e) => setMontoADepositar(e.target.value)}
                                                placeholder="Ej: 50000"
                                                style={{
                                                    width: '100%',
                                                    padding: '0.375rem 0.75rem',
                                                    borderRadius: '0.375rem',
                                                    border: '1px solid #62d8d9',
                                                    fontWeight: 'bold',
                                                    color: '#113d69'
                                                }}
                                            />
                                            <small style={{ color: '#6c757d', fontSize: '0.75rem' }}>Confirma el monto exacto antes de enviar.</small>
                                        </div>

                                    {fotoComprobante && (
                                        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                                            <img
                                                src={fotoComprobante}
                                                style={{ maxHeight: '200px', borderRadius: '0.375rem', border: '1px solid #62d8d9', maxWidth: '100%' }}
                                                alt="Comprobante"
                                            />
                                        </div>
                                    )}

                                    <AccionButton
                                        variant="primary"
                                        onClick={enviarReportePago}
                                        disabled={enviandoReporte || !fotoComprobante}
                                        style={{ width: '100%' }}
                                    >
                                        {enviandoReporte ? <Spinner size="sm" style={{ marginRight: '0.5rem' }} /> : null}
                                        Enviar Comprobante
                                    </AccionButton>
                                </>
                            )}

                            {misReportes.length > 0 && (
                                <div style={{ marginTop: '1rem' }}>
                                    <h6 style={{ color: '#6c757d', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Historial de reportes</h6>
                                    {misReportes.slice(0, 3).map(reporte => (
                                        <div key={reporte.idReporte}
                                            style={{
                                                display: 'flex',
                                                flexDirection: window.innerWidth < 576 ? 'column' : 'row',
                                                justifyContent: 'space-between',
                                                alignItems: window.innerWidth < 576 ? 'flex-start' : 'center',
                                                padding: '0.5rem',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '0.25rem',
                                                marginBottom: '0.25rem',
                                                fontSize: '0.85rem',
                                                gap: window.innerWidth < 576 ? '0.25rem' : '0'
                                            }}>
                                            <span style={{ color: '#113d69' }}>{new Date(reporte.mesCorrespondiente).toLocaleDateString('es-CO', { year: 'numeric', month: 'short' })}</span>
                                            <span style={{ color: '#62d8d9' }}>${Number(reporte.montoComision).toLocaleString()}</span>
                                            <DocumentoBadge estado={reporte.estado} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '7fr 5fr',
                    gap: '1.5rem',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{ ...cardStyle, height: '100%' }}>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '12px',
                                        backgroundColor: '#62d8d915',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '12px'
                                    }}>
                                        <Car size={20} style={{ color: '#62d8d9' }} />
                                    </div>
                                    <h5 style={{ margin: 0, fontWeight: '600', color: '#113d69' }}>Vehículo Activo</h5>
                                </div>

                                {vehiculos.length > 1 && (
                                    <button
                                        onClick={verTodosLosVehiculos}
                                        style={{
                                            background: 'none',
                                            border: `1px solid #62d8d9`,
                                            color: '#62d8d9',
                                            borderRadius: '2rem',
                                            padding: '0.25rem 0.75rem',
                                            fontSize: '0.875rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                        }}
                                    >
                                        <List /> Ver todos ({vehiculos.length})
                                    </button>
                                )}
                            </div>

                            {cargandoVehiculo ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <Spinner animation="border" style={{ color: '#62d8d9' }} />
                                </div>
                            ) : errorVehiculo ? (
                                <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#FEF2F2', borderRadius: '1rem' }}>
                                    <p style={{ fontSize: '0.875rem', color: '#dc3545', marginBottom: '0.5rem' }}>{errorVehiculo}</p>
                                    <AccionButton variant="outline-secondary" onClick={() => window.location.reload()}>Reintentar</AccionButton>
                                </div>
                            ) : vehiculoPrincipal ? (
                                <div style={{
                                    padding: '1rem',
                                    borderRadius: '1rem',
                                    backgroundColor: '#F9FAFB',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                                        alignItems: window.innerWidth < 768 ? 'center' : 'flex-start',
                                        gap: '1rem'
                                    }}>
                                        <div style={{ width: window.innerWidth < 768 ? '100%' : '25%', textAlign: 'center' }}>
                                            <VehiculoImage
                                                vehiculo={vehiculoPrincipal}
                                                size={window.innerWidth < 768 ? 80 : 60}
                                                onClick={() => handleImageClick(vehiculoPrincipal)}
                                            />
                                        </div>
                                        <div style={{ width: window.innerWidth < 768 ? '100%' : '75%', textAlign: window.innerWidth < 768 ? 'center' : 'left' }}>
                                            <h6 style={{ fontWeight: '600', marginBottom: '0.25rem', color: '#113d69', fontSize: '1.1rem' }}>
                                                {vehiculoPrincipal.marca} {vehiculoPrincipal.modelo}
                                            </h6>
                                            <p style={{ marginBottom: '0.25rem', color: '#6c757d', fontSize: '0.875rem' }}>Placa: <span style={{ fontWeight: '600', color: '#62d8d9' }}>{vehiculoPrincipal.placa}</span></p>
                                            <p style={{ marginBottom: 0, color: '#6c757d', fontSize: '0.875rem' }}>Capacidad: {vehiculoPrincipal.capacidad} kg · {vehiculoPrincipal.tipo || 'Sin tipo'}</p>
                                            {vehiculoPrincipal.placaValidada && (
                                                <span style={{
                                                    marginTop: '0.5rem',
                                                    display: 'inline-block',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '2rem',
                                                    backgroundColor: '#62d8d9',
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500'
                                                }}>
                                                    <CircleCheck style={{ marginRight: '0.25rem' }} size={10} /> Placa validada
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#F9FAFB', borderRadius: '1rem' }}>
                                    <p style={{ color: '#6c757d', fontSize: '0.875rem', marginBottom: '0.75rem' }}>No tienes un vehículo registrado</p>
                                    <AccionButton
                                        variant="primary"
                                        onClick={() => navigate("/vehicle-registration")}
                                    >
                                        Registrar ahora
                                    </AccionButton>
                                </div>
                            )}

                            {vehiculoPrincipal && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                                    <AccionButton
                                        variant="outline-primary"
                                        onClick={handleAbrirSolicitud}
                                        style={{ width: '100%' }}
                                    >
                                        Solicitar Cambio de Datos
                                    </AccionButton>
                                    <button
                                        onClick={() => navigate("/vehicle-registration")}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: 0,
                                            color: '#113d69',
                                            fontWeight: '600',
                                            fontSize: '0.875rem',
                                            textDecoration: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.25rem'
                                        }}
                                    >
                                        Registrar Otro Vehículo
                                        <ArrowRight size={12} style={{ color: '#62d8d9' }} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ ...cardStyle, height: '100%' }}>
                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    backgroundColor: '#113d6915',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '12px'
                                }}>
                                    <IdCard size={20} style={{ color: '#113d69' }} />
                                </div>
                                <h5 style={{ margin: 0, fontWeight: '600', color: '#62d8d9' }}>Licencia de Conducir</h5>
                            </div>

                            {cargandoDocumentos ? (
                                <div style={{ textAlign: 'center', padding: '1rem' }}>
                                    <Spinner animation="border" size="sm" style={{ color: '#62d8d9' }} />
                                    <p style={{ marginTop: '0.5rem', color: '#6c757d', fontSize: '0.875rem' }}>Cargando documentos...</p>
                                </div>
                            ) : errorDocumentos ? (
                                <div style={{ padding: '0.5rem', backgroundColor: '#f8d7da', borderRadius: '0.25rem', color: '#721c24' }}>
                                    <small>{errorDocumentos}</small>
                                </div>
                            ) : licencia ? (
                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: 'auto' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: 'none', flexWrap: 'wrap', gap: '0.25rem' }}>
                                            <span style={{ color: '#6c757d', fontSize: '0.875rem' }}>Número</span>
                                            <span style={{ fontWeight: '600', color: '#113d69' }}>{licencia.numeroDocumento || 'Sin número'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: 'none', flexWrap: 'wrap', gap: '0.25rem' }}>
                                            <span style={{ color: '#6c757d', fontSize: '0.875rem' }}>Expedición</span>
                                            <span style={{ fontWeight: '600', color: '#62d8d9' }}>{formatearFechaExpedicion(licencia.fechaExpedicion)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: 'none', flexWrap: 'wrap', gap: '0.25rem' }}>
                                            <span style={{ color: '#6c757d', fontSize: '0.875rem' }}>Subida</span>
                                            <span style={{ fontWeight: '600', color: '#113d69' }}>{formatearFechaSubida(licencia.fechaSubida)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: 'none', flexWrap: 'wrap', gap: '0.25rem' }}>
                                            <span style={{ color: '#6c757d', fontSize: '0.875rem' }}>Estado</span>
                                            <DocumentoBadge estado={licencia.estado} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '1rem' }}>
                                    <p style={{ color: '#6c757d', fontSize: '0.875rem' }}>No tienes una licencia registrada</p>
                                    <AccionButton
                                        variant="primary"
                                        onClick={() => navigate("/documentacion")}
                                        style={{ marginTop: '0.5rem' }}
                                    >
                                        Subir licencia
                                    </AccionButton>
                                </div>
                            )}

                            {licencia && (
                                <AccionButton
                                    variant="secondary"
                                    onClick={() => navigate("/documentacion")}
                                    style={{ width: '100%', marginTop: '1rem' }}
                                >
                                    ACTUALIZAR LICENCIA
                                </AccionButton>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                    {documentos && documentos.some(d => d.estado === 'RECHAZADO') && (
                        <div style={{
                            padding: '1rem',
                            backgroundColor: '#f8d7da',
                            borderRadius: '1rem',
                            marginBottom: '1rem',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)',
                            display: 'flex',
                            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                            alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
                            gap: '0.5rem'
                        }}>
                            <Info size={24} style={{ marginRight: '0.75rem', color: '#dc3545' }} />
                            <div style={{ flex: 1 }}>
                                <h5 style={{ marginBottom: '0.25rem', fontWeight: '600' }}>Documentación Rechazada</h5>
                                <p style={{ marginBottom: 0, fontSize: '0.875rem' }}>Tu documentación no ha sido aprobada. No podrás publicar nuevos pedidos hasta que actualices tus documentos.</p>
                            </div>
                            <AccionButton
                                variant="danger"
                                onClick={() => navigate("/documentacion")}
                                style={{ marginLeft: window.innerWidth < 768 ? '0' : '1rem', width: window.innerWidth < 768 ? '100%' : 'auto' }}
                            >
                                ACTUALIZAR
                            </AccionButton>
                        </div>
                    )}

                    {/* Pedidos en CREADO disponibles para auto-asignación */}
                    <div style={{ ...cardStyle, borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#62d8d915', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                                        <List size={20} style={{ color: '#62d8d9' }} />
                                    </div>
                                    <h5 style={{ margin: 0, fontWeight: '600', color: '#113d69' }}>Pedidos disponibles</h5>
                                </div>
                                <AccionButton variant="outline-secondary" onClick={cargarDisponibles} disabled={cargandoDisponibles}>
                                    {cargandoDisponibles ? 'Actualizando...' : 'Actualizar'}
                                </AccionButton>
                            </div>
                            {cargandoDisponibles ? (
                                <div style={{ textAlign: 'center', padding: '1rem' }}>
                                    <Spinner animation="border" size="sm" style={{ color: '#62d8d9' }} />
                                </div>
                            ) : pedidosDisponibles.length === 0 ? (
                                <p style={{ color: '#6c757d', marginBottom: 0 }}>No hay pedidos en estado CREADO por ahora.</p>
                            ) : (
                                <div style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {pedidosDisponibles.slice(0, 5).map((pedido) => (
                                        <div key={pedido.idPedido} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #F3F4F6', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <div>
                                                <p style={{ marginBottom: 0, fontWeight: '600', color: '#113d69' }}>Pedido #{pedido.idPedido}</p>
                                                <small style={{ color: '#6c757d' }}>
                                                    {(pedido.dirRecogida || 'Recogida')} → {(pedido.dirEntrega || pedido.detallePedido || 'Entrega')}
                                                    {pedido.total ? ` · $${Number(pedido.total).toLocaleString()}` : ''}
                                                    {pedido.distanciaKm ? ` · ${Number(pedido.distanciaKm).toFixed(1)} km` : ''}
                                                </small>
                                            </div>
                                            <AccionButton
                                                variant="primary"
                                                onClick={() => asignarmePedido(pedido.idPedido)}
                                                disabled={asignandoId === pedido.idPedido}
                                            >
                                                {asignandoId === pedido.idPedido ? 'Asignando...' : 'Asignarme'}
                                            </AccionButton>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ ...cardStyle, borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '12px',
                                        backgroundColor: '#62d8d915',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '12px'
                                    }}>
                                        <History size={20} style={{ color: '#62d8d9' }} />
                                    </div>
                                    <h5 style={{ margin: 0, fontWeight: '600', color: '#113d69' }}>Pedidos Recientes</h5>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <StatsBadge bgColor="#62d8d9" color="#ffffff">
                                        {estadisticasPedidos.entregados} Entregados
                                    </StatsBadge>
                                    {estadisticasPedidos.enCamino > 0 && (
                                        <StatsBadge bgColor="#113d69" color="#ffffff">
                                            {estadisticasPedidos.enCamino} En camino
                                        </StatsBadge>
                                    )}
                                </div>
                            </div>

                            {cargandoPedidos ? (
                                <div style={{ textAlign: 'center', padding: '1rem' }}>
                                    <Spinner animation="border" style={{ color: '#62d8d9' }} />
                                    <p style={{ marginTop: '0.5rem', color: '#6c757d', fontSize: '0.875rem' }}>Cargando pedidos...</p>
                                </div>
                            ) : errorPedidos ? (
                                <div style={{ textAlign: 'center', padding: '1rem' }}>
                                    <p style={{ color: '#dc3545', fontSize: '0.875rem' }}>{errorPedidos}</p>
                                    <AccionButton variant="outline-secondary" onClick={() => window.location.reload()}>
                                        Reintentar
                                    </AccionButton>
                                </div>
                            ) : pedidosRecientes.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        backgroundColor: '#F3F4F6',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1rem'
                                    }}>
                                        <History size={24} style={{ color: '#6c757d' }} />
                                    </div>
                                    <p style={{ color: '#6c757d', marginBottom: 0 }}>No hay pedidos recientes</p>
                                </div>
                            ) : (
                                <>
                                    <div style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {pedidosRecientes.map((pedido) => (
                                            <div
                                                key={pedido.idPedido}
                                                style={{
                                                    padding: '0.75rem 0',
                                                    borderBottom: '1px solid #F3F4F6',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => {
                                                    setPedidoSeleccionado(pedido);
                                                    setShowDetallePedido(true);
                                                }}
                                            >
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 3fr 4fr 2fr 2fr',
                                                    gap: '0.5rem',
                                                    alignItems: 'center'
                                                }}>
                                                    <div style={{ textAlign: 'center', gridColumn: window.innerWidth < 768 ? 'span 1' : 'auto' }}>
                                                        {vehiculoPrincipal ? (
                                                            <VehiculoImage
                                                                vehiculo={vehiculoPrincipal}
                                                                size={window.innerWidth < 768 ? 40 : 32}
                                                                onClick={() => handleImageClick(vehiculoPrincipal)}
                                                            />
                                                        ) : (
                                                            <div style={{
                                                                width: window.innerWidth < 768 ? '40px' : '32px',
                                                                height: window.innerWidth < 768 ? '40px' : '32px',
                                                                borderRadius: '10px',
                                                                backgroundColor: '#62d8d910',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                margin: '0 auto'
                                                            }}>
                                                                <Car size={16} color="#62d8d9" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ gridColumn: window.innerWidth < 768 ? 'span 1' : 'auto' }}>
                                                        <p style={{ marginBottom: 0, fontWeight: '600', color: '#113d69' }}>Pedido #{pedido.idPedido}</p>
                                                        <small style={{ color: '#6c757d' }}>
                                                            {formatearFecha(pedido.fechaHoraSalida)}
                                                        </small>
                                                    </div>
                                                    <div style={{ gridColumn: window.innerWidth < 768 ? 'span 1' : 'auto' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <Route size={12} color="#62d8d9" style={{ marginRight: '0.25rem' }} />
                                                            <small style={{ color: '#113d69' }}>
                                                                {pedido.ruta?.nombre || 'Ruta no disponible'}
                                                            </small>
                                                        </div>
                                                    </div>
                                                    <div style={{ gridColumn: window.innerWidth < 768 ? 'span 1' : 'auto' }}>
                                                        <small style={{ color: '#6c757d' }}>
                                                            {pedido.detallePedido || pedido.dirEntrega || 'Domicilio'}
                                                        </small>
                                                    </div>
                                                    <div style={{ textAlign: window.innerWidth < 768 ? 'left' : 'right', gridColumn: window.innerWidth < 768 ? 'span 1' : 'auto' }}>
                                                        <EstadoPedidoBadge estado={pedido.estado} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {todosLosPedidos.length > 3 && (
                                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                            <AccionButton
                                                variant="outline-secondary"
                                                onClick={() => setShowHistorialCompleto(true)}
                                            >
                                                Ver historial completo ({todosLosPedidos.length} pedidos)
                                            </AccionButton>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Container>

            {showVehiculosModal && (
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
                    zIndex: 1050,
                    padding: '1rem'
                }} onClick={() => setShowVehiculosModal(false)}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        maxWidth: '800px',
                        width: '100%',
                        maxHeight: '80vh',
                        overflow: 'hidden'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            backgroundColor: '#62d8d9',
                            color: 'white',
                            padding: '1rem',
                            borderBottom: 'none'
                        }}>
                            <h5 style={{ margin: 0, fontWeight: '600' }}>
                                <Car style={{ marginRight: '0.5rem' }} /> Mis Vehículos ({vehiculos.length})
                            </h5>
                        </div>
                        <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 'calc(80vh - 120px)' }}>
                            {vehiculos.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <Car size={50} style={{ color: '#62d8d9' }} />
                                    <p style={{ color: '#6c757d', marginTop: '1rem' }}>No tienes vehículos registrados</p>
                                    <AccionButton
                                        variant="primary"
                                        onClick={() => {
                                            setShowVehiculosModal(false);
                                            navigate("/vehicle-registration");
                                        }}
                                    >
                                        Registrar Vehículo
                                    </AccionButton>
                                </div>
                            ) : (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: window.innerWidth < 576 ? '1fr' : 'repeat(2, 1fr)',
                                    gap: '1rem'
                                }}>
                                    {vehiculos.map((vehiculo) => (
                                        <div
                                            key={vehiculo.idVehiculos}
                                            style={{
                                                border: vehiculo.idVehiculos === vehiculoPrincipal?.idVehiculos ? `2px solid #62d8d9` : `1px solid #113d6920`,
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => seleccionarVehiculoPrincipal(vehiculo)}
                                        >
                                            <div style={{ padding: '1rem' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: window.innerWidth < 576 ? 'column' : 'row',
                                                    alignItems: 'center',
                                                    gap: '1rem'
                                                }}>
                                                    <VehiculoImage
                                                        vehiculo={vehiculo}
                                                        size={window.innerWidth < 576 ? 60 : 50}
                                                        onClick={() => handleImageClick(vehiculo)}
                                                    />
                                                    <div style={{ flex: 1, textAlign: window.innerWidth < 576 ? 'center' : 'left' }}>
                                                        <h6 style={{ fontWeight: '600', marginBottom: '0.25rem', color: '#113d69' }}>
                                                            {vehiculo.marca} {vehiculo.modelo}
                                                            {vehiculo.idVehiculos === vehiculoPrincipal?.idVehiculos && (
                                                                <span style={{
                                                                    marginLeft: '0.5rem',
                                                                    padding: '0.25rem 0.5rem',
                                                                    backgroundColor: '#62d8d9',
                                                                    color: 'white',
                                                                    borderRadius: '0.25rem',
                                                                    fontSize: '0.75rem'
                                                                }}>Activo</span>
                                                            )}
                                                        </h6>
                                                        <p style={{ marginBottom: '0.25rem', fontSize: '0.875rem', color: '#6c757d' }}>Placa: <span style={{ color: '#62d8d9' }}>{vehiculo.placa}</span></p>
                                                        <p style={{ marginBottom: 0, fontSize: '0.875rem', color: '#6c757d' }}>Capacidad: {vehiculo.capacidad} kg · {vehiculo.tipo || 'Sin tipo'}</p>
                                                        {vehiculo.placaValidada && (
                                                            <span style={{
                                                                marginTop: '0.25rem',
                                                                display: 'inline-block',
                                                                padding: '0.25rem 0.5rem',
                                                                backgroundColor: '#62d8d9',
                                                                color: 'white',
                                                                borderRadius: '2rem',
                                                                fontSize: '0.75rem'
                                                            }}>Placa validada</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '1rem', borderTop: 'none', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <AccionButton variant="outline-secondary" onClick={() => setShowVehiculosModal(false)}>
                                Cerrar
                            </AccionButton>
                            <AccionButton
                                variant="secondary"
                                onClick={() => {
                                    setShowVehiculosModal(false);
                                    navigate("/vehicle-registration");
                                }}
                            >
                                Registrar Nuevo Vehículo
                            </AccionButton>
                        </div>
                    </div>
                </div>
            )}

            {showPhotoModal && (
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
                    zIndex: 1050,
                    padding: '1rem'
                }} onClick={() => setShowPhotoModal(false)}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        maxWidth: '800px',
                        width: '100%',
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
                            <h5 style={{ margin: 0, color: '#113d69' }}>
                                <Car style={{ marginRight: '0.5rem', color: '#62d8d9' }} /> Foto del Vehículo
                            </h5>
                            <button
                                onClick={() => setShowPhotoModal(false)}
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
                        <div style={{ textAlign: 'center', backgroundColor: '#1a1a1a', padding: 0 }}>
                            {selectedPhoto && (
                                <img
                                    src={selectedPhoto}
                                    style={{ maxHeight: '70vh', maxWidth: '100%', objectFit: 'contain' }}
                                    alt="Vehículo"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            )}
                        </div>
                        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <AccionButton variant="outline-secondary" onClick={() => setShowPhotoModal(false)}>
                                Cerrar
                            </AccionButton>
                        </div>
                    </div>
                </div>
            )}

            {showHistorialCompleto && (
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
                    zIndex: 1050,
                    padding: '1rem'
                }} onClick={() => setShowHistorialCompleto(false)}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        maxWidth: '1200px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'hidden'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            padding: '1.5rem 1.5rem 0.5rem',
                            borderBottom: 'none'
                        }}>
                            <h5 style={{ fontWeight: '600', color: '#62d8d9' }}>
                                <History style={{ marginRight: '0.5rem' }} /> Historial Completo de Pedidos
                            </h5>
                        </div>
                        <div style={{ padding: '1rem 1.5rem', overflowY: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '6fr 4fr 2fr',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{
                                            backgroundColor: 'white',
                                            padding: '0.375rem 0.75rem',
                                            border: `1px solid #62d8d9`,
                                            borderRadius: '0.375rem 0 0 0.375rem'
                                        }}>
                                            <Search color="#62d8d9" />
                                        </span>
                                        <input
                                            placeholder="Buscar por # de pedido o nombre de ruta..."
                                            value={busquedaPedidos}
                                            onChange={(e) => setBusquedaPedidos(e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: '0.375rem 0.75rem',
                                                border: `1px solid #62d8d9`,
                                                borderLeft: 'none',
                                                borderRadius: '0 0.375rem 0.375rem 0',
                                                minWidth: '150px'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{
                                            backgroundColor: 'white',
                                            padding: '0.375rem 0.75rem',
                                            border: `1px solid #113d69`,
                                            borderRadius: '0.375rem 0 0 0.375rem'
                                        }}>
                                            <Funnel color="#113d69" />
                                        </span>
                                        <select
                                            value={filtroEstado}
                                            onChange={(e) => setFiltroEstado(e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: '0.375rem 0.75rem',
                                                border: `1px solid #113d69`,
                                                borderLeft: 'none',
                                                borderRadius: '0 0.375rem 0.375rem 0',
                                                minWidth: '150px'
                                            }}
                                        >
                                            <option value="TODOS">Todos los estados</option>
                                            <option value="ENTREGADO">Entregados</option>
                                            <option value="EN_CAMINO">En camino</option>
                                            <option value="RECOGIENDO">Recogiendo</option>
                                            <option value="ASIGNADO">Asignados</option>
                                            <option value="CANCELADO">Cancelados</option>
                                            <option value="CREADO">Creados</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ textAlign: window.innerWidth < 768 ? 'left' : 'right' }}>
                                    <StatsBadge bgColor="#62d8d9" color="#ffffff">
                                        {pedidosFiltrados.length} pedidos
                                    </StatsBadge>
                                </div>
                            </div>

                            {pedidosFiltrados.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        backgroundColor: '#F3F4F6',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1rem'
                                    }}>
                                        <History size={24} style={{ color: '#62d8d9' }} />
                                    </div>
                                    <p style={{ color: '#6c757d' }}>No se encontraron pedidos con los filtros seleccionados</p>
                                    <button
                                        onClick={() => {
                                            setBusquedaPedidos('');
                                            setFiltroEstado('TODOS');
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#62d8d9',
                                            textDecoration: 'underline',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Limpiar filtros
                                    </button>
                                </div>
                            ) : (
                                <div style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {pedidosFiltrados.map((pedido) => (
                                        <div
                                            key={pedido.idPedido}
                                            style={{
                                                padding: '0.75rem 0',
                                                borderBottom: '1px solid #F3F4F6',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => {
                                                setPedidoSeleccionado(pedido);
                                                setShowDetallePedido(true);
                                            }}
                                        >
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 2fr 3fr 2fr 2fr 2fr',
                                                gap: '0.5rem',
                                                alignItems: 'center'
                                            }}>
                                                <div style={{ textAlign: 'center', gridColumn: window.innerWidth < 768 ? 'span 1' : 'auto' }}>
                                                    {vehiculoPrincipal ? (
                                                        <VehiculoImage
                                                            vehiculo={vehiculoPrincipal}
                                                            size={window.innerWidth < 768 ? 40 : 40}
                                                            onClick={() => handleImageClick(vehiculoPrincipal)}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '12px',
                                                            backgroundColor: '#62d8d910',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            margin: '0 auto'
                                                        }}>
                                                            <Car size={20} color="#62d8d9" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ gridColumn: window.innerWidth < 768 ? 'span 1' : 'auto' }}>
                                                    <p style={{ marginBottom: 0, fontWeight: '600', color: '#113d69' }}>Pedido #{pedido.idPedido}</p>
                                                    <small style={{ color: '#6c757d' }}>
                                                        {formatearFecha(pedido.fechaHoraSalida)}
                                                    </small>
                                                </div>
                                                <div style={{ gridColumn: window.innerWidth < 768 ? 'span 1' : 'auto' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <Route size={12} color="#62d8d9" style={{ marginRight: '0.25rem' }} />
                                                        <small style={{ fontWeight: '600', color: '#113d69' }}>Ruta:</small>
                                                        <span style={{ marginLeft: '0.5rem', color: '#6c757d', fontSize: '0.875rem' }}>{pedido.ruta?.nombre || 'No disponible'}</span>
                                                    </div>
                                                </div>
                                                <div style={{ gridColumn: window.innerWidth < 768 ? 'span 1' : 'auto' }}>
                                                    <small style={{ color: '#6c757d' }}>
                                                        {pedido.detallePedido || pedido.dirEntrega || 'Domicilio'}
                                                    </small>
                                                </div>
                                                <div style={{ gridColumn: window.innerWidth < 768 ? 'span 1' : 'auto' }}>
                                                    <small style={{ color: '#6c757d', display: 'block' }}>
                                                        <Clock style={{ marginRight: '0.25rem' }} size={10} />
                                                        {pedido.distanciaKm ? `${Number(pedido.distanciaKm).toFixed(1)} km` : (pedido.dirEntrega || 'Domicilio')}
                                                    </small>
                                                </div>
                                                <div style={{ textAlign: window.innerWidth < 768 ? 'left' : 'right', gridColumn: window.innerWidth < 768 ? 'span 1' : 'auto' }}>
                                                    <EstadoPedidoBadge estado={pedido.estado} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '0.5rem 1.5rem 1.5rem', borderTop: 'none' }}>
                            <AccionButton
                                variant="outline-secondary"
                                onClick={() => setShowHistorialCompleto(false)}
                            >
                                Cerrar
                            </AccionButton>
                        </div>
                    </div>
                </div>
            )}

            {showDetallePedido && pedidoSeleccionado && (
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
                    zIndex: 1050,
                    padding: '1rem'
                }} onClick={() => setShowDetallePedido(false)}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        maxWidth: '800px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'hidden'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            background: `linear-gradient(135deg, #62d8d920, white)`,
                            borderBottom: `2px solid #62d8d9`,
                            padding: '1.5rem'
                        }}>
                            <h5 style={{ fontWeight: '600', color: '#113d69' }}>
                                <Car style={{ marginRight: '0.5rem', color: '#62d8d9' }} /> Detalle del Pedido #{pedidoSeleccionado.idPedido}
                            </h5>
                        </div>
                        <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div style={{ backgroundColor: '#F9FAFB', border: `1px solid #62d8d920`, borderRadius: '1rem' }}>
                                    <div style={{ padding: '1rem' }}>
                                        <h6 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#62d8d9' }}>Información General</h6>
                                        <div style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: 'none', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                <span style={{ color: '#6c757d' }}>Fecha y hora:</span>
                                                <span style={{ fontWeight: '600', color: '#113d69' }}>{formatearFecha(pedidoSeleccionado.fechaHoraSalida)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: 'none', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                <span style={{ color: '#6c757d' }}>Estado:</span>
                                                <EstadoPedidoBadge estado={pedidoSeleccionado.estado} />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: 'none', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                <span style={{ color: '#6c757d' }}>Detalle:</span>
                                                <span style={{ fontWeight: '600', color: '#113d69' }}>{pedidoSeleccionado.detallePedido || pedidoSeleccionado.dirEntrega || 'Domicilio'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: 'none', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                <span style={{ color: '#6c757d' }}>Distancia:</span>
                                                <span style={{ fontWeight: '600', color: '#62d8d9' }}>
                                                    {pedidoSeleccionado.distanciaKm ? `${Number(pedidoSeleccionado.distanciaKm).toFixed(1)} km` : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ backgroundColor: '#F9FAFB', border: `1px solid #113d6920`, borderRadius: '1rem' }}>
                                    <div style={{ padding: '1rem' }}>
                                        <h6 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#113d69' }}>Ruta del Pedido</h6>
                                        <div style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {pedidoSeleccionado.ruta?.nombre && (
                                                <div style={{ display: 'flex', padding: '0.5rem 0', borderBottom: 'none', flexWrap: 'wrap' }}>
                                                    <Route size={14} color="#62d8d9" style={{ marginRight: '0.5rem', marginTop: '0.25rem' }} />
                                                    <div>
                                                        <span style={{ color: '#6c757d' }}>Ruta:</span>
                                                        <span style={{ fontWeight: '600', display: 'block', color: '#113d69' }}>{pedidoSeleccionado.ruta.nombre}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {pedidoSeleccionado.ruta?.descripcion && (
                                                <div style={{ display: 'flex', padding: '0.5rem 0', borderBottom: 'none', flexWrap: 'wrap' }}>
                                                    <Info size={14} color="#62d8d9" style={{ marginRight: '0.5rem', marginTop: '0.25rem' }} />
                                                    <div>
                                                        <span style={{ color: '#6c757d' }}>Descripción:</span>
                                                        <span style={{ display: 'block', color: '#113d69' }}>{pedidoSeleccionado.ruta.descripcion}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {pedidoSeleccionado.ruta?.paradas && pedidoSeleccionado.ruta.paradas.length > 0 && (
                                <div style={{ backgroundColor: '#F9FAFB', border: `1px solid #62d8d920`, borderRadius: '1rem' }}>
                                    <div style={{ padding: '1rem' }}>
                                        <h6 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#62d8d9' }}>Paradas del Recorrido</h6>
                                        <div style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {pedidoSeleccionado.ruta.paradas
                                                .sort((a, b) => a.orden - b.orden)
                                                .map((parada, index) => (
                                                    <div key={parada.idParada} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 0', borderBottom: 'none', flexWrap: 'wrap' }}>
                                                        <div style={{
                                                            width: '24px',
                                                            height: '24px',
                                                            borderRadius: '50%',
                                                            backgroundColor: index === 0 ? '#62d8d9' : index === pedidoSeleccionado.ruta.paradas.length - 1 ? '#113d69' : '#e0e0e0',
                                                            color: 'white',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '12px',
                                                            marginRight: '12px'
                                                        }}>
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <span style={{ fontWeight: '600', color: '#113d69' }}>{parada.nombre || `Parada ${parada.orden}`}</span>
                                                            {parada.tipo && (
                                                                <span style={{
                                                                    marginLeft: '0.5rem',
                                                                    padding: '0.125rem 0.375rem',
                                                                    backgroundColor: '#62d8d9',
                                                                    color: 'white',
                                                                    borderRadius: '0.25rem',
                                                                    fontSize: '10px'
                                                                }}>
                                                                    {parada.tipo}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Recogida / entrega + acciones del repartidor */}
                            <div style={{ backgroundColor: '#F9FAFB', border: `1px solid #113d6920`, borderRadius: '1rem', marginTop: '1rem' }}>
                                <div style={{ padding: '1rem' }}>
                                    <h6 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#113d69' }}>Recogida y entrega</h6>
                                    {pedidoSeleccionado.dirRecogida && (
                                        <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}><strong>Recogida:</strong> {pedidoSeleccionado.dirRecogida}</p>
                                    )}
                                    {pedidoSeleccionado.dirEntrega && (
                                        <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}><strong>Entrega:</strong> {pedidoSeleccionado.dirEntrega}</p>
                                    )}
                                    {pedidoSeleccionado.cliente?.nombre && (
                                        <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}><strong>Cliente:</strong> {pedidoSeleccionado.cliente.nombre}</p>
                                    )}
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                        {SIGUIENTE_ESTADO[pedidoSeleccionado.estado] && (
                                            <AccionButton
                                                variant="primary"
                                                onClick={() => avanzarEstado(pedidoSeleccionado)}
                                                disabled={accionPedidoId === pedidoSeleccionado.idPedido}
                                            >
                                                <CircleCheck style={{ marginRight: '0.5rem' }} />
                                                {accionPedidoId === pedidoSeleccionado.idPedido ? 'Actualizando...' : `Marcar ${SIGUIENTE_ESTADO[pedidoSeleccionado.estado].replace('_', ' ')}`}
                                            </AccionButton>
                                        )}
                                        <AccionButton variant="outline-primary" onClick={() => iniciarChatRep(pedidoSeleccionado)}>
                                            Chatear con cliente
                                        </AccionButton>
                                        {pedidoSeleccionado.estado !== 'ENTREGADO' && pedidoSeleccionado.estado !== 'CANCELADO' && (
                                            <AccionButton
                                                variant="outline-secondary"
                                                onClick={() => cancelarPedidoRep(pedidoSeleccionado.idPedido)}
                                                disabled={accionPedidoId === pedidoSeleccionado.idPedido}
                                            >
                                                Cancelar pedido
                                            </AccionButton>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {paradasPedido.length > 0 && (
                                <div style={{ backgroundColor: '#F9FAFB', border: `1px solid #62d8d920`, borderRadius: '1rem', marginTop: '1rem' }}>
                                    <div style={{ padding: '1rem' }}>
                                        <h6 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#62d8d9' }}>Paradas multi-entrega del pedido</h6>
                                        {paradasPedido.map((pp) => (
                                            <div key={`${pp.idPedido}-${pp.idParada}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '0.875rem', color: '#113d69', fontWeight: '600' }}>
                                                    {pp.parada?.nombre || `Parada ${pp.orden ?? ''}`} ({pp.tipo || 'ENTREGA'})
                                                </span>
                                                <AccionButton
                                                    variant={pp.completada ? 'outline-secondary' : 'primary'}
                                                    onClick={() => completarParada(pp.idPedido, pp.idParada, !pp.completada)}
                                                >
                                                    {pp.completada ? 'Marcar pendiente' : 'Completar'}
                                                </AccionButton>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '1rem 1.5rem 1.5rem', borderTop: 'none' }}>
                            <AccionButton
                                variant="outline-secondary"
                                onClick={() => setShowDetallePedido(false)}
                            >
                                Cerrar
                            </AccionButton>
                        </div>
                    </div>
                </div>
            )}
            {showTutorial && (
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
                    zIndex: 1060,
                    padding: '1rem'
                }} onClick={saltarTutorial}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '1.5rem',
                        maxWidth: '600px',
                        width: '100%',
                        padding: '2rem'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                            <div style={stepCircleStyle(1)}>1</div>
                            <div style={stepLineStyle(1)}></div>
                            <div style={stepCircleStyle(2)}>2</div>
                            <div style={stepLineStyle(2)}></div>
                            <div style={stepCircleStyle(3)}>3</div>
                        </div>

                        <div style={{ textAlign: 'center', minHeight: '200px' }}>
                            {currentStep === 1 && (
                                <div>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        backgroundColor: '#62d8d915',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1rem'
                                    }}>
                                        <Wallet size={40} style={{ color: '#62d8d9' }} />
                                    </div>
                                    <h3 style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#113d69' }}>Tus Ganancias</h3>
                                    <p style={{ color: '#6c757d' }}>Monitorea tus ingresos diarios de forma transparente.</p>
                                </div>
                            )}
                            {currentStep === 2 && (
                                <div>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        backgroundColor: '#62d8d915',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1rem'
                                    }}>
                                        {vehiculoPrincipal?.fotoVehiculo ? (
                                            <img
                                                src={vehiculoPrincipal.fotoVehiculo.startsWith('http')
                                                    ? vehiculoPrincipal.fotoVehiculo
                                                    : `${API_BASE_URL}${vehiculoPrincipal.fotoVehiculo}`}
                                                alt="Vehículo"
                                                style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    cursor: 'pointer',
                                                    border: `2px solid #62d8d9`
                                                }}
                                                onClick={() => handleImageClick(vehiculoPrincipal)}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <Car size={40} style={{ color: '#62d8d9' }} />
                                        )}
                                    </div>
                                    <h3 style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#113d69' }}>Vehículo</h3>
                                    <p style={{ color: '#6c757d' }}>Seguridad garantizada para ti y tus clientes.</p>
                                </div>
                            )}
                            {currentStep === 3 && (
                                <div>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        backgroundColor: '#113d6915',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1rem'
                                    }}>
                                        <FileText size={40} style={{ color: '#113d69' }} />
                                    </div>
                                    <h3 style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#62d8d9' }}>Documentación</h3>
                                    <p style={{ color: '#6c757d' }}>¡Casi listo! Solo falta validar tu documentación oficial.</p>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {currentStep > 1 && (
                                    <AccionButton
                                        variant="outline-secondary"
                                        onClick={manejarAtras}
                                    >
                                        Atrás
                                    </AccionButton>
                                )}
                                <AccionButton
                                    variant="primary"
                                    onClick={manejarSiguiente}
                                >
                                    {currentStep === 3 ? "Finalizar" : "Siguiente"}
                                </AccionButton>
                            </div>
                            <button
                                onClick={saltarTutorial}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#6c757d',
                                    marginTop: '0.75rem',
                                    fontSize: '0.875rem',
                                    textDecoration: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Saltar recorrido
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showSolicitudModal && (
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
                    zIndex: 1050,
                    padding: '1rem'
                }} onClick={() => !enviandoSolicitud && setShowSolicitudModal(false)}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        maxWidth: '500px',
                        width: '100%',
                        padding: '1.5rem'
                    }} onClick={(e) => e.stopPropagation()}>
                        <h5 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#113d69' }}>
                            Solicitar Cambio de Vehículo
                        </h5>
                        <p style={{ color: '#6c757d', fontSize: '0.875rem', marginBottom: '1rem' }}>
                            Completa los nuevos datos. Tu solicitud será revisada por un administrador antes de aplicarse.
                        </p>

                        {mensajeSolicitud.texto && (
                            <div style={{
                                padding: '0.5rem',
                                backgroundColor: mensajeSolicitud.tipo === 'success' ? '#d4edda' : '#f8d7da',
                                borderRadius: '0.25rem',
                                fontSize: '0.875rem',
                                marginBottom: '1rem',
                                color: mensajeSolicitud.tipo === 'success' ? '#155724' : '#721c24'
                            }}>
                                {mensajeSolicitud.texto}
                            </div>
                        )}

                        <form onSubmit={enviarSolicitudCambio}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#113d69', display: 'block', marginBottom: '0.25rem' }}>Marca</label>
                                <input
                                    type="text"
                                    value={formDataSolicitud.marca}
                                    onChange={(e) => setFormDataSolicitud({ ...formDataSolicitud, marca: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.375rem 0.75rem',
                                        border: `1px solid #62d8d9`,
                                        borderRadius: '0.375rem'
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#113d69', display: 'block', marginBottom: '0.25rem' }}>Modelo</label>
                                <input
                                    type="text"
                                    value={formDataSolicitud.modelo}
                                    onChange={(e) => setFormDataSolicitud({ ...formDataSolicitud, modelo: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.375rem 0.75rem',
                                        border: `1px solid #62d8d9`,
                                        borderRadius: '0.375rem'
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#113d69', display: 'block', marginBottom: '0.25rem' }}>Placa</label>
                                <input
                                    type="text"
                                    value={formDataSolicitud.placa}
                                    onChange={(e) => setFormDataSolicitud({ ...formDataSolicitud, placa: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.375rem 0.75rem',
                                        border: `1px solid #62d8d9`,
                                        borderRadius: '0.375rem'
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#113d69', display: 'block', marginBottom: '0.25rem' }}>Tipo de vehículo</label>
                                <select
                                    value={formDataSolicitud.tipo}
                                    onChange={(e) => setFormDataSolicitud({ ...formDataSolicitud, tipo: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.375rem 0.75rem',
                                        border: `1px solid #62d8d9`,
                                        borderRadius: '0.375rem'
                                    }}
                                >
                                    <option value="MOTO">MOTO</option>
                                    <option value="BICICLETA">BICICLETA</option>
                                    <option value="CARRO">CARRO</option>
                                    <option value="FURGON">FURGÓN</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#113d69', display: 'block', marginBottom: '0.25rem' }}>Capacidad (kg)</label>
                                <input
                                    type="number"
                                    value={formDataSolicitud.capacidad}
                                    onChange={(e) => setFormDataSolicitud({ ...formDataSolicitud, capacidad: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.375rem 0.75rem',
                                        border: `1px solid #62d8d9`,
                                        borderRadius: '0.375rem'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <AccionButton
                                    variant="outline-secondary"
                                    onClick={() => setShowSolicitudModal(false)}
                                    disabled={enviandoSolicitud}
                                    style={{ flex: 1, minWidth: '120px' }}
                                >
                                    Cancelar
                                </AccionButton>
                                <button
                                    type="submit"
                                    disabled={enviandoSolicitud}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#62d8d9',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '0.375rem',
                                        fontWeight: '500',
                                        cursor: enviandoSolicitud ? 'not-allowed' : 'pointer',
                                        opacity: enviandoSolicitud ? 0.6 : 1,
                                        minWidth: '120px'
                                    }}
                                >
                                    {enviandoSolicitud ? <Spinner animation="border" size="sm" /> : "Enviar Solicitud"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverHome;
