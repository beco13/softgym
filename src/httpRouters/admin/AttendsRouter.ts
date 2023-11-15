import Express from 'express';
import { ApiSoftGym } from '../../app';
import { ObjectId } from 'mongodb';
import { Customer } from '../../entities/Customer';
import { Utils } from '../../helpers/Utils';
import { UserRequest } from '../../types/UserRequest';
import { Attend } from '../../entities/Attend';
import { AttendView } from '../../entities/AttendView';
import { DateTime } from "luxon";


export class AttendsRouter {

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
        const collection = db.collection<Attend>("attends");

        const pipelines = [
            {
                '$set': {
                    'customer_id': {
                        '$toObjectId': '$customer_id'
                    }
                }
            }, {
                '$lookup': {
                    'from': 'customers',
                    'localField': 'customer_id',
                    'foreignField': '_id',
                    'as': 'customer'
                }
            }, {
                '$unwind': {
                    'path': '$customer',
                    'preserveNullAndEmptyArrays': true
                }
            }, {
                '$sort': {
                    'updated': -1
                }
            }
        ];

         // buscamos los registros
         const rows = await collection
         .aggregate<AttendView>(pipelines, { allowDiskUse : true })
         .toArray();

        //cerramos conexion con la base de datos
        connectionDB.close();

        // emitimos la respuesta
        res.json(rows);
    }

    
    /**
     * permite obtener todos los registros
     *
     * @param req
     * @param res
     */
    static getAllByCustomer = async (req: UserRequest, res: Express.Response) => {

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos las collections a usar
        const collection = db.collection<Attend>("attends");

        // consultamos los registros
        const rows = await collection.find({ customer_id: req.params.id }, { sort: { created: -1 } }).toArray();

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
        const collection = db.collection<Attend>("attends");

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
        const collection = db.collection<Attend>("attends");
        const collectionCustomers = db.collection<Customer>("customers");

        // obtenemos los datos recibidos por POST
        const formData = req.body as Attend;

        // verificamos que el cliente seleccionado cumpla con dos condiciones
        // 1 que este activo
        // 2 que no tenga ingreso previo

        const tmpCustomer = await collectionCustomers.findOne({ _id: new ObjectId(formData.customer_id) });

        // validamos que haya encontrado el cliente
        if(tmpCustomer == null){
            //cerramos conexion con la base de datos
            connectionDB.close();

            res.status(404).json({ message: 'no se encuentra el registro del cliente seleccionado' });
            return;
        }

        // verificamos que el cliente tenga activa una membresia
        if(tmpCustomer.status == "SUSPENDED"){
            //cerramos conexion con la base de datos
            connectionDB.close();

            res.status(404).json({ message: 'cliente seleccionado no contiene una membresia activa' });
            return;
        }

        // Obtener la fecha actual en la zona horaria 'America/Bogota'
        const currentDate = DateTime.now().setZone('America/Bogota');

        // Obtener la fecha de la primera hora del día actual en 'America/Bogota'
        const currentDayFirstHour = currentDate.startOf('day').toJSDate();

        // buscamos si hay registros previos de ingresos del cliente
        const previousEntry = await collection.findOne({
            customer_id: formData.customer_id,
            departure_date: null,
            entry_date: {
                $gte: currentDayFirstHour
            }
        });

        // verificamos si encontro un ingreso previo
        if(previousEntry !== null){
            
            //cerramos conexion con la base de datos
            connectionDB.close();

            res.status(404).json({ message: 'cliente seleccionado ya se encuentra adentro del gimnasio' });
            return;
        }

        // creamos la instancia que se va a guardar
        const tmpRow = new Attend();
        tmpRow.entry_date = new Date();
        tmpRow.departure_date = null;
        tmpRow.status = "ITS_HERE";
        tmpRow.customer_id = formData.customer_id;

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
        const collection = db.collection<Attend>("attends");

        // consultamos el registro
        const tmpAttend = await collection.findOne({ _id: new ObjectId(req.params.id) });

        // verificamos si encontro algo
        if (tmpAttend == null) {

            //cerramos conexion con la base de datos
            connectionDB.close();

            res.status(404).json({ message: 'no se encontro el registro' });
            return;
        }

        // verificamos que no se le este haciendo salida a un registro que ya tien ela informacion de salida registrada
        if(tmpAttend.departure_date != null){
            
            //cerramos conexion con la base de datos
            connectionDB.close();

            res.status(404).json({ message: 'el registro ya contiene registro de salida' });
            return;
        }

        tmpAttend.departure_date = new Date();
        tmpAttend.status = "ITS_GONE";
        tmpAttend.updated = new Date();

        // actualizamos el registro en la base de datos
        await collection.replaceOne({ _id: new ObjectId(req.params.id) }, tmpAttend);

        //cerramos conexion con la base de datos
        connectionDB.close();

        // emitimos la respuesta
        res.json({
            message: 'el registro fue actualizado exitosamente'
        });
    }

}
