import React from "react";
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import './App.css'
import Login from "./pages/Login"
import HomeBase from "./pages/HomeBase";
import Register from "./pages/Register";
import AdminRepartidores from "./pages/Admin/AdminRepartidores";
import AdminUsuarios from "./pages/Admin/AdminUsuarios";
import AdminVehiculos from "./pages/Admin/AdminVehiculos";
import { AuthProvider, useAuth } from "./pages/context/AuthContext";
import { SocketProvider } from "./pages/context/SocketContext";
import { Toaster } from "react-hot-toast";
import AdminClientes from "./pages/Admin/AdminClientes";
import Profile from "./pages/User/Profile";
import UserHome from "./pages/User/UserHome";
import DriverHome from "./pages/Driver/DriverHome";
import DriverProfile from "./pages/Driver/DriverProfile";
import Home from "./Dashboard/Home";
import Header from "./Dashboard/Header";
import Sidebar from "./Dashboard/Sidebar";
import DashboardLayout from "./Dashboard/DashboardLayout"
import Documents from "./pages/Documents";
import AdminDocumentos from "./pages/Admin/AdminDocuments";
import VehicleRegistration from "./pages/Driver/VehicleRegistration";
import AdminVehicleRequests from "./pages/Admin/AdminVehicleRequests";
import AdminReportesPago from "./pages/Admin/AdminReportesPago";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const ROLES = { ADMIN: "ADMIN", REPARTIDOR: "REPARTIDOR", CLIENTE: "CLIENTE", COMERCIO: "COMERCIO" };

function App() {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(true);

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  }

  return (
    <AuthProvider>
      <SocketProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/dashboard/home" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <DashboardLayout openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}>
                  <Home />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/" element={<HomeBase />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route path="/documentacion" element={<ProtectedRoute><Documents /></ProtectedRoute>} />

            <Route path="/cliente-home" element={<ProtectedRoute allowedRoles={[ROLES.CLIENTE, ROLES.COMERCIO]}><UserHome /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={[ROLES.CLIENTE, ROLES.COMERCIO, ROLES.REPARTIDOR]}><Profile /></ProtectedRoute>} />
            <Route path="/repartidor-home" element={<ProtectedRoute allowedRoles={[ROLES.REPARTIDOR]}><DriverHome /></ProtectedRoute>} />
            <Route path="/repartidor-profile" element={<ProtectedRoute allowedRoles={[ROLES.REPARTIDOR]}><DriverProfile /></ProtectedRoute>} />
            <Route path="/vehicle-registration" element={<ProtectedRoute allowedRoles={[ROLES.REPARTIDOR]}><VehicleRegistration /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />

            <Route path="/admin/repartidores" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <DashboardLayout openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}>
                  <AdminRepartidores />
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

            <Route path="/admin/clientes" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <DashboardLayout openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}>
                  <AdminClientes />
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

  // Si no hay roles específicos, solo requiere estar logueado
  if (!allowedRoles) {
    return children;
  }

  // Extraer información del rol de forma más robusta
  // 1. Intentar obtener el ID del rol (buscando en varias ubicaciones posibles)
  const rolId = Number(usuario?.idRol || usuario?.rol?.idRol || usuario?.rol?.id || (typeof usuario?.rol === 'number' ? usuario.rol : NaN));
  
  // 2. Intentar obtener el nombre del rol (normalizado a mayúsculas)
  const rolNombre = (typeof usuario?.rol === 'string' 
    ? usuario.rol 
    : (usuario?.rol?.nombre || "")
  ).toUpperCase();

  // Verificar si el usuario tiene permiso (por ID o por Nombre)
  const hasPermission = allowedRoles.some(role => {
    if (typeof role === 'number') return rolId === role;
    if (typeof role === 'string') return rolNombre === role.toUpperCase();
    return false;
  });

  if (!hasPermission) {
    console.warn(`[ProtectedRoute] Acceso denegado a ${location.pathname}. Rol detectado: ${rolNombre} (ID: ${rolId})`);
    
    // Redirigir según el rol detectado para evitar quedar atrapado en una ruta prohibida
    if (rolNombre === 'ADMIN' || rolId === 1) {
      return <Navigate to="/dashboard/home" replace />;
    }
    
    if (rolNombre === 'REPARTIDOR' || rolId === 2) {
      return <Navigate to="/repartidor-home" replace />;
    }
    
    if (rolNombre === 'CLIENTE' || rolNombre === 'COMERCIO' || rolId === 3 || rolId === 4) {
      return <Navigate to="/cliente-home" replace />;
    }
    
    return <Navigate to="/login" replace />;
  }

  return children;
}
