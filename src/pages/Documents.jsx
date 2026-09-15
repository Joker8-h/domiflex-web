import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Modal, Badge, Table } from "react-bootstrap";
import { FaIdCard, FaFileImage, FaArrowLeft, FaCheckCircle, FaCamera, FaVideo, FaExclamationTriangle, FaSmile, FaFrown, FaCalendarAlt, FaUser } from "react-icons/fa";
import { useAuth } from "./context/AuthContext";
import { API_URL } from "../config";
import Navbar from '../components/Navbar';
import LogoDomiFlex from './Imagenes/BANNER COMPLETO CON TRANSPARENCIA.png';
import EscenaHomeBase from './Imagenes/HomeBaseImage.png';
import FondoPantalla from './Imagenes/AutoresContacto.png';
import toast, { Toaster } from 'react-hot-toast';

// Estilos personalizados para el botón de tomar foto (mismo que en VehicleRegistration)
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

function Documents() {
  const navigate = useNavigate();
  const { token, usuario } = useAuth();

  const [frontalBase64, setFrontalBase64] = useState("");
  const [frontalPreview, setFrontalPreview] = useState("");
  const [frontalComprimida, setFrontalComprimida] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [datosExtraidos, setDatosExtraidos] = useState(null);

  const [showCameraFrontal, setShowCameraFrontal] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);

  const [documentoValido, setDocumentoValido] = useState(null);
  const [mensajeDocumento, setMensajeDocumento] = useState("");
  const [verificandoDocumento, setVerificandoDocumento] = useState(false);
  const [errorDocumentoBackend, setErrorDocumentoBackend] = useState("");

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

  const verificarDocumentoAntesDeEnviar = async (base64Image) => {
    setVerificandoDocumento(true);
    setDocumentoValido(null);
    setErrorDocumentoBackend("");

    try {
      const img = document.createElement('img');
      img.src = base64Image;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      if (img.width < 400 || img.height < 300) {
        setDocumentoValido(false);
        setMensajeDocumento("La imagen es muy pequeña. Acerca la cámara al documento.");
        toast.error('Imagen demasiado pequeña');
        return false;
      }

      setDocumentoValido(true);
      setMensajeDocumento("La imagen tiene buena calidad para verificación");
      toast.success('Imagen apta para verificación');
      return true;

    } catch (error) {
      console.error("Error al verificar imagen:", error);
      setDocumentoValido(false);
      setMensajeDocumento("No se pudo verificar la imagen. Intenta de nuevo.");
      return false;
    } finally {
      setVerificandoDocumento(false);
    }
  };

  const iniciarCamara = () => {
    setShowCameraFrontal(true);
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
    setShowCameraFrontal(false);
  };

  const tomarFoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const fotoBase64 = canvas.toDataURL('image/jpeg', 0.95);

      setFrontalBase64(fotoBase64);
      setFrontalPreview(fotoBase64);

      const comprimida = await comprimirImagen(fotoBase64, 250);
      setFrontalComprimida(comprimida);

      setErrorDocumentoBackend("");
      await verificarDocumentoAntesDeEnviar(fotoBase64);

      toast.success('¡Foto tomada correctamente!');
      detenerCamara();
    }
  };

  async function guardarDocumentacion(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setErrorDocumentoBackend("");
    setLoading(true);

    if (!frontalComprimida) {
      const errorMsg = "Debes tomar la foto del documento";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    const toastId = toast.loading('Enviando documentación...');

    try {
      const datosEnviar = {
        tipoDocumento: "LICENCIA_CONDUCCION",
        imagenFrontal: frontalComprimida
      };

      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const respuesta = await fetch(`${API_URL}/documentacion/documentacion_subir`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(datosEnviar)
      });

      const data = await respuesta.json();

      toast.dismiss(toastId);

      if (respuesta.ok) {
        setSuccess("✅ ¡Licencia de conducir enviada exitosamente para revisión!");
        toast.success('Documentación enviada correctamente');

        if (data.datosLicencia) {
          setDatosExtraidos(data.datosLicencia);
        }

        setTimeout(() => {
          navigate("/repartidor-profile");
        }, 2000);
      } else {
        let mensajeError = data.error || data.message || 'Error al enviar la documentación';

        if (mensajeError.toLowerCase().includes("documento") ||
          mensajeError.toLowerCase().includes("ilegible") ||
          mensajeError.toLowerCase().includes("calidad")) {

          setDocumentoValido(false);
          setErrorDocumentoBackend(mensajeError);
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

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'No disponible';
    }
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
                    <FaIdCard className="me-2" />
                    Registro de Licencia de Conducir
                  </h3>

                  {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
                  {success && <Alert variant="success" className="py-2 small">{success}</Alert>}

                  {errorDocumentoBackend && (
                    <Alert variant="danger" className="py-2 small d-flex align-items-center">
                      <FaExclamationTriangle className="me-2" />
                      {errorDocumentoBackend}
                    </Alert>
                  )}

                  <Form onSubmit={guardarDocumentacion}>
                    <Form.Group className="mb-4">
                      <Form.Label className="d-flex align-items-center fw-bold small">
                        <FaFileImage className="me-2" />
                        Fotografía de la Licencia de Conducir <span className="text-danger">*</span>
                        {frontalBase64 && <FaCheckCircle className="text-success ms-2" size={18} />}
                        {frontalBase64 && documentoValido === true && (
                          <Badge bg="success" className="ms-2 small">Válida</Badge>
                        )}
                        {frontalBase64 && documentoValido === false && (
                          <Badge bg="warning" className="ms-2 small">Revisar</Badge>
                        )}
                      </Form.Label>
                      <Form.Text className="text-muted d-block mb-2 small">
                        Toma una foto clara y legible de tu licencia de conducir donde se vean todos tus datos
                      </Form.Text>

                      <Button
                        variant="outline-success"
                        onClick={iniciarCamara}
                        className="custom-tomar-foto-btn"
                        disabled={cameraActive || verificandoDocumento || loading}
                      >
                        <FaVideo className="me-2" />
                        {frontalBase64 ? 'Tomar otra foto' : 'Tomar foto de la licencia'}
                      </Button>

                      {frontalPreview && (
                        <div className="text-center mt-3">
                          <div style={{
                            maxHeight: '200px',
                            border: `2px solid ${documentoValido === true ? '#4acfbd' : documentoValido === false ? '#ffc107' : '#ddd'}`,
                            borderRadius: '12px',
                            overflow: 'hidden',
                            display: 'inline-block'
                          }}>
                            <img
                              src={frontalPreview}
                              alt="Vista previa de la licencia"
                              style={{ maxHeight: '200px', width: 'auto' }}
                            />
                          </div>
                        </div>
                      )}
                    </Form.Group>

                    {verificandoDocumento && (
                      <Alert variant="info" className="py-2 small d-flex align-items-center">
                        <div className="spinner-border spinner-border-sm me-2" />
                        Verificando calidad de imagen...
                      </Alert>
                    )}

                    {!verificandoDocumento && documentoValido === true && (
                      <Alert variant="success" className="py-2 small d-flex align-items-center">
                        <FaSmile className="me-2" />
                        {mensajeDocumento}
                      </Alert>
                    )}

                    {!verificandoDocumento && documentoValido === false && (
                      <Alert variant="warning" className="py-2 small d-flex align-items-center">
                        <FaFrown className="me-2" />
                        {mensajeDocumento}
                      </Alert>
                    )}

                    {datosExtraidos && (
                      <Card className="mt-4 border-0 shadow-sm">
                        <Card.Header className="bg-success text-white py-2" style={{ borderRadius: '12px 12px 0 0' }}>
                          <FaCheckCircle className="me-2" />
                          Datos extraídos de la licencia
                        </Card.Header>
                        <Card.Body className="p-3">
                          <Table borderless size="sm" className="mb-0">
                            <tbody>
                              {datosExtraidos.nombre && (
                                <tr>
                                  <td className="fw-bold" style={{ width: '40%' }}><FaUser className="me-2 text-success" />Nombre:</td>
                                  <td>{datosExtraidos.nombre}</td>
                                </tr>
                              )}
                              {datosExtraidos.identificacion && (
                                <tr>
                                  <td className="fw-bold"><FaIdCard className="me-2 text-success" />Identificación:</td>
                                  <td>{datosExtraidos.identificacion}</td>
                                </tr>
                              )}
                              {datosExtraidos.fechaExpedicion && (
                                <tr>
                                  <td className="fw-bold"><FaCalendarAlt className="me-2 text-success" />Fecha Expedición:</td>
                                  <td>{formatearFecha(datosExtraidos.fechaExpedicion)}</td>
                                </tr>
                              )}
                              {datosExtraidos.categoria && (
                                <tr>
                                  <td className="fw-bold">Categoría:</td>
                                  <td><Badge bg="info" className="px-3 py-1">{datosExtraidos.categoria}</Badge></td>
                                </tr>
                              )}
                            </tbody>
                          </Table>
                        </Card.Body>
                      </Card>
                    )}

                    <div className="mt-3 p-3 bg-light rounded-4 small" style={{ backgroundColor: '#f8fafb' }}>
                      <div className="fw-bold mb-2">
                        <FaExclamationTriangle className="me-1 text-warning" />
                        Recomendaciones para la foto
                      </div>
                      <ul className="mb-0 ps-3" style={{ color: '#666' }}>
                        <li>Usa buena iluminación, evita sombras</li>
                        <li>Asegura que todos los textos sean legibles</li>
                        <li>La licencia debe ocupar la mayor parte de la foto</li>
                        <li>Evita reflejos, brillos o fotos borrosas</li>
                        <li>La foto debe ser a color y nítida</li>
                      </ul>
                    </div>

                    <div className="d-flex gap-2 mt-4">
                      <Button
                        type="submit"
                        className="flex-fill py-3 border-0"
                        style={{
                          background: frontalComprimida ? '#62d8d9' : '#6c757d',
                          borderRadius: '12px',
                          fontWeight: 'bold',
                          fontSize: '1rem'
                        }}
                        disabled={loading || !frontalComprimida || verificandoDocumento}
                      >
                        {loading ? 'Enviando...' : 'Enviar licencia para revisión'}
                      </Button>

                      <Button
                        variant="outline-secondary"
                        onClick={() => navigate("/repartidor-profile")}
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

        <Modal show={showCameraFrontal} onHide={detenerCamara} size="lg" centered>
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-bold">Tomar Foto de la Licencia</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center p-0">
            <div style={{ backgroundColor: '#000', minHeight: '450px', borderRadius: '0' }}>
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

export default Documents;