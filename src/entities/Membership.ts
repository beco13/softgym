import { Binary, ObjectId } from "mongodb";

export class Membership {

    _id: string;
    start_date: Date;
    expiration_date: Date;
    customer_id: string;
    created: Date;
    updated: Date;
    deleted: Date;


    constructor() {

        this._id = new ObjectId();
        this.start_date = null;
        this.expiration_date = null;
        this.customer_id = null;
        this.created = new Date();
        this.updated = new Date();
        this.deleted = null;
    }

}
