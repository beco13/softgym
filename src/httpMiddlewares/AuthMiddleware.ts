import express, { Response, NextFunction } from 'express';
import { AuthManagement } from "../helpers/AuthManagement";
import { UserRequest } from '../types/UserRequest';


export const AuthMiddleware = async (req: UserRequest, res: Response, next: NextFunction) => {

    // obtenemos el token de la solicitud
    const token = req.query.access_token as string;

    // verificamos si es el navegador el que esta haciendo la peticion
    if(req.method == 'OPTIONS'){
        // avanzamos en el ciclo
        next();
        return;
    }

    // si no esta definido es por que no fue recibido
    if (token === undefined || token === null) {
        return res.status(401).json({ message: 'Usted debe estar autorizado para usar el servicio' });
    }

    // consultamos la sessión
    const session = await AuthManagement.getSessionByToken(token);

    // si no devuelve nada
    if (session === null) {
        return res.status(401).json({ message: 'autorizacion no encontrada' });
    }

    // si la session ya finalizo
    if (session.expired <= new Date()) {
        return res.status(401).json({ message: 'autorizacion expirada' });
    }

    // cargamos el perfil del usuario de la session
    const sessionIdentity = await AuthManagement.createSessionIdentityFromSession(session);

    // ampliamos la fecha de finalizacion de la session otros 15 minutos mas
    await AuthManagement.extendSession(session);

    // asignamos a la solicitud la informacion del usuario logueado
    req.user = sessionIdentity;

    // avanzamos en el ciclo
    next();
}