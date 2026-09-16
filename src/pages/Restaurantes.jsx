import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFilter } from "react-icons/fa";
import theme from "../styles/theme";
import SearchBar from "../components/SearchBar";
import CategoryChips from "../components/CategoryChips";
import NegocioCard from "../components/NegocioCard";
import API_URL from "../config";

export default function Restaurantes() {
  const navigate = useNavigate();
  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchNegocios();
  }, [selectedCategory]);

  const fetchNegocios = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/negocios`;
      if (selectedCategory) {
        url += `?tipo=${selectedCategory}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setNegocios(data);
    } catch (err) {
      console.error("Error al cargar negocios:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNegocios = negocios.filter((n) =>
    n.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <FaArrowLeft size={18} />
        </button>
        <h1 style={styles.title}>Explorar</h1>
        <div style={{ width: "36px" }} />
      </div>

      <div style={styles.content}>
        <SearchBar
          placeholder="Buscar negocios..."
          onSearch={setSearchQuery}
        />

        <div style={styles.categories}>
          <CategoryChips
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Cargando negocios...</p>
          </div>
        ) : filteredNegocios.length === 0 ? (
          <div style={styles.empty}>
            <span style={{ fontSize: "48px" }}>🏪</span>
            <p style={styles.emptyText}>No se encontraron negocios</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredNegocios.map((negocio) => (
              <NegocioCard
                key={negocio.id}
                negocio={negocio}
                onClick={(n) => navigate(`/negocio/${n.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: theme.colors.bgPrimary,
    paddingBottom: "80px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    position: "sticky",
    top: 0,
    backgroundColor: theme.colors.bgNavbar,
    backdropFilter: "blur(10px)",
    zIndex: theme.zIndex.sticky,
  },
  backBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.bgCard,
    color: theme.colors.textPrimary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
  },
  content: {
    padding: "0 16px",
  },
  categories: {
    marginTop: "16px",
    marginBottom: "24px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 0",
    gap: "16px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: `3px solid ${theme.colors.border}`,
    borderTopColor: theme.colors.accent,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 0",
    gap: "16px",
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
};
