import React, { useState, useEffect } from "react";
import { Wallet } from "lucide-react";
import { Container, Row, Col, Form, Card } from "react-bootstrap";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Label } from "recharts";


const SavingsCalculator = () => {
    const [distancia, setDistancia] = useState(5); 
    const [pedidos, setPedidos] = useState(8); 
    
    const [datos, setDatos] = useState([]);

    const brandColor = "#56bca7"; 
    const secondaryColor = "#2d5a52"; 
    const [isMelo, setIsMelo] = useState(false);
    const costoTotal = datos[0]?.valor || 0;

    useEffect(() => {
        if (costoTotal > 100000) setIsMelo(true);
        else setIsMelo(false);
    }, [costoTotal]);
    useEffect(() => {
        // DomiFlex: costo de envío base $2000 + $800/km
        // Comisión por distancia: <=5km 10%, <=15km 12%, >15km 15%
        const redondearCop = (monto) => {
            if (!monto || monto <= 0) return 0;
            const res = Math.ceil(monto / 100) * 100;
            return Math.max(res, 500);
        };
        const subtotal = redondearCop(2000 + 800 * distancia);
        let tasa = 0.15;
        if (distancia <= 5) tasa = 0.10;
        else if (distancia <= 15) tasa = 0.12;
        const comision = redondearCop(subtotal * tasa);
        const totalPedido = redondearCop(subtotal + comision);
        
        setDatos([
            { name: "Subtotal envío", valor: subtotal, color: "#d1d8d6" },
            { name: "Total con comisión", valor: totalPedido, color: brandColor }
        ]);
    }, [distancia, pedidos]);

    const formatCurrency = (val) => {
        if (isNaN(val) || val === undefined) return "$ 0";
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(val);
    };



    return (
        <section className="py-5" style={{ backgroundColor: "#ffffff" }}>
            <Container>
                <Row className="align-items-center">
                    <Col lg={6} className="mb-4 mb-lg-0">
                        <div className="pe-lg-5">
                            <h2 className="fw-bold mb-4" style={{ color: brandColor, fontSize: '2.5rem' }}>
                                Calcula tu <span style={{ color: secondaryColor }}>costo de envío</span>
                            </h2>
                            <p className="text-muted mb-5" style={{ fontSize: '1.1rem' }}>
                                Ajusta la distancia y mira el costo estimado de tu domicilio con DomiFlex: base $2000 + $800/km.
                            </p>

                            <Form.Group className="mb-4">
                                <div className="d-flex justify-content-between">
                                    <Form.Label className="fw-bold" style={{ color: secondaryColor }}>Distancia del domicilio (km)</Form.Label>
                                    <span className="badge rounded-pill" style={{ backgroundColor: brandColor }}>{distancia} km</span>
                                </div>
                                <Form.Range 
                                    min="1" max="100" 
                                    value={distancia} 
                                    onChange={(e) => setDistancia(parseInt(e.target.value))} 
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <div className="d-flex justify-content-between">
                                    <Form.Label className="fw-bold" style={{ color: secondaryColor }}>Pedidos al mes</Form.Label>
                                    <span className="badge rounded-pill" style={{ backgroundColor: brandColor }}>{pedidos} pedidos</span>
                                </div>
                                <Form.Range 
                                    min="1" max="60" 
                                    value={pedidos} 
                                    onChange={(e) => setPedidos(parseInt(e.target.value))} 
                                />
                            </Form.Group>

                            <Card className={`border-0 shadow-lg p-4 mt-5 ${isMelo ? 'animate__animated animate__pulse animate__infinite' : ''}`} 
                                  style={{ 
                                      borderRadius: "25px", 
                                      background: isMelo 
                                        ? `linear-gradient(135deg, #113d69 0%, ${brandColor} 100%)` 
                                        : `linear-gradient(135deg, ${brandColor} 0%, #45a08d 100%)`, 
                                      color: "white",
                                      boxShadow: isMelo ? `0 0 30px ${brandColor}` : '0 15px 35px rgba(0,0,0,0.1)',
                                      transition: 'all 0.5s ease'
                                  }}>
                                <div className="d-flex align-items-center">
                                    <div className="rounded-circle p-3 me-3" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                                        <Wallet size={28} />
                                    </div>
                                    <div>
                                        <h6 className="mb-0 opacity-75 fw-bold">{isMelo ? '¡Pedido largo detectado!' : 'Costo estimado por pedido'}</h6>
                                        <h2 className="fw-bold mb-0">
                                            {formatCurrency(costoTotal)} <small style={{ fontSize: '1rem' }}>COP</small>
                                        </h2>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </Col>
                    
                    <Col lg={6}>
                        <div className="bg-white p-4 rounded-4 shadow-sm border" style={{ minHeight: "420px" }}>
                            <h5 className="text-center mb-4 fw-bold" style={{ color: brandColor }}>Costo de Envío DomiFlex (Pesos COP)</h5>
                            <div style={{ width: '100%', height: '320px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={datos} margin={{ top: 20, right: 30, left: 50, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" tick={{ fill: secondaryColor, fontWeight: 'bold' }} />
                                        <YAxis 
                                            tickFormatter={(val) => `$ ${(val / 1000).toFixed(0)} mil`} 
                                            tick={{ fill: '#666', fontSize: 11 }}
                                        />
                                        <Tooltip 
                                            formatter={(val) => [formatCurrency(val), "Costo"]}
                                            contentStyle={{ borderRadius: "15px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }} 
                                        />
                                        <Bar dataKey="valor" radius={[15, 15, 0, 0]} barSize={80}>
                                            {datos.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="text-center mt-3 small text-muted italic">
                                * Base $2000 + $800/km. Comisión por distancia: 10% hasta 5 km, 12% hasta 15 km, 15% superior.
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default SavingsCalculator;
