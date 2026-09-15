import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar, Container, Nav, Dropdown, Image, Button } from "react-bootstrap";
import { FaUserCircle, FaDoorOpen, FaKey, FaQuestionCircle } from "react-icons/fa";
import Logo from '../pages/Imagenes/BANNER COMPLETO CON TRANSPARENCIA.png';
import { useAuth } from '../pages/context/AuthContext';
import { API_URL } from '../config';
import Notificaciones from '../components/Notificaciones';

export default function NavbarCustom({ transparent }) {
  const { token, usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [cargandoFoto, setCargandoFoto] = useState(false);

  useEffect(() => {
    const cargarFotoPerfil = async () => {
      if (!usuario?.idUsuarios || !token) return;
      setCargandoFoto(true);
      try {
        const respuesta = await fetch(
          `${API_URL}/auth/${usuario.idUsuarios}`,
          { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        if (!respuesta.ok) return;
        const data = await respuesta.json();
        if (data.fotoPerfil) setFotoPerfil(data.fotoPerfil);
        else if (data.foto) setFotoPerfil(data.foto);
      } catch (error) {
        console.error("Error al cargar foto de perfil:", error);
      } finally {
        setCargandoFoto(false);
      }
    };
    cargarFotoPerfil();
  }, [usuario, token]);

  const getFirstName = () => usuario?.nombre?.split(' ')[0] || 'Usuario';

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Función para navegar a HomeBase y hacer scroll a "¿Cómo funciona?"
  const goToComoFunciona = () => {
    if (location.pathname !== '/') {
      // Si no estamos en HomeBase, navegamos con estado
      navigate('/', { state: { scrollToComoFunciona: true } });
    } else {
      // Si ya estamos en HomeBase, hacemos scroll directo
      const seccion = document.getElementById('como-funciona-seccion');
      if (seccion) {
        seccion.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Si no encuentra la sección, esperamos un poco (por si el DOM no ha cargado)
        setTimeout(() => {
          const seccionRetry = document.getElementById('como-funciona-seccion');
          if (seccionRetry) {
            seccionRetry.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
      }
    }
  };

  // Función para hacer scroll directo al formulario de contacto (sólo en HomeBase)
  const goToContacto = () => {
    const seccion = document.getElementById('contacto-seccion');
    if (seccion) {
      seccion.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSection = (id) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollToSection: id } });
    } else {
      const seccion = document.getElementById(id);
      if (seccion) {
        seccion.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Efecto para manejar el scroll cuando se navega desde otra página
  useEffect(() => {
    const targetSection = location.state?.scrollToSection || (location.state?.scrollToComoFunciona ? 'como-funciona-seccion' : null);
    if (location.pathname === '/' && targetSection) {
      // Limpiamos el estado para no hacer scroll múltiples veces
      navigate(location.pathname, { replace: true, state: {} });

      // Pequeño delay para asegurar que el DOM esté listo
      setTimeout(() => {
        const seccion = document.getElementById(targetSection);
        if (seccion) {
          seccion.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [location.pathname, location.state, navigate]);

  const idRol = usuario?.idRol || usuario?.rol?.id;
  const rolNombre = (typeof usuario?.rol === 'string' ? usuario.rol : (usuario?.rol?.nombre || "")).toUpperCase();
  const isRepartidor = idRol === 2 || idRol === "2" || rolNombre === "REPARTIDOR";
  const homePath = isRepartidor ? "/repartidor-home" : "/cliente-home";
  const profilePath = isRepartidor ? "/repartidor-profile" : "/profile";
  const fotoAMostrar = fotoPerfil || usuario?.fotoPerfil || usuario?.foto;

  // El botón "¿Cómo funciona?" se muestra en TODAS las páginas
  // (no solo en HomeBase, para que siempre puedas ir a esa sección)

  return (
    <Navbar
      variant={transparent ? "light" : "dark"}
      expand="lg"
      className="sticky-top py-1"
      style={{
        backgroundColor: 'transparent',
        borderBottom: transparent,
        transition: 'all 0.3s ease-in-out',
        boxShadow: transparent ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <Container>
        {/* Contenedor flexible para logo y botón */}
        <div className="d-flex align-items-center">
          <Navbar.Brand as={Link} to={token ? homePath : "/"} className="me-3">
            <img
              src={Logo}
              height="65px"
              style={{ width: 'auto', objectFit: 'contain' }}
              className="me-1"
              alt="Logo DomiFlex"
            />
          </Navbar.Brand>

          {/* BOTÓN "CÓMO FUNCIONA" - SOLO VISIBLE EN HOMEBASE */}
          {location.pathname === '/' && (
            <Button
              variant="link"
              onClick={goToComoFunciona}
              className="d-flex align-items-center text-decoration-none"
              style={{
                color: '#56bca7',
                fontWeight: '600',
                fontSize: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                border: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#3da89a';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#56bca7';
                e.target.style.transform = 'scale(1)';
              }}
            >
              <FaQuestionCircle className="me-2" size={20} />
              ¿Cómo funciona?
            </Button>
          )}

          {/* BOTÓN "CONTÁCTANOS" - SOLO VISIBLE EN HOMEBASE */}
          {location.pathname === '/' && (
            <div className="d-none d-xl-flex">
              <Button variant="link" onClick={() => scrollToSection('sostenibilidad-seccion')} className="text-decoration-none nav-link-custom">Impacto</Button>
              <Button variant="link" onClick={() => scrollToSection('calculadora-seccion')} className="text-decoration-none nav-link-custom">Ahorro</Button>
              <Button variant="link" onClick={() => scrollToSection('equipo-seccion')} className="text-decoration-none nav-link-custom">Equipo</Button>
              <Button variant="link" onClick={goToContacto} className="text-decoration-none nav-link-custom">Contacto</Button>
            </div>
          )}
        </div>

        <Navbar.Toggle aria-controls="navbar-basico" />

        <Navbar.Collapse id="navbar-basico">
          <Nav className="ms-auto align-items-center">
            {/* ESTILO PARA LOS LINKS DEL NAVBAR */}
            <style>{`
              .nav-link-custom {
                color: #56bca7 !important;
                font-weight: 600;
                font-size: 0.95rem;
                padding: 0.5rem 1rem;
                transition: all 0.2s;
              }
              .nav-link-custom:hover {
                color: #2d5a52 !important;
                transform: translateY(-2px);
              }
            `}</style>
            {!token ? (
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                background: 'transparent',
                padding: 0,
                boxShadow: 'none',
              }}>
                {/* BOTÓN DE INICIO DE SESIÓN - SOLO ÍCONO EN CÍRCULO */}
                {/* BOTÓN DE INICIO DE SESIÓN - SOLO ÍCONO EN CÍRCULO */}
                <Nav.Link
                  as={Link}
                  to="/login"
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#56bca7',
                    borderRadius: '50%',
                    color: 'white',
                    transition: 'all 0.2s',
                    padding: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#3da89a';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#56bca7';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title="Iniciar Sesión"
                >
                  <FaDoorOpen size={22} />
                </Nav.Link>

                {/* BOTÓN DE REGISTRO - SOLO ÍCONO EN CÍRCULO */}
                <Nav.Link
                  as={Link}
                  to="/register"
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#56bca7',
                    borderRadius: '50%',
                    color: 'white',
                    transition: 'all 0.2s',
                    padding: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#3da89a';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#56bca7';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title="Registrarse"
                >
                  <FaKey size={20} />
                </Nav.Link>
              </div>
            ) : (
              <>
                <div className="me-3">
                  <Notificaciones />
                </div>

                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="link"
                    id="dropdown-user"
                    className="d-flex align-items-center text-decoration-none p-0 border-0"
                    style={{ color: 'black' }}
                  >
                    <span className="me-2 fw-bold d-none d-sm-inline text-dark">
                      Hola, {getFirstName()}
                    </span>

                    <div style={{
                      width: '35px', height: '35px', borderRadius: '50%',
                      overflow: 'hidden', backgroundColor: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid #56bca7'
                    }}>
                      {cargandoFoto ? (
                        <div className="spinner-border spinner-border-sm text-primary" role="status" />
                      ) : fotoAMostrar ? (
                        <Image
                          src={fotoAMostrar}
                          alt="Perfil"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <FaUserCircle size={30} color="#adb5bd" />
                      )}
                    </div>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="shadow border-0 mt-2">
                    <Dropdown.Item as={Link} to={profilePath}>Editar Perfil</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-danger">
                      Cerrar Sesión
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}