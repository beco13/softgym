import Express from 'express';
import { ApiSoftGym } from '../../app';
import { ObjectId } from 'mongodb';
import { UserRequest } from '../../types/UserRequest';
import { Routine } from '../../entities/Routine';
import { RoutineExercise } from '../../entities/RoutineExercise';


export class RoutinesRouter {

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
        const collection = db.collection<Routine>("routines");

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
        const collection = db.collection<Routine>("routines");

        // consultamos el registro
        const tmpRow = await collection.findOne({ '_id': new ObjectId(req.params.id) });

        //cerramos conexion con la base de datos
        connectionDB.close();

        // verificamos si encontro algo
        if (tmpRow === null) {
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
        const collection = db.collection<Routine>("routines");

        // obtenemos los datos recibidos por POST
        const formData = req.body as Routine;

        // creamos la instancia de la cuenta que se va a guardar
        const tmpRow = new Routine();
        tmpRow.name = formData.name;
        tmpRow.description = formData.description;

        // recorremos los ejercicios y los agregamos
        for (const exercise of formData.exercises) {

            const tmpExer = new RoutineExercise();
            tmpExer.name = exercise.name;
            tmpExer.repetitions = exercise.repetitions;
            tmpRow.exercises.push(tmpExer);
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
        const collection = db.collection<Routine>("routines");

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
        const formData = req.body as Routine;

        // creamos la instancia de la cuenta que se va a guardar
        tmpRow.name = formData.name;
        tmpRow.description = formData.description;

        // recorremos los ejercicios y los agregamos
        for (const exercise of formData.exercises) {

            const tmpExer = new RoutineExercise();
            tmpExer.name = exercise.name;
            tmpExer.repetitions = exercise.repetitions;
            tmpRow.exercises.push(tmpExer);
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
