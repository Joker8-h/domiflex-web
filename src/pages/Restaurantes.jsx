import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import theme from "../styles/theme";
import SearchBar from "../components/SearchBar";
import CategoryChips from "../components/CategoryChips";
import NegocioCard from "../components/NegocioCard";
import { SkeletonCard } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { api } from "../api/client";

export default function Restaurantes() {
  const navigate = useNavigate();
  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const fetchNegocios = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = "/negocios";
        if (selectedCategory) {
          url += `?tipo=${encodeURIComponent(selectedCategory)}`;
        }
        const data = await api.get(url, { signal: controller.signal });
        if (!controller.signal.aborted) setNegocios(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Error al cargar negocios:", err);
          setError(err.message || "No se pudieron cargar los negocios.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchNegocios();
    return () => controller.abort();
  }, [selectedCategory, retryKey]);

  const filteredNegocios = negocios.filter((n) =>
    (n.nombre || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button
          type="button"
          aria-label="Volver"
          style={styles.backBtn}
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft size={18} aria-hidden="true" />
        </button>
        <h1 style={styles.title}>Explorar</h1>
        <div style={{ width: "36px" }} aria-hidden="true" />
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
          <div style={styles.grid} aria-busy="true" aria-label="Cargando negocios">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="No pudimos cargar los negocios"
            description={error}
            onRetry={() => setRetryKey((k) => k + 1)}
          />
        ) : filteredNegocios.length === 0 ? (
          <EmptyState
            icon="🏪"
            title="No se encontraron negocios"
            description={
              searchQuery
                ? `Sin resultados para "${searchQuery}". Prueba con otra búsqueda.`
                : "Aún no hay negocios en esta categoría. Vuelve pronto."
            }
            actionLabel={searchQuery ? "Limpiar búsqueda" : undefined}
            onAction={searchQuery ? () => setSearchQuery("") : undefined}
          />
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
    width: "44px",
    height: "44px",
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
};
