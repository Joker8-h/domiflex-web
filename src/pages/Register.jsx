import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, ProgressBar, Image, Modal } from "react-bootstrap";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaArrowLeft, FaCamera, FaVideo, FaCheckCircle } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import NavbarCustom from '../components/Navbar'
import { API_URL } from '../config';
import LogoDomiFlex from './Imagenes/BANNER COMPLETO CON TRANSPARENCIA.png';
import EscenaHomeBase from './Imagenes/HomeBaseImage.png';
import FondoPantalla from './Imagenes/AutoresContacto.png';

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

  .password-valid {
    color: #28a745 !important;
  }
  
  .password-invalid {
    color: #dc3545 !important;
  }
`;

const termsText = `CONTRATO MARCO DE LICENCIA DE USO DE SOFTWARE, INTERMEDIACIÓN
TECNOLÓGICA Y ESTATUTO DE TÉRMINOS Y CONDICIONES GLOBALES DE LA
PLATAFORMA "DOMIFLEX"
VERSIÓN: 1.0 (2026) DOMICILIO LEGAL: POPAYÁN, CAUCA, COLOMBIA.
EMPRESA: DOMIFLEX S.A.S. (NIT EN TRÁMITE).

PREÁMBULO: DECLARACIÓN DE VOLUNTAD Y NATURALEZA JURÍDICA
El presente documento constituye un acuerdo legal vinculante y obligatorio (en
adelante, el "CONTRATO") entre DOMIFLEX S.A.S., una sociedad comercial
colombiana debidamente constituida, con domicilio principal en la Oficina
Fábrica de Software Alto del Cauca SENA de la ciudad de Popayán (en adelante,
"LA COMPAÑÍA" o "DOMIFLEX") y cualquier persona natural o jurídica que, de
forma libre y espontánea, decida registrarse, descargar o utilizar el ecosistema
digital (en adelante, el "USUARIO" o el "REPARTIDOR", y colectivamente
denominados las "PARTES").

CAPÍTULO I: DE LA NATURALEZA DEL OBJETO SOCIAL Y LA ACTIVIDAD
TECNOLÓGICA

ARTÍCULO 1: DEFINICIÓN DE LA ACTIVIDAD
DOMIFLEX S.A.S. declara, y las PARTES aceptan, que su objeto social no es la
prestación del servicio de mensajería ni la operación logística directa. DOMIFLEX es una
Empresa de Base Tecnológica (EBT) dedicada exclusivamente al desarrollo,
mantenimiento y licenciamiento de una plataforma de software. La función de la
App es la de un CORREDOR TECNOLÓGICO (Art. 1340 del Código de Comercio
Colombiano), que simplemente facilita el contacto entre dos partes
independientes: quien demanda un servicio de domicilio y quien ofrece su
capacidad de reparto autónomo.

ARTÍCULO 2: AUSENCIA DE HABILITACIÓN DE MENSAJERÍA
Las PARTES reconocen que DOMIFLEX no ostenta, ni requiere, habilitación especial
como empresa de mensajería, toda vez que no
posee flota de vehículos, no ejerce el control de la operación, no despacha
vehículos y no recibe remuneración por concepto de flete, sino por concepto de
"Tarifa de Licencia de Uso de Software".

CAPÍTULO II: RÉGIMEN DE CONTRATACIÓN DEL REPARTIDOR (BLINDAJE
LABORAL)

ARTÍCULO 3: DECLARACIÓN EXPRESA DE INDEPENDENCIA (ART. 23 C.S.T.)
El Repartidor declara bajo la gravedad de juramento que su relación con
DOMIFLEX es de naturaleza civil y comercial, regida por las normas del Corretaje
y Mandato (Código de Comercio). En consecuencia, se deja constancia de la
inexistencia de los elementos del contrato de trabajo:
1. NO SUBORDINACIÓN: El Repartidor no está sujeto a reglamentos de
trabajo, órdenes, ni jerarquías. Conserva la potestad de aceptar o rechazar
cualquier solicitud de domicilio.
2. NO PRESTACIÓN PERSONAL EXCLUSIVA: El Repartidor puede utilizar
otras plataformas o dedicarse a otras actividades económicas sin
restricción alguna.
3. NO REMUNERACIÓN SALARIAL: Los ingresos percibidos por el Repartidor
son pagos directos del Usuario Cliente. DOMIFLEX no paga nómina,
prestaciones, primas ni vacaciones.

ARTÍCULO 4: ASUNCIÓN DE CARGAS PRESTACIONALES Y PARAFISCALES
De conformidad con la Ley 1562 de 2012 y el Decreto 1072 de 2015, el Repartidor,
como trabajador independiente y contratista autónomo, es el único responsable
de su afiliación y pago al Sistema de Seguridad Social Integral (Salud, Pensión y
ARL). El Repartidor mantendrá indemne a DOMIFLEX ante cualquier reclamación
de la UGPP o entidades de seguridad social.

CAPÍTULO III: MODELOS ECONÓMICOS Y PACTOS DE ESTABILIDAD

ARTÍCULO 5: ESQUEMAS DE CONTRAPRESTACIÓN
El Repartidor podrá optar por dos modalidades de licenciamiento:
• PLAN ESTÁNDAR: Comisión por distancia sobre cada
intermediación exitosa (10% hasta 5 km, 12% hasta 15 km, 15% superior). Este valor se deduce de la tarifa sugerida por la
plataforma (base $2000 + $800/km).
• PLAN PRO REPARTIDOR FUNDADOR: Pago de una suscripción mensual
de TREINTA MIL PESOS M/CTE ($30.000 COP).
o Párrafo Primero (Estabilidad): Los Repartidores que se vinculen
bajo esta modalidad durante la etapa de lanzamiento en Popayán
gozarán de un Pacto de Estabilidad de Precio, manteniendo esta
tarifa mensual de por vida, siempre que no interrumpan su
suscripción por más de 30 días.
o Párrafo Segundo: DOMIFLEX podrá ajustar el
valor de este plan para futuros usuarios según la inflación o el IPC,
sin afectar a los "Repartidores Fundadores".

CAPÍTULO IV: EXONERACIÓN ABSOLUTA DE RESPONSABILIDAD (BLINDAJE
CIVIL Y PENAL)

ARTÍCULO 6: CLÁUSULA DE INDEMNIDAD POR RIESGO OPERATIVO
Dado que el reparto es una actividad con riesgo operativo, el
Repartidor y el Usuario Cliente asumen el riesgo total de la operación.
DOMIFLEX no responderá solidaria ni directamente por:
1. Accidentes de Tránsito: Todo siniestro se rige por el SOAT del vehículo y la
responsabilidad civil del propietario.
2. Responsabilidad Penal: En caso de delitos cometidos durante el domicilio
(hurto, acoso, lesiones, homicidio), la responsabilidad será estrictamente
individual del autor. DOMIFLEX no garantiza la idoneidad moral de los
usuarios, limitándose a la verificación documental estándar.
3. Contenidos y Objetos: Se prohíbe el envío de armas, drogas o
sustancias explosivas. El Repartidor debe inspeccionar los paquetes;
DOMIFLEX no custodia ni conoce el contenido de lo transportado.

CAPÍTULO V: SEGURIDAD, PRUEBAS JUDICIALES Y TECNOLOGÍA

ARTÍCULO 7: CONSENTIMIENTO PARA EL USO DE MEDIOS AUDIOVISUALES
En virtud de la Ley 906 de 2004 (Código de Procedimiento Penal), las PARTES
otorgan su consentimiento expreso para que la plataforma registre ubicación GPS
durante los domicilios.
• Finalidad: Estos registros serán custodiados bajo estándares de
seguridad informática y solo serán revelados ante orden judicial o para
dirimir conflictos internos de la plataforma.
• Valor Probatorio: Las PARTES aceptan que estos registros constituyen
prueba plena en procesos civiles o denuncias ante la Fiscalía General de la
Nación.

CAPÍTULO VI: POLÍTICA DE DATOS PERSONALES (HABEAS DATA)

ARTÍCULO 8: CUMPLIMIENTO LEY 1581 DE 2012
DOMIFLEX S.A.S., como Responsable del Tratamiento, recolectará datos
sensibles (biometría, ubicación GPS, registros de entrega). El titular autoriza el
tratamiento de estos datos para:
1. Geolocalización en tiempo real del servicio.
2. Verificación de identidad mediante reconocimiento facial.
3. Fines comerciales y de marketing de DOMIFLEX.

CAPÍTULO VII: RÉGIMEN DISCIPLINARIO Y PENALIDADES

ARTÍCULO 9: MULTAS POR CANCELACIÓN (CLÁUSULA PENAL)
Para proteger la confianza del consumidor, se establecen multas por cancelación
injustificada:
• A partir de la 3ra cancelación: $2.000 COP.
• A partir de la 5ta cancelación: $5.000 COP. Estas multas se consideran una
estimación anticipada de perjuicios por lucro cesante y daño a la imagen
de la plataforma.

CAPÍTULO VIII: RESOLUCIÓN DE CONFLICTOS Y CLÁUSULA COMPROMISORIA

ARTÍCULO 10: PROCEDIMIENTO DE LEY
Toda controversia se resolverá bajo los principios de economía y celeridad
procesal:
1. Etapa de Arreglo Directo: 15 días hábiles mediante comunicación escrita
a somosdomiflex@gmail.com.
2. Conciliación Obligatoria: En caso de fracaso, se acudirá a un Centro de
Conciliación en Popayán, conforme a la Ley 640 de 2001.
3. Jurisdicción Ordinaria: Los jueces civiles del circuito de Popayán serán los
competentes para conocer cualquier demanda.

DECLARACIÓN DE ACEPTACIÓN: El Usuario y/o Repartidor manifiesta que ha
leído este documento de 25 Capítulos y 120 Artículos (representados en este
estatuto marco), que entiende las implicaciones de la ausencia de relación laboral
y la exoneración de responsabilidad de DOMIFLEX, y que acepta cada cláusula
como ley para las partes.

Declaro que he leído, entendido y aceptado de manera libre, previa, expresa e informada el Contrato Marco de Licencia de Uso de Software, Intermediación Tecnológica y Términos y Condiciones de la plataforma DOMIFLEX S.A.S.; reconozco la inexistencia de relación laboral con la compañía, acepto la exoneración de responsabilidad de DOMIFLEX como mero corredor tecnológico, autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012 y otorgo consentimiento para el uso de medios audiovisuales como prueba judicial.`;

function Register() {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [step, setStep] = useState(1);
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [password, setPassword] = useState("");
    const [fotoBase64, setFotoBase64] = useState("");
    const [fotoPreview, setFotoPreview] = useState("");
    const [nombreEmergencia, setNombreEmergencia] = useState("");
    const [numeroEmergencia, setNumeroEmergencia] = useState("");
    const [rol, setRol] = useState("CLIENTE");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });
    const [showCamera, setShowCamera] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [stream, setStream] = useState(null);
    const [terminosAceptados, setTerminosAceptados] = useState(false);
    const [showTerminosModal, setShowTerminosModal] = useState(false);
    const [otp, setOtp] = useState("");

    const iniciarCamara = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
            });
            setStream(mediaStream);
            setCameraActive(true);
            setShowCamera(true);
            setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = mediaStream; }, 100);
        } catch (err) {
            toast.error('Error al acceder a la cámara.');
        }
    };

    const detenerCamara = () => {
        if (stream) stream.getTracks().forEach(track => track.stop());
        setStream(null);
        setCameraActive(false);
        setShowCamera(false);
    };

    const tomarFoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64 = canvas.toDataURL('image/jpeg', 0.9);
            setFotoBase64(base64);
            setFotoPreview(base64);
            detenerCamara();
            toast.success('¡Foto tomada!');
        }
    };

    async function handleRequestOtp() {
        if (!email) return toast.error("Ingresa un correo");
        setLoading(true);
        try {
            const respuesta = await fetch(`${API_URL}/auth/request-pre-otp`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            const data = await respuesta.json();
            if (respuesta.ok) {
                toast.success(data.mensaje);
                setStep(2);
            } else {
                toast.error(data.error || "Error al enviar el código.");
            }
        } catch (err) {
            toast.error('Error de conexión.');
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOtp() {
        if (otp.length !== 6) return toast.error("Ingresa el código de 6 dígitos");
        setLoading(true);
        try {
            const respuesta = await fetch(`${API_URL}/auth/verify-pre-otp`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp })
            });
            const data = await respuesta.json();
            if (respuesta.ok) {
                toast.success(data.mensaje);
                setStep(3);
            } else {
                toast.error(data.error || "Código incorrecto.");
            }
        } catch (err) {
            toast.error('Error al verificar.');
        } finally {
            setLoading(false);
        }
    }

    async function handleResendOtp() {
        return handleRequestOtp();
    }

    async function guardar(e) {
        if (e) e.preventDefault();
        if (!terminosAceptados) return toast.error("Acepta los términos");
        if (!isPasswordValid()) return toast.error("La contraseña no cumple con los requisitos de seguridad");
        
        setLoading(true);
        try {
            const datosEnviar = { 
                nombre, 
                email, 
                telefono, 
                password, 
                rol, 
                image: fotoBase64,
                nombreEmergencia,
                numeroEmergencia
            };
            const respuesta = await fetch(`${API_URL}/auth/registro`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosEnviar)
            });
            if (respuesta.ok) {
                toast.success('¡Registro exitoso!');
                setTimeout(() => navigate("/login"), 2000);
            } else {
                const data = await respuesta.json();
                setError(data.error || "Error en el registro.");
            }
        } catch (err) {
            toast.error('Error de conexión.');
        } finally {
            setLoading(false);
        }
    }

    const validatePassword = (pwd) => {
        setPasswordErrors({
            length: pwd.length >= 8,
            uppercase: /[A-Z]/.test(pwd),
            lowercase: /[a-z]/.test(pwd),
            number: /[0-9]/.test(pwd),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
        });
    };

    const isPasswordValid = () => {
        return passwordErrors.length && 
               passwordErrors.uppercase && 
               passwordErrors.lowercase && 
               passwordErrors.number && 
               passwordErrors.special;
    };

    const handleNextStep = () => {
        if (step === 1) return handleRequestOtp();
        if (step === 2) return handleVerifyOtp();
        if (step === 3 && (!nombre || !telefono || !nombreEmergencia || !numeroEmergencia)) return toast.error("Completa todos los campos, incluyendo los de emergencia");
        if (step === 4 && !fotoBase64) return toast.error("Toma una foto");
        if (step === 5 && (!isPasswordValid() || !password)) return toast.error("La contraseña debe cumplir todos los requisitos");
        setStep(step + 1);
    };

    const handlePrevStep = () => setStep(step - 1);

    const inputStyle = {
        borderRadius: '12px',
        backgroundColor: '#f8fafb',
        border: '1px solid #e1e8ed',
        padding: '10px 15px',
        fontSize: '0.95rem'
    };

    return (
        <>
            <style>{customStyles}</style>
            <div style={{
                backgroundImage: `url(${FondoPantalla})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Toaster position="top-right" />
                <NavbarCustom />

                <Container className="d-flex flex-column justify-content-center flex-grow-1 py-4">
                    <Row className="justify-content-center align-items-center g-0">
                        <Col xs={12} md={10} lg={5} xl={4} className="p-3">
                            <Card className="shadow-lg border-0" style={{ borderRadius: '25px', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                                <Card.Body className="p-4 p-md-5">
                                    <div className="text-center mb-4">
                                        <img src={LogoDomiFlex} alt="Logo" style={{ width: '150px' }} />
                                        <h5 className="fw-bold mt-3 mb-1">Crea tu cuenta</h5>
                                        <ProgressBar now={(step / 6) * 100} variant="info" className="mt-3" style={{ height: '5px', borderRadius: '10px', backgroundColor: '#e9ecef' }} />
                                        <small className="text-muted d-block mt-2">Paso {step} de 6</small>
                                    </div>

                                    {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

                                    <Form onSubmit={guardar}>
                                        {step === 1 && (
                                            <div className="animate__animated animate__fadeIn">
                                                <p className="small mb-3 text-center">Ingresa tu correo para recibir un código de verificación.</p>
                                                <Form.Group className="mb-4">
                                                    <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo Electrónico" required style={inputStyle} />
                                                </Form.Group>
                                                <Button type="button" onClick={handleNextStep} disabled={loading} className="w-100 py-2 border-0" style={{ background: '#62d8d9', borderRadius: '12px', fontWeight: 'bold', color: 'white' }}>
                                                    {loading ? "Enviando..." : "Enviar Código"} <FaArrowRight className="ms-2" size={14} />
                                                </Button>
                                            </div>
                                        )}

                                        {step === 2 && (
                                            <div className="animate__animated animate__fadeIn text-center">
                                                <p className="small mb-4">Ingresa el código enviado a <strong>{email}</strong></p>
                                                <Form.Group className="mb-4">
                                                    <Form.Control
                                                        type="text"
                                                        maxLength="6"
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                                        placeholder="000000"
                                                        style={{ ...inputStyle, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px' }}
                                                    />
                                                </Form.Group>
                                                <Button type="button" onClick={handleNextStep} disabled={loading || otp.length !== 6} className="w-100 py-2 border-0 mb-3" style={{ background: '#62d8d9', borderRadius: '12px', fontWeight: 'bold', color: 'white' }}>
                                                    {loading ? "Verificando..." : "Verificar Email"}
                                                </Button>
                                                <div className="d-flex justify-content-between px-2">
                                                    <span onClick={handlePrevStep} style={{ cursor: 'pointer', fontSize: '0.85rem' }} className="text-muted">Cambiar Correo</span>
                                                    <span onClick={handleResendOtp} style={{ color: '#62d8d9', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>Reenviar Código</span>
                                                </div>
                                            </div>
                                        )}

                                        {step === 3 && (
                                            <div className="animate__animated animate__fadeIn">
                                                <Form.Group className="mb-3">
                                                    <Form.Control type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre Completo" required style={inputStyle} />
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Control type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Teléfono" required style={inputStyle} />
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold small" style={{ color: '#113d69' }}>Tipo de cuenta DomiFlex</Form.Label>
                                                    <Form.Select value={rol} onChange={(e) => setRol(e.target.value)} required style={inputStyle}>
                                                        <option value="CLIENTE">CLIENTE — pide domicilios</option>
                                                        <option value="REPARTIDOR">REPARTIDOR — entrega pedidos</option>
                                                        <option value="COMERCIO">COMERCIO — vende con domicilios</option>
                                                    </Form.Select>
                                                </Form.Group>

                                                <hr className="my-4" />
                                                <h6 className="fw-bold mb-3" style={{ color: '#113d69' }}>Contacto de Emergencia</h6>

                                                <Form.Group className="mb-3">
                                                    <Form.Control type="text" value={nombreEmergencia} onChange={(e) => setNombreEmergencia(e.target.value)} placeholder="Nombre del Contacto de Emergencia" required style={inputStyle} />
                                                </Form.Group>
                                                <Form.Group className="mb-4">
                                                    <Form.Control type="tel" value={numeroEmergencia} onChange={(e) => setNumeroEmergencia(e.target.value)} placeholder="Número de Emergencia" required style={inputStyle} />
                                                </Form.Group>
                                                <Button type="button" onClick={handleNextStep} className="w-100 py-2 border-0" style={{ background: '#62d8d9', borderRadius: '12px', fontWeight: 'bold', color: 'white' }}>
                                                    Siguiente <FaArrowRight className="ms-2" size={14} />
                                                </Button>
                                            </div>
                                        )}

                                        {step === 4 && (
                                            <div className="text-center animate__animated animate__fadeIn">
                                                <div className="d-flex justify-content-center mb-4">
                                                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '3px solid #62d8d9', overflow: 'hidden', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {fotoPreview ? <Image src={fotoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FaCamera size={30} color="#ccc" />}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline-success"
                                                    onClick={iniciarCamara}
                                                    className="custom-tomar-foto-btn"
                                                    disabled={cameraActive}
                                                >
                                                    <FaVideo className="me-2" /> Tomar Foto
                                                </Button>
                                                <div className="d-flex gap-2">
                                                    <Button type="button" variant="light" onClick={handlePrevStep} className="w-50 py-2" style={{ borderRadius: '12px' }}>Atrás</Button>
                                                    <Button type="button" onClick={handleNextStep} disabled={!fotoBase64} className="w-50 py-2 border-0" style={{ background: '#62d8d9', borderRadius: '12px', fontWeight: 'bold', color: 'white' }}>Siguiente</Button>
                                                </div>
                                            </div>
                                        )}

                                        {step === 5 && (
                                            <div className="animate__animated animate__fadeIn">
                                                <Form.Group className="mb-3">
                                                    <div className="position-relative">
                                                        <Form.Control 
                                                            type={showPassword ? "text" : "password"} 
                                                            value={password}
                                                            onChange={(e) => { 
                                                                setPassword(e.target.value); 
                                                                validatePassword(e.target.value);
                                                            }}
                                                            placeholder="Contraseña" 
                                                            required 
                                                            style={inputStyle} 
                                                        />
                                                        <span className="position-absolute end-0 top-50 translate-middle-y me-3" style={{ cursor: 'pointer' }} onClick={() => setShowPassword(!showPassword)}>
                                                            {showPassword ? <FaEyeSlash color="#8899a6" /> : <FaEye color="#8899a6" />}
                                                        </span>
                                                    </div>
                                                </Form.Group>
                                                
                                                <div className="mb-4 p-3 bg-light rounded-3" style={{ fontSize: '0.85rem' }}>
                                                    <p className="mb-2 fw-bold">La contraseña debe contener:</p>
                                                    <ul className="list-unstyled mb-0">
                                                        <li className={passwordErrors.length ? "password-valid" : "password-invalid"}>
                                                            {passwordErrors.length ? "✓" : "✗"} Mínimo 8 caracteres
                                                        </li>
                                                        <li className={passwordErrors.uppercase ? "password-valid" : "password-invalid"}>
                                                            {passwordErrors.uppercase ? "✓" : "✗"} Al menos una letra mayúscula
                                                        </li>
                                                        <li className={passwordErrors.lowercase ? "password-valid" : "password-invalid"}>
                                                            {passwordErrors.lowercase ? "✓" : "✗"} Al menos una letra minúscula
                                                        </li>
                                                        <li className={passwordErrors.number ? "password-valid" : "password-invalid"}>
                                                            {passwordErrors.number ? "✓" : "✗"} Al menos un número
                                                        </li>
                                                        <li className={passwordErrors.special ? "password-valid" : "password-invalid"}>
                                                            {passwordErrors.special ? "✓" : "✗"} Al menos un carácter especial (!@#$%^&*(),.?":{}|&lt;&gt;)
                                                        </li>
                                                    </ul>
                                                </div>

                                                <div className="d-flex gap-2">
                                                    <Button type="button" variant="light" onClick={handlePrevStep} className="w-50 py-2" style={{ borderRadius: '12px' }}>Atrás</Button>
                                                    <Button 
                                                        type="button" 
                                                        onClick={handleNextStep} 
                                                        disabled={!isPasswordValid() || !password} 
                                                        className="w-50 py-2 border-0" 
                                                        style={{ background: '#62d8d9', borderRadius: '12px', fontWeight: 'bold', color: 'white' }}
                                                    >
                                                        Siguiente
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {step === 6 && (
                                            <div className="animate__animated animate__fadeIn">
                                                <div className="bg-light p-3 rounded-4 mb-3" style={{ fontSize: '0.85rem' }}>
                                                    <strong>{nombre}</strong><br />
                                                    {email}<br />
                                                    <span className="text-muted small mt-2 d-block">Emergencia: {nombreEmergencia} ({numeroEmergencia})</span>
                                                </div>
                                                <Form.Check 
                                                    type="checkbox" 
                                                    label={<span style={{ fontSize: '0.8rem' }}>Acepto <span 
                                                        onClick={(e) => { e.stopPropagation(); setShowTerminosModal(true); }} 
                                                        style={{ color: '#62d8d9', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }}
                                                    >términos y condiciones</span></span>} 
                                                    checked={terminosAceptados} 
                                                    onChange={(e) => setTerminosAceptados(e.target.checked)} 
                                                    className="mb-4" 
                                                />
                                                <div className="d-flex gap-2">
                                                    <Button type="button" variant="light" onClick={handlePrevStep} className="w-50 py-2" style={{ borderRadius: '12px' }}>Atrás</Button>
                                                    <Button type="submit" disabled={!terminosAceptados || loading} className="w-50 py-2 border-0" style={{ background: '#113d69', borderRadius: '12px', fontWeight: 'bold', color: 'white' }}>
                                                        {loading ? "..." : "Finalizar"}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </Form>
                                    <p className="text-center mt-4 mb-0 small text-muted">¿Ya tienes cuenta? <Link to="/login" className="fw-bold text-decoration-none" style={{ color: '#62d8d9' }}>Inicia Sesión</Link></p>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6} lg={6} className="d-none d-md-flex justify-content-center p-5">
                            <img src={EscenaHomeBase} alt="Ilustración" style={{ width: '100%', maxWidth: '500px', height: 'auto', filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.2))' }} />
                        </Col>
                    </Row>
                </Container>

                <Modal show={showCamera} onHide={detenerCamara} centered size="md">
                    <Modal.Body className="p-0 text-center bg-black">
                        <video ref={videoRef} autoPlay playsInline style={{ width: '100%' }} />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                        <div className="p-3 bg-white d-flex justify-content-center gap-3">
                            <Button variant="secondary" size="sm" onClick={detenerCamara}>Cancelar</Button>
                            <Button variant="success" size="sm" onClick={tomarFoto} disabled={!cameraActive} style={{ background: '#62d8d9', border: 'none' }}>Capturar</Button>
                        </div>
                    </Modal.Body>
                </Modal>

                <Modal show={showTerminosModal} onHide={() => setShowTerminosModal(false)} size="lg" centered>
                    <Modal.Header closeButton style={{ borderBottom: `2px solid #62d8d9` }}>
                        <Modal.Title style={{ color: '#113d69', fontWeight: 'bold' }}>
                            <FaCheckCircle style={{ color: '#62d8d9', marginRight: '10px' }} />
                            Términos y Condiciones
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto', padding: '1.5rem', backgroundColor: '#f9f9f9' }}>
                        <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontSize: '0.9rem', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#333' }}>
                            {termsText}
                        </div>
                    </Modal.Body>
                    <Modal.Footer style={{ borderTop: '1px solid #e9ecef' }}>
                        <Button variant="secondary" onClick={() => setShowTerminosModal(false)} style={{ borderRadius: '8px' }}>
                            Cerrar
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={() => { setTerminosAceptados(true); setShowTerminosModal(false); toast.success('Términos aceptados'); }} 
                            style={{ background: '#62d8d9', border: 'none', borderRadius: '8px' }}
                        >
                            Aceptar Términos
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </>
    );
}

export default Register;