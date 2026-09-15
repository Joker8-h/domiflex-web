import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Modal, Badge } from "react-bootstrap";
import { FaCar, FaFileImage, FaArrowLeft, FaCheckCircle, FaCamera, FaVideo, FaExclamationTriangle, FaSmile, FaFrown, FaIdCard } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../../config";
import Navbar from '../../components/Navbar';
import LogoDomiFlex from '../Imagenes/BANNER COMPLETO CON TRANSPARENCIA.png';
import EscenaHomeBase from '../Imagenes/HomeBaseImage.png';
import FondoPantalla from '../Imagenes/AutoresContacto.png';
import toast, { Toaster } from 'react-hot-toast';

const customStyles = `
  .custom-tomar-foto-btn {
    border-radius: 12px!important;
    border-color: #62d8d9!important;
    color: #62d8d9!important;
    font-weight: 500!important;
    transition: all 0.3s ease!important;
    width: 100%!important;
    padding: 1rem 0!important;
    margin-bottom: 1rem!important;
  }
  
  .custom-tomar-foto-btn:hover {
    background-color: #62d8d9!important;
    border-color: #62d8d9!important;
    color: white!important;
  }
  
  .custom-tomar-foto-btn:disabled {
    opacity: 0.6!important;
    cursor: not-allowed!important;
  }
`;

function VehicleRegistration() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [placa, setPlaca] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [tipo, setTipo] = useState("MOTO");

  const [fotoPlaca, setFotoPlaca] = useState("");
  const [fotoAuto1, setFotoAuto1] = useState("");
  const [fotoAuto2, setFotoAuto2] = useState("");
  const [fotoAuto3, setFotoAuto3] = useState("");

  const [fotoPreview, setFotoPreview] = useState(""); // General preview for the one being taken
  const [activePhotoSlot, setActivePhotoSlot] = useState("placa"); // 'placa', 'auto1', 'auto2', 'auto3'

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCamera, setShowCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);

  const [imagenValida, setImagenValida] = useState(null);
  const [mensajeImagen, setMensajeImagen] = useState("");
  const [verificandoImagen, setVerificandoImagen] = useState(false);
  const [errorBackend, setErrorBackend] = useState("");
  const [buscandoPlaca, setBuscandoPlaca] = useState(false);

  const [placaValidada, setPlacaValidada] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const comprimirImagen = (base64, maxSizeKB = 300) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const maxDimension = 1200;
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        let calidad = 0.8;
        let comprimida = canvas.toDataURL('image/jpeg', calidad);

        while (comprimida.length > maxSizeKB * 1024 && calidad > 0.3) {
          calidad -= 0.1;
          comprimida = canvas.toDataURL('image/jpeg', calidad);
        }

        resolve(comprimida);
      };
    });
  };

  const verificarImagenAntesDeEnviar = async (base64Image) => {
    setVerificandoImagen(true);
    setImagenValida(null);
    setErrorBackend("");

    try {
      const img = document.createElement('img');
      img.src = base64Image;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      if (img.width < 600 || img.height < 400) {
        setImagenValida(false);
        setMensajeImagen("La imagen es muy pequeña. Acerca la cámara al vehículo.");
        toast.error('Imagen demasiado pequeña');
        return false;
      }

      setImagenValida(true);
      setMensajeImagen("La imagen tiene buena calidad");
      toast.success('Imagen apta');
      return true;

    } catch (error) {
      console.error("Error al verificar imagen:", error);
      setImagenValida(false);
      setMensajeImagen("No se pudo verificar la imagen. Intenta de nuevo.");
      return false;
    } finally {
      setVerificandoImagen(false);
    }
  };

  const iniciarCamara = (slot = "placa") => {
    setActivePhotoSlot(slot);
    setShowCamera(true);
    setTimeout(() => {
      iniciarCamaraStream();
    }, 100);
  };

  const iniciarCamaraStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      setStream(mediaStream);
      setCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      toast.error('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  };

  const detenerCamara = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    setShowCamera(false);
  };

  const tomarFoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64 = canvas.toDataURL('image/jpeg', 0.95);
      const comprimida = await comprimirImagen(base64, 250);

      if (activePhotoSlot === "placa") {
        setFotoPlaca(comprimida);
        setPlacaValidada(false);
        setErrorBackend("");
        await verificarImagenAntesDeEnviar(base64);
        extraerPlacaDeFoto(comprimida);
      } else if (activePhotoSlot === "auto1") {
        setFotoAuto1(comprimida);
      } else if (activePhotoSlot === "auto2") {
        setFotoAuto2(comprimida);
      } else if (activePhotoSlot === "auto3") {
        setFotoAuto3(comprimida);
      }

      setFotoPreview(comprimida);
      toast.success('¡Foto capturada!');
      detenerCamara();
    }
  };

  const extraerPlacaDeFoto = async (base64) => {
    setBuscandoPlaca(true);
    const toastId = toast.loading("Analizando placa...");
    try {
      const resp = await fetch(`${API_URL}/vehiculos/extraer-placa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ fotoPlaca: base64 })
      });

      const data = await resp.json();
      if (data.plate_text) {
        setPlaca(data.plate_text);
        toast.success(`Placa detectada: ${data.plate_text}`, { id: toastId });
      } else {
        toast.error("No se pudo leer la placa automáticamente. Por favor ingrésala manual.", { id: toastId });
      }
    } catch (err) {
      console.error("Error extraiendo placa:", err);
      toast.error("Error al conectar con el servicio de reconocimiento", { id: toastId });
    } finally {
      setBuscandoPlaca(false);
    }
  };

  const validarPlaca = (placa) => {
    const placaRegex = /^[A-Z]{3}[0-9]{3}$/;
    return placaRegex.test(placa.toUpperCase());
  };

  async function guardarVehiculo(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setErrorBackend("");
    setLoading(true);

    // Validaciones
    if (!marca.trim()) {
      setError("La marca es requerida");
      toast.error("La marca es requerida");
      setLoading(false);
      return;
    }

    if (!modelo.trim()) {
      setError("El modelo es requerido");
      toast.error("El modelo es requerido");
      setLoading(false);
      return;
    }

    if (!placa.trim()) {
      setError("La placa es requerida");
      toast.error("La placa es requerida");
      setLoading(false);
      return;
    }

    if (!validarPlaca(placa)) {
      setError("Formato de placa inválido. Debe ser 3 letras seguidas de 3 números (ej: ABC123)");
      toast.error("Formato de placa inválido");
      setLoading(false);
      return;
    }

    if (!capacidad || parseInt(capacidad) < 1) {
      setError("La capacidad debe ser al menos 1 kg");
      toast.error("Capacidad inválida");
      setLoading(false);
      return;
    }

    if (!["MOTO", "BICICLETA", "CARRO", "FURGON"].includes(tipo)) {
      setError("Selecciona un tipo de vehículo válido");
      toast.error("Tipo de vehículo inválido");
      setLoading(false);
      return;
    }

    if (!fotoPlaca) {
      const errorMsg = "Debes tomar la foto de la placa para validación";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    if (!fotoAuto1 || !fotoAuto2 || !fotoAuto3) {
      const errorMsg = "Debes tomar las 3 fotos generales del vehículo";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    const toastId = toast.loading('Registrando vehículo...');

    try {
      const datosEnviar = {
        marca: marca.trim(),
        modelo: modelo.trim(),
        placa: placa.toUpperCase().trim(),
        tipo,
        capacidad: parseInt(capacidad),
        fotoPlaca: fotoPlaca,
        fotoAuto1: fotoAuto1,
        fotoAuto2: fotoAuto2,
        fotoAuto3: fotoAuto3
      };

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const respuesta = await fetch(`${API_URL}/vehiculos/`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(datosEnviar)
      });

      const data = await respuesta.json();

      toast.dismiss(toastId);

      if (respuesta.ok) {
        if (data.placaValidada) {
          setSuccess("✅ ¡Vehículo registrado y placa validada automáticamente!");
          toast.success('¡Vehículo y placa validados!', { duration: 5000 });
          setPlacaValidada(true);
        } else {
          setSuccess("✅ Vehículo registrado. La placa está pendiente de validación manual por un administrador.");
          toast.success('Vehículo registrado. Placa en revisión.', { duration: 6000 });
        }

        setMarca("");
        setModelo("");
        setPlaca("");
        setCapacidad("");
        setTipo("MOTO");
        setFotoPlaca("");
        setFotoAuto1("");
        setFotoAuto2("");
        setFotoAuto3("");
        setFotoPreview("");
        setImagenValida(null);

        setTimeout(() => {
          navigate("/driver-profile");
        }, 3000);
      } else {
        let mensajeError = data.error || data.message || 'Error al registrar el vehículo';

        if (mensajeError.toLowerCase().includes("placa") ||
          mensajeError.toLowerCase().includes("ilegible") ||
          mensajeError.toLowerCase().includes("calidad")) {
          setImagenValida(false);
          setErrorBackend(mensajeError);
          toast.error('❌ ' + mensajeError);
        } else {
          setError(mensajeError);
          toast.error(mensajeError);
        }
      }
    } catch (error) {
      console.error("Error completo:", error);
      toast.dismiss(toastId);
      toast.error('Error de conexión con el servidor');
      setError("Error de conexión con el servidor: " + error.message);
    } finally {
      setLoading(false);
    }
  }

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
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              padding: '16px',
              borderRadius: '10px',
            },
            success: {
              duration: 3000,
              iconTheme: { primary: '#4acfbd', secondary: '#fff' },
            },
            error: {
              duration: 4000,
              iconTheme: { primary: '#ff4b4b', secondary: '#fff' },
            },
          }}
        />

        <Navbar />

        <Container className="d-flex flex-column justify-content-center flex-grow-1 py-4">
          <Row className="justify-content-center align-items-center g-0">

            <Col md={6} className="d-none d-md-flex justify-content-center p-4">
              <img
                src={EscenaHomeBase}
                alt="DomiFlex Home"
                style={{ width: '100%', maxWidth: '500px', height: 'auto', filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.2))' }}
              />
            </Col>
            <Col xs={12} md={6}>
              <Card className="shadow-lg border-0" style={{ borderRadius: '25px', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                <Card.Body className="p-4 p-md-5">

                  <div className="text-center mb-4">
                    <img src={LogoDomiFlex} alt="Logo" style={{ width: '120px' }} />
                  </div>

                  <h3 className="text-center mb-4" style={{ color: '#62d8d9', fontWeight: '600' }}>
                    <FaCar className="me-2" />
                    Registro de Vehículo
                  </h3>

                  {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
                  {success && <Alert variant="success" className="py-2 small">{success}</Alert>}

                  {errorBackend && (
                    <Alert variant="danger" className="py-2 small d-flex align-items-center">
                      <FaExclamationTriangle className="me-2" />
                      {errorBackend}
                    </Alert>
                  )}

                  {placaValidada && (
                    <Alert variant="success" className="py-2 small d-flex align-items-center">
                      <FaCheckCircle className="me-2" />
                      ¡Placa validada correctamente!
                    </Alert>
                  )}

                  <Form onSubmit={guardarVehiculo}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold small">Marca <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="text"
                            value={marca}
                            onChange={(e) => setMarca(e.target.value)}
                            placeholder="Ej: Toyota, Renault"
                            disabled={loading}
                            style={{ borderRadius: '12px', backgroundColor: '#f8fafb', border: '1px solid #eee', padding: '10px 15px' }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold small">Modelo <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="text"
                            value={modelo}
                            onChange={(e) => setModelo(e.target.value)}
                            placeholder="Ej: Corolla, Logan"
                            disabled={loading}
                            style={{ borderRadius: '12px', backgroundColor: '#f8fafb', border: '1px solid #eee', padding: '10px 15px' }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold small">
                            <FaIdCard className="me-1" /> Placa <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={placa}
                            onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                            placeholder="ABC123"
                            maxLength="6"
                            style={{ borderRadius: '12px', backgroundColor: '#f8fafb', border: '1px solid #eee', padding: '10px 15px', textTransform: 'uppercase' }}
                            disabled={loading}
                            readOnly
                          />
                          <Form.Text className="text-muted small">
                            3 letras + 3 números (ej: ABC123)
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold small">Tipo de vehículo <span className="text-danger">*</span></Form.Label>
                          <Form.Select
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            disabled={loading}
                            style={{ borderRadius: '12px', backgroundColor: '#f8fafb', border: '1px solid #eee', padding: '10px 15px' }}
                          >
                            <option value="MOTO">MOTO</option>
                            <option value="BICICLETA">BICICLETA</option>
                            <option value="CARRO">CARRO</option>
                            <option value="FURGON">FURGÓN</option>
                          </Form.Select>
                          <Form.Text className="text-muted small">Medio de reparto del domicilio</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold small">Capacidad (kg) <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="number"
                            value={capacidad}
                            onChange={(e) => setCapacidad(e.target.value)}
                            placeholder="Ej: 10"
                            min="1"
                            disabled={loading}
                            style={{ borderRadius: '12px', backgroundColor: '#f8fafb', border: '1px solid #eee', padding: '10px 15px' }}
                          />
                          <Form.Text className="text-muted small">Capacidad de carga en kilogramos</Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="mb-4">
                      <Form.Label className="d-flex align-items-center fw-bold small">
                        <FaCamera className="me-2" />
                        Fotos Requeridas <span className="text-danger">*</span>
                      </Form.Label>

                      <Row className="g-3">
                        {/* Slot Placa */}
                        <Col xs={6} md={3}>
                          <div className={`photo-slot ${fotoPlaca ? 'has-photo' : ''}`}
                            onClick={() => iniciarCamara("placa")}
                            style={{
                              height: '100px',
                              border: '2px dashed #ddd',
                              borderRadius: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              position: 'relative',
                              overflow: 'hidden',
                              backgroundColor: fotoPlaca ? 'transparent' : '#f8f9fa'
                            }}>
                            {fotoPlaca ? (
                              <img src={fotoPlaca} alt="Placa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <>
                                <FaIdCard size={20} color="#62d8d9" />
                                <span style={{ fontSize: '10px', marginTop: '5px' }}>PLACA</span>
                              </>
                            )}
                            {placaValidada && <FaCheckCircle style={{ position: 'absolute', top: '5px', right: '5px', color: '#4acfbd' }} />}
                          </div>
                        </Col>

                        {/* Slot Auto 1 */}
                        <Col xs={6} md={3}>
                          <div className={`photo-slot ${fotoAuto1 ? 'has-photo' : ''}`}
                            onClick={() => iniciarCamara("auto1")}
                            style={{
                              height: '100px',
                              border: '2px dashed #ddd',
                              borderRadius: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              backgroundColor: fotoAuto1 ? 'transparent' : '#f8f9fa'
                            }}>
                            {fotoAuto1 ? (
                              <img src={fotoAuto1} alt="Auto 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <>
                                <FaCar size={20} color="#62d8d9" />
                                <span style={{ fontSize: '10px', marginTop: '5px' }}>AUTO 1</span>
                              </>
                            )}
                          </div>
                        </Col>

                        {/* Slot Auto 2 */}
                        <Col xs={6} md={3}>
                          <div className={`photo-slot ${fotoAuto2 ? 'has-photo' : ''}`}
                            onClick={() => iniciarCamara("auto2")}
                            style={{
                              height: '100px',
                              border: '2px dashed #ddd',
                              borderRadius: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              backgroundColor: fotoAuto2 ? 'transparent' : '#f8f9fa'
                            }}>
                            {fotoAuto2 ? (
                              <img src={fotoAuto2} alt="Auto 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <>
                                <FaCar size={20} color="#62d8d9" />
                                <span style={{ fontSize: '10px', marginTop: '5px' }}>AUTO 2</span>
                              </>
                            )}
                          </div>
                        </Col>

                        {/* Slot Auto 3 */}
                        <Col xs={6} md={3}>
                          <div className={`photo-slot ${fotoAuto3 ? 'has-photo' : ''}`}
                            onClick={() => iniciarCamara("auto3")}
                            style={{
                              height: '100px',
                              border: '2px dashed #ddd',
                              borderRadius: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              backgroundColor: fotoAuto3 ? 'transparent' : '#f8f9fa'
                            }}>
                            {fotoAuto3 ? (
                              <img src={fotoAuto3} alt="Auto 3" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <>
                                <FaCar size={20} color="#62d8d9" />
                                <span style={{ fontSize: '10px', marginTop: '5px' }}>AUTO 3</span>
                              </>
                            )}
                          </div>
                        </Col>
                      </Row>

                      <Form.Text className="text-muted d-block mt-2 small">
                        Haz clic en cada recuadro para capturar la foto correspondiente
                      </Form.Text>
                    </div>

                    {verificandoImagen && (
                      <Alert variant="info" className="py-2 small d-flex align-items-center">
                        <div className="spinner-border spinner-border-sm me-2" />
                        Verificando calidad de placa...
                      </Alert>
                    )}

                    {!verificandoImagen && imagenValida === true && (
                      <Alert variant="success" className="py-2 small d-flex align-items-center">
                        <FaSmile className="me-2" />
                        Placa validada por IA correctamente
                      </Alert>
                    )}

                    {!verificandoImagen && imagenValida === false && (
                      <Alert variant="warning" className="py-2 small d-flex align-items-center">
                        <FaFrown className="me-2" />
                        {mensajeImagen}
                      </Alert>
                    )}

                    <div className="mt-3 p-3 bg-light rounded-4 small" style={{ backgroundColor: '#f8fafb' }}>
                      <div className="fw-bold mb-2">
                        <FaExclamationTriangle className="me-1 text-warning" />
                        Recomendaciones
                      </div>
                      <ul className="mb-0 ps-3" style={{ color: '#666' }}>
                        <li>La placa debe ser claramente visible en su foto</li>
                        <li>Toma fotos generales del frente, lado y parte trasera</li>
                        <li>Buena iluminación y evita fotos borrosas</li>
                      </ul>
                    </div>

                    <div className="d-flex gap-2 mt-4">
                      <Button
                        type="submit"
                        className="flex-fill py-3 border-0"
                        style={{
                          background: (fotoPlaca && fotoAuto1 && fotoAuto2 && fotoAuto3) ? '#62d8d9' : '#6c757d',
                          borderRadius: '12px',
                          fontWeight: 'bold',
                          fontSize: '1rem'
                        }}
                        disabled={loading || !fotoPlaca || !fotoAuto1 || !fotoAuto2 || !fotoAuto3 || verificandoImagen}
                      >
                        {loading ? 'Registrando...' : 'Registrar vehículo'}
                      </Button>

                      <Button
                        variant="outline-secondary"
                        onClick={() => navigate("/driver-profile")}
                        className="px-4"
                        style={{ borderRadius: '12px' }}
                      >
                        <FaArrowLeft />
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>

        <Modal show={showCamera} onHide={detenerCamara} size="lg" centered>
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-bold">Tomar Foto del Vehículo</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center p-0">
            <div style={{ backgroundColor: '#000', minHeight: '450px', borderRadius: '0', position: 'relative' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '100%', height: 'auto', maxHeight: '500px' }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {!cameraActive && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white'
                }}>
                  <p>Iniciando cámara...</p>
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="secondary" onClick={detenerCamara} style={{ borderRadius: '12px' }}>
              Cancelar
            </Button>
            <Button
              variant="success"
              onClick={tomarFoto}
              disabled={!cameraActive}
              style={{ background: '#4acfbd', border: 'none', borderRadius: '12px' }}
            >
              <FaCamera className="me-2" /> Tomar Foto
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}

export default VehicleRegistration;