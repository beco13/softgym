import { Binary, ObjectId } from "mongodb";


export class Customer {

    _id: ObjectId;
    name: string;
    last_name: string;
    identification_number: string;
    phone: string;
    email: string;
    gender: "FEMALE" | "MALE";
    birth_date: Date;
    remarks: string;
    status: "ACTIVE" | "SUSPENDED";
    entry_date: Date;
    created: Date;
    updated: Date;
    deleted: Date;

    constructor() {
        this._id = new ObjectId();
        this.name = null;
        this.last_name = null;
        this.identification_number = null;
        this.phone = null;
        this.email = null;
        this.gender = null;
        this.birth_date = null;
        this.remarks = null;
        this.status = null;
        this.entry_date = null;
        this.created = new Date();
        this.updated = new Date();
        this.deleted = null;
    }

}
