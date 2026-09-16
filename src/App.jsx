import React, { useState, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import "./design/global.css";
import { AuthProvider, useAuth } from "./pages/context/AuthContext";
import { SocketProvider } from "./pages/context/SocketContext";
import { Toaster } from "react-hot-toast";
import tokens from "./design/tokens";

// Eager solo lo crítico del primer pintado; el resto va por rol (code-splitting).
import Landing from "./pages/Landing";
import Login from "./pages/Login";
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Client pages
const HomeBase = lazy(() => import("./pages/HomeBase"));
const Restaurantes = lazy(() => import("./pages/Restaurantes"));
const RestauranteDetalle = lazy(() => import("./pages/RestauranteDetalle"));
const Carrito = lazy(() => import("./pages/Carrito"));
const Tracking = lazy(() => import("./pages/Tracking"));
const PedidoDetalle = lazy(() => import("./pages/PedidoDetalle"));
const NotificacionesPage = lazy(() => import("./pages/Notificaciones"));
const Perfil = lazy(() => import("./pages/Perfil"));
const UserHome = lazy(() => import("./pages/User/UserHome"));
const Profile = lazy(() => import("./pages/User/Profile"));
const Documents = lazy(() => import("./pages/Documents"));

// Driver pages
const DriverHome = lazy(() => import("./pages/Driver/DriverHome"));
const DriverProfile = lazy(() => import("./pages/Driver/DriverProfile"));
const VehicleRegistration = lazy(() => import("./pages/Driver/VehicleRegistration"));

// Admin pages
const DashboardLayout = lazy(() => import("./Dashboard/DashboardLayout"));
const Home = lazy(() => import("./Dashboard/Home"));
const AdminRepartidores = lazy(() => import("./pages/Admin/AdminRepartidores"));
const AdminClientes = lazy(() => import("./pages/Admin/AdminClientes"));
const AdminUsuarios = lazy(() => import("./pages/Admin/AdminUsuarios"));
const AdminVehiculos = lazy(() => import("./pages/Admin/AdminVehiculos"));
const AdminDocumentos = lazy(() => import("./pages/Admin/AdminDocuments"));
const AdminVehicleRequests = lazy(() => import("./pages/Admin/AdminVehicleRequests"));
const AdminReportesPago = lazy(() => import("./pages/Admin/AdminReportesPago"));

function RouteLoader() {
  return (
    <div
      role="status"
      aria-label="Cargando página"
      style={{
        minHeight: "100vh",
        backgroundColor: tokens.colors.bgPrimary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: "40px",
          height: "40px",
          border: `3px solid ${tokens.colors.border}`,
          borderTopColor: tokens.colors.accent,
          borderRadius: "50%",
          animation: "df-spin 1s linear infinite",
        }}
      />
    </div>
  );
}

// Components
import BottomTabs from "./components/BottomTabs";
import NavbarCustom from "./components/Navbar";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { useIsMobile } from "./hooks/useMediaQuery";

// Navegación móvil real: BottomTabs solo en móvil, solo autenticado,
// solo flujo cliente (admin/driver conservan su layout).
function MobileNav() {
  const { token } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  if (!token || !isMobile) return null;
  const path = location.pathname;
  if (
    path.startsWith("/dashboard") ||
    path.startsWith("/admin") ||
    path.startsWith("/repartidor") ||
    path.startsWith("/vehicle-registration") ||
    path === "/login" ||
    path === "/register"
  ) {
    return null;
  }
  return <BottomTabs />;
}

const ROLES = { ADMIN: "ADMIN", REPARTIDOR: "REPARTIDOR", CLIENTE: "CLIENTE", COMERCIO: "COMERCIO" };

function App() {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(true);
  const OpenSidebar = () => setOpenSidebarToggle(!openSidebarToggle);

  return (
    <AuthProvider>
      <SocketProvider>
        <Toaster
          toastOptions={{
            style: {
              background: "#161B22",
              color: "#FFFFFF",
              border: "1px solid #21262D",
            },
          }}
        />
        <BrowserRouter>
          <ErrorBoundary>
          <Suspense fallback={<RouteLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Home */}
            <Route path="/home" element={<ProtectedRoute><HomeBase /></ProtectedRoute>} />

            {/* Client - Negocios */}
            <Route path="/restaurantes" element={<ProtectedRoute><Restaurantes /></ProtectedRoute>} />
            <Route path="/negocio/:id" element={<ProtectedRoute><RestauranteDetalle /></ProtectedRoute>} />
            <Route path="/carrito" element={<ProtectedRoute><Carrito /></ProtectedRoute>} />
            <Route path="/tracking/:pedidoId" element={<ProtectedRoute><Tracking /></ProtectedRoute>} />
            <Route path="/pedido/:pedidoId" element={<ProtectedRoute><PedidoDetalle /></ProtectedRoute>} />
            <Route path="/mis-pedidos" element={<ProtectedRoute><UserHome /></ProtectedRoute>} />
            <Route path="/notificaciones" element={<ProtectedRoute><NotificacionesPage /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/documentacion" element={<ProtectedRoute><Documents /></ProtectedRoute>} />

            {/* Client - Legacy redirects */}
            <Route path="/cliente-home" element={<Navigate to="/home" replace />} />

            {/* Driver */}
            <Route path="/repartidor-home" element={
              <ProtectedRoute allowedRoles={[ROLES.REPARTIDOR]}><DriverHome /></ProtectedRoute>
            } />
            <Route path="/repartidor-profile" element={
              <ProtectedRoute allowedRoles={[ROLES.REPARTIDOR]}><DriverProfile /></ProtectedRoute>
            } />
            <Route path="/vehicle-registration" element={
              <ProtectedRoute allowedRoles={[ROLES.REPARTIDOR]}><VehicleRegistration /></ProtectedRoute>
            } />

            {/* Admin Dashboard */}
            <Route path="/dashboard/home" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <DashboardLayout openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}>
                  <Home />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/repartidores" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <DashboardLayout openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}>
                  <AdminRepartidores />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/clientes" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <DashboardLayout openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}>
                  <AdminClientes />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/usuarios" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <DashboardLayout openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}>
                  <AdminUsuarios />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/vehiculos" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <DashboardLayout openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}>
                  <AdminVehiculos />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/documentos" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <DashboardLayout openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}>
                  <AdminDocumentos />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/solicitudes-vehiculos" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <DashboardLayout openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}>
                  <AdminVehicleRequests />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/reportes-pago" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <DashboardLayout openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}>
                  <AdminReportesPago />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Legacy redirects */}
            <Route path="/perfil" element={<Navigate to="/profile" replace />} />
            <Route path="/qr-activation" element={<Navigate to="/login" replace />} />
            <Route path="/user-home" element={<Navigate to="/cliente-home" replace />} />
            <Route path="/driver-home" element={<Navigate to="/repartidor-home" replace />} />
            <Route path="/driver-profile" element={<Navigate to="/repartidor-profile" replace />} />
          </Routes>
          </Suspense>
          </ErrorBoundary>
          <MobileNav />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

function ProtectedRoute({ children, allowedRoles }) {
  const { token, usuario } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles) return children;

  const rolId = Number(usuario?.idRol || usuario?.rol?.idRol || usuario?.rol?.id || (typeof usuario?.rol === "number" ? usuario.rol : NaN));
  const rolNombre = (typeof usuario?.rol === "string" ? usuario.rol : usuario?.rol?.nombre || "").toUpperCase();

  const hasPermission = allowedRoles.some((role) => {
    if (typeof role === "number") return rolId === role;
    if (typeof role === "string") return rolNombre === role.toUpperCase();
    return false;
  });

  if (!hasPermission) {
    if (rolNombre === "ADMIN" || rolId === 1) return <Navigate to="/dashboard/home" replace />;
    if (rolNombre === "REPARTIDOR" || rolId === 2) return <Navigate to="/repartidor-home" replace />;
    if (rolNombre === "CLIENTE" || rolNombre === "COMERCIO" || rolId === 3 || rolId === 4) return <Navigate to="/home" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}
