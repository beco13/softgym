import { Binary, ObjectId } from "mongodb";

export class CustomerRoutine {

    _id: string;
    is_active: boolean;
    remarks: string;
    customer_id: string;
    routine_id: string;
    user_coach_id: string;
    created: Date;
    updated: Date;
    deleted: Date;


    constructor() {

        this._id = new ObjectId();
        this.is_active = false;
        this.routine_id = null;
        this.user_coach_id = null;
        this.remarks = null;
        this.customer_id = null;
        this.created = new Date();
        this.updated = new Date();
        this.deleted = null;
    }

}
