import Express from 'express';
import { ApiSoftGym } from '../../app';
import { ObjectId } from 'mongodb';
import { UserRequest } from '../../types/UserRequest';
import { DateTime } from "luxon";
import { CollectFund } from '../../entities/CollectFund';
import { CollectFundView } from '../../entities/CollectFundView';
import { Membership } from '../../entities/Membership';

interface collectFundGroupView {
    _id: string,
    total_amount: number;
}

export class ReportsRouter {

    /**
     * permite obtener el reporte de los dinero recaudados hoy
     *
     * @param req
     * @param res
     */
    static moneyCollectionReportToday = async (req: UserRequest, res: Express.Response) => {

        // Obtener la fecha actual en la zona horaria 'America/Bogota'
        const currentDate = DateTime.now().setZone('America/Bogota');

        // Obtener la fecha de la primera hora del día actual en 'America/Bogota'
        const currentDayFirstHour = currentDate.startOf('day').toJSDate();
        const currentDayLastHour = currentDate.endOf('day').toJSDate();

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos las collections a usar
        const collection = db.collection<CollectFund>("collect_funds");

        const pipelines = [
            {
                '$match': {
                    'created': {
                        '$gte': currentDayFirstHour,
                        '$lte': currentDayLastHour
                    }
                }
            }, {
                '$group': {
                    '_id': null,
                    'total_amount': {
                        '$sum': '$total_amount'
                    }
                }
            }
        ];

        // consultamos los registros
        const rows = await collection
            .aggregate<collectFundGroupView>(pipelines, { allowDiskUse: true })
            .toArray();

        //cerramos conexion con la base de datos
        connectionDB.close();

        if (rows.length > 0) {

            // emitimos la respuesta
            res.json(rows[0]);
        } else {

            // emitimos la respuesta
            res.json(null);
        }
    }

    /**
     * permite obtener el reporte de los dinero recaudados esta semana
     *
     * @param req
     * @param res
     */
    static moneyCollectionReportWeek = async (req: UserRequest, res: Express.Response) => {

        // Obtener la fecha actual en la zona horaria 'America/Bogota'
        const currentDate = DateTime.now().setZone('America/Bogota');

        // Obtener la fecha de la primera hora del día actual en 'America/Bogota'
        const startHourDate = currentDate.startOf('week', { weekStart: 1 }).toJSDate();
        const endHourDate = currentDate.endOf('week', { weekStart: 1 }).toJSDate();

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos las collections a usar
        const collection = db.collection<CollectFund>("collect_funds");

        const pipelines = [
            {
                '$match': {
                    'created': {
                        '$gte': startHourDate,
                        '$lte': endHourDate
                    }
                }
            }, {
                '$group': {
                    '_id': null,
                    'total_amount': {
                        '$sum': '$total_amount'
                    }
                }
            }
        ];

        // consultamos los registros
        const rows = await collection
            .aggregate<collectFundGroupView>(pipelines, { allowDiskUse: true })
            .toArray();

        //cerramos conexion con la base de datos
        connectionDB.close();

        if (rows.length > 0) {

            // emitimos la respuesta
            res.json(rows[0]);
        } else {

            // emitimos la respuesta
            res.json(null);
        }
    }

    /**
     * permite obtener el reporte de los dinero recaudados esta semana
     *
     * @param req
     * @param res
     */
    static moneyCollectionReportMonth = async (req: UserRequest, res: Express.Response) => {

        // Obtener la fecha actual en la zona horaria 'America/Bogota'
        const currentDate = DateTime.now().setZone('America/Bogota');

        // Obtener la fecha de la primera hora del día actual en 'America/Bogota'
        const startHourDate = currentDate.startOf('month').toJSDate();
        const endHourDate = currentDate.endOf('month').toJSDate();

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos las collections a usar
        const collection = db.collection<CollectFund>("collect_funds");

        const pipelines = [
            {
                '$match': {
                    'created': {
                        '$gte': startHourDate,
                        '$lte': endHourDate
                    }
                }
            }, {
                '$group': {
                    '_id': null,
                    'total_amount': {
                        '$sum': '$total_amount'
                    }
                }
            }
        ];

        // consultamos los registros
        const rows = await collection
            .aggregate<collectFundGroupView>(pipelines, { allowDiskUse: true })
            .toArray();

        //cerramos conexion con la base de datos
        connectionDB.close();

        if (rows.length > 0) {

            // emitimos la respuesta
            res.json(rows[0]);
        } else {

            // emitimos la respuesta
            res.json(null);
        }
    }


    /**
     * permite obtener todos los clientes que renovaron mensualidad hoy
     *
     * @param req
     * @param res
     */
    static customersWhoRenewedTodayReport = async (req: UserRequest, res: Express.Response) => {

        // Obtener la fecha actual en la zona horaria 'America/Bogota'
        const currentDate = DateTime.now().setZone('America/Bogota');

        // Obtener la fecha de la primera hora del día actual en 'America/Bogota'
        const startHourDate = currentDate.startOf('day').toJSDate();
        const endHourDate = currentDate.endOf('day').toJSDate();

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos las collections a usar
        const collection = db.collection<CollectFund>("collect_funds");

        const pipelines = [
            {
                '$match': {
                    'service': 'MEMBERSHIP',
                    'created': {
                        '$gte': startHourDate,
                        '$lte': endHourDate
                    }
                }
            },
            {
                '$addFields': {
                    'customer_id': {
                        '$toObjectId': '$customer_id'
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
            },

            
            {
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
            }, 


            {
                '$addFields': {
                    'customer_id': {
                        '$toString': '$customer_id'
                    },
                    'membership_id': {
                        '$toString': '$membership_id'
                    },
                }
            }, {
                '$sort': {
                    'created': -1
                }
            }
        ];

        // buscamos los registros
        const rows = await collection
            .aggregate<CollectFundView>(pipelines, { allowDiskUse: true })
            .toArray();

        //cerramos conexion con la base de datos
        connectionDB.close();

        // emitimos la respuesta
        res.json(rows);
    }

    /**
     * permite obtener todos los clientes que pagaron por solamente la clase hoy
     *
     * @param req
     * @param res
     */
    static payingCustomersForTodayReport = async (req: UserRequest, res: Express.Response) => {

        // Obtener la fecha actual en la zona horaria 'America/Bogota'
        const currentDate = DateTime.now().setZone('America/Bogota');

        // Obtener la fecha de la primera hora del día actual en 'America/Bogota'
        const startHourDate = currentDate.startOf('day').toJSDate();
        const endHourDate = currentDate.endOf('day').toJSDate();

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos las collections a usar
        const collection = db.collection<CollectFund>("collect_funds");

        const pipelines = [
            {
                '$match': {
                    'service': 'CLASS',
                    'created': {
                        '$gte': startHourDate,
                        '$lte': endHourDate
                    }
                }
            },
            {
                '$addFields': {
                    'customer_id': {
                        '$toObjectId': '$customer_id'
                    },
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
            },

            {
                '$addFields': {
                    'customer_id': {
                        '$toString': '$customer_id'
                    },
                }
            }, {
                '$sort': {
                    'created': -1
                }
            }
        ];

        // buscamos los registros
        const rows = await collection
            .aggregate<CollectFundView>(pipelines, { allowDiskUse: true })
            .toArray();

        //cerramos conexion con la base de datos
        connectionDB.close();

        // emitimos la respuesta
        res.json(rows);
    }

    /**
     * permite obtener todos los clientes que se les vences la membresia esta semana
     *
     * @param req
     * @param res
     */
    static customersWhoseMembershipExpiresThisWeekReport = async (req: UserRequest, res: Express.Response) => {


        // Obtener la fecha actual en la zona horaria 'America/Bogota'
        const currentDate = DateTime.now().setZone('America/Bogota');

        // Obtener la fecha de la primera hora del día actual en 'America/Bogota'
        const startHourDate = currentDate.startOf('week', { weekStart: 1 }).toJSDate();
        const endHourDate = currentDate.endOf('week', { weekStart: 1 }).toJSDate();

        // cargamos la conexion a la base de datos
        const connectionDB = await ApiSoftGym.createConnectionDB();

        // obtenemos la instancia de la conexion a la base de datos
        const db = connectionDB.getDB();

        // cargamos las collections a usar
        const collection = db.collection<CollectFund>("collect_funds");
        const collectionMemberships = db.collection<Membership>("memberships");

        const pipelinesMemberships = [
            {
                '$sort': {
                    'created': 1
                }
            }, {
                '$group': {
                    '_id': '$customer_id',
                    'last_record': {
                        '$last': '$$ROOT'
                    }
                }
            }, {
                '$match': {
                    'last_record.expiration_date': {
                        '$lte': endHourDate,
                        '$gte': startHourDate
                    }
                }
            }, {
                '$replaceRoot': {
                    'newRoot': '$last_record'
                }
            }
        ];

        // buscamos los registros
        const rowsMemberships = await collectionMemberships
            .aggregate<Membership>(pipelinesMemberships, { allowDiskUse: true })
            .toArray();

        const membership_ids = [];

        for (const row of rowsMemberships) {
            membership_ids.push(row._id.toString());
        }


        const pipelines = [
            {
                '$match': {
                    'service': 'MEMBERSHIP',
                    'membership_id': {
                        '$in': membership_ids
                    }
                }
            },
            {
                '$addFields': {
                    'customer_id': {
                        '$toObjectId': '$customer_id'
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
            },

            {
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
            }, 

            {
                '$addFields': {
                    'customer_id': {
                        '$toString': '$customer_id'
                    },
                    'membership_id': {
                        '$toString': '$membership_id'
                    },
                }
            }, {
                '$sort': {
                    'created': -1
                }
            }
        ];

        // buscamos los registros
        const rows = await collection
            .aggregate<CollectFundView>(pipelines, { allowDiskUse: true })
            .toArray();

        //cerramos conexion con la base de datos
        connectionDB.close();

        // emitimos la respuesta
        res.json(rows);
    }


}
