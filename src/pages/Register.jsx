import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, ProgressBar, Image, Modal } from "react-bootstrap";
import { CircleCheck, ArrowRight, ArrowLeft, Mail, EyeOff, Camera, Video, Phone, Check, User, Lock, Eye } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import NavbarCustom from '../components/Navbar'
import { API_URL } from '../config';
import LogoDomiFlex from '/logo-domiflex.jpg';
import EscenaHomeBase from './Imagenes/HomeBaseImage.png';
import theme from '../styles/theme';

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

    const s = theme.colors;
    const sp = theme.spacing;
    const br = theme.borderRadius;
    const fs = theme.fontSize;

    const inputStyle = {
        borderRadius: br.sm,
        backgroundColor: s.bgInput,
        border: `1px solid ${s.border}`,
        padding: `${sp.sm} ${sp.md}`,
        fontSize: fs.md,
        color: s.textPrimary,
        width: '100%',
        outline: 'none',
        transition: theme.transitions.fast,
        fontFamily: "'Montserrat', sans-serif",
    };

    const btnPrimary = {
        width: '100%',
        padding: '12px',
        background: s.accent,
        border: 'none',
        borderRadius: br.md,
        fontWeight: theme.fontWeight.bold,
        color: '#000',
        fontSize: fs.md,
        cursor: 'pointer',
        transition: theme.transitions.fast,
        fontFamily: "'Montserrat', sans-serif",
    };

    const btnSecondary = {
        width: '100%',
        padding: '12px',
        background: 'transparent',
        border: `2px solid ${s.border}`,
        borderRadius: br.md,
        fontWeight: theme.fontWeight.semibold,
        color: s.textSecondary,
        fontSize: fs.md,
        cursor: 'pointer',
        transition: theme.transitions.fast,
        fontFamily: "'Montserrat', sans-serif",
    };

    const labelStyle = {
        fontSize: fs.sm,
        fontWeight: theme.fontWeight.semibold,
        color: s.textSecondary,
        marginBottom: sp.xs,
        display: 'block',
    };

    return (
        <>
            <div style={{
                backgroundColor: s.bgPrimary,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: "'Montserrat', sans-serif",
            }}>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: s.bgSecondary,
                            color: s.textPrimary,
                            border: `1px solid ${s.border}`,
                            borderRadius: br.sm,
                        },
                        success: { iconTheme: { primary: s.accent, secondary: '#000' } },
                        error: { iconTheme: { primary: s.danger, secondary: '#fff' } },
                    }}
                />
                <NavbarCustom />

                <Container className="d-flex flex-column justify-content-center flex-grow-1 py-4">
                    <Row className="justify-content-center align-items-center g-0">
                        <Col xs={12} md={10} lg={5} xl={4} className="p-3">
                            <div style={{
                                backgroundColor: s.bgCard,
                                borderRadius: br.lg,
                                border: `1px solid ${s.border}`,
                                boxShadow: theme.shadows.card,
                                padding: '32px',
                            }}>
                                <div style={{ textAlign: 'center', marginBottom: sp.lg }}>
                                    <img src={LogoDomiFlex} alt="DomiFlex — Delivery, rapidez y flexibilidad" style={{ width: '150px' }} />
                                    <h1 style={{
                                        fontWeight: theme.fontWeight.bold,
                                        marginTop: sp.md,
                                        marginBottom: sp.xs,
                                        color: s.textPrimary,
                                        fontSize: fs.lg,
                                    }}>Crea tu cuenta</h1>
                                    <div style={{
                                        height: '5px',
                                        borderRadius: br.lg,
                                        backgroundColor: s.border,
                                        marginTop: sp.md,
                                        overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            width: `${(step / 6) * 100}%`,
                                            height: '100%',
                                            background: `linear-gradient(90deg, ${s.accent}, ${s.accentLight})`,
                                            borderRadius: br.lg,
                                            transition: 'width 0.4s ease',
                                        }} />
                                    </div>
                                    <small style={{ color: s.textMuted, display: 'block', marginTop: sp.sm, fontSize: fs.xs }}>
                                        Paso {step} de 6
                                    </small>
                                </div>

                                {error && (
                                    <div style={{
                                        backgroundColor: 'rgba(255, 82, 82, 0.1)',
                                        border: `1px solid ${s.danger}`,
                                        color: s.danger,
                                        borderRadius: br.sm,
                                        padding: `${sp.sm} ${sp.md}`,
                                        marginBottom: sp.md,
                                        fontSize: fs.sm,
                                    }}>
                                        {error}
                                    </div>
                                )}

                                <Form onSubmit={guardar}>
                                    {step === 1 && (
                                        <div>
                                            <p style={{ color: s.textSecondary, fontSize: fs.sm, textAlign: 'center', marginBottom: sp.lg }}>
                                                Ingresa tu correo para recibir un código de verificación.
                                            </p>
                                            <Form.Group style={{ marginBottom: sp.lg }}>
                                                <label htmlFor="register-email" style={{ display: 'block', fontSize: fs.sm, fontWeight: theme.fontWeight.medium, color: s.textSecondary, marginBottom: '6px' }}>
                                                    Correo electrónico
                                                </label>
                                                <Form.Control
                                                    id="register-email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="tucorreo@ejemplo.com"
                                                    autoComplete="email"
                                                    inputMode="email"
                                                    required
                                                    style={inputStyle}
                                                    onFocus={(e) => { e.target.style.borderColor = s.accent; e.target.style.boxShadow = theme.shadows.input; }}
                                                    onBlur={(e) => { e.target.style.borderColor = s.border; e.target.style.boxShadow = 'none'; }}
                                                />
                                            </Form.Group>
                                            <button type="button" onClick={handleNextStep} disabled={loading} style={btnPrimary}>
                                                {loading ? "Enviando..." : "Enviar Código"} <ArrowRight style={{ marginLeft: '8px' }} size={14} />
                                            </button>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div style={{ textAlign: 'center' }}>
                                            <p style={{ color: s.textSecondary, fontSize: fs.sm, marginBottom: sp.lg }}>
                                                Ingresa el código enviado a <strong style={{ color: s.textPrimary }}>{email}</strong>
                                            </p>
                                            <Form.Group style={{ marginBottom: sp.lg }}>
                                                <label htmlFor="register-otp" style={{ display: 'block', fontSize: fs.sm, fontWeight: theme.fontWeight.medium, color: s.textSecondary, marginBottom: '6px', textAlign: 'left' }}>
                                                    Código de 6 dígitos
                                                </label>
                                                <Form.Control
                                                    id="register-otp"
                                                    type="text"
                                                    inputMode="numeric"
                                                    autoComplete="one-time-code"
                                                    maxLength="6"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                                    placeholder="000000"
                                                    style={{
                                                        ...inputStyle,
                                                        textAlign: 'center',
                                                        fontSize: '1.5rem',
                                                        letterSpacing: '8px',
                                                    }}
                                                    onFocus={(e) => { e.target.style.borderColor = s.accent; e.target.style.boxShadow = theme.shadows.input; }}
                                                    onBlur={(e) => { e.target.style.borderColor = s.border; e.target.style.boxShadow = 'none'; }}
                                                />
                                            </Form.Group>
                                            <button type="button" onClick={handleNextStep} disabled={loading || otp.length !== 6} style={{ ...btnPrimary, marginBottom: sp.md }}>
                                                {loading ? "Verificando..." : "Verificar Email"}
                                            </button>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: `0 ${sp.sm}` }}>
                                                <span onClick={handlePrevStep} style={{ cursor: 'pointer', fontSize: fs.xs, color: s.textMuted }}>
                                                    Cambiar Correo
                                                </span>
                                                <span onClick={handleResendOtp} style={{ color: s.accent, cursor: 'pointer', fontWeight: theme.fontWeight.bold, fontSize: fs.xs }}>
                                                    Reenviar Código
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div>
                                            <Form.Group style={{ marginBottom: sp.md }}>
                                                <Form.Control type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre Completo" required style={inputStyle}
                                                    onFocus={(e) => { e.target.style.borderColor = s.accent; e.target.style.boxShadow = theme.shadows.input; }}
                                                    onBlur={(e) => { e.target.style.borderColor = s.border; e.target.style.boxShadow = 'none'; }}
                                                />
                                            </Form.Group>
                                            <Form.Group style={{ marginBottom: sp.md }}>
                                                <Form.Control type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Teléfono" required style={inputStyle}
                                                    onFocus={(e) => { e.target.style.borderColor = s.accent; e.target.style.boxShadow = theme.shadows.input; }}
                                                    onBlur={(e) => { e.target.style.borderColor = s.border; e.target.style.boxShadow = 'none'; }}
                                                />
                                            </Form.Group>
                                            <Form.Group style={{ marginBottom: sp.md }}>
                                                <label style={labelStyle}>Tipo de cuenta DomiFlex</label>
                                                <Form.Select value={rol} onChange={(e) => setRol(e.target.value)} required style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                                                    <option value="CLIENTE">CLIENTE — pide domicilios</option>
                                                    <option value="REPARTIDOR">REPARTIDOR — entrega pedidos</option>
                                                    <option value="COMERCIO">COMERCIO — vende con domicilios</option>
                                                </Form.Select>
                                            </Form.Group>

                                            <hr style={{ borderColor: s.border, margin: `${sp.lg} 0` }} />
                                            <h6 style={{
                                                fontWeight: theme.fontWeight.bold,
                                                marginBottom: sp.md,
                                                color: s.accent,
                                                fontSize: fs.md,
                                            }}>Contacto de Emergencia</h6>

                                            <Form.Group style={{ marginBottom: sp.md }}>
                                                <Form.Control type="text" value={nombreEmergencia} onChange={(e) => setNombreEmergencia(e.target.value)} placeholder="Nombre del Contacto de Emergencia" required style={inputStyle}
                                                    onFocus={(e) => { e.target.style.borderColor = s.accent; e.target.style.boxShadow = theme.shadows.input; }}
                                                    onBlur={(e) => { e.target.style.borderColor = s.border; e.target.style.boxShadow = 'none'; }}
                                                />
                                            </Form.Group>
                                            <Form.Group style={{ marginBottom: sp.lg }}>
                                                <Form.Control type="tel" value={numeroEmergencia} onChange={(e) => setNumeroEmergencia(e.target.value)} placeholder="Número de Emergencia" required style={inputStyle}
                                                    onFocus={(e) => { e.target.style.borderColor = s.accent; e.target.style.boxShadow = theme.shadows.input; }}
                                                    onBlur={(e) => { e.target.style.borderColor = s.border; e.target.style.boxShadow = 'none'; }}
                                                />
                                            </Form.Group>
                                            <button type="button" onClick={handleNextStep} style={btnPrimary}>
                                                Siguiente <ArrowRight style={{ marginLeft: '8px' }} size={14} />
                                            </button>
                                        </div>
                                    )}

                                    {step === 4 && (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: sp.lg }}>
                                                <div style={{
                                                    width: '120px',
                                                    height: '120px',
                                                    borderRadius: '50%',
                                                    border: `3px solid ${s.accent}`,
                                                    overflow: 'hidden',
                                                    backgroundColor: s.bgInput,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    {fotoPreview
                                                        ? <img src={fotoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        : <Camera size={30} color={s.textMuted} />
                                                    }
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={iniciarCamara}
                                                disabled={cameraActive}
                                                style={{
                                                    width: '100%',
                                                    padding: '16px',
                                                    border: `2px solid ${s.accent}`,
                                                    background: 'transparent',
                                                    color: s.accent,
                                                    borderRadius: br.md,
                                                    fontWeight: theme.fontWeight.medium,
                                                    fontSize: fs.md,
                                                    cursor: cameraActive ? 'not-allowed' : 'pointer',
                                                    opacity: cameraActive ? 0.6 : 1,
                                                    marginBottom: sp.md,
                                                    transition: theme.transitions.fast,
                                                    fontFamily: "'Montserrat', sans-serif",
                                                }}
                                            >
                                                <Video style={{ marginRight: '8px' }} /> Tomar Foto
                                            </button>
                                            <div style={{ display: 'flex', gap: sp.sm }}>
                                                <button type="button" onClick={handlePrevStep} style={btnSecondary}>Atrás</button>
                                                <button type="button" onClick={handleNextStep} disabled={!fotoBase64} style={{ ...btnPrimary, opacity: !fotoBase64 ? 0.6 : 1, cursor: !fotoBase64 ? 'not-allowed' : 'pointer' }}>Siguiente</button>
                                            </div>
                                        </div>
                                    )}

                                    {step === 5 && (
                                        <div>
                                            <Form.Group style={{ marginBottom: sp.md }}>
                                                <div style={{ position: 'relative' }}>
                                                    <Form.Control
                                                        type={showPassword ? "text" : "password"}
                                                        value={password}
                                                        onChange={(e) => {
                                                            setPassword(e.target.value);
                                                            validatePassword(e.target.value);
                                                        }}
                                                        placeholder="Contraseña"
                                                        required
                                                        style={{ ...inputStyle, paddingRight: '45px' }}
                                                        onFocus={(e) => { e.target.style.borderColor = s.accent; e.target.style.boxShadow = theme.shadows.input; }}
                                                        onBlur={(e) => { e.target.style.borderColor = s.border; e.target.style.boxShadow = 'none'; }}
                                                    />
                                                    <span
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        style={{
                                                            position: 'absolute',
                                                            right: '15px',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            cursor: 'pointer',
                                                            color: s.textMuted,
                                                        }}
                                                    >
                                                        {showPassword ? <EyeOff /> : <Eye />}
                                                    </span>
                                                </div>
                                            </Form.Group>

                                            <div style={{
                                                backgroundColor: s.bgInput,
                                                border: `1px solid ${s.border}`,
                                                borderRadius: br.sm,
                                                padding: sp.md,
                                                marginBottom: sp.lg,
                                                fontSize: fs.xs,
                                            }}>
                                                <p style={{ marginBottom: sp.sm, fontWeight: theme.fontWeight.bold, color: s.textPrimary }}>
                                                    La contraseña debe contener:
                                                </p>
                                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                    <li style={{ color: passwordErrors.length ? s.accent : s.danger, marginBottom: '4px' }}>
                                                        {passwordErrors.length ? "✓" : "✗"} Mínimo 8 caracteres
                                                    </li>
                                                    <li style={{ color: passwordErrors.uppercase ? s.accent : s.danger, marginBottom: '4px' }}>
                                                        {passwordErrors.uppercase ? "✓" : "✗"} Al menos una letra mayúscula
                                                    </li>
                                                    <li style={{ color: passwordErrors.lowercase ? s.accent : s.danger, marginBottom: '4px' }}>
                                                        {passwordErrors.lowercase ? "✓" : "✗"} Al menos una letra minúscula
                                                    </li>
                                                    <li style={{ color: passwordErrors.number ? s.accent : s.danger, marginBottom: '4px' }}>
                                                        {passwordErrors.number ? "✓" : "✗"} Al menos un número
                                                    </li>
                                                    <li style={{ color: passwordErrors.special ? s.accent : s.danger }}>
                                                        {passwordErrors.special ? "✓" : "✗"} Al menos un carácter especial (!@#$%^&*(),.?":{}|&lt;&gt;)
                                                    </li>
                                                </ul>
                                            </div>

                                            <div style={{ display: 'flex', gap: sp.sm }}>
                                                <button type="button" onClick={handlePrevStep} style={btnSecondary}>Atrás</button>
                                                <button
                                                    type="button"
                                                    onClick={handleNextStep}
                                                    disabled={!isPasswordValid() || !password}
                                                    style={{ ...btnPrimary, opacity: (!isPasswordValid() || !password) ? 0.6 : 1, cursor: (!isPasswordValid() || !password) ? 'not-allowed' : 'pointer' }}
                                                >
                                                    Siguiente
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {step === 6 && (
                                        <div>
                                            <div style={{
                                                backgroundColor: s.bgInput,
                                                border: `1px solid ${s.border}`,
                                                borderRadius: br.sm,
                                                padding: sp.md,
                                                marginBottom: sp.lg,
                                                fontSize: fs.sm,
                                            }}>
                                                <strong style={{ color: s.textPrimary }}>{nombre}</strong><br />
                                                <span style={{ color: s.textSecondary }}>{email}</span><br />
                                                <span style={{ color: s.textMuted, fontSize: fs.xs, marginTop: sp.xs, display: 'block' }}>
                                                    Emergencia: {nombreEmergencia} ({numeroEmergencia})
                                                </span>
                                            </div>
                                            <Form.Check
                                                type="checkbox"
                                                label={
                                                    <span style={{ fontSize: fs.xs, color: s.textSecondary }}>
                                                        Acepto{' '}
                                                        <span
                                                            onClick={(e) => { e.stopPropagation(); setShowTerminosModal(true); }}
                                                            style={{ color: s.accent, fontWeight: theme.fontWeight.bold, textDecoration: 'underline', cursor: 'pointer' }}
                                                        >
                                                            términos y condiciones
                                                        </span>
                                                    </span>
                                                }
                                                checked={terminosAceptados}
                                                onChange={(e) => setTerminosAceptados(e.target.checked)}
                                                style={{ marginBottom: sp.lg, color: s.textSecondary }}
                                            />
                                            <div style={{ display: 'flex', gap: sp.sm }}>
                                                <button type="button" onClick={handlePrevStep} style={btnSecondary}>Atrás</button>
                                                <button type="submit" disabled={!terminosAceptados || loading} style={{
                                                    ...btnPrimary,
                                                    background: !terminosAceptados || loading ? s.textMuted : s.accent,
                                                    opacity: !terminosAceptados || loading ? 0.6 : 1,
                                                    cursor: !terminosAceptados || loading ? 'not-allowed' : 'pointer',
                                                }}>
                                                    {loading ? "..." : "Finalizar"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </Form>
                                <p style={{ textAlign: 'center', marginTop: sp.lg, marginBottom: 0, fontSize: fs.sm, color: s.textMuted }}>
                                    ¿Ya tienes cuenta?{' '}
                                    <Link to="/login" style={{ fontWeight: theme.fontWeight.bold, textDecoration: 'none', color: s.accent }}>
                                        Inicia Sesión
                                    </Link>
                                </p>
                            </div>
                        </Col>

                        <Col md={6} lg={6} className="d-none d-md-flex justify-content-center p-5">
                            <img src={EscenaHomeBase} alt="Ilustración" style={{ width: '100%', maxWidth: '500px', height: 'auto', filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.4))' }} />
                        </Col>
                    </Row>
                </Container>

                <Modal show={showCamera} onHide={detenerCamara} centered size="md" backdrop="static">
                    <Modal.Body style={{ padding: 0, textAlign: 'center', backgroundColor: '#000' }}>
                        <video ref={videoRef} autoPlay playsInline style={{ width: '100%' }} />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                        <div style={{
                            padding: sp.md,
                            backgroundColor: s.bgCard,
                            display: 'flex',
                            justifyContent: 'center',
                            gap: sp.sm,
                            borderTop: `1px solid ${s.border}`,
                        }}>
                            <button onClick={detenerCamara} style={{
                                ...btnSecondary,
                                width: 'auto',
                                padding: `${sp.sm} ${sp.md}`,
                                fontSize: fs.sm,
                            }}>Cancelar</button>
                            <button onClick={tomarFoto} disabled={!cameraActive} style={{
                                ...btnPrimary,
                                width: 'auto',
                                padding: `${sp.sm} ${sp.md}`,
                                fontSize: fs.sm,
                                opacity: cameraActive ? 1 : 0.6,
                            }}>Capturar</button>
                        </div>
                    </Modal.Body>
                </Modal>

                <Modal show={showTerminosModal} onHide={() => setShowTerminosModal(false)} size="lg" centered backdrop="static">
                    <Modal.Header closeButton style={{ borderBottom: `2px solid ${s.accent}`, backgroundColor: s.bgCard }}>
                        <Modal.Title style={{ color: s.textPrimary, fontWeight: theme.fontWeight.bold, fontSize: fs.lg }}>
                            <CircleCheck style={{ color: s.accent, marginRight: '10px' }} />
                            Términos y Condiciones
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{
                        maxHeight: '60vh',
                        overflowY: 'auto',
                        padding: '1.5rem',
                        backgroundColor: s.bgPrimary,
                        color: s.textSecondary,
                    }}>
                        <div style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: fs.sm,
                            whiteSpace: 'pre-wrap',
                            lineHeight: '1.6',
                        }}>
                            {termsText}
                        </div>
                    </Modal.Body>
                    <Modal.Footer style={{ borderTop: `1px solid ${s.border}`, backgroundColor: s.bgCard }}>
                        <button onClick={() => setShowTerminosModal(false)} style={{
                            ...btnSecondary,
                            width: 'auto',
                            padding: `${sp.sm} ${sp.md}`,
                            fontSize: fs.sm,
                        }}>
                            Cerrar
                        </button>
                        <button
                            onClick={() => { setTerminosAceptados(true); setShowTerminosModal(false); toast.success('Términos aceptados'); }}
                            style={{
                                ...btnPrimary,
                                width: 'auto',
                                padding: `${sp.sm} ${sp.md}`,
                                fontSize: fs.sm,
                            }}
                        >
                            Aceptar Términos
                        </button>
                    </Modal.Footer>
                </Modal>
            </div>
        </>
    );
}

export default Register;
