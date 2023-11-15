import { ClientSession, Db, MongoClient, ObjectId } from "mongodb";
import { Database } from "../entities/Database";

export class ConnectionDB {

    /**
     * contiene la sesion de la conexion a la base de datos
     * @var type
     */
    private session: ClientSession;

    /**
     * Contiene la instancia de la base de datos
     * @var type
     */
    private db: Db;

    /**
     * Contiene la instancia dela libreria que conecta con la base de datos en mongo
     */
    private mongo: MongoClient;


    constructor() {
        this.session = null;
        this.db = null;
        this.mongo = null;
    }

    /**
     * permite obtener la sesion de la conexion a la base de datos
     * @return Session
     */
    public getSession(): ClientSession {
        return this.session;
    }

    /**
     * Permite obtener una conexion con la base de datos
     *
     * @return Database
     */
    public getDB(): Db {
        return this.db;
    }

    /**
     * Permite obtener la instancia de la libreria mongobd usada para la conexion
     * @returns 
     */
    public getMongoClient(): MongoClient{
        return this.mongo;
    }

    /**
     * permite establecer los ajustes de conexion a la base de datos administrativa
     *
     * @param array $settingsDb
     */
    async connect(database: Database) {

        // creamos la url de conexion a la base de datos
        const uri = "mongodb+srv://" + database.user + ":" + database.password + "@" + database.host + "?retryWrites=true&w=majority";

        // creamos una instancia para la conexion a la base de datos
        this.mongo = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        // hacemos la conexion a la base de datos
        await this.mongo.connect();

        // creamos la session (para manejo de transacciones) para la conexion
        this.session = this.mongo.startSession();

        // creamos una instancia para la base de datos
        this.db = this.mongo.db(database.name);
    }

    /**
     * Permite cerrar la conexion con la base de datos
     */
    async close() {
        await this.mongo.close();
    }



}