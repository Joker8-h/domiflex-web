import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../../config";
import { Container, Row, Col, Card, Table, Button, Alert, Spinner, Form, InputGroup } from "react-bootstrap";
import { BsSearch, BsXCircle, BsChevronDown } from "react-icons/bs";

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
                    <BsChevronDown style={{
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

const Paginacion = ({ totalPaginas, paginaActual, cambiarPagina, repartidoresFiltrados, indicePrimerElemento, indiceUltimoElemento, busqueda, repartidoresTotales }) => {
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
                        backgroundColor: 'white',
                        color: '#62d8d9',
                        border: '1px solid #62d8d9',
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
                botones.push(<span key="ellipsis1" style={{ margin: '0 5px', color: '#113d69' }}>...</span>);
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
                botones.push(<span key="ellipsis2" style={{ margin: '0 5px', color: '#113d69' }}>...</span>);
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
                    backgroundColor: paginaActual === totalPaginas ? '#e9ecef' : 'white',
                    color: paginaActual === totalPaginas ? '#6c757d' : '#62d8d9',
                    border: `1px solid ${paginaActual === totalPaginas ? '#dee2e6' : '#62d8d9'}`,
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
            <div className="text-muted text-center text-md-start" style={{ color: '#113d69', fontSize: window.innerWidth < 768 ? '0.8rem' : '0.9rem' }}>
                Mostrando {indicePrimerElemento + 1} - {Math.min(indiceUltimoElemento, repartidoresFiltrados.length)} de {repartidoresFiltrados.length} repartidores
                {busqueda && ` (filtrados de ${repartidoresTotales} totales)`}
            </div>
            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {generarBotones()}
            </div>
        </div>
    );
};

function AdminRepartidores() {
    const { token } = useAuth();
    const [repartidores, setRepartidores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [busqueda, setBusqueda] = useState("");

    const elementosPorPagina = 10;

    useEffect(() => {
        traerRepartidores();
    }, []);

    const repartidoresFiltrados = repartidores.filter(repartidor => {
        const terminoBusqueda = busqueda.toLowerCase();
        return (
            repartidor.email?.toLowerCase().includes(terminoBusqueda) ||
            repartidor.nombre?.toLowerCase().includes(terminoBusqueda) ||
            repartidor.idUsuarios?.toString().includes(terminoBusqueda) ||
            repartidor.telefono?.toLowerCase().includes(terminoBusqueda)
        );
    });

    const indiceUltimoElemento = paginaActual * elementosPorPagina;
    const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
    const repartidoresPaginados = repartidoresFiltrados.slice(indicePrimerElemento, indiceUltimoElemento);
    const totalPaginas = Math.ceil(repartidoresFiltrados.length / elementosPorPagina);

    const cambiarPagina = (numeroPagina) => {
        setPaginaActual(numeroPagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    async function traerRepartidores() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/auth/repartidores`, {
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

            setRepartidores(data);
            setPaginaActual(1);

        } catch (error) {
            console.error("Error al traer repartidores:", error);
            setError(error.message);
            setRepartidores([]);
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

    const cambiarEstadoRepartidor = async (id, estadoActual) => {
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
            traerRepartidores();
        } catch (err) {
            setError(err.message);
        }
    };

    const suspenderRepartidor = async (id) => {
        try {
            const response = await fetch(`${API_URL}/auth/${id}/estado`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ estado: 'SUSPENDIDO' })
            });

            if (!response.ok) throw new Error("Error al suspender repartidor");
            traerRepartidores();
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
                            borderLeft: '6px solid #62d8d9',
                            overflow: 'hidden',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)'
                        }}>
                            <Card.Body className="p-4">
                                <h1 className="display-5 fw-bold mb-0" style={{
                                    color: '#113d69',
                                    letterSpacing: '-0.02em'
                                }}>
                                    Lista de Repartidores
                                </h1>
                                <p className="mb-0 small" style={{ color: '#113d69' }}>
                                    <span style={{ color: '#62d8d9' }}>●</span> Administra los repartidores registrados en la plataforma
                                </p>
                            </Card.Body>
                        </Card>

                        <Card className="border-0 shadow-sm mt-3" style={{ borderRadius: '12px' }}>
                            <Card.Body className="p-3">
                                <Form onSubmit={handleSearch}>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-white border-end-0">
                                            <BsSearch style={{ color: '#113d69' }} />
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
                                                <BsXCircle style={{ color: '#113d69' }} />
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
                                Total: {repartidores.length}
                            </StatsBadge>
                            {busqueda && (
                                <StatsBadge isWhite>
                                    Resultados: {repartidoresFiltrados.length}
                                </StatsBadge>
                            )}
                            <StatsBadge bgColor="#62d8d9" color="#ffffff">
                                Activos: {repartidores.filter(v => v.estado === 'ACTIVO').length}
                            </StatsBadge>
                            <StatsBadge bgColor="#cccbd2af" color="#113d69">
                                Inactivos: {repartidores.filter(v => v.estado === 'INACTIVO').length}
                            </StatsBadge>
                            <StatsBadge bgColor="#113d69" color="#ffffff">
                                Suspendidos: {repartidores.filter(v => v.estado === 'SUSPENDIDO').length}
                            </StatsBadge>
                        </div>
                    </Col>
                </Row>

                {error && (
                    <Row className="mb-3">
                        <Col>
                            <Alert variant="danger" onClose={() => setError("")} dismissible className="border-0 shadow" style={{ backgroundColor: '#cccbd2af', color: '#113d69' }}>
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
                                        <p className="mt-3" style={{ color: '#113d69' }}>Cargando repartidores...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="table-responsive">
                                            <Table hover className="align-middle mb-0">
                                                <thead style={{
                                                    backgroundColor: 'rgba(248, 249, 250, 0.9)',
                                                    borderBottom: '2px solid #62d8d9'
                                                }}>
                                                    <tr>
                                                        <th className="py-3 px-4" style={{ color: '#113d69' }}>ID</th>
                                                        <th className="py-3" style={{ color: '#113d69' }}>Nombre</th>
                                                        <th className="py-3" style={{ color: '#113d69' }}>Email</th>
                                                        <th className="py-3" style={{ color: '#113d69' }}>Teléfono</th>
                                                        <th className="py-3" style={{ color: '#113d69' }}>Estado</th>
                                                        <th className="py-3" style={{ color: '#113d69' }}>Registro</th>
                                                        <th className="py-3" style={{ color: '#113d69' }}>Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>
                                                    {repartidoresFiltrados.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="7" className="text-center py-4" style={{ color: '#113d69' }}>
                                                                {busqueda ? "No se encontraron repartidores con esos criterios" : "No hay repartidores registrados"}
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        repartidoresPaginados.map((repartidor, index) => (
                                                            <tr key={repartidor.idUsuarios} style={{
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
                                                                        {repartidor.idUsuarios}
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
                                                                            {repartidor.fotoPerfil ? (
                                                                                <img
                                                                                    src={repartidor.fotoPerfil}
                                                                                    alt={repartidor.nombre}
                                                                                    style={{
                                                                                        width: '100%',
                                                                                        height: '100%',
                                                                                        objectFit: 'cover'
                                                                                    }}
                                                                                    onError={(e) => {
                                                                                        e.target.onerror = null;
                                                                                        e.target.style.display = 'none';
                                                                                        e.target.parentElement.innerHTML = '<span style="color: #113d69; font-weight: 600;">' +
                                                                                            repartidor.nombre?.charAt(0).toUpperCase() +
                                                                                            '</span>';
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                <span style={{
                                                                                    color: '#113d69',
                                                                                    fontWeight: '600',
                                                                                    fontSize: '1rem'
                                                                                }}>
                                                                                    {repartidor.nombre?.charAt(0).toUpperCase()}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <div className="fw-medium" style={{ color: '#113d69' }}>{repartidor.nombre}</div>
                                                                            <small className="text-muted">ID: {repartidor.idUsuarios}</small>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td style={{ color: '#113d69' }}>{repartidor.email}</td>
                                                                <td style={{ color: '#113d69' }}>
                                                                    {repartidor.telefono || <span className="text-muted fst-italic">No especificado</span>}
                                                                </td>
                                                                <td>
                                                                    <EstadoBadge estado={repartidor.estado} />
                                                                </td>
                                                                <td>
                                                                    <div style={{ color: '#113d69' }}>{formatearFecha(repartidor.creadoEn)}</div>
                                                                </td>
                                                                <td>
                                                                    <div style={{ minWidth: '140px' }}>
                                                                        <AccionButton
                                                                            estado={repartidor.estado}
                                                                            onActivarDesactivar={() => cambiarEstadoRepartidor(repartidor.idUsuarios, repartidor.estado)}
                                                                            onSuspender={() => suspenderRepartidor(repartidor.idUsuarios)}
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
                                            repartidoresFiltrados={repartidoresFiltrados}
                                            indicePrimerElemento={indicePrimerElemento}
                                            indiceUltimoElemento={indiceUltimoElemento}
                                            busqueda={busqueda}
                                            repartidoresTotales={repartidores.length}
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

export default AdminRepartidores;