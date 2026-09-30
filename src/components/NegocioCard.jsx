import React, { useState } from "react";
import { Clock, Star, Heart } from "lucide-react";

export default function NegocioCard({ negocio, onClick }) {
  const [isFav, setIsFav] = useState(false);

  const fallbackImages = {
    COMIDA: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    SUPERMERCADO: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    FARMACIA: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
    DEFAULT: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
  };

  const imageSrc =
    negocio.imagen ||
    fallbackImages[negocio.tipo] ||
    fallbackImages.DEFAULT;

  const rating = Number(negocio.calificacion || negocio.rating || 4.7).toFixed(1);
  const reviews = negocio.reviews || "850+";
  const tiempo = negocio.tiempoEstimadoMin ? `${negocio.tiempoEstimadoMin} min` : "20-35 min";
  const tag = negocio.tipo || "Restaurante";

  const handleFav = (e) => {
    e.stopPropagation();
    setIsFav(!isFav);
  };

  return (
    <div
      style={styles.card}
      onClick={() => onClick(negocio)}
      className="bg-rapitipica-card bg-rapitipica-card-hover df-lift"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(negocio)}
    >
      {/* Portada */}
      <div style={styles.imageContainer}>
        <img src={imageSrc} alt={negocio.nombre} style={styles.image} loading="lazy" />
        <span style={styles.tag}>{tag}</span>
        <button
          type="button"
          onClick={handleFav}
          style={styles.favBtn}
          aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
        >
          <Heart
            size={16}
            color={isFav ? "#EF4444" : "#FFFFFF"}
            fill={isFav ? "#EF4444" : "none"}
          />
        </button>
      </div>

      {/* Información del local */}
      <div style={styles.info}>
        <div style={styles.headerRow}>
          <h3 style={styles.name}>{negocio.nombre}</h3>
          <div style={styles.ratingWrap}>
            <Star size={13} color="#F59E0B" fill="#F59E0B" />
            <span style={styles.ratingVal}>{rating}</span>
            <span style={styles.reviews}>({reviews})</span>
          </div>
        </div>

        {negocio.descripcion && (
          <p style={styles.description}>{negocio.descripcion}</p>
        )}

        <div style={styles.footerRow}>
          <div style={styles.timeWrap}>
            <Clock size={13} color="#00E576" />
            <span>{tiempo}</span>
            {negocio.costoEnvio !== undefined && (
              <span style={styles.deliveryFee}>
                • {negocio.costoEnvio === 0 ? "Envío gratis" : `Envío $${Number(negocio.costoEnvio).toLocaleString()}`}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClick(negocio);
            }}
            style={styles.pedirBtn}
          >
            Pedir
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#11254E",
    borderRadius: "18px",
    border: "1px solid #1D3B72",
    overflow: "hidden",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.2s ease",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: "160px",
    overflow: "hidden",
    backgroundColor: "#081836",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  tag: {
    position: "absolute",
    top: "10px",
    left: "10px",
    backgroundColor: "#00E576",
    color: "#0B1F44",
    fontSize: "11px",
    fontWeight: "800",
    padding: "3px 10px",
    borderRadius: "9999px",
    textTransform: "capitalize",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  favBtn: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "rgba(11, 31, 68, 0.8)",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(255,255,255,0.1)",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  info: {
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: "1",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  },
  name: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#F5F7FA",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  ratingWrap: {
    display: "flex",
    alignItems: "center",
    gap: "3px",
    flexShrink: 0,
  },
  ratingVal: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#F5F7FA",
  },
  reviews: {
    fontSize: "11px",
    color: "#9CA3AF",
  },
  description: {
    fontSize: "12px",
    color: "#9CA3AF",
    margin: 0,
    lineHeight: 1.4,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  footerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: "10px",
    borderTop: "1px solid #1D3B72",
  },
  timeWrap: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#F5F7FA",
  },
  deliveryFee: {
    color: "#9CA3AF",
    fontWeight: "400",
  },
  pedirBtn: {
    backgroundColor: "#00E576",
    color: "#0B1F44",
    border: "none",
    borderRadius: "9999px",
    padding: "6px 16px",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
};
