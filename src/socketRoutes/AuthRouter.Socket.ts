
import { Socket } from "socket.io";
import { User } from '../entities/User';
import { Socket as SocketEntity } from '../entities/Socket';
import { ApiSoftGym } from "../app";



export class AuthRouterSocket {

    /**
     * se ejecuta cuando hay una conexion nueva
     * 
     * @param socket 
     */
    public static async connect(socket: Socket) {

        console.log("conentado: ", socket.id);

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos la conexion a la colleccion a trabajar
        const collectionUsers = db.collection<User>("Users");
        const collectionSockets = db.collection<SocketEntity>("sockets");

        // indicamos que el usuario esta en linea
        socket.request.user.user.online = true;

        // actualizamos el estado de que el usuario esta conectado en la base de datos
        await collectionUsers.replaceOne({ _id: socket.request.user.user._id }, socket.request.user.user);

        // creamos una instancia
        const socketEntityRow = new SocketEntity();
        socketEntityRow.socket_id = socket.id;
        socketEntityRow.session_id = socket.request.user.session._id.toString();

        // guardamos la informacion del socket
        await collectionSockets.insertOne(socketEntityRow);

        //cerramos conexion con la base de datos
        connectionDB.close();
    }

    /**
     * Se ejecuta cuando una conexion se pierde
     * 
     * @param reason 
     * @param socket 
     */
    public static async disconnect(reason: string, socket: Socket) {

        console.log("reason: ", reason);
        console.log("desconenctado: ", socket.id);

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos la conexion a la colleccion a trabajar
        const collectionUsers = db.collection<User>("Users");
        const collectionSockets = db.collection<SocketEntity>("sockets");


        /****************************************
         * ELIMINAMOS LA INFORMACION DEL SOCKET *
         ****************************************/

        // buscamos el socket gaurdado
        const socketEntityRow = await collectionSockets.findOne({ socket_id: socket.id, deleted: null })
        socketEntityRow.deleted = new Date();

        // actualizamos la informacion en la base de datos
        await collectionSockets.replaceOne({ _id: socketEntityRow._id }, socketEntityRow);




        /************************************************************************************
         * VERIFICAMOS SI DEBEMOS INDICAR QUE EL USUARIO ESTA EN MODO OFLINE (DESCONECTADO) *
         ************************************************************************************/

        // consultamos todos los sockets activos de la session del usuario
        const tmpSockets = await collectionSockets.find({ session_id: socket.request.user.session._id.toString() }).toArray();

        // si no hay mas sockets activos, indicamo que el usuario no esta en linea
        if (tmpSockets.length == 0) {

            // buscamos la credencial a actualizar
            const tmpUser = await collectionUsers.findOne({ _id: socket.request.user.user._id });

            // indicamos que el usuario ya no esta en linea
            tmpUser.online = false;
            tmpUser.disconnected = new Date();

            // actualizamos el estado en la base de datos
            await collectionUsers.replaceOne({ _id: socket.request.user.user._id }, socket.request.user.user);
        }


        //cerramos conexion con la base de datos
        connectionDB.close();
    }


}