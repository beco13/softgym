import { Binary, ObjectId } from "mongodb";

export class User {

    _id: ObjectId;
    role: "ADMIN" | "COACH";
    username: string;
    password: string;
    status: "ACTIVE" | "BLOCKED";
    online: boolean;
    disconnected: Date;
    created: Date;
    updated: Date;
    deleted: Date;

    constructor() {
        this._id = new ObjectId();
        this.role = null;
        this.username = null;
        this.password = null;
        this.role = null;
        this.status = "ACTIVE";
        this.online = false;
        this.disconnected = null;
        this.created = new Date();
        this.updated = new Date();
        this.deleted = null;
    }

}
