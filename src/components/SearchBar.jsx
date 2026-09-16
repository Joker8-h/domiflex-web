import React, { useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import theme from "../styles/theme";

export default function SearchBar({ placeholder = "Buscar...", onSearch, value = "" }) {
  const [query, setQuery] = useState(value);
  const [focused, setFocused] = useState(false);

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const handleClear = () => {
    setQuery("");
    if (onSearch) onSearch("");
  };

  return (
    <div
      style={{
        ...styles.container,
        borderColor: focused ? theme.colors.accent : theme.colors.border,
        boxShadow: focused ? theme.shadows.input : "none",
      }}
    >
      <FaSearch style={{ color: theme.colors.textMuted, fontSize: "16px" }} />
      <input
        style={styles.input}
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {query && (
        <button style={styles.clearBtn} onClick={handleClear}>
          <FaTimes size={12} />
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.xl,
    padding: "12px 16px",
    transition: theme.transitions.fast,
  },
  input: {
    flex: 1,
    backgroundColor: "transparent",
    border: "none",
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    outline: "none",
    fontFamily: "'Inter', sans-serif",
  },
  clearBtn: {
    background: "none",
    border: "none",
    color: theme.colors.textMuted,
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    transition: theme.transitions.fast,
  },
};
