import React, { useState } from "react";
import { Star, Heart, Bike } from "lucide-react";

export default function NegocioCard({ negocio, onClick }) {
  const negocioId = negocio.id || negocio.idNegocio;
  const [isFav, setIsFav] = useState(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("domiflex_favoritos") || "[]");
      return favs.includes(negocioId) || favs.includes(String(negocioId));
    } catch {
      return false;
    }
  });

  const fallbackImages = {
    COMIDA: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    SUPERMERCADO: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    FARMACIA: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
    DEFAULT: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  };

  const imageSrc =
    negocio.imagen ||
    fallbackImages[negocio.tipo] ||
    fallbackImages.DEFAULT;

  const rating = Number(negocio.calificacion || negocio.rating || 4.8).toFixed(1);
  const tiempo = negocio.tiempoEstimadoMin ? `${negocio.tiempoEstimadoMin} min` : "25 min";
  const categoriaTexto = negocio.tipo || "Restaurante";

  const handleFav = (e) => {
    e.stopPropagation();
    const next = !isFav;
    setIsFav(next);
    try {
      const favs = JSON.parse(localStorage.getItem("domiflex_favoritos") || "[]");
      const updated = next
        ? [...new Set([...favs, negocioId])]
        : favs.filter((id) => String(id) !== String(negocioId));
      localStorage.setItem("domiflex_favoritos", JSON.stringify(updated));
      window.dispatchEvent(new Event("domiflex_favoritos_changed"));
    } catch {
      // ignore storage error
    }
  };

  return (
    <div
      style={styles.card}
      onClick={() => onClick(negocio)}
      className="df-lift"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(negocio)}
    >
      {/* Portada con botón favorito y badge rojo de moto como en el boceto */}
      <div style={styles.imageContainer}>
        <img src={imageSrc} alt={negocio.nombre} style={styles.image} loading="lazy" />
        <button
          type="button"
          onClick={handleFav}
          style={styles.favBtn}
          aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
        >
          <Heart
            size={16}
            color={isFav ? "#E30613" : "#11141A"}
            fill={isFav ? "#E30613" : "none"}
          />
        </button>
        <div style={styles.scooterBadge} title="Entrega rápida Rapitipica">
          <Bike size={14} color="#FFFFFF" />
        </div>
      </div>

      {/* Información limpia sobre tarjeta blanca */}
      <div style={styles.info}>
        <h3 style={styles.name}>{negocio.nombre}</h3>
        <p style={styles.subtitle}>
          {categoriaTexto} • {tiempo}
        </p>
        <div style={styles.ratingRow}>
          <Star size={14} color="#F59E0B" fill="#F59E0B" />
          <span style={styles.ratingVal}>{rating}</span>
          {negocio.costoEnvio !== undefined && (
            <span style={styles.deliveryFee}>
              • {negocio.costoEnvio === 0 ? "Envío gratis" : `Envío $${Number(negocio.costoEnvio).toLocaleString()}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    border: "1px solid #E5E7EB",
    overflow: "hidden",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    transition: "all 0.2s ease",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: "155px",
    overflow: "hidden",
    backgroundColor: "#11141A",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  favBtn: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    border: "none",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
  },
  scooterBadge: {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#E30613",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(227, 6, 19, 0.45)",
  },
  info: {
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: "1",
  },
  name: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#11141A",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  subtitle: {
    fontSize: "13px",
    color: "#6B7280",
    fontWeight: "500",
    margin: 0,
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginTop: "4px",
  },
  ratingVal: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#11141A",
  },
  deliveryFee: {
    fontSize: "12px",
    color: "#16A34A",
    fontWeight: "600",
  },
};
