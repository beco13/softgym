import Express from 'express';
import { ApiSoftGym } from '../../app';
import { ObjectId } from 'mongodb';
import { UserRequest } from '../../types/UserRequest';
import { Membership } from '../../entities/Membership';
import { MembershipView } from '../../entities/MembershipView';


export class MembershipsRouter {

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
        const collection = db.collection<Membership>("memberships");

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
                    'created': -1
                }
            }
        ];

         // buscamos los registros
         const rows = await collection
         .aggregate<MembershipView>(pipelines, { allowDiskUse : true })
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
        const collection = db.collection<Membership>("memberships");

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
        const collection = db.collection<Membership>("memberships");

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

}
