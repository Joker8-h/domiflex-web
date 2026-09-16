import { useState, useEffect, useRef } from "react";
import { ChevronDown, CircleX, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../../config";
import { Container, Row, Col, Card, Table, Button, Alert, Spinner, Form, InputGroup } from "react-bootstrap";


const EstadoBadge = ({ estado }) => {
    const estilos = {
        ACTIVO: { backgroundColor: '#62d8d9', color: '#ffffff' },
        INACTIVO: { backgroundColor: '#cccbd2af', color: '#113d69' },
        SUSPENDIDO: { backgroundColor: '#113d69', color: '#ffffff' }
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
            {estado === 'ACTIVO' && 'Activo'}
            {estado === 'INACTIVO' && 'Inactivo'}
            {estado === 'SUSPENDIDO' && 'Suspendido'}
            {!estado && 'Sin estado'}
        </span>
    );
};

const getRolNombre = (rolId, rolNombre) => {
    if (rolNombre) {
        switch (rolNombre.toUpperCase()) {
            case 'ADMINISTRADOR':
            case 'ADMIN':
                return "Administrador";
            case 'REPARTIDOR':
            case 'DRIVER':
                return "Repartidor";
            case 'CLIENTE':
            case 'CUSTOMER':
            case 'COMERCIO':
                return "Cliente";
            default:
                return rolNombre;
        }
    }

    switch (parseInt(rolId)) {
        case 1:
            return "Administrador";
        case 2:
            return "Repartidor";
        case 3:
            return "Cliente";
        default:
            return `Rol ${rolId}`;
    }
};

const RolBadge = ({ rolId, rolNombre }) => {
    const nombre = getRolNombre(rolId, rolNombre);

    const estilos = {
        "Administrador": { backgroundColor: '#113d69', color: '#ffffff' },
        "Repartidor": { backgroundColor: '#62d8d9', color: '#ffffff' },
        "Cliente": { backgroundColor: '#cccbd2af', color: '#113d69' }
    };

    const estilo = estilos[nombre] || { backgroundColor: '#e9ecef', color: '#113d69' };

    return (
        <span style={{
            ...estilo,
            padding: '0.25rem 0.75rem',
            borderRadius: '1rem',
            fontSize: '0.8rem',
            fontWeight: '500',
            display: 'inline-block'
        }}>
            {nombre}
        </span>
    );
};

const StatsBadge = ({ children, color, bgColor, isWhite = false }) => {
    if (isWhite) {
        return (
            <span style={{
                backgroundColor: '#ffffff',
                color: '#62d8d9',
                border: '1px solid #62d8d9',
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
            borderRadius: '0.375rem',
            fontSize: '0.9rem',
            fontWeight: '500',
            display: 'inline-block'
        }}>
            {children}
        </span>
    );
};

const AccionButton = ({ estado, onActivarDesactivar, onSuspender }) => {
    const [mostrarMenu, setMostrarMenu] = useState(false);
    const menuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMostrarMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getButtonStyle = (tipoBoton = 'principal') => {
        if (tipoBoton === 'principal') {
            if (estado === 'ACTIVO') {
                return {
                    backgroundColor: '#62d8d9',
                    color: '#ffffff',
                    borderColor: '#62d8d9'
                };
            } else {
                return {
                    backgroundColor: 'transparent',
                    color: '#62d8d9',
                    borderColor: '#62d8d9'
                };
            }
        } else if (tipoBoton === 'suspender') {
            return {
                backgroundColor: '#113d69',
                color: '#ffffff',
                borderColor: '#113d69'
            };
        }
    };

    const textoBoton = estado === 'ACTIVO' ? 'Desactivar' : 'Activar';

    return (
        <div className="position-relative" ref={menuRef} style={{ minWidth: '120px' }}>
            <div className="d-flex">
                <Button
                    size="sm"
                    onClick={onActivarDesactivar}
                    className="flex-grow-1"
                    style={{
                        transition: 'all 0.2s',
                        fontWeight: '500',
                        borderRadius: '50px 0 0 50px',
                        padding: '0.4rem 0.8rem',
                        border: `2px solid ${estado === 'ACTIVO' ? '#62d8d9' : '#62d8d9'}`,
                        ...getButtonStyle('principal')
                    }}
                >
                    {textoBoton}
                </Button>
                <Button
                    size="sm"
                    onClick={() => setMostrarMenu(!mostrarMenu)}
                    style={{
                        transition: 'all 0.2s',
                        fontWeight: '500',
                        borderRadius: '0 50px 50px 0',
                        padding: '0.4rem 0.6rem',
                        border: `2px solid ${estado === 'ACTIVO' ? '#62d8d9' : '#62d8d9'}`,
                        borderLeft: 'none',
                        ...getButtonStyle('principal'),
                        backgroundColor: estado === 'ACTIVO' ? '#62d8d9' : 'transparent',
                        color: estado === 'ACTIVO' ? '#ffffff' : '#62d8d9'
                    }}
                >
                    <ChevronDown style={{
                        transform: mostrarMenu ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s'
                    }} />
                </Button>
            </div>

            {mostrarMenu && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    minWidth: '120px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    zIndex: 1000,
                    overflow: 'hidden'
                }}>
                    <Button
                        size="sm"
                        onClick={() => {
                            onSuspender();
                            setMostrarMenu(false);
                        }}
                        className="w-100"
                        style={{
                            transition: 'all 0.2s',
                            fontWeight: '500',
                            padding: '0.5rem 1rem',
                            border: 'none',
                            borderRadius: 0,
                            backgroundColor: 'transparent',
                            color: '#113d69',
                            textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f8f9fa';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                        }}
                    >
                        Suspender
                    </Button>
                </div>
            )}
        </div>
    );
};
const Paginacion = ({ totalPaginas, paginaActual, cambiarPagina, usuariosFiltrados, indicePrimerElemento, indiceUltimoElemento, busqueda, usuariosTotales }) => {
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
                    backgroundColor: paginaActual === 1 ? '#e9ecef' : 'white',
                    color: paginaActual === 1 ? '#6c757d' : '#62d8d9',
                    border: `1px solid ${paginaActual === 1 ? '#dee2e6' : '#62d8d9'}`,
                    margin: '0 2px',
                    borderRadius: '0.375rem 0 0 0.375rem',
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
                        backgroundColor: 'white',
                        color: '#62d8d9',
                        border: '1px solid #62d8d9',
                        margin: '0 2px',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    1
                </button>
            );
            if (inicio > 2) {
                botones.push(<span key="ellipsis1" style={{ margin: '0 5px' }}>...</span>);
            }
        }

        for (let i = inicio; i <= fin; i++) {
            botones.push(
                <button
                    key={i}
                    onClick={() => cambiarPagina(i)}
                    style={{
                        ...buttonStyle,
                        backgroundColor: i === paginaActual ? '#62d8d9' : 'white',
                        color: i === paginaActual ? 'white' : '#62d8d9',
                        border: '1px solid #62d8d9',
                        margin: '0 2px',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    {i}
                </button>
            );
        }

        if (fin < totalPaginas) {
            if (fin < totalPaginas - 1) {
                botones.push(<span key="ellipsis2" style={{ margin: '0 5px' }}>...</span>);
            }
            botones.push(
                <button
                    key={totalPaginas}
                    onClick={() => cambiarPagina(totalPaginas)}
                    style={{
                        ...buttonStyle,
                        backgroundColor: 'white',
                        color: '#62d8d9',
                        border: '1px solid #62d8d9',
                        margin: '0 2px',
                        borderRadius: '0.375rem',
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
                    backgroundColor: paginaActual === totalPaginas ? '#e9ecef' : 'white',
                    color: paginaActual === totalPaginas ? '#6c757d' : '#62d8d9',
                    border: `1px solid ${paginaActual === totalPaginas ? '#dee2e6' : '#62d8d9'}`,
                    margin: '0 2px',
                    borderRadius: '0 0.375rem 0.375rem 0',
                    cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    opacity: paginaActual === totalPaginas ? 0.6 : 1
                }}
            >
                {window.innerWidth < 768 ? '‹' : 'Siguiente'}
            </button>
        );

        return botones;
    };

    return (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 px-4 pb-4" style={{ gap: '1rem' }}>
            <div className="text-muted text-center text-md-start" style={{ color: '#113d69', fontSize: window.innerWidth < 768 ? '0.8rem' : '0.9rem' }}>
                Mostrando {indicePrimerElemento + 1} - {Math.min(indiceUltimoElemento, usuariosFiltrados.length)} de {usuariosFiltrados.length} usuarios
                {busqueda && ` (filtrados de ${usuariosTotales} totales)`}
            </div>
            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {generarBotones()}
            </div>
        </div>
    );
};

function AdminUsuarios() {
    const { token } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [busqueda, setBusqueda] = useState("");

    const elementosPorPagina = 10;



    useEffect(() => {
        traerUsuarios();
    }, []);

    const usuariosFiltrados = usuarios.filter(usuario => {
        const terminoBusqueda = busqueda.toLowerCase();
        return (
            usuario.email?.toLowerCase().includes(terminoBusqueda) ||
            usuario.nombre?.toLowerCase().includes(terminoBusqueda) ||
            usuario.idUsuarios?.toString().includes(terminoBusqueda) ||
            usuario.telefono?.toLowerCase().includes(terminoBusqueda)
        );
    });

    const indiceUltimoElemento = paginaActual * elementosPorPagina;
    const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
    const usuariosPaginados = usuariosFiltrados.slice(indicePrimerElemento, indiceUltimoElemento);
    const totalPaginas = Math.ceil(usuariosFiltrados.length / elementosPorPagina);

    const cambiarPagina = (numeroPagina) => {
        setPaginaActual(numeroPagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    async function traerUsuarios() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/auth/`, {
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

            setUsuarios(data);
            setPaginaActual(1);

        } catch (error) {
            console.error("Error al traer usuarios:", error);
            setError(error.message);
            setUsuarios([]);
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        setPaginaActual(1);
    };

    const limpiarBusqueda = () => {
        setBusqueda("");
        setPaginaActual(1);
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return "Sin fecha";
        return new Date(fecha).toLocaleDateString();
    };

    const cambiarEstadoUsuario = async (id, estadoActual) => {
        try {
            const nuevoEstado = estadoActual === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
            const response = await fetch(`${API_URL}/auth/${id}/estado`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (!response.ok) throw new Error("Error al cambiar estado");
            traerUsuarios();
        } catch (err) {
            setError(err.message);
        }
    };

    const suspenderUsuario = async (id) => {
        try {
            const response = await fetch(`${API_URL}/auth/${id}/estado`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ estado: 'SUSPENDIDO' })
            });

            if (!response.ok) throw new Error("Error al suspender usuario");
            traerUsuarios();
        } catch (err) {
            setError(err.message);
        }
    };

    const getBotonTexto = (estado) => {
        if (estado === 'ACTIVO') return "Desactivar";
        return "Activar";
    };

    const puedeSuspender = (estado) => {
        return estado !== 'SUSPENDIDO';
    };


    return (
        <div style={{ position: 'relative' }}>
            <Container fluid className="py-4" style={{ position: 'relative', zIndex: 1 }}>
                <Row className="mb-4">
                    <Col>
                        <Card className="border-0 shadow" style={{
                            borderRadius: '16px',
                            borderLeft: '6px solid #62d8d9',
                            overflow: 'hidden',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)'
                        }}>
                            <Card.Body className="p-4">
                                <h1 className="display-5 fw-bold mb-0" style={{
                                    color: '#113d69',
                                    letterSpacing: '-0.02em'
                                }}>
                                    Lista de Usuarios
                                </h1>
                                <p className="mb-0 small" style={{ color: '#113d69' }}>
                                    <span style={{ color: '#62d8d9' }}>●</span> Administra los usuarios registrados en la plataforma
                                </p>
                            </Card.Body>
                        </Card>

                        <Card className="border-0 shadow-sm mt-3" style={{ borderRadius: '12px' }}>
                            <Card.Body className="p-3">
                                <Form onSubmit={handleSearch}>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-white border-end-0">
                                            <Search style={{ color: '#113d69' }} />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Buscar por nombre, email, teléfono o ID..."
                                            value={busqueda}
                                            onChange={(e) => {
                                                setBusqueda(e.target.value);
                                                setPaginaActual(1);
                                            }}
                                            className="border-start-0"
                                            style={{ color: '#113d69' }}
                                        />
                                        {busqueda && (
                                            <Button variant="outline-secondary" className="border-start-0 border-end-0 bg-white" onClick={limpiarBusqueda}>
                                                <CircleX style={{ color: '#113d69' }} />
                                            </Button>
                                        )}
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            style={{ backgroundColor: '#62d8d9', border: 'none', color: '#ffffff' }}
                                        >
                                            Buscar
                                        </Button>
                                    </InputGroup>
                                </Form>
                            </Card.Body>
                        </Card>

                        <div className="d-flex gap-3 mt-3 flex-wrap">
                            <StatsBadge bgColor="transparent" color="#113d69">
                                Total: {usuarios.length}
                            </StatsBadge>
                            {busqueda && (
                                <StatsBadge isWhite>
                                    Resultados: {usuariosFiltrados.length}
                                </StatsBadge>
                            )}
                            <StatsBadge bgColor="#62d8d9" color="#ffffff">
                                Activos: {usuarios.filter(u => u.estado === 'ACTIVO').length}
                            </StatsBadge>
                            <StatsBadge bgColor="#cccbd2af" color="#113d69">
                                Inactivos: {usuarios.filter(u => u.estado === 'INACTIVO').length}
                            </StatsBadge>
                            <StatsBadge bgColor="#113d69" color="#ffffff">
                                Suspendidos: {usuarios.filter(u => u.estado === 'SUSPENDIDO').length}
                            </StatsBadge>
                        </div>
                    </Col>
                </Row>

                {error && (
                    <Row className="mb-3">
                        <Col>
                            <Alert variant="danger" onClose={() => setError("")} dismissible className="border-0 shadow" style={{ backgroundColor: theme.colors.dangerDark, color: theme.colors.textPrimary }}>
                                <strong style={{ color: '#113d69' }}>Error:</strong> <span style={{ color: '#113d69' }}>{error}</span>
                            </Alert>
                        </Col>
                    </Row>
                )}

                <Row>
                    <Col>
                        <Card className="shadow border-0" style={{
                            borderRadius: '16px',
                            overflow: 'hidden',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)'
                        }}>
                            <Card.Body className="p-0">
                                {loading ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" style={{ color: '#62d8d9' }} />
                                        <p className="mt-3" style={{ color: '#113d69' }}>Cargando usuarios...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="table-responsive">
                                            <Table hover variant="dark" className="align-middle mb-0">
                                                <thead style={{
                                                    backgroundColor: 'rgba(248, 249, 250, 0.9)',
                                                    borderBottom: '2px solid #62d8d9'
                                                }}>
                                                    <tr>
                                                        <th className="py-3 px-4" style={{ color: '#113d69' }}>ID</th>
                                                        <th className="py-3" style={{ color: '#113d69' }}>Nombre</th>
                                                        <th className="py-3" style={{ color: '#113d69' }}>Email</th>
                                                        <th className="py-3" style={{ color: '#113d69' }}>Teléfono</th>
                                                        <th className="py-3" style={{ color: '#113d69' }}>Rol</th>
                                                        <th className="py-3" style={{ color: '#113d69' }}>Estado</th>
                                                        <th className="py-3" style={{ color: '#113d69' }}>Registro</th>
                                                        <th className="py-3" style={{ color: '#113d69' }}>Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>
                                                    {usuariosFiltrados.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="8" className="text-center py-4" style={{ color: '#113d69' }}>
                                                                {busqueda ? "No se encontraron usuarios con esos criterios" : "No hay usuarios registrados"}
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        usuariosPaginados.map((usuario, index) => (
                                                            <tr key={usuario.idUsuarios} style={{
                                                                backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(250, 250, 250, 0.9)'
                                                            }}>
                                                                <td className="fw-semibold px-4">
                                                                    <span style={{
                                                                        backgroundColor: '#62d8d9',
                                                                        color: '#fafafa',
                                                                        padding: '0.4rem 0.8rem',
                                                                        borderRadius: '8px',
                                                                        display: 'inline-block',
                                                                        fontWeight: '600',
                                                                        minWidth: '50px',
                                                                        textAlign: 'center'
                                                                    }}>
                                                                        {usuario.idUsuarios}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <div style={{
                                                                            width: '40px',
                                                                            height: '40px',
                                                                            borderRadius: '50%',
                                                                            overflow: 'hidden',
                                                                            backgroundColor: '#e9ecef',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            border: '2px solid #62d8d9',
                                                                            flexShrink: 0
                                                                        }}>
                                                                            {usuario.fotoPerfil ? (
                                                                                <img
                                                                                    src={usuario.fotoPerfil}
                                                                                    alt={usuario.nombre}
                                                                                    style={{
                                                                                        width: '100%',
                                                                                        height: '100%',
                                                                                        objectFit: 'cover'
                                                                                    }}
                                                                                    onError={(e) => {
                                                                                        e.target.onerror = null;
                                                                                        e.target.style.display = 'none';
                                                                                        e.target.parentElement.innerHTML = '<span style="color: #113d69; font-weight: 600;">' +
                                                                                            usuario.nombre?.charAt(0).toUpperCase() +
                                                                                            '</span>';
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                <span style={{
                                                                                    color: '#113d69',
                                                                                    fontWeight: '600',
                                                                                    fontSize: '1rem'
                                                                                }}>
                                                                                    {usuario.nombre?.charAt(0).toUpperCase()}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <div className="fw-medium" style={{ color: '#113d69' }}>{usuario.nombre}</div>
                                                                            <small className="text-muted">ID: {usuario.idUsuarios}</small>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td style={{ color: '#113d69' }}>{usuario.email}</td>
                                                                <td style={{ color: '#113d69' }}>
                                                                    {usuario.telefono || <span className="text-muted fst-italic">No especificado</span>}
                                                                </td>
                                                                <td>
                                                                    <RolBadge rolId={usuario.idRol} rolNombre={usuario.rol?.nombre} />
                                                                </td>
                                                                <td>
                                                                    <EstadoBadge estado={usuario.estado} />
                                                                </td>
                                                                <td>
                                                                    <div style={{ color: '#113d69' }}>{formatearFecha(usuario.creadoEn)}</div>
                                                                </td>
                                                                <td>
                                                                    <div style={{ minWidth: '140px' }}>
                                                                        <AccionButton
                                                                            estado={usuario.estado}
                                                                            onActivarDesactivar={() => cambiarEstadoUsuario(usuario.idUsuarios, usuario.estado)}
                                                                            onSuspender={() => suspenderUsuario(usuario.idUsuarios)}
                                                                        />
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                        <Paginacion
                                            totalPaginas={totalPaginas}
                                            paginaActual={paginaActual}
                                            cambiarPagina={cambiarPagina}
                                            usuariosFiltrados={usuariosFiltrados}
                                            indicePrimerElemento={indicePrimerElemento}
                                            indiceUltimoElemento={indiceUltimoElemento}
                                            busqueda={busqueda}
                                            usuariosTotales={usuarios.length}
                                        />
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default AdminUsuarios;