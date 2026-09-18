import React, { useRef, useCallback, useEffect, useState } from "react";
import { Download, Mail, QrCode, Printer, Clock, User, ShieldCheck } from "lucide-react";
import { Modal, Button, Alert, Badge } from 'react-bootstrap';
import QRCode from 'react-qr-code';

import PropTypes from 'prop-types';

const QRModal = ({
  show,
  onHide,
  qrValue,
  usuario,
  onDownload,
  onPrint,
  titulo = "Tu código QR de acceso",
  mensajeExpiracion = "Este código QR expira en tres horas"
}) => {
  const qrContainerRef = useRef(null);
  const [qrReady, setQrReady] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const colores = {
    primary: '#113d69',    // Azul oscuro institucional
    secondary: '#62d8d9',  // Celeste/verde agua
    accent: '#ffffff'
  };

  const getRolNombre = (idRol) => {
    const roles = {
      1: 'Administrador',
      2: 'Repartidor',
      3: 'Cliente',
      4: 'Comercio'
    };
    return roles[idRol] || 'Usuario';
  };

  const getRolColor = (idRol) => {
    const coloresRol = {
      1: '#ff6b6b',  // Rojo para admin
      2: colores.secondary,  // Celeste para repartidor
      3: '#f59e0b',   // Naranja para cliente
      4: '#8b5cf6'   // Morado para comercio
    };
    return coloresRol[idRol] || colores.secondary;
  };

  useEffect(() => {
    if (!show || !qrValue) {
      setQrReady(false);
      return;
    }

    const timer = setTimeout(() => {
      if (qrContainerRef.current) {
        console.log("✅ QR listo!");
        setQrReady(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [show, qrValue]);

  useEffect(() => {
    if (copiado) {
      const timer = setTimeout(() => setCopiado(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiado]);

  const svgToPng = (svgElement) => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 500;

        const svgData = new XMLSerializer().serializeToString(svgElement);

        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          URL.revokeObjectURL(url);

          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/png');
        };

        img.onerror = reject;
        img.src = url;
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleDownload = useCallback(async () => {
    console.log("📥 Iniciando descarga...");

    if (onDownload) {
      onDownload();
      return;
    }

    const svgElement = qrContainerRef.current?.querySelector('svg');
    if (!svgElement) {
      alert("Error: No se encontró el código QR");
      return;
    }

    try {
      const blob = await svgToPng(svgElement);

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR-${usuario?.nombre?.replace(/\s+/g, '-') || 'usuario'}.png`;

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 100);

    } catch (error) {
      console.error("Error:", error);
      alert("Error al descargar el QR");
    }
  }, [onDownload, usuario?.nombre]);

  const handlePrint = useCallback(() => {
    const svgElement = qrContainerRef.current?.querySelector('svg');
    if (!svgElement) {
      alert("Error: No se encontró el código QR");
      return;
    }

    svgToPng(svgElement).then((blob) => {
      const url = URL.createObjectURL(blob);

      const ventanaImpresion = window.open('', '_blank');
      ventanaImpresion.document.write(`
        <html>
          <head>
            <title>QR de Acceso - ${usuario?.nombre || 'Usuario'}</title>
            <style>
              body { 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh; 
                font-family: 'Segoe UI', Arial, sans-serif; 
                margin: 0; 
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); 
              }
              .container { 
                text-align: center; 
                background: white; 
                padding: 40px; 
                border-radius: 30px; 
                box-shadow: 0 20px 60px rgba(17, 61, 105, 0.3);
                max-width: 500px;
                border: 1px solid rgba(98, 216, 217, 0.3);
              }
              img { 
                max-width: 100%; 
                border: 3px solid ${colores.primary}; 
                padding: 20px; 
                border-radius: 20px; 
                background: white;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              }
              h2 { 
                color: ${colores.primary}; 
                margin-bottom: 20px;
                font-weight: 600;
              }
              .info-card {
                background: linear-gradient(135deg, ${colores.primary}10, ${colores.secondary}10);
                padding: 20px;
                border-radius: 15px;
                margin: 20px 0;
                border-left: 4px solid ${colores.secondary};
              }
              .badge-rol {
                background: ${colores.secondary};
                color: white;
                padding: 5px 15px;
                border-radius: 50px;
                display: inline-block;
                margin: 10px 0;
              }
              .warning { 
                color: #f39c12; 
                font-size: 12px; 
                margin-top: 20px;
                border-top: 1px dashed #ddd;
                padding-top: 15px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>🔐 QR de Acceso</h2>
              <div class="info-card">
                <p style="margin:5px 0"><strong>${usuario?.nombre || 'Usuario'}</strong></p>
                <p style="margin:5px 0; color:#666;">${usuario?.email || ''}</p>
                <span class="badge-rol">${getRolNombre(usuario?.idRol)}</span>
              </div>
              <img src="${url}" alt="QR Code" />
              <p style="margin-top:20px; font-weight:500;">Escanea este código para iniciar sesión</p>
              <p class="warning"><small>${mensajeExpiracion}</small></p>
            </div>
          </body>
        </html>
      `);
      ventanaImpresion.document.close();
      ventanaImpresion.focus();
      setTimeout(() => ventanaImpresion.print(), 250);
    });
  }, [usuario, mensajeExpiracion]);

  const copyToClipboard = () => {
    if (qrValue) {
      navigator.clipboard.writeText(qrValue);
      setCopiado(true);
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      size="lg"
      style={{ fontFamily: "'Segoe UI', Roboto, sans-serif" }}
    >
      <Modal.Header 
        closeButton 
        style={{ 
          background: `linear-gradient(135deg, ${colores.primary} 0%, ${colores.secondary} 100%)`,
          color: 'white',
          borderBottom: 'none',
          padding: '1.5rem 2rem'
        }}
      >
        <Modal.Title className="d-flex align-items-center fw-bold">
          <QrCode className="me-3" size={28} />
          {titulo}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-5">
        {qrValue ? (
          <>
            {!qrReady && (
              <div className="text-center mb-4 p-4">
                <div className="spinner-border" style={{ color: colores.secondary }} role="status">
                  <span className="visually-hidden">Generando...</span>
                </div>
                <p className="mt-3 text-muted">Generando código QR seguro...</p>
              </div>
            )}

            <div className="text-center" style={{ opacity: qrReady ? 1 : 0.3 }}>
              {/* Tarjeta del QR con efecto glassmorphism */}
              <div
                ref={qrContainerRef}
                style={{
                  padding: '25px',
                  background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                  borderRadius: '24px',
                  display: 'inline-block',
                  marginBottom: '25px',
                  border: `2px solid ${colores.secondary}`,
                  boxShadow: `0 20px 40px -10px ${colores.primary}40`,
                  transition: 'transform 0.3s ease',
                  transform: qrReady ? 'scale(1)' : 'scale(0.98)'
                }}
              >
                <QRCode
                  value={qrValue}
                  size={256}
                  level="H"
                  fgColor={colores.primary}
                  bgColor="#ffffff"
                />
              </div>

              {/* Tarjeta de información del usuario */}
              <div 
                className="p-4 rounded-4 mb-4 text-start"
                style={{ 
                  background: `linear-gradient(135deg, ${colores.primary}08, ${colores.secondary}08)`,
                  border: `1px solid ${colores.secondary}30`,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.02)'
                }}
              >
                <div className="d-flex align-items-center mb-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      background: `linear-gradient(135deg, ${colores.primary}, ${colores.secondary})`,
                      color: 'white'
                    }}
                  >
                    <User size={24} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1" style={{ color: colores.primary }}>
                      {usuario?.nombre || 'Usuario'}
                    </h5>
                    <div className="d-flex align-items-center text-muted">
                      <Mail size={12} className="me-1" />
                      <small>{usuario?.email || 'Email no disponible'}</small>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-3 mt-3">
                  <Badge 
                    pill
                    style={{ 
                      background: getRolColor(usuario?.idRol),
                      color: 'white',
                      padding: '8px 16px',
                      fontSize: '0.85rem'
                    }}
                  >
                    <User size={14} className="me-1" />
                    {getRolNombre(usuario?.idRol)}
                  </Badge>
                  
                  <Badge 
                    pill
                    style={{ 
                      background: `${colores.secondary}20`,
                      color: colores.primary,
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      border: `1px solid ${colores.secondary}`
                    }}
                  >
                    <Clock className="me-1" />
                    {mensajeExpiracion}
                  </Badge>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="d-flex gap-3 justify-content-center mt-4">
                <Button
                  variant="outline-primary"
                  size="lg"
                  onClick={handleDownload}
                  disabled={!qrReady}
                  style={{ 
                    borderColor: colores.primary,
                    color: colores.primary,
                    padding: '12px 30px',
                    borderRadius: '50px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colores.primary;
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = colores.primary;
                  }}
                >
                  <Download className="me-2" />
                  Descargar QR
                </Button>
                
                <Button
                  variant="outline-secondary"
                  size="lg"
                  onClick={handlePrint}
                  disabled={!qrReady}
                  style={{ 
                    borderColor: colores.secondary,
                    color: colores.primary,
                    padding: '12px 30px',
                    borderRadius: '50px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colores.secondary;
                    e.target.style.color = colores.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = colores.primary;
                  }}
                >
                  <Printer className="me-2" />
                  Imprimir QR
                </Button>
              </div>

              {/* Alerta de seguridad mejorada */}
              <Alert 
                variant="warning" 
                className="mt-4 mb-0 text-start rounded-4"
                style={{ 
                  background: `linear-gradient(135deg, #fff3cd, #ffe9b0)`,
                  border: 'none',
                  borderLeft: `4px solid ${colores.secondary}`,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.05)'
                }}
              >
                <div className="d-flex align-items-center mb-2">
                  <ShieldCheck className="me-2" size={20} style={{ color: colores.primary }} />
                  <strong style={{ color: colores.primary }}>Información de Seguridad</strong>
                </div>
                <ul className="mb-0 ps-3" style={{ color: '#856404' }}>
                  <li className="mb-1">Este QR contiene tu token de acceso personal</li>
                  <li className="mb-1">No lo compartas con nadie - es tan seguro como tu contraseña</li>
                  <li className="mb-1"><strong>{mensajeExpiracion}</strong></li>
                  <li>Si alguien más lo escanea, tendrá acceso a tu cuenta</li>
                </ul>
              </Alert>

              {/* Botón para copiar token (solo para administradores) */}
              {usuario?.idRol === 1 && (
                <div className="mt-3">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={copyToClipboard}
                    style={{ color: colores.secondary, textDecoration: 'none' }}
                  >
                    {copiado ? '✓ Token copiado' : '📋 Copiar token (solo admin)'}
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Alert 
            variant="info" 
            className="text-center p-5 rounded-4"
            style={{ 
              background: `linear-gradient(135deg, #d1ecf1, #bee5eb)`,
              border: 'none'
            }}
          >
            <QrCode size={48} className="mb-3 opacity-50" />
            <h5>No hay datos para generar el QR</h5>
            <p className="mb-0 text-muted">Intenta nuevamente o contacta al soporte</p>
          </Alert>
        )}
      </Modal.Body>
    </Modal>
  );
};

QRModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  qrValue: PropTypes.string,
  usuario: PropTypes.shape({
    nombre: PropTypes.string,
    email: PropTypes.string,
    idRol: PropTypes.number
  }),
  onDownload: PropTypes.func,
  onPrint: PropTypes.func,
  titulo: PropTypes.string,
  mensajeExpiracion: PropTypes.string
};

export default QRModal;