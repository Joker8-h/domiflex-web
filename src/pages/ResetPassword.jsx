import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Container, Row, Col, Card, Form } from "react-bootstrap";
import RapitipicaLogo from '../components/common/RapitipicaLogo';
import EscenaHomeBase from './Imagenes/HomeBaseImage.png';
import { EyeOff, Lock, Eye, CheckCircle2, ChevronRight, ArrowLeft } from "lucide-react";
import NavbarCustom from '../components/Navbar';
import { API_URL } from '../config';
import tokens from '../design/tokens';

export default function ResetPassword() {
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
                setTimeout(() => navigate("/login"), 2500);
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
                            alt="Rapitipica Reset"
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
                                        Nueva Contraseña
                                    </h2>
                                    <p style={{ color: tokens.colors.textSecondary, fontSize: tokens.fontSize.xs }}>
                                        Ingresa y confirma tu nueva contraseña de acceso.
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

                                {success && (
                                    <div role="status" style={{
                                        backgroundColor: 'rgba(0, 229, 118, 0.15)',
                                        border: `1px solid ${tokens.colors.accent}`,
                                        borderRadius: tokens.borderRadius.sm,
                                        padding: '10px 14px',
                                        color: tokens.colors.accent,
                                        fontSize: tokens.fontSize.xs,
                                        marginBottom: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}>
                                        <CheckCircle2 size={18} />
                                        <span>¡Contraseña actualizada! Redirigiendo al login...</span>
                                    </div>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <label htmlFor="reset-pass" style={{
                                            display: 'block',
                                            fontSize: tokens.fontSize.xs,
                                            fontWeight: 600,
                                            color: tokens.colors.textSecondary,
                                            marginBottom: '6px'
                                        }}>
                                            Nueva Contraseña
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock style={{
                                                position: 'absolute',
                                                left: '14px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: tokens.colors.textMuted,
                                                zIndex: 1,
                                            }} size={18} />
                                            <input
                                                id="reset-pass"
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                style={{
                                                    width: '100%',
                                                    backgroundColor: tokens.colors.bgPrimary,
                                                    border: `1px solid ${tokens.colors.border}`,
                                                    borderRadius: tokens.borderRadius.sm,
                                                    padding: '12px 42px 12px 42px',
                                                    color: tokens.colors.textPrimary,
                                                    fontSize: tokens.fontSize.sm,
                                                    outline: 'none',
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none',
                                                    border: 'none',
                                                    color: tokens.colors.textMuted,
                                                    cursor: 'pointer',
                                                    padding: 0,
                                                }}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <label htmlFor="reset-confirm" style={{
                                            display: 'block',
                                            fontSize: tokens.fontSize.xs,
                                            fontWeight: 600,
                                            color: tokens.colors.textSecondary,
                                            marginBottom: '6px'
                                        }}>
                                            Confirmar Contraseña
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock style={{
                                                position: 'absolute',
                                                left: '14px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: tokens.colors.textMuted,
                                                zIndex: 1,
                                            }} size={18} />
                                            <input
                                                id="reset-confirm"
                                                type={showPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
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
                                        disabled={loading || success}
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
                                        {loading ? "Actualizando…" : "Restablecer Contraseña"}
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
