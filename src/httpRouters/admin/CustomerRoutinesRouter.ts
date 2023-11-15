import Express from 'express';
import { ApiSoftGym } from '../../app';
import { ObjectId } from 'mongodb';
import { UserRequest } from '../../types/UserRequest';
import { CustomerRoutine } from '../../entities/CustomerRoutine';
import { CustomerRoutineView } from '../../entities/CustomerRoutineView';


export class CustomerRoutinesRouter {

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
        const collection = db.collection<CustomerRoutine>("customer_routines");

        const pipelines = [
            {
                '$match': {
                    'customer_id': req.params.id
                }
            }, {
                '$addFields': {
                    'routine_id': {
                        '$toObjectId': '$routine_id'
                    },
                    'user_coach_id': {
                        '$toObjectId': '$user_coach_id'
                    }
                }
            }, {
                '$lookup': {
                    'from': 'routines',
                    'localField': 'routine_id',
                    'foreignField': '_id',
                    'as': 'routine'
                }
            }, {
                '$unwind': {
                    'path': '$routine',
                    'preserveNullAndEmptyArrays': true
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'user_coach_id',
                    'foreignField': '_id',
                    'as': 'user_coach'
                }
            }, {
                '$unwind': {
                    'path': '$user_coach',
                    'preserveNullAndEmptyArrays': true
                }
            }, {
                '$sort': {
                    'created': -1
                }
            }
        ];

        // buscamos los registros
        const rows = await collection
            .aggregate<CustomerRoutineView>(pipelines, { allowDiskUse : true })
            .toArray();


        //cerramos conexion con la base de datos
        connectionDB.close();

        // emitimos la respuesta
        res.json(rows);
    }

    /**
     * permite registrar los medidas de los clientes
     *
     * @param req
     * @param res
     */
    static add = async (req: UserRequest, res: Express.Response) => {

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos las collections a usar
        const collection = db.collection<CustomerRoutine>("customer_routines");

        // obtenemos los datos recibidos por POST
        const formData = req.body as CustomerRoutine;

        // creamos la instancia de la cuenta que se va a guardar
        const tmpRow = new CustomerRoutine();
        tmpRow.is_active = formData.is_active;
        tmpRow.remarks = formData.remarks;
        tmpRow.customer_id = req.params.id;
        tmpRow.routine_id = formData.routine_id;
        tmpRow.user_coach_id = formData.user_coach_id;

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
     * permite registrar los medidas de los clientes
     *
     * @param req
     * @param res
     */
    static setActive = async (req: UserRequest, res: Express.Response) => {

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos las collections a usar
        const collection = db.collection<CustomerRoutine>("customer_routines");

        // consultamos el registro
        const tmpRow = await collection.findOne({ _id: new ObjectId(req.params.id), customer_id: req.params.customer_id });

        if (tmpRow == null) {

            //cerramos conexion con la base de datos
            connectionDB.close();

            res.status(404).json({ message: 'no se encontro el registro' });
            return;
        }

        // consultamos todos los activos y los colocamos como falso
        const tmpRowActives = await collection.find({ customer_id: req.params.customer_id, is_active: true }).toArray();

        // iteramos
        for (const item of tmpRowActives) {
            item.is_active = false;
            await collection.replaceOne({ _id: item._id }, item);
        }

        // actualizamos el estado
        tmpRow.is_active = true;

        // insertamos el registro en la base de datos
        await collection.replaceOne({ _id: new ObjectId(req.params.id) }, tmpRow);

        //cerramos conexion con la base de datos
        connectionDB.close();

        // emitimos la respuesta
        res.json({
            message: 'el registro fue registrado exitosamente'
        });
    }

    /**
     * permite eliminar los registrode medidas realizados
     *
     * @param req
     * @param res
     */
    static remove = async (req: Express.Request, res: Express.Response) => {

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos las collections a usar        
        const collection = db.collection<CustomerRoutine>("customer_routines");

        // consultamos el registro
        const tmpRow = await collection.findOne({ _id: new ObjectId(req.params.id), customer_id: req.params.customer_id });

        // verificamos si encontro algo
        if (tmpRow == null) {

            //cerramos conexion con la base de datos
            connectionDB.close();

            res.status(404).json({ message: 'no se encontro el registro' });
            return;
        }

        // eliminamos el registro
        await collection.deleteOne({ _id: new ObjectId(req.params.id), customer_id: req.params.customer_id });

        //cerramos conexion con la base de datos
        connectionDB.close();

        // emitimos la respuesta
        res.json({
            message: 'el registro fue eliminado exitosamente'
        });
    }

}
