import 'dotenv/config'
import { createAdapter } from '@socket.io/mongo-adapter';
import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { createServer, Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { AuthMiddleware as HttpAuthMiddleware } from './httpMiddlewares/AuthMiddleware';
import { AuthMiddleware as SocketAuthMiddleware } from './socketMiddlewares/AuthMiddleware';
import { HeadersMiddleware } from './httpMiddlewares/HeadersMiddleware';
import { ConnectionDB } from './helpers/ConnectionDB';
import { HomeRouter } from './httpRouters/Public/HomeRouter';
import { AuthRouter } from './httpRouters/Public/AuthRouter';
import { CustomersRouter } from './httpRouters/admin/CustomersRouter';
import { UsersRouter } from './httpRouters/admin/UsersRouter';
import { AuthRouterSocket } from './socketRoutes/AuthRouter.Socket';
import { Database } from './entities/Database';
import { RoutinesRouter } from './httpRouters/admin/RoutinesRouter';
import { CollectFundsRouter } from './httpRouters/admin/CollectFundsRouter';
import { AttendsRouter } from './httpRouters/admin/AttendsRouter';
import { MembershipsRouter } from './httpRouters/admin/MembershipsRouter';
import { BodyMeasurementsRouter } from './httpRouters/admin/BodyMeasurementsRouter';
import { CustomerRoutinesRouter } from './httpRouters/admin/CustomerRoutinesRouter';
import { ReportsRouter } from './httpRouters/admin/ReportsRouter';

/**
 * Clase principal que corre las basses del proyecto,
 * se ejecuta empezando el metodo estatico para
 * ApiSoftGym.run();
 */
export class ApiSoftGym {

    // variable que guarda la informacion de la instancia del framework
    static appExpress: express.Express = null;

    // contiene el servidor http
    static httpServer: HttpServer = null;

    // contiene el servidor webscoket
    static socketServer: SocketServer = null;

    /**
     * Permite inicializar las conexiones a la base de datos
     */
    public static async createConnectionDB(): Promise<ConnectionDB> {

        // creamos configuracion a la bd principal
        const configAdminDB = new Database();
        configAdminDB.name = process.env.DB_DATABASE;
        configAdminDB.host = process.env.DB_HOST;
        configAdminDB.port = process.env.DB_PORT;
        configAdminDB.user = process.env.DB_USERNAME;
        configAdminDB.password = process.env.DB_PASSWORD;

        // creamos la instancia 
        const connectionDB = new ConnectionDB();

        // connectamos a la base de datos
        await connectionDB.connect(configAdminDB);

        // devolvemos la conexion
        return connectionDB;
    }

    /**
     * Permite crear los servidores para correr el proyecto
     */
    private static async createServers() {

        // creamos instancia de la libreria del framework
        ApiSoftGym.appExpress = express();

        // creamos el servidor WEB HTTPS
        ApiSoftGym.httpServer = createServer(ApiSoftGym.appExpress);

        // creamos el servidor web WEBSOCKETS
        ApiSoftGym.socketServer = new SocketServer(ApiSoftGym.httpServer, {
            path: process.env.SOCKET_PATH,
            cors: {
                // origin: 'http://localhost:3000',
                origin: '*',
                methods: ["GET", "POST", "PUT", "DELETE"],
                allowedHeaders: ["access_token"],
                credentials: true
            },
        });

        // con este codigo lo que hacemos es que cualquier cosa que se envie como respues en formatoo json, 
        // se verifica si el string enviado es una fecha y lo enviamos en numero
        ApiSoftGym.appExpress
            .set("json replacer", function (key, value) {

                if (typeof value === "string") {
                    const A = new Date(value);
                    const B = Date.parse(value);
                    if (A instanceof Date && !isNaN(B)) {
                        return B;
                    }
                }

                return value;
            });

        // creamos la conexion principal a la base de datos
        const connectionDb = await ApiSoftGym.createConnectionDB();

        // obtenemos la referencia de la conexion a la base de datos..
        const db = connectionDb.getDB();

        // creamos una intancia de acceso a la base de datos Principal y seguido seleccionamos la collecion donde se guardara los eventos de websockets
        const CollectionSocketAdapterEvents = db.collection("socket_events");

        // indicamos al socket.io donde debe guardar la info sobre los eventos
        ApiSoftGym.socketServer.adapter(createAdapter(CollectionSocketAdapterEvents));
    }

    /**
     * permite crear los middlewares a usar en el servidor http
     */
    private static setupHttpMiddlewares() {

        // middleware to set headers
        ApiSoftGym.appExpress.use(HeadersMiddleware);

        // con esto le decimos a expressjs que procese las peticiones como si fueran a recibirlas on json
        ApiSoftGym.appExpress.use(express.json());
    }

    /**
     * permite crear los middlewares a usar en el servidor socket
     */
    private static setupSocketMiddlewares() {

        // middleware auth
        ApiSoftGym.socketServer.use(SocketAuthMiddleware);
    }

    /**
     * Permite registrar los routes para el servidor http
     * Servicios publicos
     */
    private static setupHttpRoutes() {


        /******************************************
         * CREAMOS LAS RUTAS PARA EL AREA PUBLICA *
         ******************************************/
        // creamos las rutas publicas
        ApiSoftGym.appExpress.get('/', HomeRouter);
        ApiSoftGym.appExpress.post('/login', AuthRouter.login);
        ApiSoftGym.appExpress.post('/logout', AuthRouter.logout);

        
        /******************************************
         * CREAMOS LAS RUTAS PARA EL AREA PRIVADA *
         ******************************************/
        // creamos una ruta para tratar en conjunto
        const adminRoutes = express.Router();
        adminRoutes.use(HttpAuthMiddleware);
        
        adminRoutes.get('/collect-funds', CollectFundsRouter.getAll);
        adminRoutes.get('/collect-funds/:id', CollectFundsRouter.get);
        adminRoutes.post('/collect-funds', CollectFundsRouter.add);

        adminRoutes.get('/customers', CustomersRouter.getAll);
        adminRoutes.get('/customers/:id', CustomersRouter.get);
        adminRoutes.post('/customers', CustomersRouter.add);
        adminRoutes.put('/customers/:id', CustomersRouter.adit);

        adminRoutes.get('/customers/:id/body-measurements', BodyMeasurementsRouter.getAllByCustomer);
        adminRoutes.post('/customers/:id/body-measurements', BodyMeasurementsRouter.add);
        adminRoutes.delete('/customers/:customer_id/body-measurements/:id', BodyMeasurementsRouter.remove);

        adminRoutes.get('/customers/:id/routines', CustomerRoutinesRouter.getAllByCustomer);
        adminRoutes.post('/customers/:id/routines', CustomerRoutinesRouter.add);
        adminRoutes.post('/customers/:customer_id/routines/:id/activate', CustomerRoutinesRouter.setActive);
        adminRoutes.delete('/customers/:customer_id/routines/:id', CustomerRoutinesRouter.remove);


        adminRoutes.get('/customers/:id/memberships', MembershipsRouter.getAllByCustomer);
        adminRoutes.get('/memberships', MembershipsRouter.getAll);
        adminRoutes.get('/memberships/:id', MembershipsRouter.get);
        
        adminRoutes.get('/customers/:id/attends', AttendsRouter.getAllByCustomer);
        adminRoutes.get('/attends', AttendsRouter.getAll);
        adminRoutes.get('/attends/:id', AttendsRouter.get);
        adminRoutes.post('/attends', AttendsRouter.add);
        adminRoutes.put('/attends/:id', AttendsRouter.adit);


        adminRoutes.get('/routines', RoutinesRouter.getAll);
        adminRoutes.get('/routines/:id', RoutinesRouter.get);
        adminRoutes.post('/routines', RoutinesRouter.add);
        adminRoutes.put('/routines/:id', RoutinesRouter.adit);

        adminRoutes.get('/users', UsersRouter.getAll);
        adminRoutes.get('/users/:id', UsersRouter.get);
        adminRoutes.post('/users', UsersRouter.add);
        adminRoutes.put('/users/:id', UsersRouter.adit);
        adminRoutes.put('/users/:id/status', UsersRouter.toogleStatus);

        adminRoutes.get('/reports/money-collection-today', ReportsRouter.moneyCollectionReportToday);
        adminRoutes.get('/reports/money-collection-week', ReportsRouter.moneyCollectionReportWeek);
        adminRoutes.get('/reports/money-collection-month', ReportsRouter.moneyCollectionReportMonth);
        adminRoutes.get('/reports/customers-who-renewed-today', ReportsRouter.customersWhoRenewedTodayReport);
        adminRoutes.get('/reports/paying-customers-for-today', ReportsRouter.payingCustomersForTodayReport);
        adminRoutes.get('/reports/customers-whose-membership-expire-week', ReportsRouter.customersWhoseMembershipExpiresThisWeekReport);


        // mount the router on the app
        ApiSoftGym.appExpress.use('/admin', adminRoutes)
    }

    /**
     * permite registrar los handlers para el servidor socket
     * Debe estar autenticado para acceder a los siguientes servicios
     */
    private static socketHandlers(socket: Socket) {

        // ejecutamos el handler para cuando se cree una conexion
        AuthRouterSocket.connect(socket);

        // ejecutamos el handler para cuando se pierda una conexion
        socket.on("disconnect", (reason: string) => {
            AuthRouterSocket.disconnect(reason, socket);
        })

        // socket.on("order:create", createOrder);
        // socket.on("order:read", readOrder);
    }

    /**
     * Metodo principal para correr la aplicacion
     */
    public static async run() {

        // creamos las instancias de los servidores
        ApiSoftGym.createServers();

        // configuramos los http middlewares
        ApiSoftGym.setupHttpMiddlewares();

        // configuramos los sockets middlewares
        ApiSoftGym.setupSocketMiddlewares();

        // configuramos las rutas HTTP que tendra disponible la aplicacion
        ApiSoftGym.setupHttpRoutes();

        // le decimos al framework express js que ya puede desplegar
        ApiSoftGym.httpServer.listen(process.env.HTTP_PORT, async () => {
            console.log('listening on *:', process.env.HTTP_PORT);
            //console.log('contraseña: ', await bcrypt.hash("alejo_12345", 10));
        });

        // configuramos las rutas SOCKETS que tendra disponible la aplicacion para cuando se conecte un usuario
        ApiSoftGym.socketServer.on('connection', ApiSoftGym.socketHandlers);

    }

}

// corremos el aplicativo
ApiSoftGym.run();