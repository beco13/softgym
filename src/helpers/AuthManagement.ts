import { Session } from "../entities/Session";
import { Customer } from "../entities/Customer";
import { ApiSoftGym } from "../app";
import { ObjectId } from "mongodb";
import crypto from 'crypto';
import { SessionIdentity } from "./SessionIdentity";
import { User } from "../entities/User";

export class AuthManagement {


    /**
     * Permite obtener la session a partir de un token 
     * @param token 
     * @returns 
     */
    public static async getSessionByToken(token: string): Promise<Session> {

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos las collections a usar
        const collectionSessions = db.collection<Session>("sessions");

        // consultamos la session del token
        const tmpSession = await collectionSessions.findOne({ token: token });

        // cerramos conexion con la base de datos
        connectionDB.close();

        // devolemos el valor encontrado
        return tmpSession;
    }

    /**
    * permite crear la session
    *
    * @param user_id
    * @param userAgent
    * @param ip
    * @returns token
    */
    public static async createSessionForUser(user_id: string, userAgent: string, ip: string): Promise<Session> {
        
        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos las collections a usar
        const collectionSessions = db.collection<Session>("sessions");

        // generamos una marca de tiempo del momento
        const currentMoment = new Date();

        // añadimos 15 minutos para saber cual seria el momento dentro de 15 mins
        currentMoment.setMinutes(currentMoment.getMinutes() + 15);

        // creamos instancia para una nueva session
        const tmpSession = new Session();
        tmpSession.token = crypto.randomBytes(30).toString('hex'); // creamos el token
        tmpSession.ip = ip;
        tmpSession.user_id = user_id;
        tmpSession.user_agent = userAgent;
        tmpSession.expired = new Date(currentMoment);

        // guardamos la informacion de la session
        await collectionSessions.insertOne(tmpSession);

        //cerramos conexion con la base de datos
        connectionDB.close();

        // devolvemos el token
        return tmpSession;
    }

    /**
     * Permite cargar el resto de la informacion a partir de la session
     *
     * @param tmpSession 
     * @returns Promise<SessionIdentity>
     */
    public static async createSessionIdentityFromSession(tmpSession: Session): Promise<SessionIdentity> {

        // creamos una instancia de la clase principal y empezamos a llenar la informacion de la session
        const tmpSessionIdentity = new SessionIdentity();
        tmpSessionIdentity.session = tmpSession;

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // conectamos con la tabla de credenciales
        const collectionUsers = db.collection<User>("users");

        // consultamos la credencial
        tmpSessionIdentity.user = await collectionUsers.findOne({ _id: ObjectId(tmpSession.user_id) });
       
        //cerramos conexion con la base de datos
        connectionDB.close();

        return tmpSessionIdentity;
    }

    /**
     * Permite prolongar la session 15 minutos a una session
     * 
     * @param tmpSession 
     */
    public static async extendSession(tmpSession: Session): Promise<void> {

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos las collections a usar
        const collectionSessions = db.collection<Session>("sessions");

        // generamos una marca de tiempo del momento
        const currentMoment = new Date();

        // añadimos 15 minutos para saber cual seria el momento dentro de 15 mins
        currentMoment.setMinutes(currentMoment.getMinutes() + 15);

        // actualizamos el dato en la entidad
        tmpSession.expired = new Date(currentMoment);

        // guardamos la informacion de la session en la base de datos
        await collectionSessions.replaceOne({ _id: new ObjectId(tmpSession._id.toString()) }, tmpSession);

        //cerramos conexion con la base de datos
        connectionDB.close();
    }

    /**
     * Permite actualizar el estado de una sessión
     * @param session 
     */
    public static async endSession(session: Session) {

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos las collections a usar
        const collectionSessions = db.collection<Session>("sessions");

        // verificamos si se encontro alguna session
        if (session !== null) {

            // indicamos que la session fue expirada con la fecha y hora del momento
            session.expired = new Date();

            // guardamos la informacion de la session en la base de datos
            await collectionSessions.replaceOne({ _id: new ObjectId(session._id) }, session);
        }

        //cerramos conexion con la base de datos
        connectionDB.close();
    }
}
