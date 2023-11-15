import { Binary, ObjectId } from "mongodb";

export class BodyMeasurement {

    _id: string;
    shoulder: string;
    waist: string;
    collar: string;
    biceps: string;
    buttocks: string;
    calf: string;
    remarks: string;
    customer_id: string;
    created: Date;
    updated: Date;
    deleted: Date;


    constructor() {

        this._id = new ObjectId();
        this.shoulder = null;
        this.waist = null;
        this.collar = null;
        this.biceps = null;
        this.buttocks = null;
        this.calf = null;
        this.remarks = null;
        this.customer_id = null;
        this.created = new Date();
        this.updated = new Date();
        this.deleted = null;
    }

}
