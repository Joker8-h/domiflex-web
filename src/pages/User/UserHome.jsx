import React, { useState, useEffect } from "react";
import { Banknote, MapPin, Calendar, Send, Bike, ArrowRight, ChartLine, History, Funnel, Wallet, Search, Route, Clock, X, Star, User } from "lucide-react";
import { Container, Row, Col, Spinner } from "react-bootstrap";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area
} from 'recharts';
import Navbar from "../../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";
import imagencontacto from "../Imagenes/AutoresContacto.png";
import toast, { Toaster } from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Componentes personalizados
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

const PagoBadge = ({ estado }) => {
    const estilos = {
        PAGADO: { backgroundColor: '#62d8d9', color: '#ffffff' },
        PENDIENTE: { backgroundColor: '#cccbd2af', color: '#113d69' },
        FALLIDO: { backgroundColor: '#113d69', color: '#ffffff' }
    };

    const estilo = estilos[estado] || { backgroundColor: '#cccbd2af', color: '#113d69' };

    return (
        <span style={{
            ...estilo,
            padding: '0.25rem 0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.7rem',
            fontWeight: '500',
            display: 'inline-block'
        }}>
            {estado || 'N/A'}
        </span>
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

const AccionButton = ({ variant, onClick, children, disabled, style }) => {
    const getButtonStyle = () => {
        const baseStyle = {
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: '1px solid',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            transition: 'all 0.2s',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
        };

        if (variant === 'outline-primary') {
            return {
                ...baseStyle,
                backgroundColor: 'transparent',
                color: '#62d8d9',
                borderColor: '#62d8d9'
            };
        } else if (variant === 'primary') {
            return {
                ...baseStyle,
                backgroundColor: '#62d8d9',
                color: '#ffffff',
                borderColor: '#62d8d9'
            };
        } else if (variant === 'outline-secondary') {
            return {
                ...baseStyle,
                backgroundColor: 'transparent',
                color: '#113d69',
                borderColor: '#113d69'
            };
        } else if (variant === 'secondary') {
            return {
                ...baseStyle,
                backgroundColor: '#113d69',
                color: '#ffffff',
                borderColor: '#113d69'
            };
        } else if (variant === 'link') {
            return {
                ...baseStyle,
                backgroundColor: 'transparent',
                color: '#113d69',
                border: 'none',
                textDecoration: 'none'
            };
        }
        return baseStyle;
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{ ...getButtonStyle(), ...style }}
        >
            {children}
        </button>
    );
};

const cardStyle = {
    background: "#ffffff",
    borderRadius: '1rem',
    border: 'none',
    boxShadow: "0 10px 30px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.02)",
    overflow: "hidden"
};

const BOGOTA_CENTER = [4.711, -74.0721];

const redondearCop = (monto) => {
    if (!monto || monto <= 0) return 0;
    return Math.max(Math.ceil(monto / 100) * 100, 500);
};

const haversineKm = (a, b) => {
    const R = 6371;
    const dLat = (b[0] - a[0]) * Math.PI / 180;
    const dLng = (b[1] - a[1]) * Math.PI / 180;
    const s = Math.sin(dLat / 2) ** 2 +
        Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
};

// Estimación local espejo del backend: base $2000 + $800/km, comisión 10%/12%/15%
const estimarLocal = (origen, destino) => {
    const distanciaKm = haversineKm(origen, destino);
    const subtotal = redondearCop(2000 + 800 * distanciaKm);
    const tasa = distanciaKm <= 5 ? 0.10 : distanciaKm <= 15 ? 0.12 : 0.15;
    const comision = redondearCop(subtotal * tasa);
    const total = redondearCop(subtotal + comision);
    return { distanciaKm, subtotal, comision, total };
};

const puntoIcon = (color) => L.divIcon({
    className: 'domiflex-pin',
    html: `<div style="background:${color};width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22]
});

const ClickManejador = ({ modo, onPick }) => {
    useMapEvents({
        click(e) {
            onPick([e.latlng.lat, e.latlng.lng], modo);
        }
    });
    return null;
};

const FLUJO_PEDIDO = ['CREADO', 'ASIGNADO', 'RECOGIENDO', 'EN_CAMINO', 'ENTREGADO'];

const UserHome = () => {
    const { usuario, token } = useAuth();
    const navigate = useNavigate();

    const brandColor = "#113d69"; // Azul oscuro
    const accentColor = "#62d8d9"; // Verde turquesa

    const [pedidosRecientes, setPedidosRecientes] = useState([]);
    const [todosLosPedidos, setTodosLosPedidos] = useState([]);
    const [showPedidosModal, setShowPedidosModal] = useState(false);
    const [cargandoPedidos, setCargandoPedidos] = useState(false);
    const [errorPedidos, setErrorPedidos] = useState("");
    const [pagosRecientes, setPagosRecientes] = useState([]);
    const [cargandoPagos, setCargandoPagos] = useState(false);
    const [errorPagos, setErrorPagos] = useState("");
    
    // Estados para filtros de pedidos
    const [busquedaPedidos, setBusquedaPedidos] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("TODOS");
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [showDetallePedido, setShowDetallePedido] = useState(false);

    // Crear domicilio (recogida -> entrega) con pago en efectivo
    const [showCrearPedido, setShowCrearPedido] = useState(false);
    const [dirRecogida, setDirRecogida] = useState('');
    const [dirEntrega, setDirEntrega] = useState('');
    const [posRecogida, setPosRecogida] = useState([4.711, -74.0721]);
    const [posEntrega, setPosEntrega] = useState([4.724, -74.062]);
    const [detallePedido, setDetallePedido] = useState('');
    const [modoMapa, setModoMapa] = useState('recogida');
    const [estimacion, setEstimacion] = useState(null);
    const [estimando, setEstimando] = useState(false);
    const [creandoPedido, setCreandoPedido] = useState(false);

    // Detalle: paradas, acciones y calificación
    const [paradasPedido, setParadasPedido] = useState([]);
    const [accionando, setAccionando] = useState(false);
    const [puntuacion, setPuntuacion] = useState(5);
    const [comentarioCalif, setComentarioCalif] = useState('');
    const [enviandoCalif, setEnviandoCalif] = useState(false);

    const [estadisticas, setEstadisticas] = useState({
        totalPedidos: 0,
        pedidosEntregados: 0,
        pedidosCancelados: 0,
        totalGastado: 0
    });

    // Nuevos estados para analíticas de cliente
    const [statsAvanzadas, setStatsAvanzadas] = useState({
        gastos: { total: 0, historial: [] },
        frecuencia: { total: 0, historial: [] }
    });
    const [periodo, setPeriodo] = useState('mensual');
    const [cargandoStats, setCargandoStats] = useState(false);

    useEffect(() => {
        const obtenerPedidos = async () => {
            if (!token || !usuario?.idUsuarios) return;

            try {
                setCargandoPedidos(true);
                const respuesta = await fetch(
                    `${API_URL}/pedidos/mis-pedidos`,
                    { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
                );

                if (respuesta.ok) {
                    const data = await respuesta.json();
                    const pedidosData = Array.isArray(data) ? data : [];
                    setTodosLosPedidos(pedidosData);
                    setPedidosRecientes(pedidosData.slice(0, 3));

                    const entregados = pedidosData.filter(v => v.estado === 'ENTREGADO').length;
                    const cancelados = pedidosData.filter(v => v.estado === 'CANCELADO').length;
                    const totalGastado = pedidosData
                        .filter(v => v.estado === 'ENTREGADO')
                        .reduce((sum, v) => sum + Number(v.total || 0), 0);

                    // Las estadísticas estáticas ya no son necesarias si todo es dinámico,
                    // pero las mantenemos por si se usan en otro lado sin filtro temporal.
                    setEstadisticas({
                        totalPedidos: pedidosData.length,
                        pedidosEntregados: entregados,
                        pedidosCancelados: cancelados,
                        totalGastado: totalGastado
                    });
                }
            } catch (error) {
                console.error("Error al obtener pedidos:", error);
                setErrorPedidos("Error al cargar pedidos");
            } finally {
                setCargandoPedidos(false);
            }
        };
        obtenerPedidos();
    }, [token, usuario?.idUsuarios]);

    useEffect(() => {
        const obtenerPagos = async () => {
            if (!token || !usuario?.idUsuarios) return;
            try {
                setCargandoPagos(true);
                const respuesta = await fetch(
                    `${API_URL}/pagos/`,
                    { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
                );
                if (respuesta.ok) {
                    const data = await respuesta.json();
                    setPagosRecientes(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Error al cargar pagos:", error);
                setErrorPagos("Error al cargar pagos");
            } finally {
                setCargandoPagos(false);
            }
        };
        obtenerPagos();
    }, [token, usuario?.idUsuarios]);

    const traerEstadisticasCliente = async () => {
        if (!token) return;
        try {
            setCargandoStats(true);
            const headers = { "Authorization": "Bearer " + token };

            const [resGastos, resPedidosHistory] = await Promise.all([
                fetch(`${API_URL}/estadisticas/ganancias?periodo=${periodo}`, { headers }),
                fetch(`${API_URL}/estadisticas/pedidos?periodo=${periodo}`, { headers })
            ]);

            const nuevasStats = { ...statsAvanzadas };
            if (resGastos.ok) nuevasStats.gastos = await resGastos.json();
            if (resPedidosHistory.ok) nuevasStats.frecuencia = await resPedidosHistory.json();

            setStatsAvanzadas(nuevasStats);
        } catch (error) {
            console.error("Error al traer estadísticas del cliente:", error);
        } finally {
            setCargandoStats(false);
        }
    };

    useEffect(() => {
        traerEstadisticasCliente();
    }, [token, periodo]);

    // Función para filtrar pedidos (igual que en DriverHome)
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

    // --- CÁLCULO DE FRECUENCIA EN EL FRONTEND ---
    const agruparFrecuencia = (pedidosLista, periodoActual) => {
        const gruposF = {};

        pedidosLista.forEach(v => {
            const fecha = new Date(v.fechaHoraSalida || v.creadoEn || new Date());
            let key;
            if (periodoActual === 'diario') {
                key = `${fecha.getHours()}:00`;
            } else if (periodoActual === 'mensual') {
                key = `Día ${fecha.getDate()}`;
            } else if (periodoActual === 'anual') {
                const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                key = meses[fecha.getMonth()];
            }
            gruposF[key] = (gruposF[key] || 0) + 1;
        });

        return {
            frecuencia: Object.entries(gruposF).map(([name, value]) => ({ name, value }))
        };
    };

    const ahora = new Date();
    let fechaInicioFiltro;
    if (periodo === 'diario') {
        fechaInicioFiltro = new Date(ahora.setHours(0, 0, 0, 0));
    } else if (periodo === 'mensual') {
        fechaInicioFiltro = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    } else if (periodo === 'anual') {
        fechaInicioFiltro = new Date(ahora.getFullYear(), 0, 1);
    }

    const pedidosEntregadosPorPeriodo = todosLosPedidos.filter(v => 
        (v.estado === 'ENTREGADO' || v.estado === 'ASIGNADO') && 
        new Date(v.fechaHoraSalida || v.creadoEn) >= fechaInicioFiltro
    );

    const agrupadosFrecuencia = agruparFrecuencia(pedidosEntregadosPorPeriodo, periodo);
    
    // --- ESTADÍSTICAS DEL RESUMEN POR PERIODO ---
    const pedidosTotalesPorPeriodo = todosLosPedidos.filter(v => 
        new Date(v.fechaHoraSalida || v.creadoEn) >= fechaInicioFiltro
    );
    const entregadosPeriodo = pedidosTotalesPorPeriodo.filter(v => v.estado === 'ENTREGADO' || v.estado === 'ASIGNADO').length;
    const canceladosPeriodo = pedidosTotalesPorPeriodo.filter(v => v.estado === 'CANCELADO').length;
    // --------------------------------------------

    // --- CÁLCULO DE GASTOS ASIGNADOS EN EL FRONTEND ---
    let gastoTotalCalculado = 0;
    const gruposG = {};

    // Asumimos que un pedido ENTREGADO o ENTREGADO o ASIGNADO representa un gasto real
    pedidosEntregadosPorPeriodo.forEach(v => {
        gastoTotalCalculado += Number(v.total || 0);

        const fecha = new Date(v.fechaHoraSalida || v.creadoEn || new Date());
        let key;
        if (periodo === 'diario') {
            key = `${fecha.getHours()}:00`;
        } else if (periodo === 'mensual') {
            key = `Día ${fecha.getDate()}`;
        } else if (periodo === 'anual') {
            const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            key = meses[fecha.getMonth()];
        }
        gruposG[key] = (gruposG[key] || 0) + Number(v.total || 0);
    });

    const displayGastos = {
        total: gastoTotalCalculado,
        historial: Object.entries(gruposG).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
    };

    const displayFrecuencia = {
        historial: agrupadosFrecuencia.frecuencia
    };

    const displayPagosRecientes = pagosRecientes && pagosRecientes.length > 0 
        ? pagosRecientes 
        : todosLosPedidos
            .filter(v => v.estado === 'ENTREGADO')
            .map(v => ({
                idPago: `pedido-${v.idPedido}`,
                tipoPago: 'Pago de Pedido',
                fechaPago: v.fechaHoraSalida || v.creadoEn,
                monto: v.total || 0,
                estado: 'PAGADO'
            })).slice(0, 3);
    // -----------------------------------------------------------

    // Estimación: intenta backend (GET /pedidos/0/estimar-precio) y cae a cálculo local
    const actualizarEstimacion = async (origen, destino) => {
        setEstimando(true);
        const local = estimarLocal(origen, destino);
        try {
            const resp = await fetch(
                `${API_URL}/pedidos/0/estimar-precio?latRecogida=${origen[0]}&lngRecogida=${origen[1]}&latEntrega=${destino[0]}&lngEntrega=${destino[1]}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (resp.ok) {
                const data = await resp.json();
                setEstimacion({
                    distanciaKm: Number(data.distanciaRecorrida || local.distanciaKm),
                    subtotal: Number(data.subtotal || local.subtotal),
                    comision: Number(data.comisionPlataforma || local.comision),
                    total: Number(data.precioFinal || data.total || local.total)
                });
                setEstimando(false);
                return;
            }
        } catch (e) { /* fallback local */ }
        setEstimacion(local);
        setEstimando(false);
    };

    useEffect(() => {
        if (showCrearPedido && token) actualizarEstimacion(posRecogida, posEntrega);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [posRecogida, posEntrega, showCrearPedido]);

    const onPickMapa = (latlng) => {
        if (modoMapa === 'recogida') setPosRecogida(latlng);
        else setPosEntrega(latlng);
    };

    const crearPedido = async (e) => {
        e.preventDefault();
        if (!dirRecogida.trim() || !dirEntrega.trim()) {
            toast.error('Indica la dirección de recogida y la de entrega');
            return;
        }
        try {
            setCreandoPedido(true);
            const total = estimacion?.total || estimarLocal(posRecogida, posEntrega).total;
            const resp = await fetch(`${API_URL}/pedidos`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dirRecogida: dirRecogida.trim(),
                    latRecogida: posRecogida[0],
                    lngRecogida: posRecogida[1],
                    dirEntrega: dirEntrega.trim(),
                    latEntrega: posEntrega[0],
                    lngEntrega: posEntrega[1],
                    detallePedido: detallePedido.trim(),
                    tipoPago: 'EFECTIVO'
                })
            });
            const data = await resp.json();
            if (data?.error || (!resp.ok && !data?.idPedido)) throw new Error(data?.error || 'No se pudo crear el pedido');
            // Pago en efectivo asociado al pedido
            try {
                await fetch(`${API_URL}/pagos`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idPedido: data.idPedido, monto: total, tipoPago: 'EFECTIVO' })
                });
            } catch (e) { console.warn('No se pudo registrar el pago en efectivo:', e); }
            setTodosLosPedidos(prev => [data, ...prev]);
            setPedidosRecientes(prev => [data, ...prev].slice(0, 3));
            setShowCrearPedido(false);
            setDirRecogida(''); setDirEntrega(''); setDetallePedido('');
            toast.success(`Pedido #${data.idPedido} creado. Pagas $${Number(total).toLocaleString()} en efectivo al recibir.`);
        } catch (error) {
            toast.error(error.message || 'Error al crear el pedido');
        } finally {
            setCreandoPedido(false);
        }
    };

    const cancelarPedido = async (id) => {
        try {
            setAccionando(true);
            const resp = await fetch(`${API_URL}/pedidos/${id}/cancelar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            const data = await resp.json();
            if (data?.error) throw new Error(data.error);
            const actualizado = data.pedido || { idPedido: id, estado: 'CANCELADO' };
            setTodosLosPedidos(prev => prev.map(p => p.idPedido === id ? { ...p, ...actualizado } : p));
            setPedidoSeleccionado(prev => prev ? { ...prev, ...actualizado } : prev);
            toast.success('Pedido cancelado');
        } catch (error) {
            toast.error(error.message || 'No se pudo cancelar el pedido');
        } finally {
            setAccionando(false);
        }
    };

    const pagarEfectivo = async (pedido) => {
        try {
            setAccionando(true);
            const resp = await fetch(`${API_URL}/pagos`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ idPedido: pedido.idPedido, monto: Number(pedido.total || 0), tipoPago: 'EFECTIVO' })
            });
            const data = await resp.json();
            if (data?.error) throw new Error(data.error);
            toast.success('Pago en efectivo registrado');
        } catch (error) {
            toast.error(error.message || 'No se pudo registrar el pago');
        } finally {
            setAccionando(false);
        }
    };

    const cargarParadas = async (idPedido) => {
        try {
            const resp = await fetch(`${API_URL}/pedido-paradas/pedido/${idPedido}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resp.ok) setParadasPedido(await resp.json());
            else setParadasPedido([]);
        } catch (e) { setParadasPedido([]); }
    };

    useEffect(() => {
        if (pedidoSeleccionado?.idPedido) cargarParadas(pedidoSeleccionado.idPedido);
        else setParadasPedido([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pedidoSeleccionado?.idPedido]);

    const calificarRepartidor = async () => {
        if (!pedidoSeleccionado?.idRepartidor) {
            toast.error('Este pedido aún no tiene repartidor asignado');
            return;
        }
        try {
            setEnviandoCalif(true);
            const resp = await fetch(`${API_URL}/calificaciones`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idPedido: pedidoSeleccionado.idPedido,
                    idCalificado: pedidoSeleccionado.idRepartidor,
                    puntuacion: parseInt(puntuacion),
                    comentario: comentarioCalif.trim()
                })
            });
            const data = await resp.json();
            if (data?.error) throw new Error(data.error);
            setComentarioCalif('');
            toast.success('Gracias por calificar al repartidor');
        } catch (error) {
            toast.error(error.message || 'No se pudo enviar la calificación');
        } finally {
            setEnviandoCalif(false);
        }
    };

    const iniciarChat = async (pedido) => {
        if (!pedido?.idRepartidor) {
            toast.error('Aún no hay repartidor asignado para chatear');
            return;
        }
        try {
            const resp = await fetch(`${API_URL}/chat/conversaciones`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ idPedido: pedido.idPedido, idCliente: usuario.idUsuarios, idRepartidor: pedido.idRepartidor })
            });
            const data = await resp.json();
            if (data?.error) throw new Error(data.error);
            toast.success(`Chat del pedido #${pedido.idPedido} listo`);
        } catch (error) {
            toast.error(error.message || 'No se pudo iniciar el chat');
        }
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'ENTREGADO': return 'success';
            case 'CANCELADO': return 'danger';
            case 'CREADO': return 'info';
            case 'ASIGNADO':
            case 'RECOGIENDO': return 'primary';
            case 'EN_CAMINO': return 'warning';
            default: return 'secondary';
        }
    };

    const getEstadoTexto = (estado) => {
        switch (estado) {
            case 'ENTREGADO': return 'Entregado';
            case 'CANCELADO': return 'Cancelado';
            case 'CREADO': return 'Creado';
            case 'ASIGNADO': return 'Asignado';
            case 'RECOGIENDO': return 'Recogiendo';
            case 'EN_CAMINO': return 'En camino';
            default: return estado || 'Desconocido';
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

    const formatearMoneda = (valor) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor || 0);
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundImage: `url(${imagencontacto})`,
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

                <div style={{ position: 'relative', zIndex: 2 }}>
                <Navbar transparent={true} />
                <Toaster position="top-right" />

                <Container className="py-5">
                    {/* Tarjeta de bienvenida */}
                    <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
                        <div style={{
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                            justifyContent: 'space-between',
                            alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
                            gap: window.innerWidth < 768 ? '1rem' : '0'
                        }}>
                            <div>
                                <h2 style={{ fontWeight: 'bold', margin: 0, color: brandColor }}>
                                    ¡Hola, <span style={{ color: accentColor }}>{usuario?.nombre?.split(' ')[0] || 'Usuario'}</span>!
                                </h2>
                                <p style={{ color: '#6c757d', margin: 0 }}>Gestiona tus pedidos y pagos en DomiFlex</p>
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
                                    <span style={{ fontSize: '0.875rem', textTransform: 'uppercase', fontWeight: 'bold', color: '#6c757d', display: 'block' }}>Gastado {periodo}</span>
                                    <h3 style={{ fontWeight: 'bold', margin: 0, color: accentColor }}>
                                        {formatearMoneda(displayGastos.total)}
                                    </h3>
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

                    {/* Nuevo domicilio */}
                    <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Bike size={22} style={{ color: accentColor, marginRight: '0.5rem' }} />
                                    <h5 style={{ margin: 0, fontWeight: 'bold', color: brandColor }}>Nuevo domicilio</h5>
                                </div>
                                <AccionButton variant={showCrearPedido ? 'outline-secondary' : 'primary'} onClick={() => setShowCrearPedido(v => !v)}>
                                    {showCrearPedido ? <><X style={{ marginRight: '0.5rem' }} /> Cerrar</> : <><Send style={{ marginRight: '0.5rem' }} /> Pedir domicilio</>}
                                </AccionButton>
                            </div>
                            {showCrearPedido && (
                                <form onSubmit={crearPedido} style={{ marginTop: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                        <AccionButton variant={modoMapa === 'recogida' ? 'primary' : 'outline-primary'} onClick={() => setModoMapa('recogida')}>
                                            <MapPin style={{ marginRight: '0.5rem' }} /> Marcar recogida
                                        </AccionButton>
                                        <AccionButton variant={modoMapa === 'entrega' ? 'primary' : 'outline-primary'} onClick={() => setModoMapa('entrega')}>
                                            <MapPin style={{ marginRight: '0.5rem' }} /> Marcar entrega
                                        </AccionButton>
                                    </div>
                                    <div style={{ height: '300px', borderRadius: '0.75rem', overflow: 'hidden', border: `1px solid ${accentColor}`, marginBottom: '1rem' }}>
                                        <MapContainer center={BOGOTA_CENTER} zoom={13} style={{ height: '100%', width: '100%' }}>
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                                            <ClickManejador modo={modoMapa} onPick={onPickMapa} />
                                            <Marker position={posRecogida} icon={puntoIcon('#113d69')} />
                                            <Marker position={posEntrega} icon={puntoIcon('#62d8d9')} />
                                        </MapContainer>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: brandColor }}>Dirección de recogida *</label>
                                            <input value={dirRecogida} onChange={(e) => setDirRecogida(e.target.value)} placeholder="Ej: Calle 80 #10-20" style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #ced4da' }} />
                                            <small style={{ color: '#6c757d' }}>{posRecogida[0].toFixed(5)}, {posRecogida[1].toFixed(5)}</small>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: brandColor }}>Dirección de entrega *</label>
                                            <input value={dirEntrega} onChange={(e) => setDirEntrega(e.target.value)} placeholder="Ej: Carrera 15 #93-47" style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #ced4da' }} />
                                            <small style={{ color: '#6c757d' }}>{posEntrega[0].toFixed(5)}, {posEntrega[1].toFixed(5)}</small>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: brandColor }}>Detalle del pedido</label>
                                        <textarea value={detallePedido} onChange={(e) => setDetallePedido(e.target.value)} placeholder="Ej: Paquete mediano, entregar en portería" rows={2} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #ced4da' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <span style={{ color: '#6c757d', display: 'flex', alignItems: 'center' }}>
                                            <Banknote style={{ marginRight: '0.5rem', color: accentColor }} />
                                            {estimando ? 'Calculando...' : estimacion ? `${estimacion.distanciaKm.toFixed(1)} km · Base $2.000 + $800/km` : 'Toca el mapa para ubicar los puntos'}
                                        </span>
                                        <strong style={{ color: accentColor, fontSize: '1.25rem' }}>
                                            {estimacion ? formatearMoneda(estimacion.total) : '—'}
                                        </strong>
                                    </div>
                                    <AccionButton variant="primary" onClick={crearPedido} disabled={creandoPedido} style={{ width: '100%', padding: '0.75rem' }}>
                                        <Banknote style={{ marginRight: '0.5rem' }} />
                                        {creandoPedido ? 'Creando pedido...' : 'Crear pedido · Pago en efectivo'}
                                    </AccionButton>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Gráficos */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: window.innerWidth < 992 ? '1fr' : '7fr 5fr',
                        gap: '1.5rem',
                        marginBottom: '1.5rem'
                    }}>
                        {/* Gráfico de hábitos de gasto */}
                        <div style={{ ...cardStyle, height: '100%' }}>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <ChartLine size={20} style={{ color: accentColor, marginRight: '0.5rem' }} />
                                        <h5 style={{ margin: 0, fontWeight: 'bold', color: brandColor }}>Hábitos de Gasto</h5>
                                    </div>
                                    <StatsBadge bgColor="#f8f9fa" color="#113d69">Tendencia {periodo}</StatsBadge>
                                </div>
                                <div style={{ height: '250px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={displayGastos.historial}>
                                            <defs>
                                                <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={accentColor} stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            <Area type="monotone" dataKey="value" stroke={accentColor} fillOpacity={1} fill="url(#colorGastos)" name="Gastado ($)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Frecuencia de Pedidos */}
                        <div style={{ ...cardStyle, height: '100%' }}>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <History size={20} style={{ color: brandColor, marginRight: '0.5rem' }} />
                                        <h5 style={{ margin: 0, fontWeight: 'bold', color: brandColor }}>Frecuencia de Pedidos</h5>
                                    </div>
                                    <StatsBadge bgColor="#f8f9fa" color="#113d69">Pedidos {periodo}</StatsBadge>
                                </div>
                                <div style={{ height: '250px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={displayFrecuencia.historial}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            <Bar dataKey="value" fill={brandColor} radius={[4, 4, 0, 0]} name="Pedidos" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mi Actividad Resumen y Pagos Recientes */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: window.innerWidth < 992 ? '1fr' : '7fr 5fr',
                        gap: '1.5rem',
                        marginBottom: '1.5rem'
                    }}>
                        {/* Mi Actividad Resumen */}
                        <div style={{ ...cardStyle, height: '100%' }}>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                    <User size={22} style={{ color: accentColor, marginRight: '0.5rem' }} />
                                    <h5 style={{ margin: 0, fontWeight: 'bold', color: brandColor }}>Resumen de Actividad</h5>
                                </div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: window.innerWidth < 576 ? '1fr' : window.innerWidth < 768 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                                    gap: '1rem',
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem', textAlign: 'center' }}>
                                        <h4 style={{ fontWeight: 'bold', marginBottom: 0, color: accentColor }}>{formatearMoneda(gastoTotalCalculado)}</h4>
                                        <small style={{ color: '#6c757d', fontWeight: 'bold' }}>Total Gastado</small>
                                    </div>
                                    <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem', textAlign: 'center' }}>
                                        <h4 style={{ fontWeight: 'bold', marginBottom: 0, color: brandColor }}>{pedidosTotalesPorPeriodo.length}</h4>
                                        <small style={{ color: '#6c757d' }}>Pedidos Totales</small>
                                    </div>
                                    <div 
                                        style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem', textAlign: 'center', cursor: 'pointer' }}
                                        onClick={() => setShowPedidosModal(true)}
                                    >
                                        <h4 style={{ fontWeight: 'bold', marginBottom: 0, color: brandColor }}>{entregadosPeriodo}</h4>
                                        <small style={{ color: '#6c757d', fontWeight: 'bold' }}>Entregados</small>
                                    </div>
                                    <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem', textAlign: 'center' }}>
                                        <h4 style={{ fontWeight: 'bold', marginBottom: 0, color: '#6c757d' }}>{canceladosPeriodo}</h4>
                                        <small style={{ color: '#6c757d' }}>Cancelados</small>
                                    </div>
                                </div>
        
                            </div>
                        </div>

                        <div style={{ ...cardStyle, height: '100%' }}>
                            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                    <Wallet size={22} style={{ color: accentColor, marginRight: '0.5rem' }} />
                                    <h5 style={{ margin: 0, fontWeight: 'bold', color: brandColor }}>Pagos Recientes</h5>
                                </div>
                                
                                {cargandoPagos ? (
                                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                                        <Spinner size="sm" style={{ color: accentColor }} />
                                    </div>
                                ) : displayPagosRecientes.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                                        <p style={{ color: '#6c757d' }}>No hay pagos recientes</p>
                                    </div>
                                ) : (
                                    <div style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                                        {displayPagosRecientes.slice(0, 3).map((pago) => (
                                            <div key={pago.idPago} style={{
                                                display: 'flex',
                                                flexDirection: window.innerWidth < 576 ? 'column' : 'row',
                                                justifyContent: 'space-between',
                                                alignItems: window.innerWidth < 576 ? 'flex-start' : 'center',
                                                padding: '0.75rem 0',
                                                borderBottom: '1px solid #e9ecef',
                                                gap: window.innerWidth < 576 ? '0.5rem' : '0'
                                            }}>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '0.875rem', color: brandColor }}>{pago.tipoPago || 'Pedido'}</div>
                                                    <small style={{ color: '#6c757d' }}>{new Date(pago.fechaPago).toLocaleDateString()}</small>
                                                </div>
                                                <div style={{ textAlign: window.innerWidth < 576 ? 'left' : 'right' }}>
                                                    <div style={{ fontWeight: 'bold', color: accentColor }}>{formatearMoneda(pago.monto)}</div>
                                                    <PagoBadge estado={pago.estado} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>

                    {/* Pedidos Recientes */}
                    <div style={{ ...cardStyle }}>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <History size={24} style={{ color: accentColor, marginRight: '0.5rem' }} />
                                    <h5 style={{ margin: 0, fontWeight: 'bold', color: brandColor }}>Pedidos Recientes</h5>
                                </div>
                                <AccionButton
                                    variant="link"
                                    onClick={() => setShowPedidosModal(true)}
                                    style={{ color: brandColor, fontWeight: 'bold' }}
                                >
                                    Ver Todos
                                </AccionButton>
                            </div>

                            {cargandoPedidos ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <Spinner animation="border" style={{ color: accentColor }} />
                                </div>
                            ) : errorPedidos ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <p style={{ color: '#dc3545' }}>{errorPedidos}</p>
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
                                                gridTemplateColumns: window.innerWidth < 768 ? '1fr 1fr' : '1fr 5fr 3fr 3fr',
                                                gap: '0.5rem',
                                                alignItems: 'center'
                                            }}>
                                                <div style={{ textAlign: 'center', gridColumn: window.innerWidth < 768 ? 'span 1' : 'auto' }}>
                                                    <Route size={20} color={accentColor} />
                                                </div>
                                                <div style={{ gridColumn: window.innerWidth < 768 ? 'span 1' : 'auto' }}>
                                                    <p style={{ marginBottom: 0, fontWeight: 'bold', color: brandColor }}>
                                                        A {pedido.ruta?.nombre || pedido.destino || "Destino"}
                                                    </p>
                                                    <small style={{ color: '#6c757d' }}>
                                                        {formatearFecha(pedido.fechaHoraSalida)}
                                                    </small>
                                                </div>
                                                <div style={{ fontWeight: 'bold', color: accentColor, gridColumn: window.innerWidth < 768 ? 'span 1' : 'auto' }}>
                                                    {formatearMoneda(pedido.total)}
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
                    </div>
                </Container>
            </div>

            {/* Modal de Historial Completo (igual que en DriverHome) */}
            {showPedidosModal && (
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
                }} onClick={() => setShowPedidosModal(false)}>
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
                            <h5 style={{ fontWeight: '600', color: accentColor }}>
                                <History style={{ marginRight: '0.5rem' }} /> Mis Pedidos
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
                                            border: `1px solid ${accentColor}`,
                                            borderRadius: '0.375rem 0 0 0.375rem'
                                        }}>
                                            <Search color={accentColor} />
                                        </span>
                                        <input
                                            placeholder="Buscar por # de pedido o nombre de ruta..."
                                            value={busquedaPedidos}
                                            onChange={(e) => setBusquedaPedidos(e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: '0.375rem 0.75rem',
                                                border: `1px solid ${accentColor}`,
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
                                            border: `1px solid ${brandColor}`,
                                            borderRadius: '0.375rem 0 0 0.375rem'
                                        }}>
                                            <Funnel color={brandColor} />
                                        </span>
                                        <select
                                            value={filtroEstado}
                                            onChange={(e) => setFiltroEstado(e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: '0.375rem 0.75rem',
                                                border: `1px solid ${brandColor}`,
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
                                    <StatsBadge bgColor={accentColor} color="#ffffff">
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
                                        <History size={24} style={{ color: accentColor }} />
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
                                            color: accentColor,
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
                                                setShowPedidosModal(false);
                                            }}
                                        >
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: window.innerWidth < 768 ? '1fr 1fr 1fr 1fr' : '1fr 2fr 3fr 2fr 2fr 2fr',
                                                gap: '0.5rem',
                                                alignItems: 'center'
                                            }}>
                                                <div style={{ textAlign: 'center', gridColumn: window.innerWidth < 768 ? 'span 1' : 'auto' }}>
                                                    <Route size={20} color={accentColor} />
                                                </div>
                                                <div style={{ gridColumn: window.innerWidth < 768 ? 'span 1' : 'auto' }}>
                                                    <p style={{ marginBottom: 0, fontWeight: '600', color: brandColor }}>Pedido #{pedido.idPedido}</p>
                                                    <small style={{ color: '#6c757d' }}>
                                                        {formatearFecha(pedido.fechaHoraSalida)}
                                                    </small>
                                                </div>
                                                <div style={{ gridColumn: window.innerWidth < 768 ? 'span 1' : 'auto' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <Route size={12} color={accentColor} style={{ marginRight: '0.25rem' }} />
                                                        <small style={{ fontWeight: '600', color: brandColor }}>Ruta:</small>
                                                        <span style={{ marginLeft: '0.5rem', color: '#6c757d', fontSize: '0.875rem' }}>{pedido.ruta?.nombre || 'No disponible'}</span>
                                                    </div>
                                                </div>
                                                <div style={{ fontWeight: 'bold', color: accentColor, gridColumn: window.innerWidth < 768 ? 'span 1' : 'auto' }}>
                                                    {formatearMoneda(pedido.total)}
                                                </div>
                                                <div style={{ gridColumn: window.innerWidth < 768 ? 'span 1' : 'auto' }}>
                                                    <small style={{ color: '#6c757d', display: 'flex', alignItems: 'center' }}>
                                                        <Clock style={{ marginRight: '0.25rem' }} size={10} />
                                                        {pedido.dirRecogida && pedido.dirEntrega ? `${pedido.dirRecogida} → ${pedido.dirEntrega}` : (pedido.detallePedido || 'Domicilio')}
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
                                onClick={() => setShowPedidosModal(false)}
                            >
                                Cerrar
                            </AccionButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Detalle de Pedido */}
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
                    zIndex: 1060,
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
                            background: `linear-gradient(135deg, ${accentColor}20, white)`,
                            borderBottom: `2px solid ${accentColor}`,
                            padding: '1.5rem'
                        }}>
                            <h5 style={{ fontWeight: '600', color: brandColor }}>
                                <Route style={{ marginRight: '0.5rem', color: accentColor }} /> Detalle del Pedido #{pedidoSeleccionado.idPedido}
                            </h5>
                        </div>
                        <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div style={{ backgroundColor: '#F9FAFB', border: `1px solid ${accentColor}20`, borderRadius: '1rem' }}>
                                    <div style={{ padding: '1rem' }}>
                                        <h6 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: accentColor }}>Información General</h6>
                                        <div style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: 'none', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                <span style={{ color: '#6c757d' }}>Fecha y hora:</span>
                                                <span style={{ fontWeight: '600', color: brandColor }}>{formatearFecha(pedidoSeleccionado.fechaHoraSalida)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: 'none', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                <span style={{ color: '#6c757d' }}>Estado:</span>
                                                <EstadoPedidoBadge estado={pedidoSeleccionado.estado} />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: 'none', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                <span style={{ color: '#6c757d' }}>Precio:</span>
                                                <span style={{ fontWeight: '600', color: accentColor }}>{formatearMoneda(pedidoSeleccionado.total)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: 'none', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                <span style={{ color: '#6c757d' }}>Pago:</span>
                                                <span style={{ fontWeight: '600', color: brandColor }}>EFECTIVO</span>
                                            </div>
                                            {pedidoSeleccionado.repartidor?.nombre && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: 'none', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                    <span style={{ color: '#6c757d' }}>Repartidor:</span>
                                                    <span style={{ fontWeight: '600', color: brandColor }}>{pedidoSeleccionado.repartidor.nombre}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ backgroundColor: '#F9FAFB', border: `1px solid ${brandColor}20`, borderRadius: '1rem' }}>
                                    <div style={{ padding: '1rem' }}>
                                        <h6 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: brandColor }}>Ruta del Pedido</h6>
                                        <div style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {pedidoSeleccionado.dirRecogida && (
                                                <div style={{ display: 'flex', padding: '0.5rem 0', borderBottom: 'none', flexWrap: 'wrap' }}>
                                                    <MapPin size={14} color={accentColor} style={{ marginRight: '0.5rem', marginTop: '0.25rem' }} />
                                                    <div>
                                                        <span style={{ color: '#6c757d' }}>Recogida:</span>
                                                        <span style={{ fontWeight: '600', display: 'block', color: brandColor }}>{pedidoSeleccionado.dirRecogida}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {pedidoSeleccionado.dirEntrega && (
                                                <div style={{ display: 'flex', padding: '0.5rem 0', borderBottom: 'none', flexWrap: 'wrap' }}>
                                                    <MapPin size={14} color={brandColor} style={{ marginRight: '0.5rem', marginTop: '0.25rem' }} />
                                                    <div>
                                                        <span style={{ color: '#6c757d' }}>Entrega:</span>
                                                        <span style={{ fontWeight: '600', display: 'block', color: brandColor }}>{pedidoSeleccionado.dirEntrega}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {pedidoSeleccionado.detallePedido && (
                                                <div style={{ display: 'flex', padding: '0.5rem 0', borderBottom: 'none', flexWrap: 'wrap' }}>
                                                    <div>
                                                        <span style={{ color: '#6c757d' }}>Detalle:</span>
                                                        <span style={{ fontWeight: '600', display: 'block', color: brandColor }}>{pedidoSeleccionado.detallePedido}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {pedidoSeleccionado.ruta?.nombre && (
                                                <div style={{ display: 'flex', padding: '0.5rem 0', borderBottom: 'none', flexWrap: 'wrap' }}>
                                                    <Route size={14} color={accentColor} style={{ marginRight: '0.5rem', marginTop: '0.25rem' }} />
                                                    <div>
                                                        <span style={{ color: '#6c757d' }}>Ruta:</span>
                                                        <span style={{ fontWeight: '600', display: 'block', color: brandColor }}>{pedidoSeleccionado.ruta.nombre}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Seguimiento del domicilio */}
                            <div style={{ backgroundColor: '#F9FAFB', border: `1px solid ${accentColor}20`, borderRadius: '1rem', padding: '1rem', marginBottom: '1rem' }}>
                                <h6 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: brandColor }}>Seguimiento</h6>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
                                    {FLUJO_PEDIDO.map((paso, i) => {
                                        const idxActual = FLUJO_PEDIDO.indexOf(pedidoSeleccionado.estado);
                                        const alcanzado = idxActual >= 0 && i <= idxActual;
                                        return (
                                            <div key={paso} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <span style={{
                                                    backgroundColor: alcanzado ? accentColor : '#e9ecef',
                                                    color: alcanzado ? '#fff' : '#6c757d',
                                                    padding: '0.25rem 0.6rem', borderRadius: '2rem',
                                                    fontSize: '0.7rem', fontWeight: '600'
                                                }}>{paso.replace('_', ' ')}</span>
                                                {i < FLUJO_PEDIDO.length - 1 && <ArrowRight size={10} color="#ccc" />}
                                            </div>
                                        );
                                    })}
                                    {pedidoSeleccionado.estado === 'CANCELADO' && (
                                        <span style={{ backgroundColor: '#113d69', color: '#fff', padding: '0.25rem 0.6rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: '600' }}>CANCELADO</span>
                                    )}
                                </div>
                                {(paradasPedido?.length > 0) && (
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <small style={{ fontWeight: 'bold', color: brandColor }}>Paradas multi-entrega:</small>
                                        {paradasPedido.map((pp, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.25rem 0' }}>
                                                <span style={{ color: '#6c757d' }}>{pp.parada?.nombre || `Parada ${i + 1}`} ({pp.tipo || 'ENTREGA'})</span>
                                                <span style={{ fontWeight: '600', color: pp.completada ? accentColor : '#6c757d' }}>{pp.completada ? 'Completada' : 'Pendiente'}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                                    {pedidoSeleccionado.estado !== 'ENTREGADO' && pedidoSeleccionado.estado !== 'CANCELADO' && (
                                        <AccionButton variant="outline-secondary" onClick={() => cancelarPedido(pedidoSeleccionado.idPedido)} disabled={accionando}>
                                            Cancelar pedido
                                        </AccionButton>
                                    )}
                                    <AccionButton variant="outline-primary" onClick={() => pagarEfectivo(pedidoSeleccionado)} disabled={accionando}>
                                        <Banknote style={{ marginRight: '0.5rem' }} /> Pagar en efectivo
                                    </AccionButton>
                                    {pedidoSeleccionado.idRepartidor && (
                                        <AccionButton variant="outline-primary" onClick={() => iniciarChat(pedidoSeleccionado)}>
                                            Chatear con repartidor
                                        </AccionButton>
                                    )}
                                </div>
                            </div>
                            {pedidoSeleccionado.estado === 'ENTREGADO' && pedidoSeleccionado.idRepartidor && (
                                <div style={{ backgroundColor: '#F9FAFB', border: `1px solid ${brandColor}20`, borderRadius: '1rem', padding: '1rem', marginBottom: '1rem' }}>
                                    <h6 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: brandColor }}>
                                        <Star style={{ marginRight: '0.5rem', color: accentColor }} /> Calificar al repartidor
                                    </h6>
                                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <Star key={n} onClick={() => setPuntuacion(n)} style={{ cursor: 'pointer', color: n <= puntuacion ? accentColor : '#e9ecef', fontSize: '22px' }} />
                                        ))}
                                    </div>
                                    <textarea value={comentarioCalif} onChange={(e) => setComentarioCalif(e.target.value)} placeholder="Cuéntanos cómo fue tu domicilio (opcional)" rows={2} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #ced4da', marginBottom: '0.5rem' }} />
                                    <AccionButton variant="primary" onClick={calificarRepartidor} disabled={enviandoCalif}>
                                        {enviandoCalif ? 'Enviando...' : 'Enviar calificación'}
                                    </AccionButton>
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
        </div>
    );
};

export default UserHome;
