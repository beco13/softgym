import { Session } from "../entities/Session";
import { User } from "../entities/User";

export class SessionIdentity {

    //  contiene informacion de las credenciales de la session
    user: User;

    // contiene informacion de la session
    session: Session;

    // indica el canal por el que se estaria haciendo la conexion, solo aplica para peticiones tipo SOCKETS no HTTP
    socket_id: string;

    constructor() {
        this.user = null;
        this.session = null;
        this.socket_id = null;
    }

}
