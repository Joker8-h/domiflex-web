import React from "react";
import theme from "../styles/theme";

const defaultCategories = [
  { id: "COMIDA", label: "Restaurantes", icono: "🍔" },
  { id: "FARMACIA", label: "Farmacias", icono: "💊" },
  { id: "SUPERMERCADO", label: "Supermercados", icono: "🛒" },
  { id: "TIENDA", label: "Tiendas", icono: "🏪" },
  { id: "PAQUETERIA", label: "Paquetería", icono: "📦" },
  { id: "OTRO", label: "Más", icono: "⭐" },
];

export default function CategoryChips({
  categories = defaultCategories,
  selected,
  onSelect,
}) {
  return (
    <div style={styles.container}>
      {categories.map((cat) => {
        const isSelected = selected === cat.id;
        return (
          <button
            key={cat.id}
            style={{
              ...styles.chip,
              backgroundColor: isSelected ? theme.colors.accent : theme.colors.bgCard,
              color: isSelected ? "#000" : theme.colors.textPrimary,
              borderColor: isSelected ? theme.colors.accent : theme.colors.border,
            }}
            onClick={() => onSelect(cat.id)}
          >
            <span style={styles.icon}>{cat.icono}</span>
            <span style={styles.label}>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    gap: "10px",
    overflowX: "auto",
    padding: "4px 0",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
  chip: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    borderRadius: theme.borderRadius.xl,
    border: `1px solid ${theme.colors.border}`,
    background: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: theme.transitions.fast,
    fontFamily: "'Inter', sans-serif",
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    flexShrink: 0,
  },
  icon: {
    fontSize: "16px",
  },
  label: {},
};
