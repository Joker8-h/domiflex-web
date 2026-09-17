import React from 'react';
import { Container, Row, Col, Button, Image } from 'react-bootstrap';
import { Smartphone, Play } from "lucide-react";
import qrDescarga from '../pages/Imagenes/qr_descarga.png';

const AppDownloadBanner = () => {
    const brandColor = "#00E676";
    
    return (
        <section className="py-5" style={{ background: `linear-gradient(135deg, ${brandColor} 0%, #3a9382 100%)`, borderRadius: '40px', margin: '40px 20px', overflow: 'hidden' }}>
            <Container>
                <Row className="align-items-center text-center text-lg-start">
                    <Col lg={7} className="text-white ps-lg-5">
                        <h2 className="display-4 fw-bold mb-3 animate__animated animate__fadeInLeft">El domicilio que mereces,<br />a un escaneo de distancia.</h2>
                        <p className="lead mb-4 opacity-75 animate__animated animate__fadeInLeft animate__delay-1s">
                            Olvídate de las esperas. Únete a la comunidad de domicilios más rápida de la ciudad. Escanea y pide con nosotros.
                        </p>
                    </Col>
                    <Col lg={5} className="mt-5 mt-lg-0 text-center">
                        <div className="animate__animated animate__pulse animate__infinite animate__slower">
                            <style>
                                {`
                                @keyframes floating {
                                    0% { transform: translateY(0px); }
                                    50% { transform: translateY(-20px); }
                                    100% { transform: translateY(0px); }
                                }
                                `}
                            </style>
                            <div style={{
                                width: '280px',
                                height: '560px',
                                background: '#333',
                                borderRadius: '40px',
                                border: '10px solid #222',
                                margin: '0 auto',
                                boxShadow: '0 50px 100px rgba(0,0,0,0.4)',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                animation: 'floating 6s ease-in-out infinite'
                            }}>
                                {/* Mock camera notch */}
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '0', 
                                    width: '120px', 
                                    height: '25px', 
                                    background: '#222', 
                                    borderBottomLeftRadius: '15px', 
                                    borderBottomRightRadius: '15px',
                                    zIndex: 10
                                }}></div>

                                {/* QR Inside Phone Screen */}
                                <div style={{
                                    width: '92%',
                                    height: '96%',
                                    background: 'white',
                                    borderRadius: '30px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '20px'
                                }}>
                                    <h4 className="fw-bold mb-4" style={{ color: brandColor, fontSize: '1.2rem' }}>Descarga App</h4>
                                    <Image 
                                        src={qrDescarga} 
                                        alt="Escanea el QR" 
                                        fluid 
                                        style={{ width: '85%', borderRadius: '10px' }} 
                                    />
                                    <p className="mt-4 text-muted small fw-bold">DOMIFLEX MOBILE</p>
                                </div>
                                
                                {/* Reflection Effect */}
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)', pointerEvents: 'none' }}></div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default AppDownloadBanner;
