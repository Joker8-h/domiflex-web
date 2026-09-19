import { useState, useEffect, useRef } from "react";
import { ChevronDown, CircleX, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from '../../config';
import theme from '../../styles/theme';
import { Container, Row, Col, Card, Table, Button, Alert, Spinner, Form, InputGroup } from "react-bootstrap";


const EstadoBadge = ({ estado }) => {
    const estilos = {
        ACTIVO: { backgroundColor: theme.colors.accent, color: '#000' },
        INACTIVO: { backgroundColor: theme.colors.border, color: theme.colors.textSecondary },
        SUSPENDIDO: { backgroundColor: theme.colors.bgPrimary, color: theme.colors.textPrimary }
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
            {estado === 'SUSPENDIDO' && 'Suspendido'}
            {!estado && 'Sin estado'}
        </span>
    );
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
                    backgroundColor: theme.colors.accent,
                    color: '#000',
                    borderColor: theme.colors.accent
                };
            } else {
                return {
                    backgroundColor: 'transparent',
                    color: theme.colors.accent,
                    borderColor: theme.colors.accent
                };
            }
        } else if (tipoBoton === 'suspender') {
            return {
                backgroundColor: theme.colors.bgPrimary,
                color: theme.colors.textPrimary,
                borderColor: theme.colors.border
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
                        border: `2px solid ${theme.colors.accent}`,
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
                        border: `2px solid ${theme.colors.accent}`,
                        borderLeft: 'none',
                        ...getButtonStyle('principal'),
                        backgroundColor: estado === 'ACTIVO' ? theme.colors.accent : 'transparent',
                        color: estado === 'ACTIVO' ? '#000' : theme.colors.accent
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
                    backgroundColor: theme.colors.bgCard,
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    border: `1px solid ${theme.colors.border}`,
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
                            color: theme.colors.textPrimary,
                            textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = theme.colors.bgCardHover;
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

const Paginacion = ({ totalPaginas, paginaActual, cambiarPagina, clientesFiltrados, indicePrimerElemento, indiceUltimoElemento, busqueda, clientesTotales }) => {
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
                    backgroundColor: paginaActual === 1 ? theme.colors.bgCardHover : theme.colors.bgCard,
                    color: paginaActual === 1 ? theme.colors.textMuted : theme.colors.accent,
                    border: `1px solid ${paginaActual === 1 ? theme.colors.border : theme.colors.accent}`,
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
                botones.push(<span key="ellipsis1" style={{ margin: '0 5px', color: theme.colors.textMuted }}>...</span>);
            }
        }

        for (let i = inicio; i <= fin; i++) {
            botones.push(
                <button
                    key={i}
                    onClick={() => cambiarPagina(i)}
                    style={{
                        ...buttonStyle,
                        backgroundColor: i === paginaActual ? theme.colors.accent : theme.colors.bgCard,
                        color: i === paginaActual ? '#000' : theme.colors.accent,
                        border: `1px solid ${theme.colors.accent}`,
                        margin: '0 2px',
                        borderRadius: '50px',
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
                botones.push(<span key="ellipsis2" style={{ margin: '0 5px', color: theme.colors.textMuted }}>...</span>);
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
                    backgroundColor: paginaActual === totalPaginas ? theme.colors.bgCardHover : theme.colors.bgCard,
                    color: paginaActual === totalPaginas ? theme.colors.textMuted : theme.colors.accent,
                    border: `1px solid ${paginaActual === totalPaginas ? theme.colors.border : theme.colors.accent}`,
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
            <div className="text-muted text-center text-md-start" style={{ color: theme.colors.textSecondary, fontSize: window.innerWidth < 768 ? '0.8rem' : '0.9rem' }}>
                Mostrando {indicePrimerElemento + 1} - {Math.min(indiceUltimoElemento, clientesFiltrados.length)} de {clientesFiltrados.length} clientes
                {busqueda && ` (filtrados de ${clientesTotales} totales)`}
            </div>
            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {generarBotones()}
            </div>
        </div>
    );
};

function AdminClientes() {
    const { token } = useAuth();
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [busqueda, setBusqueda] = useState("");

    const elementosPorPagina = 10;

    useEffect(() => {
        traerClientes();
    }, []);

    const clientesFiltrados = clientes.filter(cliente => {
        const terminoBusqueda = busqueda.toLowerCase();
        return (
            cliente.email?.toLowerCase().includes(terminoBusqueda) ||
            cliente.nombre?.toLowerCase().includes(terminoBusqueda) ||
            cliente.idUsuarios?.toString().includes(terminoBusqueda) ||
            cliente.telefono?.toLowerCase().includes(terminoBusqueda)
        );
    });

    const indiceUltimoElemento = paginaActual * elementosPorPagina;
    const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
    const clientesPaginados = clientesFiltrados.slice(indicePrimerElemento, indiceUltimoElemento);
    const totalPaginas = Math.ceil(clientesFiltrados.length / elementosPorPagina);

    const cambiarPagina = (numeroPagina) => {
        setPaginaActual(numeroPagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    async function traerClientes() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/auth/clientes`, {
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

            setClientes(data);
            setPaginaActual(1);

        } catch (error) {
            console.error("Error al traer clientes:", error);
            setError(error.message);
            setClientes([]);
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

    const cambiarEstadoCliente = async (id, estadoActual) => {
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
            traerClientes();
        } catch (err) {
            setError(err.message);
        }
    };

    const suspenderCliente = async (id) => {
        try {
            const response = await fetch(`${API_URL}/auth/${id}/estado`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ estado: 'SUSPENDIDO' })
            });

            if (!response.ok) throw new Error("Error al suspender cliente");
            traerClientes();
        } catch (err) {
            setError(err.message);
        }
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
                            borderLeft: `6px solid ${theme.colors.accent}`,
                            overflow: 'hidden',
                            backgroundColor: theme.colors.bgCard
                        }}>
                            <Card.Body className="p-4">
                                <h1 className="display-5 fw-bold mb-0" style={{
                                    color: theme.colors.textPrimary,
                                    letterSpacing: '-0.02em'
                                }}>
                                    Lista de Clientes
                                </h1>
                                <p className="mb-0 small" style={{ color: theme.colors.textSecondary }}>
                                    <span style={{ color: theme.colors.accent }}>●</span> Administra los clientes registrados en la plataforma
                                </p>
                            </Card.Body>
                        </Card>

                        <Card className="border-0 shadow-sm mt-3" style={{ borderRadius: '12px', backgroundColor: theme.colors.bgCard }}>
                            <Card.Body className="p-3">
                                <Form onSubmit={handleSearch}>
                                    <InputGroup>
                                        <InputGroup.Text style={{ backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }}>
                                            <Search style={{ color: theme.colors.textSecondary }} />
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
                                            style={{ backgroundColor: theme.colors.bgPrimary, color: theme.colors.textPrimary, borderColor: theme.colors.border }}
                                        />
                                        {busqueda && (
                                            <Button variant="outline-secondary" className="border-start-0 border-end-0" style={{ backgroundColor: theme.colors.bgCard, borderColor: theme.colors.border }} onClick={limpiarBusqueda}>
                                                <CircleX style={{ color: theme.colors.textSecondary }} />
                                            </Button>
                                        )}
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            style={{ backgroundColor: theme.colors.accent, border: 'none', color: '#000' }}
                                        >
                                            Buscar
                                        </Button>
                                    </InputGroup>
                                </Form>
                            </Card.Body>
                        </Card>

                        <div className="d-flex gap-3 mt-3 flex-wrap">
                            <StatsBadge bgColor="transparent" color={theme.colors.textPrimary}>
                                Total: {clientes.length}
                            </StatsBadge>
                            {busqueda && (
                                <StatsBadge isWhite>
                                    Resultados: {clientesFiltrados.length}
                                </StatsBadge>
                            )}
                            <StatsBadge bgColor={theme.colors.accent} color="#000">
                                Activos: {clientes.filter(v => v.estado === 'ACTIVO').length}
                            </StatsBadge>
                            <StatsBadge bgColor={theme.colors.border} color={theme.colors.textSecondary}>
                                Inactivos: {clientes.filter(v => v.estado === 'INACTIVO').length}
                            </StatsBadge>
                            <StatsBadge bgColor={theme.colors.bgPrimary} color={theme.colors.textPrimary}>
                                Suspendidos: {clientes.filter(v => v.estado === 'SUSPENDIDO').length}
                            </StatsBadge>
                        </div>
                    </Col>
                </Row>

                {error && (
                    <Row className="mb-3">
                        <Col>
                            <Alert variant="danger" onClose={() => setError("")} dismissible className="border-0 shadow" style={{ backgroundColor: '#2D1111', color: theme.colors.danger, border: `1px solid ${theme.colors.danger}` }}>
                                <strong style={{ color: theme.colors.danger }}>Error:</strong> <span style={{ color: theme.colors.textPrimary }}>{error}</span>
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
                                        <p className="mt-3" style={{ color: theme.colors.textSecondary }}>Cargando clientes...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="table-responsive">
                                            <Table hover variant="dark" className="align-middle mb-0">
                                                <thead style={{
                                                    backgroundColor: theme.colors.bgPrimary,
                                                    borderBottom: `2px solid ${theme.colors.accent}`
                                                }}>
                                                    <tr>
                                                        <th className="py-3 px-4" style={{ color: theme.colors.textSecondary }}>ID</th>
                                                        <th className="py-3" style={{ color: theme.colors.textSecondary }}>Nombre</th>
                                                        <th className="py-3" style={{ color: theme.colors.textSecondary }}>Email</th>
                                                        <th className="py-3" style={{ color: theme.colors.textSecondary }}>Teléfono</th>
                                                        <th className="py-3" style={{ color: theme.colors.textSecondary }}>Estado</th>
                                                        <th className="py-3" style={{ color: theme.colors.textSecondary }}>Registro</th>
                                                        <th className="py-3" style={{ color: theme.colors.textSecondary }}>Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{ backgroundColor: theme.colors.bgCard }}>
                                                    {clientesFiltrados.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="7" className="text-center py-4" style={{ color: theme.colors.textSecondary }}>
                                                                {busqueda ? "No se encontraron clientes con esos criterios" : "No hay clientes registrados"}
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        clientesPaginados.map((cliente, index) => (
                                                            <tr key={cliente.idUsuarios} style={{
                                                                backgroundColor: index % 2 === 0 ? theme.colors.bgCard : theme.colors.bgPrimary
                                                            }}>
                                                                <td className="fw-semibold px-4">
                                                                    <span style={{
                                                                        backgroundColor: theme.colors.accent,
                                                                        color: '#000',
                                                                        padding: '0.4rem 0.8rem',
                                                                        borderRadius: '8px',
                                                                        display: 'inline-block',
                                                                        fontWeight: '600',
                                                                        minWidth: '50px',
                                                                        textAlign: 'center'
                                                                    }}>
                                                                        {cliente.idUsuarios}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <div style={{
                                                                            width: '40px',
                                                                            height: '40px',
                                                                            borderRadius: '50%',
                                                                            overflow: 'hidden',
                                                                            backgroundColor: theme.colors.bgPrimary,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            border: `2px solid ${theme.colors.accent}`,
                                                                            flexShrink: 0
                                                                        }}>
                                                                            {cliente.fotoPerfil ? (
                                                                                <img
                                                                                    src={cliente.fotoPerfil}
                                                                                    alt={cliente.nombre}
                                                                                    style={{
                                                                                        width: '100%',
                                                                                        height: '100%',
                                                                                        objectFit: 'cover'
                                                                                    }}
                                                                                    onError={(e) => {
                                                                                        e.target.onerror = null;
                                                                                        e.target.style.display = 'none';
                                                                                        e.target.parentElement.innerHTML = '<span style="color: #000; font-weight: 600;">' +
                                                                                            cliente.nombre?.charAt(0).toUpperCase() +
                                                                                            '</span>';
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                <span style={{
                                                                                    color: '#000',
                                                                                    fontWeight: '600',
                                                                                    fontSize: '1rem'
                                                                                }}>
                                                                                    {cliente.nombre?.charAt(0).toUpperCase()}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <div className="fw-medium" style={{ color: theme.colors.textPrimary }}>{cliente.nombre}</div>
                                                                            <small style={{ color: theme.colors.textMuted }}>ID: {cliente.idUsuarios}</small>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td style={{ color: theme.colors.textPrimary }}>{cliente.email}</td>
                                                                <td style={{ color: theme.colors.textPrimary }}>
                                                                    {cliente.telefono || <span className="fst-italic" style={{ color: theme.colors.textMuted }}>No especificado</span>}
                                                                </td>
                                                                <td>
                                                                    <EstadoBadge estado={cliente.estado} />
                                                                </td>
                                                                <td>
                                                                    <div style={{ color: theme.colors.textSecondary }}>{formatearFecha(cliente.creadoEn)}</div>
                                                                </td>
                                                                <td>
                                                                    <div style={{ minWidth: '140px' }}>
                                                                        <AccionButton
                                                                            estado={cliente.estado}
                                                                            onActivarDesactivar={() => cambiarEstadoCliente(cliente.idUsuarios, cliente.estado)}
                                                                            onSuspender={() => suspenderCliente(cliente.idUsuarios)}
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
                                            clientesFiltrados={clientesFiltrados}
                                            indicePrimerElemento={indicePrimerElemento}
                                            indiceUltimoElemento={indiceUltimoElemento}
                                            busqueda={busqueda}
                                            clientesTotales={clientes.length}
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

export default AdminClientes;
