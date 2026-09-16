import React, { useState, useEffect } from "react";
import { CircleUserRound, CarFront, Repeat, Users, Circle, Banknote, Star, StarHalf, Truck, Medal } from "lucide-react";
import { useAuth } from "../pages/context/AuthContext";
import { API_URL } from "../config";
import { Container, Row, Col, Spinner } from "react-bootstrap";

import { useSocket } from "../pages/context/SocketContext";

import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import imagenDashboard from "../pages/Imagenes/HomeBaseImage.png";
import theme from "../styles/theme";

// Componentes personalizados
const CustomBadge = ({ color, bgColor, onClick, children, isActive, activeColor }) => {
    const estilo = {
        backgroundColor: isActive ? activeColor : bgColor,
        color: isActive ? '#000000' : color,
        padding: '0.5rem 1rem',
        borderRadius: '2rem',
        fontSize: '0.9rem',
        fontWeight: '500',
        display: 'inline-block',
        cursor: onClick ? 'pointer' : 'default',
        border: `1px solid ${theme.colors.border}`
    };

    return (
        <span style={estilo} onClick={onClick}>
            {children}
        </span>
    );
};

const StatsCard = ({ icon, title, value, iconBgColor, iconColor }) => {
    return (
        <div style={{
            backgroundColor: theme.colors.bgCard,
            borderRadius: '1rem',
            border: `1px solid ${theme.colors.border}`,
            boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.3)',
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
                    <h6 style={{ color: theme.colors.textSecondary, marginBottom: '0.25rem', fontSize: '0.875rem' }}>{title}</h6>
                    <h3 style={{ fontWeight: 'bold', margin: 0, color: theme.colors.textPrimary }}>{value}</h3>
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
            padding: '1rem 0',
            borderBottom: `1px solid ${theme.colors.border}`,
            ...style
        }}>
            {children}
        </div>
    );
};

const EstadoBadge = ({ estado }) => {
    const estilos = {
        activo: { backgroundColor: theme.colors.success, color: '#000000' },
        inactivo: { backgroundColor: theme.colors.bgCardHover, color: theme.colors.textSecondary },
        suspendido: { backgroundColor: theme.colors.warning, color: '#000000' }
    };

    const estilo = estilos[estado] || { backgroundColor: theme.colors.bgCardHover, color: theme.colors.textSecondary };

    return (
        <span style={{
            ...estilo,
            padding: '0.25rem 0.75rem',
            borderRadius: '2rem',
            fontSize: '0.8rem',
            fontWeight: '500',
            display: 'inline-block'
        }}>
            {estado?.charAt(0).toUpperCase() + estado?.slice(1).toLowerCase() || 'Desconocido'}
        </span>
    );
};

const OnlineIndicator = () => {
    return (
        <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: theme.colors.accent,
            display: 'inline-block'
        }} />
    );
};

function Home() {
    const { token, usuario } = useAuth();
    const { onlineUsers } = useSocket();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [errorDetails, setErrorDetails] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [stats, setStats] = useState({
        totalUsuarios: 0,
        totalRepartidores: 0,
        totalClientes: 0,
        totalVehiculos: 0
    });

    const [statsFinancieras, setStatsFinancieras] = useState({
        ingresosPlataforma: { total: 0, historial: [] }
    });
    const [periodoAdmin, setPeriodoAdmin] = useState('mensual');

    const [chartData, setChartData] = useState([]);
    const [donutData, setDonutData] = useState([
        { name: 'Activos', value: 0, color: theme.colors.accent },
        { name: 'Inactivos', value: 0, color: theme.colors.borderLight },
        { name: 'Suspendidos', value: 0, color: theme.colors.warning }
    ]);
    const [topRepartidores, setTopRepartidores] = useState([]);
    const [topClientes, setTopClientes] = useState([]);
    const [cargandoTop, setCargandoTop] = useState(false);
    const [erroresPorSeccion, setErroresPorSeccion] = useState({
        usuarios: false,
        vehiculos: false,
        graficos: false,
        rankings: false,
        finanzas: false
    });

    const colores = {
        estrella: theme.colors.warning,
        badgeFondo: theme.colors.bgCardHover,
        badgeTexto: theme.colors.textPrimary,
        verdeMenta: theme.colors.accent,
        azulFuerte: theme.colors.textPrimary
    };

    useEffect(() => {
        cargarTodosLosDatos();
    }, [retryCount, periodoAdmin]);

    const cargarTodosLosDatos = async () => {
        setLoading(true);
        setError("");
        setErrorDetails(null);

        try {
            await Promise.allSettled([
                traerUsuarios(),
                traerVehiculos(),
                traerDatosGraficos(),
                traerTopRankings(),
                traerEstadisticasFinancieras()
            ]);
        } catch (error) {
            console.error("Error general en carga de datos:", error);
            setError("Error al cargar algunos datos. Algunas secciones pueden estar incompletas.");
        } finally {
            setLoading(false);
        }
    };

    const traerEstadisticasFinancieras = async () => {
        if (!token) return;
        try {
            setErroresPorSeccion(prev => ({ ...prev, finanzas: false }));
            const headers = { "Authorization": "Bearer " + token };

            const resIngresos = await fetch(`${API_URL}/estadisticas/ingresos?periodo=${periodoAdmin}`, { headers });

            const dataFin = {
                ingresosPlataforma: { total: 0, historial: [] }
            };

            if (resIngresos.ok) {
                dataFin.ingresosPlataforma = await resIngresos.json();
            }

            setStatsFinancieras(dataFin);
        } catch (error) {
            console.error("Error trayendo stats financieras:", error);
            setErroresPorSeccion(prev => ({ ...prev, finanzas: true }));
        }
    };

    const manejarError = (seccion, error, mensajePersonalizado = null) => {
        console.error(`Error en ${seccion}:`, error);
        setErroresPorSeccion(prev => ({ ...prev, [seccion]: true }));

        if (seccion === 'usuarios' || seccion === 'graficos') {
            setError(mensajePersonalizado || `Error al cargar ${seccion}`);
        }
    };

    const calcularEstadoUsuarios = (usuarios) => {
        if (!Array.isArray(usuarios)) return { activos: 0, inactivos: 0, suspendidos: 0, total: 0 };
        const activos = usuarios.filter(u => u.estado === 'ACTIVO').length;
        const inactivos = usuarios.filter(u => u.estado === 'INACTIVO').length;
        const suspendidos = usuarios.filter(u => u.estado === 'SUSPENDIDO').length;
        return { activos, inactivos, suspendidos, total: usuarios.length };
    };

    async function traerUsuarios() {
        try {
            setErroresPorSeccion(prev => ({ ...prev, usuarios: false }));
            if (!token) throw new Error("No hay token de autenticación");

            const response = await fetch(`${API_URL}/auth/`, {
                headers: { "Authorization": "Bearer " + token }
            });

            if (!response.ok) throw new Error(`Error ${response.status}`);
            const usuarios = await response.json();

            if (Array.isArray(usuarios)) {
                const repartidores = usuarios.filter(u => u.idRol === 2 || u.rol?.nombre?.toUpperCase() === 'REPARTIDOR').length;
                const clientes = usuarios.filter(u => u.idRol === 3 || u.rol?.nombre?.toUpperCase() === 'CLIENTE' || u.rol?.nombre?.toUpperCase() === 'COMERCIO').length;
                const { activos, inactivos, suspendidos } = calcularEstadoUsuarios(usuarios);

                setStats(prev => ({ ...prev, totalUsuarios: usuarios.length, totalRepartidores: repartidores, totalClientes: clientes }));
                setDonutData([
                    { name: 'Activos', value: activos, color: theme.colors.accent },
                    { name: 'Inactivos', value: inactivos, color: theme.colors.bgCardHover },
                    { name: 'Suspendidos', value: suspendidos, color: theme.colors.textPrimary }
                ]);
            }
        } catch (error) {
            manejarError('usuarios', error, "Error al cargar estadísticas de usuarios");
        }
    }

    async function traerVehiculos() {
        try {
            setErroresPorSeccion(prev => ({ ...prev, vehiculos: false }));
            if (!token) return;
            const response = await fetch(`${API_URL}/vehiculos/`, {
                headers: { "Authorization": "Bearer " + token }
            });
            if (!response.ok) throw new Error(`Error ${response.status}`);
            const vehiculos = await response.json();
            if (Array.isArray(vehiculos)) {
                setStats(prev => ({ ...prev, totalVehiculos: vehiculos.length }));
            }
        } catch (error) {
            manejarError('vehiculos', error);
        }
    }

    async function traerPedidosPorDia() {
        try {
            const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            const promesasPedidos = diasSemana.map(async (nombre, dia) => {
                try {
                    const response = await fetch(`${API_URL}/pedidos/dia/${dia}`, {
                        headers: { "Authorization": "Bearer " + token }
                    });
                    if (!response.ok) return { nombre, cantidad: 0 };
                    const PedidosDelDia = await response.json();
                    return { nombre, cantidad: Array.isArray(PedidosDelDia) ? PedidosDelDia.length : 0 };
                } catch (error) {
                    return { nombre, cantidad: 0 };
                }
            });
            return await Promise.all(promesasPedidos);
        } catch (error) {
            return [];
        }
    }

    async function traerDatosGraficos() {
        try {
            setErroresPorSeccion(prev => ({ ...prev, graficos: false }));
            if (!token) return;

            const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            const promesasUsuarios = diasSemana.map(async (nombre, dia) => {
                try {
                    const response = await fetch(`${API_URL}/auth/usuarios/dia/${dia}`, {
                        headers: { "Authorization": "Bearer " + token }
                    });
                    if (!response.ok) return { name: nombre, usuarios: 0 };
                    const usuariosDelDia = await response.json();
                    return { name: nombre, usuarios: Array.isArray(usuariosDelDia) ? usuariosDelDia.length : 0 };
                } catch (error) {
                    return { name: nombre, usuarios: 0 };
                }
            });

            const [UsuariosPorDia, PedidosPorDia] = await Promise.all([
                Promise.all(promesasUsuarios),
                traerPedidosPorDia()
            ]);

            setChartData(UsuariosPorDia.map(item => ({
                name: item.name,
                usuarios: item.usuarios,
                pedidos: PedidosPorDia.find(v => v.nombre === item.name)?.cantidad || 0
            })));
        } catch (error) {
            manejarError('graficos', error);
        }
    }

    async function traerTopRankings() {
        try {
            setCargandoTop(true);
            setErroresPorSeccion(prev => ({ ...prev, rankings: false }));
            if (!token) return;

            const headers = { "Authorization": "Bearer " + token };
            const [resRepartidores, resClientes] = await Promise.allSettled([
                fetch(`${API_URL}/calificaciones/top-repartidores`, { headers }),
                fetch(`${API_URL}/calificaciones/top-clientes`, { headers })
            ]);

            if (resRepartidores.status === 'fulfilled' && resRepartidores.value.ok) {
                const data = await resRepartidores.value.json();
                setTopRepartidores(Array.isArray(data) ? data : []);
            }
            if (resClientes.status === 'fulfilled' && resClientes.value.ok) {
                const data = await resClientes.value.json();
                setTopClientes(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            manejarError('rankings', error);
        } finally {
            setCargandoTop(false);
        }
    }

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        setError("");
        setErrorDetails(null);
    };

    const formatearMoneda = (valor) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor || 0);
    };

    const renderStars = (promedio) => {
        const stars = [];
        const fullStars = Math.floor(promedio);
        const hasHalfStar = promedio % 1 >= 0.5;
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) stars.push(<Star key={i} style={{ marginRight: '0.25rem', color: colores.estrella, fontSize: '12px' }} />);
            else if (i === fullStars + 1 && hasHalfStar) stars.push(<StarHalf key={i} style={{ marginRight: '0.25rem', color: colores.estrella, fontSize: '12px' }} />);
            else stars.push(<Star key={i} style={{ marginRight: '0.25rem', color: colores.estrella, fontSize: '12px' }} />);
        }
        return <div style={{ display: 'flex' }}>{stars}</div>;
    };

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative', zIndex: 1, padding: '1.5rem' }}>
                {/* Encabezado */}
                <div style={{
                    backgroundColor: theme.colors.bgCard,
                    borderRadius: '1rem',
                    border: 'none',
                    boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.075)',
                    marginBottom: '1.5rem',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                        alignItems: 'center'
                    }}>
                        <div style={{ marginRight: window.innerWidth < 768 ? 0 : '1rem', marginBottom: window.innerWidth < 768 ? '1rem' : 0 }}>
                            <img src={imagenDashboard} alt="Dashboard" style={{ width: '120px', borderRadius: '0.75rem' }} />
                        </div>
                        <div style={{ flex: 1, textAlign: window.innerWidth < 768 ? 'center' : 'left' }}>
                            <h2 style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: colores.azulFuerte }}>¡Bienvenido de nuevo, {usuario?.nombre || 'Administrador'}!</h2>
                            <p style={{ color: theme.colors.textSecondary, margin: 0 }}>Gestión global de la plataforma DomiFlex</p>
                        </div>
                        <div style={{ marginTop: window.innerWidth < 768 ? '1rem' : 0, display: 'flex', gap: '0.5rem' }}>
                            <CustomBadge
                                color={theme.colors.textSecondary}
                                bgColor="transparent"
                                activeColor={colores.verdeMenta}
                                isActive={periodoAdmin === 'diario'}
                                onClick={() => setPeriodoAdmin('diario')}
                            >
                                Día
                            </CustomBadge>
                            <CustomBadge
                                color={theme.colors.textSecondary}
                                bgColor="transparent"
                                activeColor={colores.verdeMenta}
                                isActive={periodoAdmin === 'mensual'}
                                onClick={() => setPeriodoAdmin('mensual')}
                            >
                                Mes
                            </CustomBadge>
                            <CustomBadge
                                color={theme.colors.textSecondary}
                                bgColor="transparent"
                                activeColor={colores.verdeMenta}
                                isActive={periodoAdmin === 'anual'}
                                onClick={() => setPeriodoAdmin('anual')}
                            >
                                Año
                            </CustomBadge>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <Spinner animation="border" style={{ color: colores.verdeMenta }} />
                    </div>
                ) : (
                    <>
                        {/* Tarjetas Principales */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <StatsCard
                                icon={<Users size={20} />}
                                title="Total Usuarios"
                                value={stats.totalUsuarios}
                                iconBgColor={`${theme.colors.accent}15`}
                                iconColor={colores.verdeMenta}
                            />
                            <StatsCard
                                icon={<Truck size={20} />}
                                title="Repartidores"
                                value={stats.totalRepartidores}
                                iconBgColor={theme.colors.bgCardHover}
                                iconColor={theme.colors.textSecondary}
                            />
                            <StatsCard
                                icon={<Banknote size={20} />}
                                title="Ingresos Totales"
                                value={formatearMoneda(statsFinancieras.ingresosPlataforma.total)}
                                iconBgColor={theme.colors.bgCardHover}
                                iconColor={theme.colors.accent}
                            />
                        </div>

                        {/* Gráficos de Finanzas */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                backgroundColor: theme.colors.bgCard,
                                borderRadius: '1rem',
                                border: 'none',
                                boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.075)',
                                height: '100%',
                                padding: '1.5rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                    <Banknote size={20} style={{ marginRight: '0.5rem', color: theme.colors.accent }} />
                                    <h5 style={{ fontWeight: 'bold', margin: 0, color: colores.azulFuerte }}>Flujo de Ingresos de Plataforma</h5>
                                </div>
                                <div style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={statsFinancieras.ingresosPlataforma.historial}>
                                            <defs>
                                                <linearGradient id="colorAdminIngresos" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={colores.verdeMenta} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={colores.verdeMenta} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.colors.border} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9AA4B2', fontSize: 11 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9AA4B2', fontSize: 11 }} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                                            <Area type="monotone" dataKey="value" stroke={colores.verdeMenta} strokeWidth={3} fillOpacity={1} fill="url(#colorAdminIngresos)" name="Ingresos ($)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Actividad y Estados */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                backgroundColor: theme.colors.bgCard,
                                borderRadius: '1rem',
                                border: 'none',
                                boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.075)',
                                padding: '1.5rem'
                            }}>
                                <h5 style={{ fontWeight: 'bold', marginBottom: '1rem', color: colores.azulFuerte }}>Actividad de Registro y Pedidos</h5>
                                <div style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.colors.border} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9AA4B2', fontSize: 11 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9AA4B2', fontSize: 11 }} />
                                            <Tooltip cursor={{ fill: theme.colors.bgCardHover }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                            <Bar dataKey="usuarios" fill={theme.colors.accent} name="Reg. Usuarios" radius={[4, 4, 0, 0]} barSize={25} />
                                            <Bar dataKey="pedidos" fill={theme.colors.accentDark} name="Pedidos Realizados" radius={[4, 4, 0, 0]} barSize={25} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div style={{
                                backgroundColor: theme.colors.bgCard,
                                borderRadius: '1rem',
                                border: 'none',
                                boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.075)',
                                height: '100%',
                                padding: '1.5rem'
                            }}>
                                <h5 style={{ fontWeight: 'bold', marginBottom: '1rem', color: colores.azulFuerte }}>Estados de Usuario</h5>
                                <div style={{ height: '220px', position: 'relative' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                {donutData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                        <h3 style={{ fontWeight: 'bold', margin: 0, color: theme.colors.textPrimary }}>{stats.totalUsuarios}</h3>
                                        <small style={{ color: theme.colors.textSecondary }}>Total</small>
                                    </div>
                                </div>
                                <div style={{ marginTop: '1rem' }}>
                                    {donutData.map((item, id) => (
                                        <div key={id} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '0.5rem',
                                            padding: '0.5rem 1rem',
                                            backgroundColor: theme.colors.bgCardHover,
                                            borderRadius: '0.5rem'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color, marginRight: '10px' }} />
                                                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: theme.colors.textPrimary }}>{item.name}</span>
                                            </div>
                                            <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: theme.colors.textPrimary }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Rankings a tres columnas */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                            <div style={{
                                backgroundColor: theme.colors.bgCard,
                                borderRadius: '1rem',
                                border: 'none',
                                boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.075)',
                                height: '100%',
                                padding: '1.5rem'
                            }}>
                                <h6 style={{ fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', color: theme.colors.textPrimary }}>
                                    <Medal style={{ marginRight: '0.5rem', color: theme.colors.accent }} /> Top Repartidores
                                </h6>
                                <CustomListGroup>
                                    {cargandoTop ? (
                                        <div style={{ textAlign: 'center', padding: '2rem' }}><Spinner size="sm" style={{ color: colores.verdeMenta }} /></div>
                                    ) : topRepartidores.length === 0 ? (
                                        <p style={{ color: theme.colors.textSecondary, textAlign: 'center', padding: '2rem' }}>Sin datos</p>
                                    ) : (
                                        topRepartidores.slice(0, 5).map((c, i) => (
                                            <CustomListItem key={i} style={{ padding: '0.75rem 0' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <div style={{ marginRight: '0.75rem', fontWeight: 'bold', color: theme.colors.textSecondary, width: '20px' }}>{i + 1}</div>
                                                        <div>
                                                            <div style={{ fontWeight: 'bold', fontSize: '0.875rem', color: theme.colors.textPrimary }}>{c.nombre}</div>
                                                            <div style={{ marginTop: '0.25rem' }}>{renderStars(c.promedioEstrellas || 0)}</div>
                                                        </div>
                                                    </div>
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem',
                                                        backgroundColor: theme.colors.bgCardHover,
                                                        borderRadius: '2rem',
                                                        fontSize: '0.8rem',
                                                        border: `1px solid ${theme.colors.border}`,
                                                        color: theme.colors.textPrimary
                                                    }}>
                                                        {c.promedioEstrellas?.toFixed(1) || '0.0'}
                                                    </span>
                                                </div>
                                            </CustomListItem>
                                        ))
                                    )}
                                </CustomListGroup>
                            </div>
                            <div style={{
                                backgroundColor: theme.colors.bgCard,
                                borderRadius: '1rem',
                                border: 'none',
                                boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.075)',
                                height: '100%',
                                padding: '1.5rem'
                            }}>
                                <h6 style={{ fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', color: theme.colors.textPrimary }}>
                                    <Medal style={{ marginRight: '0.5rem', color: theme.colors.accent }} /> Top Clientes
                                </h6>
                                <CustomListGroup>
                                    {cargandoTop ? (
                                        <div style={{ textAlign: 'center', padding: '2rem' }}><Spinner size="sm" style={{ color: colores.verdeMenta }} /></div>
                                    ) : topClientes.length === 0 ? (
                                        <p style={{ color: theme.colors.textSecondary, textAlign: 'center', padding: '2rem' }}>Sin datos</p>
                                    ) : (
                                        topClientes.slice(0, 5).map((v, i) => (
                                            <CustomListItem key={i} style={{ padding: '0.75rem 0' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <div style={{ marginRight: '0.75rem', fontWeight: 'bold', color: theme.colors.textSecondary, width: '20px' }}>{i + 1}</div>
                                                        <div>
                                                            <div style={{ fontWeight: 'bold', fontSize: '0.875rem', color: theme.colors.textPrimary }}>{v.nombre}</div>
                                                            <div style={{ marginTop: '0.25rem' }}>{renderStars(v.promedioEstrellas || 0)}</div>
                                                        </div>
                                                    </div>
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem',
                                                        backgroundColor: theme.colors.bgCardHover,
                                                        borderRadius: '2rem',
                                                        fontSize: '0.8rem',
                                                        border: `1px solid ${theme.colors.border}`,
                                                        color: theme.colors.textPrimary
                                                    }}>
                                                        {v.promedioEstrellas?.toFixed(1) || '0.0'}
                                                    </span>
                                                </div>
                                            </CustomListItem>
                                        ))
                                    )}
                                </CustomListGroup>
                            </div>
                            <div style={{
                                backgroundColor: theme.colors.bgCard,
                                borderRadius: '1rem',
                                border: 'none',
                                boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.075)',
                                height: '100%',
                                padding: '1.5rem'
                            }}>
                                <h6 style={{ fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', color: theme.colors.textPrimary }}>
                                    <Circle size={10} style={{ marginRight: '0.5rem', color: theme.colors.accent }} /> En Línea Ahora
                                </h6>
                                <CustomListGroup>
                                    {onlineUsers?.length === 0 ? (
                                        <p style={{ color: theme.colors.textSecondary, textAlign: 'center', padding: '2rem' }}>Sin usuarios en línea</p>
                                    ) : (
                                        onlineUsers?.slice(0, 5).map((u, i) => (
                                            <CustomListItem key={i} style={{ padding: '0.5rem 0' }}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <div style={{
                                                        padding: '0.5rem',
                                                        backgroundColor: theme.colors.bgCardHover,
                                                        borderRadius: '50%',
                                                        marginRight: '0.5rem'
                                                    }}>
                                                        <CircleUserRound style={{ color: theme.colors.textSecondary }} />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 'bold', fontSize: '0.875rem', color: theme.colors.textPrimary }}>{u.nombre}</div>
                                                        <small style={{ color: theme.colors.textSecondary, fontSize: '10px', textTransform: 'uppercase' }}>{u.role}</small>
                                                    </div>
                                                    <OnlineIndicator />
                                                </div>
                                            </CustomListItem>
                                        ))
                                    )}
                                </CustomListGroup>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Home;