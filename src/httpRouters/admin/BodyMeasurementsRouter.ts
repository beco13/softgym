import Express from 'express';
import { ApiSoftGym } from '../../app';
import { ObjectId } from 'mongodb';
import { UserRequest } from '../../types/UserRequest';
import { BodyMeasurement } from '../../entities/BodyMeasurement';


export class BodyMeasurementsRouter {

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
        const collection = db.collection<BodyMeasurement>("body_measurements");

        // consultamos los registros
        const rows = await collection.find({ customer_id: req.params.id }, { sort: { created: -1 } }).toArray();

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
        const collection = db.collection<BodyMeasurement>("body_measurements");

        // obtenemos los datos recibidos por POST
        const formData = req.body as BodyMeasurement;

        // creamos la instancia de la cuenta que se va a guardar
        const tmpRow = new BodyMeasurement();
        tmpRow.shoulder = formData.shoulder;
        tmpRow.waist = formData.waist;
        tmpRow.collar = formData.collar;
        tmpRow.biceps = formData.biceps;
        tmpRow.buttocks = formData.buttocks;
        tmpRow.calf = formData.calf;
        tmpRow.remarks = formData.remarks;
        tmpRow.customer_id = req.params.id;

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
        const collection = db.collection<BodyMeasurement>("body_measurements");

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
