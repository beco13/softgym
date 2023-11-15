import Express from 'express';
import { ApiSoftGym } from '../../app';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { User } from '../../entities/User';


export class UsersRouter {

    /**
     * permite obtener todos los registros
     *
     * @param req
     * @param res
     */
    static getAll = async (req: Express.Request, res: Express.Response) => {

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos las collections a usar
        const collection = db.collection<User>("users");

        // buscamos los registros
        const rows = await collection.find().toArray();

        //cerramos conexion con la base de datos
        connectionDB.close();

        // emitimos la respuesta
        res.json(rows);
    }

    /**
     * permite obtener todos los tipos de identificacion
     *
     * @param req
     * @param res
     */
    static get = async (req: Express.Request, res: Express.Response) => {

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos las collections a usar
        const collection = db.collection<User>("users");

        // consultamos el registro
        const tmpRow = await collection.findOne({ _id: new ObjectId(req.params.id), customer_id: null, deleted: null });

        //cerramos conexion con la base de datos
        connectionDB.close();

        // verificamos si encontro algo
        if (tmpRow == null) {
            res.status(404).json({ message: 'no se encontro el registro' });
            return;
        }

        // emitimos la respuesta
        res.json(tmpRow);
    }

    /**
     * permite procesar las peticiones para agregar tipos de identificacion
     *
     * @param req
     * @param res
     */
    static add = async (req: Express.Request, res: Express.Response) => {

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos las collections a usar
        const collection = db.collection<User>("users");

        // obtenemos los datos recibidos por POST
        const formData = req.body as User;

        // consultamos el registro
        const resultExist = await collection.findOne({ username: formData.username, deleted: null });

        // verificamos si encontro algo
        if (resultExist !== null) {

            //cerramos conexion con la base de datos
            connectionDB.close();

            res.status(400).json({ message: 'ya existe un usuario previamente registrado con el mismo username' });
            return;
        }

        // creamos la instancia del registro
        const tmpRow = new User();
        tmpRow.role = formData.role;
        tmpRow.username = formData.username;
        tmpRow.password = await bcrypt.hash(formData.password, 10);
        tmpRow.status = "ACTIVE";
        
        // insertamos el registro en la base de datos
        await collection.insertOne(tmpRow);

        //cerramos conexion con la base de datos
        connectionDB.close();

        // emitimos la respuesta
        res.json({
            message: 'el registro fue registrado exitosamente'
        });
    }

    /**
     * permite procesar las peticiones para editar tipos de identificacion
     *
     * @param req
     * @param res
     */
    static adit = async (req: Express.Request, res: Express.Response) => {

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos las collections a usar
        const collection = db.collection<User>("users");

        // consultamos el registro
        const tmpRow = await collection.findOne({ _id: new ObjectId(req.params.id), customer_id: null, deleted: null });

        // verificamos si encontro algo
        if (tmpRow == null) {

            //cerramos conexion con la base de datos
            connectionDB.close();

            res.status(404).json({ message: 'no se encontro el registro' });
            return;
        }

        // obtenemos los datos recibidos por POST
        const formData = req.body as User;

        // actualizamos
        tmpRow.role = formData.role;
        tmpRow.username = formData.username;
        tmpRow.status = formData.status;

        if (formData.password != null) {
            formData.password = String(formData.password).trim();
            if (formData.password !== "") {
                tmpRow.password = await bcrypt.hash(formData.password, 10);
            }
        }

        // actualizamos el registro en la base de datos
        await collection.replaceOne({ _id: new ObjectId(req.params.id) }, tmpRow);

        //cerramos conexion con la base de datos
        connectionDB.close();

        // emitimos la respuesta
        res.json({
            message: 'el registro fue actualizado exitosamente'
        });
    }

    /**
     * Permite activar y desactivar un usuario
     * 
     * @param req 
     * @param res 
     * @returns 
     */
    static toogleStatus = async (req: Express.Request, res: Express.Response) => {

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos las collections a usar
        const collection = db.collection<User>("users");

        // consultamos el registro
        const tmpRow = await collection.findOne({ _id: new ObjectId(req.params.id), customer_id: null, deleted: null });

        // verificamos si encontro algo
        if (tmpRow == null) {

            //cerramos conexion con la base de datos
            connectionDB.close();

            res.status(404).json({ message: 'no se encontro el registro' });
            return;
        }

        // indicamos en el campo deleted la fecha de eliminado

        if (tmpRow.status == "ACTIVE") {
            tmpRow.status = "BLOCKED";
        } else {
            tmpRow.status = "ACTIVE";
        }

        // actualizamos el registro en la base de datos
        await collection.replaceOne({ _id: new ObjectId(req.params.id) }, tmpRow);

        //cerramos conexion con la base de datos
        connectionDB.close();

        // emitimos la respuesta
        res.json({
            message: 'el registro fue actualizado exitosamente'
        });
    }


}
