import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Container, Row, Col, Card, Form, Button, Alert, Modal } from "react-bootstrap";
import LogoDomiFlex from './Imagenes/BANNER COMPLETO CON TRANSPARENCIA.png';
import EscenaHomeBase from './Imagenes/HomeBaseImage.png';
import FondoPantalla from './Imagenes/AutoresContacto.png';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaQrcode, FaCamera } from "react-icons/fa";
import NavbarCustom from '../components/Navbar';
import QRScanner from '../components/QRScanner';
import { API_URL } from '../config';

const customStyles = `
  .custom-tomar-foto-btn {
    border-radius: 12px !important;
    border-color: #62d8d9 !important;
    color: #62d8d9 !important;
    font-weight: 500 !important;
    transition: all 0.3s ease !important;
    width: 100% !important;
    padding: 1rem 0 !important;
    margin-bottom: 1rem !important;
  }
  
  .custom-tomar-foto-btn:hover {
    background-color: #62d8d9 !important;
    border-color: #62d8d9 !important;
    color: white !important;
  }
  
  .custom-tomar-foto-btn:disabled {
    opacity: 0.6 !important;
    cursor: not-allowed !important;
  }
`;

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
        // Obtenemos tanto el ID como el nombre del rol (normalizado)
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
            backgroundImage: `url(${FondoPantalla})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <style>{customStyles}</style>
            
            <NavbarCustom />

            <Container className="d-flex flex-column justify-content-center flex-grow-1 py-4">
                <Row className="justify-content-center align-items-center g-0">

                    <Col md={7} lg={6} className="d-none d-md-flex justify-content-center p-4">
                        <img
                            src={EscenaHomeBase}
                            alt="DomiFlex Home"
                            style={{ width: '100%', maxWidth: '550px', height: 'auto', filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.2))' }}
                        />
                    </Col>

                    <Col xs={12} md={5} lg={5} xl={4}>
                        <Card className="shadow-lg border-0" style={{ borderRadius: '25px', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                            <Card.Body className="p-4 p-md-5">

                                <div className="text-center mb-4">
                                    <img src={LogoDomiFlex} alt="Logo" style={{ width: '150px' }} />
                                </div>

                                <div className="d-flex gap-2 mb-4">
                                    <Button 
                                        onClick={() => setShowQRScanner(true)} 
                                        variant="outline-primary" 
                                        className="w-100 fw-bold custom-tomar-foto-btn"
                                    >
                                        <FaQrcode className="me-1" /> QR
                                    </Button>
                                    <Button 
                                        onClick={abrirFacialModal} 
                                        variant="outline-success" 
                                        className="w-100 fw-bold custom-tomar-foto-btn"
                                    >
                                        <FaCamera className="me-1" /> Facial
                                    </Button>
                                </div>

                                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

                                <Form onSubmit={guardar}>
                                    <Form.Group className="mb-3">
                                        <div className="position-relative">
                                            <FaEnvelope className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                                            <Form.Control
                                                type="email" placeholder="Correo electrónico" value={email}
                                                onChange={(e) => setEmail(e.target.value)} required
                                                style={{ borderRadius: '12px', paddingLeft: '45px', backgroundColor: '#f8fafb', border: '1px solid #eee' }}
                                            />
                                        </div>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <div className="position-relative">
                                            <FaLock className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Contraseña" value={password}
                                                onChange={(e) => setPassword(e.target.value)} required
                                                style={{ borderRadius: '12px', paddingLeft: '45px', backgroundColor: '#f8fafb', border: '1px solid #eee' }}
                                            />
                                            <span className="position-absolute end-0 top-50 translate-middle-y me-3" style={{ cursor: 'pointer' }} onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <FaEyeSlash color="#8899a6" /> : <FaEye color="#8899a6" />}
                                            </span>
                                        </div>
                                    </Form.Group>

                                    <div className="d-flex justify-content-between mb-4 small">
                                        <Form.Check type="checkbox" label="Recordarme" className="text-muted" />
                                        <Link to="/forgot-password" title="Recuperar contraseña" style={{ color: '#62d8d9', textDecoration: 'none', fontWeight: '500' }}>
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>


                                    <Button 
                                        type="submit" 
                                        className="w-100 py-3 border-0" 
                                        style={{ 
                                            background: loading ? '#6c757d' : '#62d8d9',
                                            borderRadius: '12px', 
                                            fontWeight: 'bold', 
                                            fontSize: '1rem',
                                            transition: 'all 0.3s ease',
                                            opacity: loading ? 0.6 : 1,
                                            cursor: loading ? 'not-allowed' : 'pointer'
                                        }} 
                                        disabled={loading}
                                    >
                                        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                                    </Button>
                                </Form>

                                <p className="text-center mt-4 mb-0 small text-muted">
                                    ¿No tienes una cuenta? <Link to="/register" className="fw-bold text-decoration-none" style={{ color: '#62d8d9' }}>Regístrate</Link>
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <Modal show={showFacialModal} onHide={cerrarFacialModal} centered size="lg">
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Login Facial</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <div style={{ position: 'relative', backgroundColor: '#000', height: '400px', borderRadius: '15px', overflow: 'hidden' }}>
                        <video ref={videoRef} autoPlay playsInline style={{ width: '100%' }} />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>
                    {!fotoPreview ? 
                        <Button 
                            variant="success" 
                            onClick={tomarFoto} 
                            className="mt-3 w-100 py-2 fw-bold" 
                            style={{ background: '#62d8d9', border: 'none', borderRadius: '12px' }}
                        >
                            Capturar
                        </Button> 
                        : 
                        <Button 
                            variant="primary" 
                            onClick={enviarLoginFacial} 
                            className="mt-3 w-100 py-2 fw-bold" 
                            disabled={verificando} 
                            style={{ background: '#62d8d9', border: 'none', borderRadius: '12px' }}
                        >
                            {verificando ? 'Verificando...' : 'Confirmar e Iniciar'}
                        </Button>
                    }
                </Modal.Body>
            </Modal>

            <QRScanner show={showQRScanner} onHide={() => setShowQRScanner(false)} onScanSuccess={handleQRScan} />
        </div>
    );
}

export default Login;