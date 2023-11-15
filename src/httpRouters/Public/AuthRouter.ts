import Express from 'express';
import { ApiSoftGym } from '../../app';
import { User } from '../../entities/User';
import { AuthManagement } from '../../helpers/AuthManagement';
import * as bcrypt from 'bcryptjs';


interface CredentialData {
    username: string;
    password: string;
}

export class AuthRouter {

    /**
     * permite procesar las peticiones para el inicio de session
     *
     * @param req
     * @param res
     */
    static login = async (req: Express.Request, res: Express.Response) => {

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos las collections a usar
        const collectionUsers = db.collection<User>("users");

        // obtenemos los datos recibidos por POST
        const formData = req.body as CredentialData;

        // consultamos si existe en el sistema una cuenta
        let userFound = await collectionUsers.findOne({ username: formData.username, deleted: null, status: 'ACTIVE' });

        //cerramos conexion con la base de datos
        connectionDB.close();

        if (userFound == null) {
            // en caso de que lleuge hasta aqui emitimos notificacion de que nada fue encontrado
            res.status(400).json({ message: 'usuario no encontrado' });
            return;
        }

        // revisamos vericidad de contraseña
        const passwordMatch = await bcrypt.compare(formData.password, userFound.password);

        // si coinciden
        if (!passwordMatch) {

            // en caso de que lleuge hasta aqui emitimos notificacion de que nada fue encontrado
            res.status(400).json({ message: 'usuario o contraseña incorrecta' });
            return;
        }

        // creamos la session
        const session = await AuthManagement.createSessionForUser(userFound._id.toString(), req.get('user-agent'), req.ip);

        // completamos la informacion
        const sessionIdentity = await AuthManagement.createSessionIdentityFromSession(session);

        // emitimos la respuesta
        res.json({
            token: session.token,
            user: sessionIdentity.user
        });
    }

    /**
     * permite cerrar la session al access_token recibido
     * 
     * @param req 
     * @param res 
     */
    static logout = async (req: Express.Request, res: Express.Response) => {

        // obtenemos el token de la solicitud
        const token = req.query.access_token as string;

        // consultamos la session a partir del token
        const session = await AuthManagement.getSessionByToken(token);

        // finalizamos la session
        await AuthManagement.endSession(session);

        // emitimos la respuesta
        res.json({
            message: "se ha cerrado la session correctamente"
        });
    }

}
