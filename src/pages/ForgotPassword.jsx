import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import LogoDomiFlex from './Imagenes/BANNER COMPLETO CON TRANSPARENCIA.png';
import EscenaHomeBase from './Imagenes/HomeBaseImage.png';
import FondoPantalla from './Imagenes/AutoresContacto.png';
import { ArrowLeft, Mail } from "lucide-react";
import NavbarCustom from '../components/Navbar';
import { API_URL } from '../config';

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const respuesta = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            const data = await respuesta.json();
            
            if (respuesta.ok) {
                setMessage(data.mensaje || "Si el correo está registrado, recibirás un enlace de recuperación.");
            } else {
                setError(data.error || "Hubo un problema al procesar tu solicitud.");
            }
        } catch (error) {
            setError("Error en la conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            backgroundImage: `url(${FondoPantalla})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <NavbarCustom />

            <Container className="d-flex flex-column justify-content-center flex-grow-1 py-4">
                <Row className="justify-content-center align-items-center g-0">
                    
                    <Col md={7} lg={6} className="d-none d-md-flex justify-content-center p-4">
                        <img
                            src={EscenaHomeBase}
                            alt="DomiFlex Recovery"
                            style={{ 
                                width: '100%', 
                                maxWidth: '550px', 
                                height: 'auto', 
                                filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.2))' 
                            }}
                        />
                    </Col>

                    <Col xs={12} md={5} lg={5} xl={4}>
                        <Card className="shadow-lg border-0" style={{ borderRadius: '25px', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                            <Card.Body className="p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <img src={LogoDomiFlex} alt="Logo" style={{ width: '150px' }} />
                                    <h4 className="mt-3 fw-bold" style={{ color: '#333' }}>Recuperar Contraseña</h4>
                                    <p className="text-muted small">Ingresa tu correo para recibir las instrucciones</p>
                                </div>

                                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
                                {message && <Alert variant="success" className="py-2 small">{message}</Alert>}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-4">
                                        <div className="position-relative">
                                            <Mail className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                                            <Form.Control
                                                type="email" 
                                                placeholder="Correo electrónico" 
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)} 
                                                required
                                                disabled={loading || !!message}
                                                style={{ 
                                                    borderRadius: '12px', 
                                                    paddingLeft: '45px', 
                                                    backgroundColor: '#f8fafb', 
                                                    border: '1px solid #eee',
                                                    paddingTop: '0.8rem',
                                                    paddingBottom: '0.8rem'
                                                }}
                                            />
                                        </div>
                                    </Form.Group>

                                    <Button 
                                        type="submit" 
                                        className="w-100 py-3 border-0 mb-3" 
                                        style={{ 
                                            background: loading ? '#6c757d' : '#62d8d9',
                                            borderRadius: '12px', 
                                            fontWeight: 'bold', 
                                            fontSize: '1rem',
                                            transition: 'all 0.3s ease',
                                            opacity: (loading || !!message) ? 0.6 : 1,
                                        }} 
                                        disabled={loading || !!message}
                                    >
                                        {loading ? 'Enviando...' : 'Enviar enlace'}
                                    </Button>

                                    <div className="text-center mt-3">
                                        <Link to="/login" className="text-decoration-none small fw-bold" style={{ color: '#62d8d9' }}>
                                            <ArrowLeft className="me-2" />
                                            Volver al inicio de sesión
                                        </Link>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default ForgotPassword;
