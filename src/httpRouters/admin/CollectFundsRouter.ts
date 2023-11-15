import Express from 'express';
import { ApiSoftGym } from '../../app';
import { ObjectId } from 'mongodb';
import { Customer } from '../../entities/Customer';
import { Utils } from '../../helpers/Utils';
import { UserRequest } from '../../types/UserRequest';
import { CollectFund } from '../../entities/CollectFund';
import { Attend } from '../../entities/Attend';
import { Membership } from '../../entities/Membership';
import { CollectFundView } from '../../entities/CollectFundView';


export class CollectFundsRouter {

    /**
     * permite obtener todos los registros
     *
     * @param req
     * @param res
     */
    static getAll = async (req: UserRequest, res: Express.Response) => {

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos las collections a usar
        const collection = db.collection<CollectFund>("collect_funds");

        const pipelines = [
            {
                '$addFields': {
                    'customer_id': {
                        '$toObjectId': '$customer_id'
                    },
                    'user_id': {
                        '$toObjectId': '$user_id'
                    },
                    'attend_id': {
                        '$toObjectId': '$attend_id'
                    },
                    'membership_id': {
                        '$toObjectId': '$membership_id'
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
                '$lookup': {
                    'from': 'users',
                    'localField': 'user_id',
                    'foreignField': '_id',
                    'as': 'user'
                }
            }, {
                '$unwind': {
                    'path': '$user',
                    'preserveNullAndEmptyArrays': true
                }
            }, {
                '$lookup': {
                    'from': 'attends',
                    'localField': 'attend_id',
                    'foreignField': '_id',
                    'as': 'attend'
                }
            }, {
                '$unwind': {
                    'path': '$attend',
                    'preserveNullAndEmptyArrays': true
                }
            }, {
                '$lookup': {
                    'from': 'memberships',
                    'localField': 'membership_id',
                    'foreignField': '_id',
                    'as': 'membership'
                }
            }, {
                '$unwind': {
                    'path': '$membership',
                    'preserveNullAndEmptyArrays': true
                }
            }, {
                '$addFields': {
                    'customer_id': {
                        '$toString': '$customer_id'
                    },
                    'user_id': {
                        '$toString': '$user_id'
                    },
                    'attend_id': {
                        '$toString': '$attend_id'
                    },
                    'membership_id': {
                        '$toString': '$membership_id'
                    },
                    'attend': {
                        '$ifNull': [
                            '$attend', null
                        ]
                    },
                    'membership': {
                        '$ifNull': [
                            '$membership', null
                        ]
                    }
                }
            }, {
                '$sort': {
                    'created': -1
                }
            }
        ];

        // buscamos los registros
        const rows = await collection
            .aggregate<CollectFundView>(pipelines, { allowDiskUse : true })
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
        const collection = db.collection<CollectFund>("collect_funds");

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
    static add = async (req: UserRequest, res: Express.Response) => {

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos las collections a usar
        const collection = db.collection<CollectFund>("collect_funds");
        const collectionAttends = db.collection<Attend>("attends");
        const collectionMemberships = db.collection<Membership>("memberships");
        const collectionCustomers = db.collection<Customer>("customers");

        // obtenemos los datos recibidos por POST
        const formData = req.body as CollectFund;

        // creamos la instancia de la cuenta que se va a guardar
        const tmpRow = new CollectFund();
        tmpRow.service = formData.service;
        tmpRow.total_amount = formData.total_amount;
        tmpRow.user_id = req.user.user._id.toString();
        tmpRow.customer_id = formData.customer_id;


        // dependiendo de lo que se este pagadno registramos
        if (formData.service == "CLASS") {

            const tmpAttend = new Attend();
            tmpAttend.entry_date = new Date();
            tmpAttend.departure_date = null;
            tmpAttend.status = "ITS_HERE";
            tmpAttend.customer_id = formData.customer_id;

            // insertamos el registro en la base de datos
            await collectionAttends.insertOne(tmpAttend);

            tmpRow.attend_id = tmpAttend._id.toString();
        } else {

            const customDate = new Date();
            customDate.setMonth(customDate.getMonth() + 1);

            const tmpMembership = new Membership();
            tmpMembership.start_date = new Date();
            tmpMembership.expiration_date = customDate;
            tmpMembership.customer_id = formData.customer_id;

            // insertamos el registro en la base de datos
            await collectionMemberships.insertOne(tmpMembership);

            tmpRow.membership_id = tmpMembership._id.toString();


            const tmpCustomers = await collectionCustomers.findOne({ _id: new ObjectId(formData.customer_id) });
            tmpCustomers.status = "ACTIVE";
            await collectionCustomers.replaceOne({ _id: new ObjectId(formData.customer_id) }, tmpCustomers);
        }


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
        const collection = db.collection<CollectFund>("collect_funds");

        // consultamos el registro
        const tmpRow = await collection.findOne({ _id: new ObjectId(req.params.id) });

        // verificamos si encontro algo
        if (tmpRow == null) {

            //cerramos conexion con la base de datos
            connectionDB.close();

            res.status(404).json({ message: 'no se encontro el registro' });
            return;
        }

        // obtenemos los datos recibidos por POST
        const formData = req.body as Customer;
        /*
                // creamos la instancia de la cuenta que se va a guardar
                tmpRow.name = formData.name;
                tmpRow.last_name = formData.last_name;
                tmpRow.identification_number = formData.identification_number;
                tmpRow.phone = formData.phone;
                tmpRow.email = formData.email;
                tmpRow.gender = formData.gender;
                tmpRow.birth_date = new Date(formData.birth_date);
                tmpRow.remarks = formData.remarks;
                tmpRow.entry_date = new Date(formData.remarks);
        */
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
