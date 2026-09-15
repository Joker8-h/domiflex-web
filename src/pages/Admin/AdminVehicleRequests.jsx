import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { API_URL } from "../../config";
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Spinner, Modal, Form } from "react-bootstrap";
import { FaCheck, FaTimes, FaUser, FaExchangeAlt } from "react-icons/fa";
import Navbar from "../../components/Navbar";

const AdminVehicleRequests = () => {
    const { token } = useAuth();
    const { socket } = useSocket();
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [procesando, setProcesando] = useState(null);
    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [observaciones, setObservaciones] = useState("");

    const brandColor = "#56bca7";

    const traerSolicitudes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/vehiculos/solicitudes/pendientes`, {
                headers: { "Authorization": "Bearer " + token }
            });

            if (!response.ok) throw new Error("Error al cargar solicitudes");
            const data = await response.json();
            setSolicitudes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        traerSolicitudes();
    }, [traerSolicitudes]);

    const handleProcesar = async (id, aprobado) => {
        try {
            setProcesando(id);
            const response = await fetch(`${API_URL}/vehiculos/solicitudes/${id}/procesar`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ aprobado, observaciones })
            });

            if (response.ok) {
                if (socket) {
                    socket.emit("vehicle_change_processed", { id, aprobado });
                }
                setShowRevisionModal(false);
                setObservaciones("");
                traerSolicitudes();
            } else {
                const err = await response.json();
                alert(err.error || "Error al procesar solicitud");
            }
        } catch (err) {
            alert("Error de conexión");
        } finally {
            setProcesando(null);
        }
    };

    const handleCloseRevisionModal = () => {
        if (!procesando) {
            setShowRevisionModal(false);
        }
    };

    const handleRevisionModalExited = () => {
        setSelectedSolicitud(null);
        setObservaciones("");
    };

    const openRevision = (solicitud) => {
        setSelectedSolicitud(solicitud);
        setShowRevisionModal(true);
    };

    return (
        <div style={{ position: 'relative' }}>
            <Container className="py-5" style={{ position: 'relative', zIndex: 1 }}>
                <Row className="mb-4 align-items-center">
                    <Col>
                        <h2 className="fw-bold" style={{ color: '#333' }}>Solicitudes de Cambio de Vehículo</h2>
                        <p className="text-muted">Revisa y aprueba las modificaciones de vehículos de los repartidores.</p>
                    </Col>
                    <Col xs="auto">
                        <Button
                            variant="outline-primary"
                            onClick={traerSolicitudes}
                            className="rounded-pill border-0 shadow-sm"
                            style={{ backgroundColor: 'white', color: brandColor }}
                        >
                            Actualizar Lista
                        </Button>
                    </Col>
                </Row>

                {error && <Alert variant="danger">{error}</Alert>}

                <Card className="border-0 shadow-sm" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                    <Card.Body className="p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" style={{ color: brandColor }} />
                                <p className="mt-2 text-muted">Buscando solicitudes pendientes...</p>
                            </div>
                        ) : solicitudes.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <FaCheck size={48} className="mb-3 opacity-25" />
                                <p>No hay solicitudes pendientes de revisión.</p>
                            </div>
                        ) : (
                            <Table responsive hover className="mb-0 align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="px-4 py-3 border-0">Repartidor</th>
                                        <th className="py-3 border-0">Vehículo</th>
                                        <th className="py-3 border-0">Cambios Solicitados</th>
                                        <th className="py-3 border-0">Fecha</th>
                                        <th className="px-4 py-3 border-0 text-end">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {solicitudes.map(s => (
                                        <tr key={s.idSolicitud}>
                                            <td className="px-4 py-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                                                        <FaUser size={14} color={brandColor} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold">{s.vehiculo?.usuario?.nombre || 'N/A'}</div>
                                                        <div className="small text-muted">{s.vehiculo?.usuario?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <div className="fw-semibold">{s.vehiculo?.marca} {s.vehiculo?.modelo}</div>
                                                <div className="small text-muted">Placa: {s.vehiculo?.placa}</div>
                                            </td>
                                            <td className="py-3">
                                                <div className="d-flex flex-wrap gap-1">
                                                    {s.marcaNueva && s.marcaNueva !== s.vehiculo.marca && <Badge bg="info" className="fw-normal">Marca</Badge>}
                                                    {s.modeloNuevo && s.modeloNuevo !== s.vehiculo.modelo && <Badge bg="info" className="fw-normal">Modelo</Badge>}
                                                    {s.capacidadNueva && s.capacidadNueva !== s.vehiculo.capacidad && <Badge bg="info" className="fw-normal">Capacidad</Badge>}
                                                </div>
                                            </td>
                                            <td className="py-3 small text-muted">
                                                {new Date(s.fechaSolicitud).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-end">
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    className="rounded-pill px-3 border-0"
                                                    style={{ backgroundColor: brandColor }}
                                                    onClick={() => openRevision(s)}
                                                >
                                                    Revisar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>
            </Container>

            {/* Modal de Revisión Detallada */}
            <Modal
                show={showRevisionModal}
                onHide={handleCloseRevisionModal}
                onExited={handleRevisionModalExited}
                size="lg"
                centered
            >
                <Modal.Header closeButton={!procesando} className="border-0">
                    <Modal.Title className="fw-bold">Detalle de Modificación</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedSolicitud && (
                        <>
                            <Row className="mb-4">
                                <Col md={6}>
                                    <h6 className="text-muted small fw-bold mb-3">DATOS ACTUALES</h6>
                                    <div className="p-3 bg-light rounded-3">
                                        <p className="mb-1"><strong>Marca:</strong> {selectedSolicitud.vehiculo.marca}</p>
                                        <p className="mb-1"><strong>Modelo:</strong> {selectedSolicitud.vehiculo.modelo}</p>
                                        <p className="mb-0"><strong>Capacidad:</strong> {selectedSolicitud.vehiculo.capacidad} kg</p>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <h6 className="text-primary small fw-bold mb-3">DATOS PROPUESTOS</h6>
                                    <div className="p-3 bg-light rounded-3 border-start border-primary border-4 shadow-sm" style={{ backgroundColor: '#F0F9FF' }}>
                                        <p className="mb-1">
                                            <strong>Marca:</strong> {selectedSolicitud.marcaNueva || selectedSolicitud.vehiculo.marca}
                                            {selectedSolicitud.marcaNueva && selectedSolicitud.marcaNueva !== selectedSolicitud.vehiculo.marca && <FaExchangeAlt className="ms-2 text-primary" size={12} />}
                                        </p>
                                        <p className="mb-1">
                                            <strong>Modelo:</strong> {selectedSolicitud.modeloNuevo || selectedSolicitud.vehiculo.modelo}
                                            {selectedSolicitud.modeloNuevo && selectedSolicitud.modeloNuevo !== selectedSolicitud.vehiculo.modelo && <FaExchangeAlt className="ms-2 text-primary" size={12} />}
                                        </p>
                                        <p className="mb-0">
                                            <strong>Capacidad:</strong> {selectedSolicitud.capacidadNueva || selectedSolicitud.vehiculo.capacidad} kg
                                            {selectedSolicitud.capacidadNueva && selectedSolicitud.capacidadNueva !== selectedSolicitud.vehiculo.capacidad && <FaExchangeAlt className="ms-2 text-primary" size={12} />}
                                        </p>
                                    </div>
                                </Col>
                            </Row>

                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold text-muted">Observaciones (Opcional)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Escribe el motivo de la aprobación o rechazo..."
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                    disabled={procesando}
                                />
                            </Form.Group>

                            <div className="d-flex gap-3 mt-4">
                                <Button
                                    variant="danger"
                                    className="w-100 py-2 rounded-pill border-0"
                                    onClick={() => handleProcesar(selectedSolicitud.idSolicitud, false)}
                                    disabled={procesando}
                                >
                                    {procesando === selectedSolicitud.idSolicitud ? <Spinner animation="border" size="sm" /> : <><FaTimes className="me-2" /> Rechazar</>}
                                </Button>
                                <Button
                                    className="w-100 py-2 rounded-pill border-0"
                                    style={{ backgroundColor: brandColor, color: 'white' }}
                                    onClick={() => handleProcesar(selectedSolicitud.idSolicitud, true)}
                                    disabled={procesando}
                                >
                                    {procesando === selectedSolicitud.idSolicitud ? <Spinner animation="border" size="sm" /> : <><FaCheck className="me-2" /> Aprobar y Aplicar</>}
                                </Button>
                            </div>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AdminVehicleRequests;
