import { Binary, ObjectId } from "mongodb";

export class Attend {

    _id: string;
    entry_date: Date;
    departure_date: Date;
    status: "ITS_HERE" | "ITS_GONE";
    customer_id: string;
    created: Date;
    updated: Date;
    deleted: Date;


    constructor() {

        this._id = new ObjectId();
        this.entry_date = null;
        this.departure_date = null;
        this.status = "ITS_HERE";
        this.customer_id = null;
        this.created = new Date();
        this.updated = new Date();
        this.deleted = null;
    }

}
