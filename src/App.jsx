import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import "./design/global.css";
import { AuthProvider, useAuth } from "./pages/context/AuthContext";
import { SocketProvider } from "./pages/context/SocketContext";
import { Toaster } from "react-hot-toast";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Client pages
import HomeBase from "./pages/HomeBase";
import Restaurantes from "./pages/Restaurantes";
import RestauranteDetalle from "./pages/RestauranteDetalle";
import Carrito from "./pages/Carrito";
import Tracking from "./pages/Tracking";
import PedidoDetalle from "./pages/PedidoDetalle";
import NotificacionesPage from "./pages/Notificaciones";
import Perfil from "./pages/Perfil";
import UserHome from "./pages/User/UserHome";
import Profile from "./pages/User/Profile";
import Documents from "./pages/Documents";

// Driver pages
import DriverHome from "./pages/Driver/DriverHome";
import DriverProfile from "./pages/Driver/DriverProfile";
import VehicleRegistration from "./pages/Driver/VehicleRegistration";

// Admin pages
import DashboardLayout from "./Dashboard/DashboardLayout";
import Home from "./Dashboard/Home";
import AdminRepartidores from "./pages/Admin/AdminRepartidores";
import AdminClientes from "./pages/Admin/AdminClientes";
import AdminUsuarios from "./pages/Admin/AdminUsuarios";
import AdminVehiculos from "./pages/Admin/AdminVehiculos";
import AdminDocumentos from "./pages/Admin/AdminDocuments";
import AdminVehicleRequests from "./pages/Admin/AdminVehicleRequests";
import AdminReportesPago from "./pages/Admin/AdminReportesPago";

// Components
import BottomTabs from "./components/BottomTabs";
import NavbarCustom from "./components/Navbar";

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
