import Express from 'express';
import { ApiSoftGym } from '../../app';
import { ObjectId } from 'mongodb';
import { Customer } from '../../entities/Customer';
import { Utils } from '../../helpers/Utils';
import { UserRequest } from '../../types/UserRequest';


export class CustomersRouter {

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
        const collection = db.collection<Customer>("customers");

        // buscamos los registros
        const rows = await collection
            .find()
            .toArray();

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
        const collection = db.collection<Customer>("customers");

        // consultamos el registro
        const tmpUser = await collection.findOne({ '_id': new ObjectId(req.params.id) });

        //cerramos conexion con la base de datos
        connectionDB.close();

        // verificamos si encontro algo
        if (tmpUser === null) {
            res.status(404).json({ message: 'no se encontro el registro' });
            return;
        }

        // emitimos la respuesta
        res.json(tmpUser);
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
        const collection = db.collection<Customer>("customers");

        // obtenemos los datos recibidos por POST
        const formData = req.body as Customer;

        // creamos la instancia de la cuenta que se va a guardar
        const tmpCustomer = new Customer();
        tmpCustomer.name = formData.name;
        tmpCustomer.last_name = formData.last_name;
        tmpCustomer.identification_number = formData.identification_number;
        tmpCustomer.phone = formData.phone;
        tmpCustomer.email = formData.email;
        tmpCustomer.gender = formData.gender;
        tmpCustomer.birth_date = new Date(formData.birth_date);
        tmpCustomer.remarks = formData.remarks;
        tmpCustomer.entry_date = new Date(formData.entry_date);
        tmpCustomer.status = "SUSPENDED";

        // insertamos el registro en la base de datos
        await collection.insertOne(tmpCustomer);

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
        const collection = db.collection<Customer>("customers");

        // consultamos el registro
        const tmpCustomer = await collection.findOne({ _id: new ObjectId(req.params.id) });

        // verificamos si encontro algo
        if (tmpCustomer == null) {

            //cerramos conexion con la base de datos
            connectionDB.close();

            res.status(404).json({ message: 'no se encontro el registro' });
            return;
        }

        // obtenemos los datos recibidos por POST
        const formData = req.body as Customer;

        // creamos la instancia de la cuenta que se va a guardar
        tmpCustomer.name = formData.name;
        tmpCustomer.last_name = formData.last_name;
        tmpCustomer.identification_number = formData.identification_number;
        tmpCustomer.phone = formData.phone;
        tmpCustomer.email = formData.email;
        tmpCustomer.gender = formData.gender;
        tmpCustomer.birth_date = new Date(formData.birth_date);
        tmpCustomer.remarks = formData.remarks;
        tmpCustomer.entry_date = new Date(formData.entry_date);

        // actualizamos el registro en la base de datos
        await collection.replaceOne({ _id: new ObjectId(req.params.id) }, tmpCustomer);

        //cerramos conexion con la base de datos
        connectionDB.close();

        // emitimos la respuesta
        res.json({
            message: 'el registro fue actualizado exitosamente'
        });
    }

}
