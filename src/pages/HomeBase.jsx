import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Image, Modal } from 'react-bootstrap';
import Navbar from '../components/Navbar';
import { API_URL } from '../config';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SavingsCalculator from '../components/SavingsCalculator';
import SustainabilitySection from '../components/SustainabilitySection';
import WaveDivider from '../components/WaveDivider';
import FaqSection from '../components/FaqSection';
import AppDownloadBanner from '../components/AppDownloadBanner';

// --- IMPORTACIÓN DE IMÁGENES ---
import imagencontacto from '../pages/Imagenes/AutoresContacto.png';
import imagenAbajo from '../pages/Imagenes/Mapa.png';
import ImagenFondoPaisaje from '../pages/Imagenes/Paisaje-tranquilo-con-plantas-verdes.png';
import ImagenHomebase from '../pages/Imagenes/HomeBaseImage.png';

// IMPORTACIONES DE LAS IMÁGENES DE AUTORES
import Arlys from './Autores/Arlys.PNG';
import Carlos from './Autores/Carlos.PNG';
import Janier from './Autores/Janier.PNG';
import JuanCeron from './Autores/JuanCeron.PNG';
import JuanOcampo from './Autores/JuanOcampo.PNG';
import Kevin from './Autores/Kevin.PNG';

function HomeBase() {
  // =======================
  // ESTADOS FORMULARIO
  // =======================

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    tipo: '',
    mensaje: ''
  });

  const [mensajeEstado, setMensajeEstado] = useState('');
  const [loading, setLoading] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const handleCloseContactModal = () => setShowContactModal(false);
  const handleShowContactModal = () => setShowContactModal(true);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeEstado('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/contacto/`,
        formData
      );

      setMensajeEstado(response.data.mensaje);

      setFormData({
        nombre: '',
        correo: '',
        tipo: '',
        mensaje: ''
      });

    } catch (error) {
      console.error(error);
      setMensajeEstado('Error al enviar el mensaje');
    }

    setLoading(false);
  };

  const autores = [
    { id: 1, nombre: "Arlys Villareal", rol: "Full Stack Developer", img: Arlys },
    { id: 2, nombre: "Carlos Rodriguez", rol: "Desarrollador Móvil", img: Carlos },
    { id: 3, nombre: "Janier Cerón", rol: "Frontend Engineer", img: Janier },
    { id: 4, nombre: "Juan Cerón", rol: "Frontend Diseño", img: JuanCeron },
    { id: 5, nombre: "Juan Ocampo", rol: "Tester", img: JuanOcampo },
    { id: 6, nombre: "Kevin Jaramillo", rol: "Product Owner", img: Kevin },
  ];

  const verdeMenta = '#56bca7';

  // TARJETAS PARA CLIENTES (4) — DomiFlex domicilios
  const slidesUsuario = [
    { id: 1, titulo: "Regístrate Como Cliente", desc: "¡Crea tu cuenta desde nuestra app!" },
    { id: 2, titulo: "Pide tu Domicilio", desc: "Solicita la recogida y entrega de tu pedido." },
    { id: 3, titulo: "Confirma tu Pedido", desc: "Revisa el costo de envío y confirma tu pedido." },
    { id: 4, titulo: "Recibe Seguro", desc: "Sigue tu pedido con repartidores verificados." },
  ];

  // TARJETAS PARA REPARTIDORES (4)
  const slidesRepartidor = [
    { id: 1, titulo: "Regístrate Como Repartidor", desc: "¡Regístrate como repartidor desde la web!" },
    { id: 2, titulo: "Acepta Pedidos", desc: "Recibe solicitudes de domicilios cerca de ti." },
    { id: 3, titulo: "Entrega y Confirma", desc: "Acepta pedidos y actualiza su estado de entrega." },
    { id: 4, titulo: "Gana Dinero", desc: "Optimiza tus entregas y genera ingresos extras." },
  ];

  // =======================
  // INTERACTIVIDAD AVANZADA
  // =======================
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    const handleScroll = () => setScrollPos(window.scrollY);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `url(${imagencontacto})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Resplandor que sigue al mouse (solo en el hero) */}
      {scrollPos < 600 && (
        <div style={{
          position: 'fixed',
          top: mousePos.y - 150,
          left: mousePos.x - 150,
          width: '300px',
          height: '300px',
          background: 'rgba(86, 188, 167, 0.15)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 1,
          transition: 'top 0.1s ease, left 0.1s ease'
        }}></div>
      )}

      <style>
        {`
          @keyframes floatBubble {
            0% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-40px) translateX(20px); }
            100% { transform: translateY(0) translateX(0); }
          }
          .team-card:hover .team-info {
            transform: translateY(-10px);
            background: rgba(86, 188, 167, 0.9) !important;
          }
        `}
      </style>

      {/* Burbujas de fondo decorativas */}
      <div style={{ position: 'fixed', top: '10%', left: '5%', width: '150px', height: '150px', background: 'rgba(86, 188, 167, 0.1)', borderRadius: '50%', filter: 'blur(40px)', animation: 'floatBubble 8s infinite ease-in-out', zIndex: 0 }}></div>
      <div style={{ position: 'fixed', bottom: '15%', right: '8%', width: '200px', height: '200px', background: 'rgba(17, 61, 105, 0.05)', borderRadius: '50%', filter: 'blur(50px)', animation: 'floatBubble 12s infinite ease-in-out reverse', zIndex: 0 }}></div>


      <div style={{ position: 'absolute', width: '100%', zIndex: 1000 }}>
        <Navbar transparent={true} />
      </div>

      <div style={{
        position: 'relative',
        minHeight: '650px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
        paddingTop: '80px'
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: `url(${ImagenFondoPaisaje})`, backgroundSize: 'cover',
          backgroundPosition: 'center', zIndex: 1
        }}></div>

        <Container style={{ position: 'relative', zIndex: 10, marginBottom: '2rem' }}>
          <Row className="justify-content-center text-center">
            <Col lg={10}>
              <h1 className="display-4 fw-bold mb-3 animate__animated animate__fadeInDown" style={{ color: '#113d69' }}>
                Domicilios rápidos. <span style={{ color: '#56bca7' }}>Repartidores verificados.</span>
              </h1>
            </Col>
          </Row>
        </Container>

        <div style={{
          position: 'relative',
          zIndex: 15,
          width: '100%',
          textAlign: 'center',
          marginTop: '-120px',
          transform: `translateY(${scrollPos * 0.15}px)`,
          transition: 'transform 0.1s ease-out'
        }}>
          <Image
            src={ImagenHomebase}
            alt="HomeBase Visual"
            fluid
            style={{
              maxWidth: '800px',
              width: '85%',
              borderRadius: '20px',
              filter: 'drop-shadow(0px 20px 40px rgba(0,0,0,0.2))',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.filter = 'drop-shadow(0px 30px 60px rgba(86, 188, 167, 0.3))'}
            onMouseLeave={(e) => e.currentTarget.style.filter = 'drop-shadow(0px 20px 40px rgba(0,0,0,0.2))'}
          />
        </div>


        <WaveDivider color="#ffffff" />
      </div>

      <div id="como-funciona-seccion" className="reveal-section"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '100px 0',
          marginTop: '60px',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.05)'
        }}>
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="fw-bold" style={{ fontSize: '2.5rem', color: '#113d69' }}>¿Cómo Funciona?</h2>
              {/* ELIMINADO EL TEXTO "Tres simples pasos para comenzar tu experiencia" */}
            </Col>
          </Row>

          {/* SECCIÓN PARA CLIENTES */}
          <h3 className="fw-bold mb-4" style={{ color: '#56bca7', textAlign: 'center' }}>Cliente</h3>
          <Row className="g-4 mb-5">
            {slidesUsuario.map((item) => (
              <Col key={item.id} xs={12} sm={6} lg={3}>
                <div style={{
                  background: 'transparent',
                  padding: '32px 24px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  textAlign: 'center',
                  color: '#113d69',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid rgba(86, 188, 167, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(86, 188, 167, 0.15)';
                  e.currentTarget.style.background = 'rgba(86, 188, 167, 0.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = 'transparent';
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '55px',
                    height: '55px',
                    borderTop: '4px solid #56bca7',
                    borderLeft: '4px solid #56bca7',
                    borderTopLeftRadius: '30px',
                  }} />
                  
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '55px',
                    height: '55px',
                    borderBottom: '4px solid #56bca7',
                    borderRight: '4px solid #56bca7',
                    borderBottomRightRadius: '30px',
                  }} />
                  
                  <h3 className="fw-bold mb-3" style={{ fontSize: '1.3rem', color: '#56bca7' }}>{item.titulo}</h3>
                  <p style={{ fontSize: '1rem', lineHeight: '1.5', color: '#113d69', marginBottom: 0 }}>{item.desc}</p>
                </div>
              </Col>
            ))}
          </Row>

          {/* SECCIÓN PARA REPARTIDORES */}
          <h3 className="fw-bold mb-4" style={{ color: '#56bca7', textAlign: 'center' }}>Repartidor</h3>
          <Row className="g-4">
            {slidesRepartidor.map((item) => (
              <Col key={item.id} xs={12} sm={6} lg={3}>
                <div style={{
                  background: 'white',
                  padding: '40px 24px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  textAlign: 'center',
                  color: '#113d69',
                   borderRadius: '24px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                  transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  cursor: 'pointer',
                  position: 'relative',
                  border: '1px solid transparent'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-15px) rotate(1deg)';
                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.12)';
                    e.currentTarget.style.borderColor = 'rgba(86, 188, 167, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) rotate(0)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.04)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}>
                  <div style={{
                    position: 'absolute',
                    top: -1,
                    left: -1,
                    width: '60px',
                    height: '60px',
                    borderTop: '6px solid #56bca7',
                    borderLeft: '6px solid #56bca7',
                    borderTopLeftRadius: '20px',
                  }} />

                  <div style={{
                    position: 'absolute',
                    bottom: -1,
                    right: -1,
                    width: '60px',
                    height: '60px',
                    borderBottom: '6px solid #56bca7',
                    borderRight: '6px solid #56bca7',
                    borderBottomRightRadius: '20px',
                  }} />

                  <h3 className="fw-bold mb-3" style={{ fontSize: '1.25rem', color: '#56bca7' }}>{item.titulo}</h3>
                  <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#113d69', marginBottom: 0 }}>{item.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      <WaveDivider color="#e8f6f3" flip={true} />
      <div id="sostenibilidad-seccion" className="reveal-section">
        <SustainabilitySection />
      </div>
      <WaveDivider color="#e8f6f3" />

      {/* NUEVAS SECCIONES: CALCULADORA */}
      <div id="calculadora-seccion" className="reveal-section">
        <SavingsCalculator />
      </div>


      <WaveDivider color="#56bca7" flip={true} />


      {/* SECCIÓN EQUIPO */}
      {/* SECCIÓN EQUIPO */}
      <div id="equipo-seccion" className="reveal-section">
        <Container className="py-5 mb-5">
          <Row className="justify-content-center">
            <Col lg={11}>
              <div style={{
                backgroundColor: verdeMenta,
                borderRadius: '50px',
                overflow: 'hidden',
                boxShadow: '0 30px 60px rgba(86, 188, 167, 0.4)',
                padding: '80px 40px',
                position: 'relative'
              }}>
                {/* Overlay decorativo */}
                <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                
                <div className="text-center mb-5" style={{ position: 'relative', zIndex: 2 }}>
                  <h2 className="fw-bold" style={{ color: '#fff', fontSize: '3rem', letterSpacing: '-1px' }}>Equipo DomiFlex</h2>
                  <p className="text-white" style={{ fontSize: '1.2rem', opacity: 0.95 }}>Los cerebros detrás de tu nueva forma de pedir domicilios</p>
                </div>
                <Row className="justify-content-center g-4" style={{ position: 'relative', zIndex: 2 }}>
                  {autores.map((autor) => (
                    <Col key={autor.id} xs={6} md={4} lg={2} className="text-center team-card">
                      <div style={{
                        width: '120px',
                        height: '120px',
                        margin: '0 auto',
                        borderRadius: '30px',
                        overflow: 'hidden',
                        backgroundColor: 'white',
                        border: '4px solid white',
                        boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                      }}
                        className="autor-img-container">
                        <Image
                          src={autor.img}
                          alt={autor.nombre}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease'
                          }}
                        />
                      </div>
                      <div className="team-info" style={{ transition: 'all 0.3s ease', paddingTop: '15px' }}>
                        <h6 className="fw-bold mb-0" style={{ color: '#fff', fontSize: '1.1rem' }}>{autor.nombre}</h6>
                        <p style={{ fontSize: '11px', color: '#113d69', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '6px', background: 'rgba(255,255,255,0.8)', padding: '2px 8px', borderRadius: '10px', display: 'inline-block' }}>{autor.rol}</p>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <WaveDivider color="#56bca7" />
      <div className="reveal-section">
        <FaqSection />
      </div>
      <div className="reveal-section">
        <AppDownloadBanner />
      </div>
      {/* SECCIÓN CONTACTO (Botón en la página) */}
      <Container id="contacto-seccion" className="py-5">
        <Row className="justify-content-center">
          <Col lg={8} className="text-center">
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '30px',
              padding: '50px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
            }}>
              <h2 className="fw-bold mb-3" style={{ color: '#113d69' }}>
                ¿Tienes dudas o sugerencias?
              </h2>
              <p className="mb-4 text-muted" style={{ fontSize: '1.1rem' }}>
                Estamos aquí para ayudarte. Déjanos un mensaje y te responderemos lo más pronto posible.
              </p>
              <Button
                onClick={handleShowContactModal}
                style={{
                  backgroundColor: verdeMenta,
                  border: 'none',
                  padding: '12px 40px',
                  borderRadius: '30px',
                  fontSize: '1.2rem',
                  fontWeight: '600'
                }}
              >
                Abrir Formulario de Contacto
              </Button>
            </div>
          </Col>
        </Row>
      </Container>


      {/* MODAL DE CONTACTO */}
      <Modal show={showContactModal} onHide={handleCloseContactModal} centered size="lg">
        <Modal.Header closeButton style={{ borderBottom: 'none', paddingBottom: '0' }}>
          <Modal.Title className="fw-bold w-100 text-center" style={{ color: '#113d69' }}>
            Contáctanos
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '30px' }}>
          <form onSubmit={handleSubmit}>

            <Row className="mb-3">
              <Col md={6}>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre completo"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="form-control"
                  style={{ borderRadius: '15px', padding: '12px' }}
                  required
                />
              </Col>

              <Col md={6}>
                <input
                  type="email"
                  name="correo"
                  placeholder="Correo electrónico"
                  value={formData.correo}
                  onChange={handleChange}
                  className="form-control"
                  style={{ borderRadius: '15px', padding: '12px' }}
                  required
                />
              </Col>
            </Row>

            <div className="mb-3">
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="form-select"
                style={{ borderRadius: '15px', padding: '12px' }}
                required
              >
                <option value="">Seleccione tipo</option>
                <option value="Soporte">Soporte</option>
                <option value="Sugerencia">Sugerencia</option>
                <option value="Reclamo">Reclamo</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="mb-4">
              <textarea
                name="mensaje"
                rows="4"
                placeholder="Escribe tu mensaje..."
                value={formData.mensaje}
                onChange={handleChange}
                className="form-control"
                style={{ borderRadius: '15px', padding: '12px' }}
                required
              />
            </div>

            <div className="text-center">
              <Button
                type="submit"
                style={{
                  backgroundColor: verdeMenta,
                  border: 'none',
                  padding: '10px 40px',
                  borderRadius: '30px',
                  fontWeight: '600'
                }}
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Mensaje'}
              </Button>
            </div>

            {mensajeEstado && (
              <p className="text-center mt-4 fw-semibold"
                style={{
                  color: mensajeEstado.includes('Error')
                    ? 'red'
                    : verdeMenta
                }}>
                {mensajeEstado}
              </p>
            )}

          </form>
        </Modal.Body>
      </Modal>

      <footer className="py-5 text-white text-center mt-auto" style={{ background: '#cccbd2af' }}>
        <Container>
          <h2 className="mb-4">Únete a nuestra comunidad</h2>
          <Button 
            as={Link} 
            to="/register" 
            variant="light" 
            className="px-5 fw-bold shadow-sm"
            style={{ 
              borderRadius: '30px', 
              transition: 'all 0.3s ease',
              transform: 'scale(1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Registrarse Ahora
          </Button>
          <p className="mt-5 text-white small">© 2026 DomiFlex.</p>
        </Container>
      </footer>
    </div>
  );
}

export default HomeBase;