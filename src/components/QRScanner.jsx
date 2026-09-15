import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FaQrcode, FaCamera, FaUpload, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../pages/context/AuthContext';

function QRScanner({ show, onHide }) {
    const [error, setError] = useState('');
    const [scanMethod, setScanMethod] = useState('camera');
    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const scannerRef = useRef(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const colores = {
        primary: '#113d69',    // Azul oscuro institucional
        secondary: '#62d8d9',  // Celeste/verde agua
        accent: '#ffffff'
    };

    const ROLES = {
        ADMIN: 1,
        REPARTIDOR: 2,
        CLIENTE: 3,
        COMERCIO: 4
    };

    const handleClose = () => {
        if (scannerRef.current) {
            scannerRef.current.clear();
        }
        setScanning(false);
        onHide();
    };

    const procesarQR = async (decodedText) => {
        try {
            setLoading(true);
            setError('');
            
            console.log("📱 QR escaneado (completo):", decodedText);
            
            const partes = decodedText.split('|');
            const token = partes[0];
            const nombre = partes[1] || 'Usuario';
            
            console.log("🔑 Token extraído:", token.substring(0, 30) + "...");
            console.log("👤 Nombre extraído:", nombre);
            
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                console.log("📦 Token decodificado:", payload);
                
                const usuarioQR = {
                    id: payload.id,
                    email: payload.email,
                    idRol: payload.idRol,
                    nombre: nombre, 
                    ...payload
                };

                console.log("✅ Usuario a guardar:", usuarioQR);
                
                login(token, usuarioQR);
                
                setTimeout(() => {
                    const rolId = Number(usuarioQR.idRol);
                    if (rolId === 1) {
                        navigate('/dashboard/home');
                    } else if (rolId === 2) {
                        navigate('/repartidor-home');
                    } else if (rolId === 3 || rolId === 4) {
                        navigate('/cliente-home');
                    }
                }, 500);

                onHide();

            } catch (e) {
                console.error("❌ Error decodificando token:", e);
                setError('Token inválido');
            }

        } catch (error) {
            console.error('❌ Error:', error);
            setError('Error al procesar el QR');
        } finally {
            setLoading(false);
        }
    };

    const startCameraScan = () => {
        setError('');
        setScanning(true);

        setTimeout(() => {
            const scanner = new Html5QrcodeScanner(
                'qr-reader',
                {
                    fps: 5,
                    qrbox: { width: 300, height: 300 },
                    rememberLastUsedCamera: true,
                    showTorchButtonIfSupported: true,
                    aspectRatio: 1.0,
                    defaultZoomValueIfSupported: 2,
                    videoConstraints: {
                        facingMode: "environment"
                    }
                },
                false
            );

            scanner.render(
                (decodedText) => {
                    console.log("✅ QR escaneado con cámara");
                    const clearPromise = (scanner && scanner.getState() === 2)
                        ? scanner.clear()
                        : Promise.resolve();

                    clearPromise.then(() => {
                        setScanning(false);
                        procesarQR(decodedText);
                    }).catch(err => {
                        console.error("Error al limpiar scanner:", err);
                        setScanning(false);
                        procesarQR(decodedText);
                    });
                },
                (errorMessage) => {
                    if (!errorMessage?.includes('NotFoundException')) {
                        console.log('Error escáner:', errorMessage);
                    }
                }
            );
            scannerRef.current = scanner;
        }, 100);
    };

    const stopScanning = () => {
        if (scannerRef.current) {
            scannerRef.current.clear();
            scannerRef.current = null;
        }
        setScanning(false);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setError('');

        if (!file.type.startsWith('image/')) {
            setError('Por favor, selecciona un archivo de imagen válido');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                import('html5-qrcode').then(({ Html5Qrcode }) => {
                    const element = document.getElementById('qr-reader-file');
                    if (!element) {
                        setError('Error interno del escáner');
                        return;
                    }

                    const html5QrCode = new Html5Qrcode('qr-reader-file');

                    html5QrCode.scanFile(file, true)
                        .then(decodedText => {
                            console.log("✅ QR leído de archivo");
                            html5QrCode.clear();
                            procesarQR(decodedText);
                        })
                        .catch(err => {
                            console.error('❌ Error:', err);
                            if (err.toString().includes('NotFoundException')) {
                                setError('No se encontró ningún código QR en la imagen. Asegúrate de que la imagen sea clara y el QR esté bien visible.');
                            } else {
                                setError('No se pudo leer el código QR. Intenta con otra imagen.');
                            }
                        });
                });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear();
            }
        };
    }, []);

    return (
        <Modal 
            show={show} 
            onHide={handleClose} 
            size="lg" 
            centered
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
                    <FaQrcode className="me-3" size={28} />
                    Escanear Código QR
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-5">
                <div className="d-flex justify-content-center mb-4">
                </div>

                {loading && (
                    <div className="text-center mb-4 p-4">
                        <div 
                            className="spinner-border" 
                            style={{ color: colores.secondary }} 
                            role="status"
                        >
                            <span className="visually-hidden">Procesando...</span>
                        </div>
                        <p className="mt-3" style={{ color: colores.primary, fontWeight: '500' }}>
                            Procesando QR...
                        </p>
                    </div>
                )}

                {error && (
                    <Alert 
                        variant="danger" 
                        className="text-center rounded-4 mb-4"
                        style={{ 
                            background: 'linear-gradient(135deg, #f8d7da, #f5c6cb)',
                            border: 'none',
                            borderLeft: `4px solid ${colores.primary}`,
                            color: '#721c24'
                        }}
                    >
                        <FaInfoCircle className="me-2" />
                        {error}
                    </Alert>
                )}

                {scanMethod === 'camera' && !loading && (
                    <div>
                        {!scanning ? (
                            <div className="text-center p-4">
                                <div 
                                    className="mb-4 p-4 rounded-4"
                                    style={{ 
                                        background: `linear-gradient(135deg, ${colores.primary}08, ${colores.secondary}08)`,
                                        border: `1px solid ${colores.secondary}30`
                                    }}
                                >
                                    <FaCamera size={48} style={{ color: colores.primary }} className="mb-3" />
                                    <p className="mb-3" style={{ color: colores.primary }}>
                                        Haz clic en "Iniciar Cámara" para comenzar a escanear
                                    </p>
                                </div>
                                <Button
                                    onClick={startCameraScan}
                                    variant="success"
                                    size="lg"
                                    style={{ 
                                        borderRadius: '50px',
                                        padding: '12px 35px',
                                        background: `linear-gradient(135deg, ${colores.primary}, ${colores.secondary})`,
                                        border: 'none',
                                        fontWeight: '500',
                                        boxShadow: `0 10px 20px -5px ${colores.primary}60`,
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = `0 15px 30px -5px ${colores.primary}80`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = `0 10px 20px -5px ${colores.primary}60`;
                                    }}
                                >
                                    <FaCamera className="me-2" />
                                    Iniciar Cámara
                                </Button>
                            </div>
                        ) : (
                            <div>
                                <div 
                                    id="qr-reader" 
                                    style={{ 
                                        width: '100%',
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        border: `2px solid ${colores.secondary}`,
                                        boxShadow: `0 20px 40px -10px ${colores.primary}40`
                                    }}
                                ></div>
                                <div className="text-center mt-4">
                                    <Button
                                        onClick={stopScanning}
                                        variant="danger"
                                        style={{ 
                                            borderRadius: '50px',
                                            padding: '10px 30px',
                                            background: 'linear-gradient(135deg, #dc3545, #c82333)',
                                            border: 'none',
                                            fontWeight: '500'
                                        }}
                                    >
                                        <FaTimes className="me-2" />
                                        Detener Escaneo
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {scanMethod === 'upload' && !loading && (
                    <div className="text-center">
                        <div
                            className="rounded-4 p-5 mb-4"
                            style={{
                                border: `2px dashed ${colores.secondary}`,
                                cursor: 'pointer',
                                background: `linear-gradient(135deg, ${colores.primary}05, ${colores.secondary}05)`,
                                transition: 'all 0.3s ease'
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = `${colores.primary}10`;
                                e.currentTarget.style.borderColor = colores.primary;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.borderColor = colores.secondary;
                            }}
                        >
                            <FaUpload 
                                size={50} 
                                className="mb-3" 
                                style={{ color: colores.primary }} 
                            />
                            <h5 style={{ color: colores.primary, fontWeight: '500' }}>
                                Haz clic para seleccionar una imagen
                            </h5>
                            <p className="text-muted mb-0">
                                Arrastra o selecciona una imagen con código QR
                            </p>
                            <p className="text-muted small mt-2">
                                Formatos soportados: PNG, JPG, JPEG
                            </p>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                        />

                        <div id="qr-reader-file" style={{ display: 'none' }}></div>

                        <Alert 
                            variant="info" 
                            className="text-start rounded-4 mt-3"
                            style={{ 
                                background: `linear-gradient(135deg, ${colores.primary}08, ${colores.secondary}08)`,
                                border: `1px solid ${colores.secondary}30`,
                                color: colores.primary
                            }}
                        >
                            <FaInfoCircle className="me-2" style={{ color: colores.secondary }} />
                            Asegúrate de que el código QR esté bien iluminado y enfocado para una mejor lectura.
                        </Alert>
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer className="border-0 pt-0">
                <Button 
                    variant="secondary" 
                    onClick={handleClose} 
                    disabled={loading}
                    style={{ 
                        borderRadius: '50px',
                        padding: '10px 30px',
                        background: '#e0e0e0',
                        border: 'none',
                        color: '#666',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#d0d0d0';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#e0e0e0';
                    }}
                >
                    Cancelar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default QRScanner;