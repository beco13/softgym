import { Binary, ObjectId } from "mongodb";

export class Session {

    _id: ObjectId;
    token: string;
    ip: string;
    user_agent: string;
    user_id: string;
    created: Date;
    updated: Date;
    expired: Date;

    constructor() {
        this._id = new ObjectId();
        this.token = null;
        this.ip = null;
        this.user_agent = null;
        this.user_id = null;
        this.created = new Date();
        this.updated = new Date();
        this.expired = null;
    }
}
