import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import LogoDomiFlex from './Imagenes/BANNER COMPLETO CON TRANSPARENCIA.png';
import EscenaHomeBase from './Imagenes/HomeBaseImage.png';
import FondoPantalla from './Imagenes/AutoresContacto.png';
import { EyeOff, Lock, Eye } from "lucide-react";
import NavbarCustom from '../components/Navbar';
import { API_URL } from '../config';

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const validatePassword = (pass) => {
        const errors = [];
        if (pass.length < 8) errors.push("mínimo 8 caracteres");
        if (!/[A-Z]/.test(pass)) errors.push("una mayúscula");
        if (!/[a-z]/.test(pass)) errors.push("una minúscula");
        if (!/[0-9]/.test(pass)) errors.push("un número");
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) errors.push("un carácter especial");
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        const passErrors = validatePassword(password);
        if (passErrors.length > 0) {
            setError(`La contraseña debe tener: ${passErrors.join(", ")}.`);
            return;
        }

        setLoading(true);

        try {
            const respuesta = await fetch(`${API_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password })
            });
            const data = await respuesta.json();
            
            if (respuesta.ok) {
                setSuccess(true);
                setTimeout(() => navigate("/login"), 3000);
            } else {
                setError(data.error || "El enlace es inválido o ha expirado.");
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
                            alt="DomiFlex Reset"
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
                                    <h4 className="mt-3 fw-bold" style={{ color: '#333' }}>Nueva Contraseña</h4>
                                    <p className="text-muted small">Ingresa tu nueva contraseña para acceder</p>
                                </div>

                                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
                                {success && (
                                    <Alert variant="success" className="py-2 small">
                                        Contraseña actualizada. Redirigiendo al login...
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <div className="position-relative">
                                            <Lock className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Nueva contraseña" 
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)} 
                                                required
                                                disabled={loading || success}
                                                style={{ 
                                                    borderRadius: '12px', 
                                                    paddingLeft: '45px', 
                                                    backgroundColor: '#f8fafb', 
                                                    border: '1px solid #eee',
                                                    paddingTop: '0.8rem',
                                                    paddingBottom: '0.8rem'
                                                }}
                                            />
                                            <span 
                                                className="position-absolute end-0 top-50 translate-middle-y me-3" 
                                                style={{ cursor: 'pointer' }} 
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff color="#8899a6" /> : <Eye color="#8899a6" />}
                                            </span>
                                        </div>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <div className="position-relative">
                                            <Lock className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Confirmar contraseña" 
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                                required
                                                disabled={loading || success}
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
                                        className="w-100 py-3 border-0" 
                                        style={{ 
                                            background: loading ? '#6c757d' : '#62d8d9',
                                            borderRadius: '12px', 
                                            fontWeight: 'bold', 
                                            fontSize: '1rem',
                                            transition: 'all 0.3s ease',
                                            opacity: (loading || success) ? 0.6 : 1,
                                        }} 
                                        disabled={loading || success}
                                    >
                                        {loading ? 'Procesando...' : 'Restablecer Contraseña'}
                                    </Button>

                                    {!success && (
                                        <div className="text-center mt-4">
                                            <Link to="/login" className="text-decoration-none small text-muted">
                                                Cancelar y volver
                                            </Link>
                                        </div>
                                    )}
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default ResetPassword;
