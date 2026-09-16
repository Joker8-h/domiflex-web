import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Container, Row, Col, Card, Form, Button, Alert, Modal } from "react-bootstrap";
import LogoDomiFlex from './Imagenes/BANNER COMPLETO CON TRANSPARENCIA.png';
import EscenaHomeBase from './Imagenes/HomeBaseImage.png';
import FondoPantalla from './Imagenes/AutoresContacto.png';
import { Mail, EyeOff, QrCode, Camera, Lock, Eye } from "lucide-react";
import NavbarCustom from '../components/Navbar';
import QRScanner from '../components/QRScanner';
import { API_URL } from '../config';
import theme from '../styles/theme';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showQRScanner, setShowQRScanner] = useState(false);

    const [showFacialModal, setShowFacialModal] = useState(false);
    const [fotoBase64, setFotoBase64] = useState("");
    const [fotoPreview, setFotoPreview] = useState("");
    const [verificando, setVerificando] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const navigate = useNavigate();
    const { login, token, usuario } = useAuth();

    const ROLES = { ADMIN: "ADMIN", REPARTIDOR: "REPARTIDOR", CLIENTE: "CLIENTE", COMERCIO: "COMERCIO" };

    useEffect(() => {
        const rolId = Number(usuario?.idRol || usuario?.rol?.idRol || usuario?.rol?.id || NaN);
        const rolNombre = (typeof usuario?.rol === 'string'
            ? usuario.rol
            : (usuario?.rol?.nombre || "")
        ).toUpperCase();

        if (rolNombre === ROLES.ADMIN || rolId === 1) {
            navigate("/dashboard/home");
        } else if (rolNombre === ROLES.REPARTIDOR || rolId === 2) {
            navigate("/repartidor-home");
        } else if (rolNombre === ROLES.CLIENTE || rolNombre === ROLES.COMERCIO || rolId === 3 || rolId === 4) {
            navigate("/cliente-home");
        }
    }, [token, usuario, navigate]);

    const iniciarCamara = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
            });
            setStream(mediaStream);
            setCameraActive(true);
            setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = mediaStream; }, 100);
        } catch (err) { setError('No se pudo acceder a la cámara.'); }
    };

    const detenerCamara = () => {
        if (stream) { stream.getTracks().forEach(track => track.stop()); setStream(null); }
        setCameraActive(false);
    };

    const tomarFoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            setFotoBase64(canvas.toDataURL('image/jpeg', 0.9));
            setFotoPreview(canvas.toDataURL('image/jpeg', 0.9));
            detenerCamara();
        }
    };

    const abrirFacialModal = () => {
        setFotoBase64(""); setFotoPreview(""); setError("");
        setShowFacialModal(true);
        setTimeout(() => iniciarCamara(), 500);
    };

    const cerrarFacialModal = () => { detenerCamara(); setShowFacialModal(false); };

    const enviarLoginFacial = async () => {
        if (!fotoBase64) return;
        setVerificando(true);
        try {
            const respuesta = await fetch(`${API_URL}/auth/login`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: fotoBase64 })
            });
            const data = await respuesta.json();
            if (respuesta.ok) { login(data.token, data.usuario); cerrarFacialModal(); }
            else { setError(data.error || 'Rostro no reconocido'); }
        } catch (error) { setError('Error en la conexión'); } finally { setVerificando(false); }
    };

    async function guardar(e) {
        e.preventDefault(); setError(""); setLoading(true);
        try {
            const respuesta = await fetch(`${API_URL}/auth/login`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await respuesta.json();
            if (respuesta.ok) login(data.token, data.usuario);
            else setError(data.message || 'Error al iniciar sesión');
        } catch (error) { setError('Error en la conexión'); } finally { setLoading(false); }
    }

    const handleQRScan = async (qrData) => {
        try {
            const datos = JSON.parse(qrData);
            if (datos.tipo === 'login_token' && datos.token) login(datos.token, { email: datos.email, idRol: datos.idRol });
        } catch (e) { setError("QR no válido"); }
    };

    return (
        <div style={{
            backgroundColor: theme.colors.bgPrimary,
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
                            alt="DomiFlex Home"
                            style={{
                                width: '100%',
                                maxWidth: '550px',
                                height: 'auto',
                                filter: 'drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.4))'
                            }}
                        />
                    </Col>

                    <Col xs={12} md={5} lg={5} xl={4}>
                        <Card style={{
                            backgroundColor: theme.colors.bgCard,
                            borderRadius: theme.borderRadius.lg,
                            border: `1px solid ${theme.colors.border}`,
                            boxShadow: theme.shadows.card
                        }}>
                            <Card.Body className="p-4 p-md-5">

                                <div className="text-center mb-4">
                                    <img src={LogoDomiFlex} alt="Logo" style={{ width: '150px' }} />
                                </div>

                                <div className="d-flex gap-2 mb-4">
                                    <Button
                                        onClick={() => setShowQRScanner(true)}
                                        style={{
                                            flex: 1,
                                            backgroundColor: 'transparent',
                                            color: theme.colors.textSecondary,
                                            border: `1px solid ${theme.colors.border}`,
                                            borderRadius: theme.borderRadius.md,
                                            padding: '0.75rem 0',
                                            fontWeight: theme.fontWeight.semibold,
                                            fontSize: theme.fontSize.sm,
                                            transition: theme.transitions.normal,
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.borderColor = theme.colors.accent;
                                            e.target.style.color = theme.colors.accent;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.borderColor = theme.colors.border;
                                            e.target.style.color = theme.colors.textSecondary;
                                        }}
                                    >
                                        <QrCode className="me-1" /> QR
                                    </Button>
                                    <Button
                                        onClick={abrirFacialModal}
                                        style={{
                                            flex: 1,
                                            backgroundColor: 'transparent',
                                            color: theme.colors.textSecondary,
                                            border: `1px solid ${theme.colors.border}`,
                                            borderRadius: theme.borderRadius.md,
                                            padding: '0.75rem 0',
                                            fontWeight: theme.fontWeight.semibold,
                                            fontSize: theme.fontSize.sm,
                                            transition: theme.transitions.normal,
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.borderColor = theme.colors.accent;
                                            e.target.style.color = theme.colors.accent;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.borderColor = theme.colors.border;
                                            e.target.style.color = theme.colors.textSecondary;
                                        }}
                                    >
                                        <Camera className="me-1" /> Facial
                                    </Button>
                                </div>

                                {error && (
                                    <div style={{
                                        backgroundColor: 'rgba(255, 82, 82, 0.1)',
                                        color: theme.colors.danger,
                                        border: `1px solid ${theme.colors.danger}`,
                                        borderRadius: theme.borderRadius.sm,
                                        padding: '0.75rem 1rem',
                                        fontSize: theme.fontSize.sm,
                                        marginBottom: '1rem'
                                    }}>
                                        {error}
                                    </div>
                                )}

                                <Form onSubmit={guardar}>
                                    <Form.Group className="mb-3">
                                        <div style={{ position: 'relative' }}>
                                            <Mail style={{
                                                position: 'absolute',
                                                left: '14px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: theme.colors.textMuted,
                                                zIndex: 1
                                            }} />
                                            <input
                                                type="email"
                                                placeholder="Correo electrónico"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                style={{
                                                    backgroundColor: theme.colors.bgInput,
                                                    color: theme.colors.textPrimary,
                                                    border: `1px solid ${theme.colors.border}`,
                                                    borderRadius: theme.borderRadius.sm,
                                                    padding: '0.75rem 0.75rem 0.75rem 42px',
                                                    fontSize: theme.fontSize.md,
                                                    width: '100%',
                                                    outline: 'none',
                                                    transition: theme.transitions.fast,
                                                    fontFamily: "'Inter', sans-serif"
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = theme.colors.accent;
                                                    e.target.style.boxShadow = theme.shadows.input;
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = theme.colors.border;
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        </div>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <div style={{ position: 'relative' }}>
                                            <Lock style={{
                                                position: 'absolute',
                                                left: '14px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: theme.colors.textMuted,
                                                zIndex: 1
                                            }} />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Contraseña"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                style={{
                                                    backgroundColor: theme.colors.bgInput,
                                                    color: theme.colors.textPrimary,
                                                    border: `1px solid ${theme.colors.border}`,
                                                    borderRadius: theme.borderRadius.sm,
                                                    padding: '0.75rem 2.5rem 0.75rem 42px',
                                                    fontSize: theme.fontSize.md,
                                                    width: '100%',
                                                    outline: 'none',
                                                    transition: theme.transitions.fast,
                                                    fontFamily: "'Inter', sans-serif"
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = theme.colors.accent;
                                                    e.target.style.boxShadow = theme.shadows.input;
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = theme.colors.border;
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    right: '14px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    cursor: 'pointer',
                                                    color: theme.colors.textMuted
                                                }}
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff /> : <Eye />}
                                            </span>
                                        </div>
                                    </Form.Group>

                                    <div className="d-flex justify-content-between mb-4" style={{ fontSize: theme.fontSize.sm }}>
                                        <Form.Check
                                            type="checkbox"
                                            label="Recordarme"
                                            style={{ color: theme.colors.textSecondary }}
                                        />
                                        <Link
                                            to="/forgot-password"
                                            title="Recuperar contraseña"
                                            style={{
                                                color: theme.colors.accent,
                                                textDecoration: 'none',
                                                fontWeight: theme.fontWeight.medium
                                            }}
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            backgroundColor: loading ? theme.colors.textMuted : theme.colors.accent,
                                            color: '#000',
                                            border: 'none',
                                            borderRadius: theme.borderRadius.xl,
                                            padding: '0.875rem 0',
                                            width: '100%',
                                            fontWeight: theme.fontWeight.bold,
                                            fontSize: theme.fontSize.md,
                                            transition: theme.transitions.fast,
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            opacity: loading ? 0.7 : 1,
                                            fontFamily: "'Inter', sans-serif"
                                        }}
                                    >
                                        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                                    </button>
                                </Form>

                                <p className="text-center mt-4 mb-0" style={{
                                    fontSize: theme.fontSize.sm,
                                    color: theme.colors.textSecondary
                                }}>
                                    ¿No tienes una cuenta?{' '}
                                    <Link
                                        to="/register"
                                        style={{
                                            color: theme.colors.accent,
                                            textDecoration: 'none',
                                            fontWeight: theme.fontWeight.bold
                                        }}
                                    >
                                        Regístrate
                                    </Link>
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <Modal
                show={showFacialModal}
                onHide={cerrarFacialModal}
                centered
                size="lg"
                contentClassName="dark-modal"
            >
                <style>{`
                    .dark-modal {
                        background-color: ${theme.colors.bgCard} !important;
                        border: 1px solid ${theme.colors.border} !important;
                        border-radius: ${theme.borderRadius.lg} !important;
                    }
                    .dark-modal .modal-header {
                        border-bottom: 1px solid ${theme.colors.border} !important;
                    }
                    .dark-modal .modal-title {
                        color: ${theme.colors.textPrimary} !important;
                    }
                    .dark-modal .btn-close {
                        filter: invert(1) !important;
                    }
                `}</style>
                <Modal.Header closeButton style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                    <Modal.Title style={{
                        fontWeight: theme.fontWeight.bold,
                        color: theme.colors.textPrimary
                    }}>
                        Login Facial
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <div style={{
                        position: 'relative',
                        backgroundColor: '#000',
                        height: '400px',
                        borderRadius: theme.borderRadius.lg,
                        overflow: 'hidden'
                    }}>
                        <video ref={videoRef} autoPlay playsInline style={{ width: '100%' }} />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>
                    {!fotoPreview ?
                        <button
                            onClick={tomarFoto}
                            style={{
                                marginTop: '1rem',
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: theme.colors.accent,
                                color: '#000',
                                border: 'none',
                                borderRadius: theme.borderRadius.md,
                                fontWeight: theme.fontWeight.bold,
                                fontSize: theme.fontSize.md,
                                cursor: 'pointer',
                                transition: theme.transitions.fast
                            }}
                        >
                            Capturar
                        </button>
                        :
                        <button
                            onClick={enviarLoginFacial}
                            disabled={verificando}
                            style={{
                                marginTop: '1rem',
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: verificando ? theme.colors.textMuted : theme.colors.accent,
                                color: '#000',
                                border: 'none',
                                borderRadius: theme.borderRadius.md,
                                fontWeight: theme.fontWeight.bold,
                                fontSize: theme.fontSize.md,
                                cursor: verificando ? 'not-allowed' : 'pointer',
                                transition: theme.transitions.fast,
                                opacity: verificando ? 0.7 : 1
                            }}
                        >
                            {verificando ? 'Verificando...' : 'Confirmar e Iniciar'}
                        </button>
                    }
                </Modal.Body>
            </Modal>

            <QRScanner show={showQRScanner} onHide={() => setShowQRScanner(false)} onScanSuccess={handleQRScan} />
        </div>
    );
}

export default Login;