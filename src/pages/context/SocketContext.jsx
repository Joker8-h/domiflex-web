import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL, API_URL } from '../../config';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { token, usuario } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [ultimaUbicacionPedido, setUltimaUbicacionPedido] = useState(null);
    const [pedidoActivo, setPedidoActivo] = useState(null);

    useEffect(() => {
        if (token) {
            const newSocket = io(API_BASE_URL, {
                auth: { token }
            });

            newSocket.on("connect", () => {
                console.log("Conectado al servidor DomiFlex en tiempo real");
            });

            // Eventos de pedidos en tiempo real (salas pedido_<idPedido>)
            newSocket.on("user_joined_pedido", (data) => {
                console.log("Usuario unido al pedido:", data);
            });

            newSocket.on("location_updated", (data) => {
                setUltimaUbicacionPedido(data);
                setPedidoActivo(data.idPedido);
            });

            newSocket.on("pedido_actualizado", (data) => {
                console.log("Pedido actualizado:", data);
                if (data?.idPedido) setPedidoActivo(data.idPedido);
            });

            newSocket.on("pedido_estado", (data) => {
                console.log("Estado de pedido:", data);
            });

            // Si es administrador, escuchar eventos especiales
            if (usuario?.rol?.nombre === 'ADMIN' || usuario?.idRol === 1) {
                newSocket.on("new_user_registration", (data) => {
                    toast.success(`¡Nuevo registro! ${data.nombre} (${data.rol})`, {
                        duration: 5000,
                        position: 'top-right',
                        icon: '🆕'
                    });
                });

                newSocket.on("new_document_uploaded", (data) => {
                    toast.success(`📄 ${data.nombre} ha subido documentación`, {
                        duration: 4000,
                        position: 'top-right',
                        icon: '📄'
                    });
                });

                newSocket.on("user_connected", (data) => {
                    toast.success(`${data.nombre} se ha conectado`, {
                        duration: 3000,
                        position: 'top-right'
                    });
                    // Actualizar lista de usuarios online si es necesario
                    fetchOnlineUsers();
                });

                newSocket.on("user_disconnected", (data) => {
                    toast.error(`${data.nombre} se ha desconectado`, {
                        duration: 3000,
                        position: 'top-right'
                    });
                    fetchOnlineUsers();
                });
            }

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [token, usuario]);

    const fetchOnlineUsers = async () => {
        if (!token || (usuario?.rol?.nombre !== 'ADMIN' && usuario?.idRol !== 1)) return;
        try {
            const response = await fetch(`${API_URL}/auth/online-users`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                setOnlineUsers(data);
            }
        } catch (error) {
            console.error("Error al obtener usuarios online:", error);
        }
    };

    const joinPedido = (idPedido) => {
        if (!socket || !idPedido) return;
        socket.emit("join_pedido", { idPedido });
        setPedidoActivo(idPedido);
    };

    const leavePedido = (idPedido) => {
        if (!socket || !idPedido) return;
        socket.emit("leave_pedido", { idPedido });
        setPedidoActivo((actual) => (actual === idPedido ? null : actual));
    };

    const sendRepartidorLocation = ({ idPedido, lat, lng, rumbo }) => {
        if (!socket || !idPedido || !lat || !lng) return;
        socket.emit("repartidor_location_update", { idPedido, lat, lng, rumbo });
    };

    useEffect(() => {
        fetchOnlineUsers();
    }, [socket]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, fetchOnlineUsers, joinPedido, leavePedido, sendRepartidorLocation, ultimaUbicacionPedido, pedidoActivo }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
