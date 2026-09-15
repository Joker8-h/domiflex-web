import React from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Container, Card } from 'react-bootstrap';
import { FaMapMarkerAlt, FaUsers, FaCar } from 'react-icons/fa';

// Arreglar iconos de Leaflet (forma más segura)
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const InteractiveMap = () => {
    const brandColor = "#113d69";
    const accentColor = "#62d8d9";

    // Ubicación central aproximada (ej. Cali, Colombia - ajusta según prefieras)
    const position = [3.4516, -76.5320]; 

    const repartidores = [
        { id: 1, pos: [3.4550, -76.5350], name: "Carlos - En entrega", via: "Av. 6ta" },
        { id: 2, pos: [3.4480, -76.5280], name: "Arlys - Disponible", via: "Calle 5ta" },
        { id: 3, pos: [3.4600, -76.5400], name: "Janier - En entrega", via: "Norte" },
    ];

    const clientes = [
        { id: 1, pos: [3.4520, -76.5300], name: "Pedido en Chipichape" },
        { id: 2, pos: [3.4400, -76.5380], name: "Pedido en Tequendama" },
    ];

    return (
        <section className="py-5" style={{ backgroundColor: "#ffffff" }}>
            <Container>
                <div className="text-center mb-5">
                    <h2 className="fw-bold" style={{ color: brandColor }}>Pedidos Activos en Tiempo Real</h2>
                    <p className="text-muted">Mira cómo la comunidad <span style={{ color: accentColor }}>DomiFlex</span> entrega hoy.</p>
                </div>

                <div className="position-relative shadow-lg rounded-4 overflow-hidden border" style={{ height: "500px" }}>
                    <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        />
                        
                        {repartidores.map(rep => (
                            <Marker key={`rep-${rep.id}`} position={rep.pos}>
                                <Popup>
                                    <div className="text-center" style={{ minWidth: '150px' }}>
                                        <FaCar color={brandColor} className="mb-2" />
                                        <h6 className="mb-1 fw-bold">{rep.name}</h6>
                                        <small className="text-muted">{rep.via}</small>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {clientes.map(p => (
                            <Circle 
                                key={`pass-${p.id}`} 
                                center={p.pos} 
                                pathOptions={{ fillColor: accentColor, color: accentColor }} 
                                radius={200} 
                            >
                                <Popup>
                                    <div className="text-center">
                                        <FaUsers color={accentColor} className="mb-2" />
                                        <h6 className="mb-0 fw-bold">{p.name}</h6>
                                    </div>
                                </Popup>
                            </Circle>
                        ))}
                    </MapContainer>

                    {/* Leyenda flotante */}
                    <Card className="position-absolute bottom-0 start-0 m-3 p-3 border-0 shadow" style={{ zIndex: 1000, borderRadius: "15px" }}>
                        <div className="d-flex align-items-center mb-2">
                            <FaMapMarkerAlt color={brandColor} />
                            <span className="ms-2 small fw-bold">Repartidores</span>
                        </div>
                        <div className="d-flex align-items-center">
                            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: accentColor, border: `2px solid ${accentColor}` }}></div>
                            <span className="ms-2 small fw-bold">Clientes pidiendo</span>
                        </div>
                    </Card>
                </div>
            </Container>
        </section>
    );
};

export default InteractiveMap;
