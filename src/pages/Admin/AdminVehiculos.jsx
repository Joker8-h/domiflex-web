import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronDown, CircleCheck, CircleX, Search, Check, X, Eye, Car } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../../config";
import theme from "../../styles/theme";
import { Container, Row, Col, Card, Table, Button, Alert, Spinner, Modal, Image, Form, InputGroup } from "react-bootstrap";



function AdminVehiculos() {
    const { token } = useAuth();
    const [vehiculos, setVehiculos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState("");
    const [validatingPlate, setValidatingPlate] = useState(false);
    const [busqueda, setBusqueda] = useState("");

    const [paginaActual, setPaginaActual] = useState(1);
    const elementosPorPagina = 10;

    const traerUsuarios = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/auth/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status} al obtener usuarios`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("La respuesta del servidor no es válida");
            }

            setUsuarios(data);
        } catch (error) {
            console.error("Error al traer usuarios:", error);
            setError("Error al cargar la información de propietarios");
        }
    }, [token]);

    const traerVehiculos = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/vehiculos/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error("Acceso denegado. No tienes permisos de administrador.");
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("La respuesta del servidor no es válida");
            }

            setVehiculos(data);
            setPaginaActual(1);

        } catch (error) {
            console.error("Error al traer vehículos:", error);
            setError(error.message);
            setVehiculos([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    async function handleSearch(e) {
        if (e) e.preventDefault();
        if (!busqueda.trim()) {
            traerVehiculos();
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/auth/search?q=${busqueda}`, {
                headers: { "Authorization": "Bearer " + token }
            });
            if (!response.ok) throw new Error("Error en la búsqueda");
            const data = await response.json();

            const vehiculosEncontrados = [];
            data.forEach(usuario => {
                if (usuario.vehiculos && usuario.vehiculos.length > 0) {
                    usuario.vehiculos.forEach(v => {
                        vehiculosEncontrados.push({
                            ...v,
                            idUsuario: usuario.idUsuarios,
                            idVehiculos: v.idVehiculos || v.id
                        });
                    });
                }
            });

            setVehiculos(vehiculosEncontrados);
            setPaginaActual(1);
        } catch (error) {
            setError("Error al buscar vehículos");
        } finally {
            setLoading(false);
        }
    }

    function limpiarBusqueda() {
        setBusqueda("");
        traerVehiculos();
    }

    useEffect(() => {
        traerUsuarios();
        traerVehiculos();
    }, [traerUsuarios, traerVehiculos]);

    const vehiculosFiltrados = vehiculos.filter(vehiculo => {
        const terminoBusqueda = busqueda.toLowerCase();
        const nombrePropietario = obtenerNombreUsuario(vehiculo.idUsuario).toLowerCase();

        return (
            vehiculo.placa?.toLowerCase().includes(terminoBusqueda) ||
            nombrePropietario.includes(terminoBusqueda) ||
            vehiculo.marca?.toLowerCase().includes(terminoBusqueda) ||
            vehiculo.modelo?.toLowerCase().includes(terminoBusqueda) ||
            vehiculo.idVehiculos?.toString().includes(terminoBusqueda)
        );
    });

    const indiceUltimoElemento = paginaActual * elementosPorPagina;
    const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
    const vehiculosPaginados = vehiculosFiltrados.slice(indicePrimerElemento, indiceUltimoElemento);
    const totalPaginas = Math.ceil(vehiculosFiltrados.length / elementosPorPagina);

    const cambiarPagina = (numeroPagina) => {
        setPaginaActual(numeroPagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    async function cambiarEstadoVehiculo(id, estadoActual) {
        try {
            let nuevoEstado;

            switch (estadoActual) {
                case 'ACTIVO':
                    nuevoEstado = 'INACTIVO';
                    break;
                case 'INACTIVO':
                    nuevoEstado = 'ACTIVO';
                    break;
                default:
                    nuevoEstado = 'ACTIVO';
            }

            const response = await fetch(`${API_URL}/vehiculos/${id}/estado`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    estado: nuevoEstado
                })
            });

            if (!response.ok) {
                throw new Error(`Error al cambiar estado: ${response.status}`);
            }

            await traerVehiculos();

        } catch (error) {
            console.error("Error al cambiar estado:", error);
            setError("Error al cambiar estado del vehículo");
        }
    }

    async function validarPlaca(id, actual) {
        try {
            setValidatingPlate(true);
            const response = await fetch(`${API_URL}/vehiculos/${id}/validar-placa`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    validada: !actual
                })
            });

            if (!response.ok) throw new Error("Error al validar placa");

            await traerVehiculos();
        } catch (error) {
            console.error("Error al validar placa:", error);
            setError("Error al actualizar validación de placa");
        } finally {
            setValidatingPlate(false);
        }
    }

    const handleClosePhotoModal = () => {
        setShowPhotoModal(false);
    };

    const handlePhotoModalExited = () => {
        setSelectedPhoto("");
    };

    function obtenerNombreUsuario(idUsuario) {
        if (!idUsuario) return "Sin propietario";

        const usuario = usuarios.find(u => u.idUsuarios === idUsuario);

        if (usuario) {
            return usuario.nombre;
        } else if (usuarios.length > 0) {
            return `Usuario #${idUsuario} (No encontrado)`;
        } else {
            return `Usuario #${idUsuario}`;
        }
    }

    // COMPONENTES ESTILIZADOS
    const EstadoBadge = ({ estado }) => {
        const estilos = {
            ACTIVO: { backgroundColor: theme.colors.accent, color: '#000000' },
            INACTIVO: { backgroundColor: theme.colors.border, color: theme.colors.textSecondary }
        };

        const estilo = estilos[estado] || { backgroundColor: theme.colors.border, color: theme.colors.textSecondary };

        return (
            <span style={{
                ...estilo,
                padding: '0.25rem 0.75rem',
                borderRadius: '1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'inline-block'
            }}>
                {estado === 'ACTIVO' && 'Activo'}
                {estado === 'INACTIVO' && 'Inactivo'}
                {!estado && 'Sin estado'}
            </span>
        );
    };

    const PlacaValidadaIcon = ({ validada }) => {
        if (validada) {
            return <CircleCheck style={{ color: theme.colors.accent }} title="Placa Validada" size={18} />;
        } else {
            return <CircleX style={{ color: theme.colors.textMuted }} title="Placa No Validada" size={18} />;
        }
    };

    const StatsBadge = ({ children, color, bgColor, isWhite = false }) => {
        if (isWhite) {
            return (
                <span style={{
                    backgroundColor: theme.colors.bgCard,
                    color: theme.colors.accent,
                    border: `1px solid ${theme.colors.accent}`,
                    padding: '0.5rem 1rem',
                    borderRadius: '1rem',
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
                borderRadius: '1rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                display: 'inline-block'
            }}>
                {children}
            </span>
        );
    };

    const TipoVehiculoBadge = ({ tipo }) => {
        if (!tipo) return null;

        let estilo = { backgroundColor: theme.colors.border, color: theme.colors.textSecondary };

        switch (tipo.toUpperCase()) {
            case 'AUTOMOVIL':
            case 'AUTO':
            case 'CARRO':
                estilo = { backgroundColor: theme.colors.accent, color: '#000000' };
                break;
            case 'MOTOCICLETA':
            case 'MOTO':
            case 'BICICLETA':
                estilo = { backgroundColor: '#30363D', color: theme.colors.textPrimary };
                break;
            case 'CAMIONETA':
            case 'SUV':
                estilo = { backgroundColor: theme.colors.bgCardHover, color: theme.colors.textPrimary };
                break;
            case 'VAN':
            case 'FURGON':
                estilo = { backgroundColor: '#21262D', color: theme.colors.textPrimary };
                break;
        }

        return (
            <span style={{
                ...estilo,
                padding: '0.2rem 0.5rem',
                borderRadius: '0.5rem',
                fontSize: '0.7rem',
                fontWeight: '500',
                display: 'inline-block'
            }}>
                {tipo}
            </span>
        );
    };

    const AccionButton = ({ estado, onClick, children, disabled = false }) => {
        if (children === "Validar Placa" || children === "Invalidar Placa") {
            return (
                <Button
                    size="sm"
                    onClick={onClick}
                    disabled={disabled}
                    className="w-100"
                    style={{
                        transition: 'all 0.2s',
                        fontWeight: '500',
                        borderRadius: '50px',
                        padding: '0.4rem 0.8rem',
                        border: `2px solid ${children === "Validar Placa" ? theme.colors.accent : theme.colors.textMuted}`,
                        backgroundColor: disabled ? theme.colors.border : 'transparent',
                        color: children === "Validar Placa" ? theme.colors.accent : theme.colors.textSecondary,
                        borderColor: children === "Validar Placa" ? theme.colors.accent : theme.colors.textMuted,
                        opacity: disabled ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                        if (!disabled) {
                            e.target.style.backgroundColor = children === "Validar Placa" ? theme.colors.accent : theme.colors.textMuted;
                            e.target.style.color = '#000000';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!disabled) {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = children === "Validar Placa" ? theme.colors.accent : theme.colors.textSecondary;
                        }
                    }}
                >
                    {children}
                </Button>
            );
        }

        return (
            <Button
                size="sm"
                onClick={onClick}
                className="w-100"
                style={{
                    transition: 'all 0.2s',
                    fontWeight: '500',
                    borderRadius: '50px',
                    padding: '0.4rem 0.8rem',
                    border: `2px solid ${theme.colors.accent}`,
                    backgroundColor: estado === 'ACTIVO' ? 'transparent' : theme.colors.accent,
                    color: estado === 'ACTIVO' ? theme.colors.accent : '#000000',
                }}
                onMouseEnter={(e) => {
                    if (estado === 'ACTIVO') {
                        e.target.style.backgroundColor = theme.colors.accent;
                        e.target.style.color = '#000000';
                    }
                }}
                onMouseLeave={(e) => {
                    if (estado === 'ACTIVO') {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = theme.colors.accent;
                    }
                }}
            >
                {children}
            </Button>
        );
    };

    const VerFotoButton = ({ onClick }) => {
        return (
            <Button
                variant="link"
                size="sm"
                onClick={onClick}
                className="p-0 text-decoration-none mt-1"
                style={{
                    color: theme.colors.accent,
                    transition: 'all 0.2s',
                    fontWeight: '500',
                    fontSize: '0.8rem'
                }}
                onMouseEnter={(e) => {
                    e.target.style.color = theme.colors.accentLight;
                }}
                onMouseLeave={(e) => {
                    e.target.style.color = theme.colors.accent;
                }}
            >
                <Eye className="me-1" /> Ver Foto
            </Button>
        );
    };

    function getBotonTexto(estado) {
        switch (estado) {
            case 'ACTIVO':
                return "Desactivar";
            case 'INACTIVO':
                return "Activar";
            default:
                return "Cambiar Estado";
        }
    }

    function formatearCapacidad(capacidad) {
        if (!capacidad) return <span className="fst-italic" style={{ color: theme.colors.textMuted }}>No especificado</span>;
        if (typeof capacidad === 'number' || !isNaN(parseInt(capacidad))) {
            const numCapacidad = parseInt(capacidad);
            return `${numCapacidad} kg`;
        }
        return capacidad;
    }

    const Paginacion = () => {
        if (totalPaginas <= 1) return null;

        const generarBotones = () => {
            const botones = [];
            const maxBotones = window.innerWidth < 768 ? 3 : 5;
            let inicio = Math.max(1, paginaActual - Math.floor(maxBotones / 2));
            let fin = Math.min(totalPaginas, inicio + maxBotones - 1);

            if (fin - inicio + 1 < maxBotones) {
                inicio = Math.max(1, fin - maxBotones + 1);
            }

            const buttonStyle = {
                padding: window.innerWidth < 768 ? '0.4rem 0.6rem' : '0.5rem 0.75rem',
                fontSize: window.innerWidth < 768 ? '0.8rem' : '0.9rem',
            };

            botones.push(
                <button
                    key="prev"
                    onClick={() => paginaActual > 1 && cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    style={{
                        ...buttonStyle,
                        backgroundColor: paginaActual === 1 ? theme.colors.border : theme.colors.bgCard,
                        color: paginaActual === 1 ? theme.colors.textMuted : theme.colors.accent,
                        border: `1px solid ${paginaActual === 1 ? theme.colors.borderLight : theme.colors.accent}`,
                        margin: '0 2px',
                        borderRadius: '50px 0 0 50px',
                        cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        opacity: paginaActual === 1 ? 0.6 : 1
                    }}
                >
                    {window.innerWidth < 768 ? '‹' : 'Anterior'}
                </button>
            );

            if (inicio > 1) {
                botones.push(
                    <button
                        key={1}
                        onClick={() => cambiarPagina(1)}
                        style={{
                            ...buttonStyle,
                            backgroundColor: theme.colors.bgCard,
                            color: theme.colors.accent,
                            border: `1px solid ${theme.colors.accent}`,
                            margin: '0 2px',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        1
                    </button>
                );
                if (inicio > 2) {
                    botones.push(
                        <span
                            key="ellipsis1"
                            style={{
                                ...buttonStyle,
                                backgroundColor: 'transparent',
                                color: theme.colors.textSecondary,
                                border: 'none',
                                margin: '0 2px',
                                fontWeight: '500'
                            }}
                        >
                            ...
                        </span>
                    );
                }
            }

            for (let numero = inicio; numero <= fin; numero++) {
                const esActivo = numero === paginaActual;
                botones.push(
                    <button
                        key={numero}
                        onClick={() => !esActivo && cambiarPagina(numero)}
                        style={{
                            ...buttonStyle,
                            backgroundColor: esActivo ? theme.colors.accent : theme.colors.bgCard,
                            color: esActivo ? '#000000' : theme.colors.accent,
                            border: `1px solid ${theme.colors.accent}`,
                            margin: '0 2px',
                            borderRadius: '50px',
                            cursor: esActivo ? 'default' : 'pointer',
                            fontWeight: esActivo ? '600' : '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        {numero}
                    </button>
                );
            }

            if (fin < totalPaginas) {
                if (fin < totalPaginas - 1) {
                    botones.push(
                        <span
                            key="ellipsis2"
                            style={{
                                ...buttonStyle,
                                backgroundColor: 'transparent',
                                color: theme.colors.textSecondary,
                                border: 'none',
                                margin: '0 2px',
                                fontWeight: '500'
                            }}
                        >
                            ...
                        </span>
                    );
                }
                botones.push(
                    <button
                        key={totalPaginas}
                        onClick={() => cambiarPagina(totalPaginas)}
                        style={{
                            ...buttonStyle,
                            backgroundColor: theme.colors.bgCard,
                            color: theme.colors.accent,
                            border: `1px solid ${theme.colors.accent}`,
                            margin: '0 2px',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        {totalPaginas}
                    </button>
                );
            }

            botones.push(
                <button
                    key="next"
                    onClick={() => paginaActual < totalPaginas && cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    style={{
                        ...buttonStyle,
                        backgroundColor: paginaActual === totalPaginas ? theme.colors.border : theme.colors.bgCard,
                        color: paginaActual === totalPaginas ? theme.colors.textMuted : theme.colors.accent,
                        border: `1px solid ${paginaActual === totalPaginas ? theme.colors.borderLight : theme.colors.accent}`,
                        margin: '0 2px',
                        borderRadius: '0 50px 50px 0',
                        cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        opacity: paginaActual === totalPaginas ? 0.6 : 1
                    }}
                >
                    {window.innerWidth < 768 ? '›' : 'Siguiente'}
                </button>
            );

            return botones;
        };

        return (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 px-4 pb-4" style={{ gap: '1rem' }}>
                <div className="text-center text-md-start" style={{ color: theme.colors.textSecondary, fontSize: window.innerWidth < 768 ? '0.8rem' : '0.9rem' }}>
                    Mostrando {indicePrimerElemento + 1} - {Math.min(indiceUltimoElemento, vehiculosFiltrados.length)} de {vehiculosFiltrados.length} vehículos
                    {busqueda && ` (filtrados de ${vehiculos.length} totales)`}
                </div>
                <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {generarBotones()}
                </div>
            </div>
        );
    };

    return (
        <div style={{ position: 'relative' }}>
            <Container fluid className="py-4" style={{ position: 'relative', zIndex: 1 }}>
                <Row className="mb-4">
                    <Col>
                        <Card className="border-0 shadow" style={{
                            borderRadius: '16px',
                            borderLeft: `6px solid ${theme.colors.accent}`,
                            overflow: 'hidden',
                            backgroundColor: theme.colors.bgCard
                        }}>
                            <Card.Body className="p-4">
                                <h1 className="display-5 fw-bold mb-0" style={{
                                    color: theme.colors.textPrimary,
                                    letterSpacing: '-0.02em'
                                }}>
                                    Lista de Vehículos
                                </h1>
                                <p className="mb-0 small" style={{ color: theme.colors.textSecondary }}>
                                    <span style={{ color: theme.colors.accent }}>●</span> Administra los vehículos registrados en la plataforma
                                </p>
                            </Card.Body>
                        </Card>

                        <Card className="border-0 shadow-sm mt-3" style={{ borderRadius: '12px', backgroundColor: theme.colors.bgCard }}>
                            <Card.Body className="p-3">
                                <Form onSubmit={handleSearch}>
                                    <InputGroup>
                                        <InputGroup.Text style={{ backgroundColor: theme.colors.bgInput, border: `1px solid ${theme.colors.border}`, borderRight: 'none' }}>
                                            <Search style={{ color: theme.colors.textSecondary }} />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Buscar por placa, propietario o marca/modelo..."
                                            value={busqueda}
                                            onChange={(e) => {
                                                setBusqueda(e.target.value);
                                                setPaginaActual(1);
                                            }}
                                            className="border-start-0"
                                            style={{
                                                color: theme.colors.textPrimary,
                                                backgroundColor: theme.colors.bgInput,
                                                border: `1px solid ${theme.colors.border}`,
                                                borderLeft: 'none'
                                            }}
                                        />
                                        {busqueda && (
                                            <Button
                                                className="border-start-0 border-end-0"
                                                onClick={limpiarBusqueda}
                                                style={{
                                                    backgroundColor: theme.colors.bgInput,
                                                    border: `1px solid ${theme.colors.border}`,
                                                    color: theme.colors.textSecondary
                                                }}
                                            >
                                                <CircleX />
                                            </Button>
                                        )}
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            style={{ backgroundColor: theme.colors.accent, border: 'none', color: '#000000' }}
                                        >
                                            Buscar
                                        </Button>
                                    </InputGroup>
                                </Form>
                            </Card.Body>
                        </Card>

                        <div className="d-flex gap-3 mt-3 flex-wrap">
                            <StatsBadge bgColor="transparent" color={theme.colors.textSecondary}>
                                Total: {vehiculos.length}
                            </StatsBadge>
                            {busqueda && (
                                <StatsBadge isWhite>
                                    Resultados: {vehiculosFiltrados.length}
                                </StatsBadge>
                            )}
                            <StatsBadge bgColor={theme.colors.accent} color="#000000">
                                Activos: {vehiculos.filter(v => v.estado === 'ACTIVO').length}
                            </StatsBadge>
                            <StatsBadge bgColor={theme.colors.border} color={theme.colors.textSecondary}>
                                Inactivos: {vehiculos.filter(v => v.estado === 'INACTIVO').length}
                            </StatsBadge>
                        </div>
                    </Col>
                </Row>

                {error && (
                    <Row className="mb-3">
                        <Col>
                            <Alert variant="danger" onClose={() => setError("")} dismissible className="border-0 shadow" style={{ backgroundColor: theme.colors.dangerDark, color: theme.colors.textPrimary }}>
                                <strong>Error:</strong> {error}
                            </Alert>
                        </Col>
                    </Row>
                )}

                <Row>
                    <Col>
                        <Card className="shadow border-0" style={{
                            borderRadius: '16px',
                            overflow: 'hidden',
                            backgroundColor: theme.colors.bgCard
                        }}>
                            <Card.Body className="p-0">
                                {loading ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" style={{ color: theme.colors.accent }} />
                                        <p className="mt-3" style={{ color: theme.colors.textSecondary }}>Cargando vehículos...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="table-responsive">
                                            <Table hover variant="dark" className="align-middle mb-0">
                                                <thead style={{
                                                    backgroundColor: theme.colors.bgCardHover,
                                                    borderBottom: `2px solid ${theme.colors.accent}`
                                                }}>
                                                    <tr>
                                                        <th className="py-3 px-4" style={{ color: theme.colors.textSecondary }}>ID</th>
                                                        <th className="py-3" style={{ color: theme.colors.textSecondary }}>Propietario</th>
                                                        <th className="py-3" style={{ color: theme.colors.textSecondary }}>Vehículo</th>
                                                        <th className="py-3" style={{ color: theme.colors.textSecondary }}>Placa / Foto</th>
                                                        <th className="py-3" style={{ color: theme.colors.textSecondary }}>Capacidad</th>
                                                        <th className="py-3" style={{ color: theme.colors.textSecondary }}>Estado</th>
                                                        <th className="py-3" style={{ color: theme.colors.textSecondary }}>Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {vehiculosFiltrados.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="7" className="text-center py-4" style={{ color: theme.colors.textSecondary }}>
                                                                {busqueda ? "No se encontraron vehículos con esos criterios" : "No hay vehículos registrados"}
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        vehiculosPaginados.map((vehiculo, index) => (
                                                            <tr key={vehiculo.idVehiculos} style={{
                                                                backgroundColor: index % 2 === 0 ? theme.colors.bgCard : theme.colors.bgCardHover,
                                                                borderBottom: `1px solid ${theme.colors.border}`
                                                            }}>
                                                                <td className="fw-semibold px-4">
                                                                    <span style={{
                                                                        backgroundColor: theme.colors.accent,
                                                                        color: '#000000',
                                                                        padding: '0.4rem 0.8rem',
                                                                        borderRadius: '8px',
                                                                        display: 'inline-block',
                                                                        fontWeight: '600',
                                                                        minWidth: '50px',
                                                                        textAlign: 'center'
                                                                    }}>
                                                                        {vehiculo.idVehiculos}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <div className="fw-medium" style={{ color: theme.colors.textPrimary }}>
                                                                        {obtenerNombreUsuario(vehiculo.idUsuario)}
                                                                    </div>
                                                                    <small style={{ color: theme.colors.textMuted }}>
                                                                        ID: {vehiculo.idUsuario}
                                                                    </small>
                                                                </td>
                                                                <td>
                                                                    <div className="fw-medium" style={{ color: theme.colors.textPrimary }}>
                                                                        {vehiculo.marca} {vehiculo.modelo}
                                                                    </div>
                                                                    <div className="d-flex gap-1 mt-1 align-items-center">
                                                                        <TipoVehiculoBadge tipo={vehiculo.tipo} />
                                                                        {vehiculo.anio && (
                                                                            <small className="ms-1" style={{ color: theme.colors.textMuted }}>({vehiculo.anio})</small>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <span className="fw-semibold" style={{ color: theme.colors.textPrimary, fontSize: '1.05rem' }}>
                                                                            {vehiculo.placa}
                                                                        </span>
                                                                        <PlacaValidadaIcon validada={vehiculo.placaValidada} />
                                                                    </div>
                                                                    {vehiculo.fotoVehiculo && (
                                                                        <VerFotoButton onClick={() => {
                                                                            setSelectedPhoto(vehiculo.fotoVehiculo);
                                                                            setShowPhotoModal(true);
                                                                        }} />
                                                                    )}
                                                                </td>
                                                                <td style={{ color: theme.colors.textSecondary }}>
                                                                    {formatearCapacidad(vehiculo.capacidad)}
                                                                </td>
                                                                <td>
                                                                    <EstadoBadge estado={vehiculo.estado} />
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex flex-column gap-2" style={{ minWidth: '130px' }}>
                                                                        <AccionButton
                                                                            estado={vehiculo.estado}
                                                                            onClick={() => cambiarEstadoVehiculo(vehiculo.idVehiculos, vehiculo.estado)}
                                                                        >
                                                                            {getBotonTexto(vehiculo.estado)}
                                                                        </AccionButton>
                                                                        <AccionButton
                                                                            estado={vehiculo.estado}
                                                                            onClick={() => validarPlaca(vehiculo.idVehiculos, vehiculo.placaValidada)}
                                                                            disabled={validatingPlate}
                                                                        >
                                                                            {vehiculo.placaValidada ? "Invalidar Placa" : "Validar Placa"}
                                                                        </AccionButton>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                        <Paginacion />
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Modal para ver la foto del vehículo */}
            <Modal
                show={showPhotoModal}
                onHide={handleClosePhotoModal}
                onExited={handlePhotoModalExited}
                size="lg"
                centered
                style={{
                    backgroundColor: theme.colors.overlay
                }}
            >
                <Modal.Header
                    closeButton
                    style={{
                        borderBottom: `2px solid ${theme.colors.accent}`,
                        backgroundColor: theme.colors.bgCard
                    }}
                >
                    <Modal.Title style={{ color: theme.colors.textPrimary }}>
                        <Car className="me-2" style={{ color: theme.colors.accent }} /> Foto del Vehículo
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center p-0" style={{ backgroundColor: theme.colors.bgPrimary }}>
                    <Image
                        src={selectedPhoto}
                        fluid
                        style={{
                            maxHeight: '70vh',
                            width: 'auto',
                            margin: '0 auto'
                        }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/400x300?text=Error+al+cargar+imagen";
                        }}
                    />
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: theme.colors.bgCard }}>
                    <Button
                        variant="secondary"
                        onClick={handleClosePhotoModal}
                        style={{
                            backgroundColor: theme.colors.border,
                            border: 'none',
                            transition: 'all 0.2s',
                            fontWeight: '500',
                            padding: '0.5rem 1.5rem',
                            borderRadius: '50px',
                            color: theme.colors.textPrimary
                        }}
                    >
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default AdminVehiculos;
