import React, { useState, useEffect } from 'react';
import { Car, Leaf, Building } from "lucide-react";
import { Container, Row, Col, Card } from 'react-bootstrap';


const SustainabilitySection = () => {
    const brandColor = "#56bca7";
    const lightGreen = "#e8f6f3";
    
    const [co2, setCo2] = useState(12540);

    // Efecto de contador en "tiempo real"
    useEffect(() => {
        const interval = setInterval(() => {
            setCo2(prev => prev + Math.floor(Math.random() * 3) + 1);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const impacts = [
        { icon: <Leaf size={40} />, title: "10/12/15%", desc: "Comisión justa por distancia en cada domicilio entregado.", delay: "0.2s" },
        { icon: <Car size={40} />, title: "$2000 + $800/km", desc: "Costo de envío transparente calculado por distancia real.", delay: "0.4s" },
        { icon: <Building size={40} />, title: "100%", desc: "Pedidos trazables con repartidores verificados en Popayán.", delay: "0.6s" }
    ];

    return (
        <section className="py-5" style={{ backgroundColor: lightGreen }}>
            <Container>
                <div className="text-center mb-5 animate__animated animate__fadeIn">
                    <h2 className="fw-bold mb-3" style={{ color: brandColor, fontSize: '2.5rem' }}>Domicilios Eficientes</h2>
                    <div className="d-inline-block py-2 px-4 mb-4 rounded-pill shadow-sm bg-white border">
                        <span className="fw-bold text-muted small me-2 uppercase">🛵 Pedidos entregados hoy:</span>
                        <span className="fw-bold fs-4" style={{ color: brandColor }}>{co2.toLocaleString()}</span>
                    </div>
                    <p className="text-muted" style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.2rem' }}>
                        Pedir un domicilio no es solo comodidad; es logística optimizada. Mira lo que logramos juntos cada día.
                    </p>
                </div>

                <Row className="justify-content-center">
                    {impacts.map((item, index) => (
                        <Col lg={4} md={6} key={index} className="mb-4">
                            <Card className="h-100 border-0 shadow-sm p-4 text-center animate__animated animate__fadeInUp" style={{ 
                                borderRadius: '35px', 
                                animationDelay: item.delay,
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-15px) scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(86,188,167,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.05)';
                            }}>
                                <div className="mb-4 d-inline-block p-3 rounded-circle" style={{ backgroundColor: 'white', color: brandColor, boxShadow: '0 10px 25px rgba(86,188,167,0.15)' }}>
                                    {item.icon}
                                </div>
                                <h3 className="fw-bold mb-2" style={{ color: brandColor, fontSize: '2rem' }}>{item.title}</h3>
                                <p className="text-muted mb-0" style={{ fontSize: '1rem', lineHeight: '1.6' }}>{item.desc}</p>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default SustainabilitySection;
