import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { AuthManagement } from "../helpers/AuthManagement";

/**
 * clase extendida de error para pdoer enviar datos adicionales en el error
 */
class SocketError extends Error {
    data: {
        content: string,
        action: string
    }
}

export const AuthMiddleware = async (socket: Socket, next: (err?: ExtendedError) => void) => {

    // obtenemos el token de la peticion
    const token = socket.handshake.auth.access_token;

    // consultamos la sessión
    const session = await AuthManagement.getSessionByToken(token);

    // si no devuelve nada
    if (session === null) {
        const error = new SocketError('autorizacion no encontrada');
        error.data = {
            content: "por favor, vuelve a iniciar sesion",
            action: "log_out"
        };
        next(error);
        return;
    }

    // si la session ya finalizo
    if (session.expired <= new Date()) {

        const error = new SocketError('autorizacion expirada');
        error.data = {
            content: "por favor, volver a iniciar sesion",
            action: "log_out"
        };
        next(error);
        return;
    }

    // cargamos el perfil del usuario de la session
    const sessionIdentity = await AuthManagement.createSessionIdentityFromSession(session);

    // registramos el identificador del canal del socket en la session
    sessionIdentity.socket_id = socket.id;

    // asignamos la informacion de la session para la solicitud
    socket.request.user = sessionIdentity;

    // ampliamos la fecha de finalizacion de la session otros 15 minutos mas
    await AuthManagement.extendSession(session);
    
    // dejamos que avanze el flujo de la peticion
    next();
}