import { Binary, ObjectId } from "mongodb";

export class Database {

    _id: ObjectId;
    name: string;
    host: string;
    port: string;
    user: string;
    password: string;

    constructor() {
        this._id = new ObjectId();
        this.name = null;
        this.host = null;
        this.port = null;
        this.user = null;
        this.password = null;
    }

}
