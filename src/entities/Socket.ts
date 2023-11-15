import { Binary, ObjectId } from "mongodb";

export class Socket {

    _id: ObjectId;
    socket_id: string;
    session_id: string;
    created: Date;
    deleted: Date;

    constructor() {
        this._id = new ObjectId();
        this.socket_id = null;
        this.session_id = null;
        this.created = new Date();
        this.deleted = null;
    }
}
