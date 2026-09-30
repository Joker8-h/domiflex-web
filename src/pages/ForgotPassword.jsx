import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import RapitipicaLogo from '../components/common/RapitipicaLogo';
import EscenaHomeBase from './Imagenes/HomeBaseImage.png';
import { ArrowLeft, Mail, ChevronRight } from "lucide-react";
import NavbarCustom from '../components/Navbar';
import { API_URL } from '../config';
import tokens from '../design/tokens';
import theme from '../styles/theme';

export default function ForgotPassword() {
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
            backgroundColor: tokens.colors.bgPrimary,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            color: tokens.colors.textPrimary,
            fontFamily: tokens.typography.fontFamily,
        }}>
            <NavbarCustom />

            <Container className="d-flex flex-column justify-content-center flex-grow-1 py-5">
                <Row className="justify-content-center align-items-center g-0">
                    
                    <Col md={7} lg={6} className="d-none d-md-flex justify-content-center p-4">
                        <img
                            src={EscenaHomeBase}
                            alt="Rapitipica Recovery"
                            style={{ 
                                width: '100%', 
                                maxWidth: '500px', 
                                height: 'auto', 
                                filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.5))' 
                            }}
                        />
                    </Col>

                    <Col xs={12} md={5} lg={5} xl={4}>
                        <Card style={{
                            backgroundColor: tokens.colors.bgCard,
                            border: `1px solid ${tokens.colors.border}`,
                            borderRadius: tokens.borderRadius.lg,
                            boxShadow: tokens.shadows.card,
                        }}>
                            <Card.Body className="p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <RapitipicaLogo size={36} showTagline={true} />
                                    <h2 className="mt-3 fw-bold" style={{ color: tokens.colors.textPrimary, fontSize: tokens.fontSize.xl }}>
                                        Recuperar Contraseña
                                    </h2>
                                    <p style={{ color: tokens.colors.textSecondary, fontSize: tokens.fontSize.xs }}>
                                        Ingresa tu correo registrado para recibir las instrucciones de acceso.
                                    </p>
                                </div>

                                {error && (
                                    <div role="alert" style={{
                                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                        border: '1px solid #EF4444',
                                        borderRadius: tokens.borderRadius.sm,
                                        padding: '10px 14px',
                                        color: '#FCA5A5',
                                        fontSize: tokens.fontSize.xs,
                                        marginBottom: '16px',
                                    }}>
                                        {error}
                                    </div>
                                )}

                                {message && (
                                    <div role="status" style={{
                                        backgroundColor: 'rgba(0, 229, 118, 0.15)',
                                        border: `1px solid ${tokens.colors.accent}`,
                                        borderRadius: tokens.borderRadius.sm,
                                        padding: '10px 14px',
                                        color: tokens.colors.accent,
                                        fontSize: tokens.fontSize.xs,
                                        marginBottom: '16px',
                                    }}>
                                        {message}
                                    </div>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-4">
                                        <label htmlFor="forgot-email" style={{
                                            display: 'block',
                                            fontSize: tokens.fontSize.xs,
                                            fontWeight: 600,
                                            color: tokens.colors.textSecondary,
                                            marginBottom: '6px'
                                        }}>
                                            Correo electrónico
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail style={{
                                                position: 'absolute',
                                                left: '14px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: tokens.colors.textMuted,
                                                zIndex: 1,
                                            }} size={18} />
                                            <input
                                                id="forgot-email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="ejemplo@correo.com"
                                                required
                                                style={{
                                                    width: '100%',
                                                    backgroundColor: tokens.colors.bgPrimary,
                                                    border: `1px solid ${tokens.colors.border}`,
                                                    borderRadius: tokens.borderRadius.sm,
                                                    padding: '12px 14px 12px 42px',
                                                    color: tokens.colors.textPrimary,
                                                    fontSize: tokens.fontSize.sm,
                                                    outline: 'none',
                                                }}
                                            />
                                        </div>
                                    </Form.Group>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            backgroundColor: tokens.colors.accent,
                                            color: '#0B1F44',
                                            border: 'none',
                                            borderRadius: tokens.borderRadius.full,
                                            fontWeight: tokens.fontWeight.bold,
                                            fontSize: tokens.fontSize.sm,
                                            cursor: 'pointer',
                                            boxShadow: tokens.shadows.glow,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                        }}
                                    >
                                        {loading ? "Enviando instrucciones…" : "Enviar instrucciones"}
                                        <ChevronRight size={18} />
                                    </button>

                                    <div className="text-center mt-4">
                                        <Link to="/login" style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            color: tokens.colors.textSecondary,
                                            fontSize: tokens.fontSize.xs,
                                            textDecoration: 'none',
                                            transition: 'color 0.2s ease',
                                        }}>
                                            <ArrowLeft size={14} /> Volver a iniciar sesión
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
