import { Binary, ObjectId } from "mongodb";

export class CollectFund {

    _id: string;
    service: "CLASS" | "MEMBERSHIP";
    total_amount: number;
    user_id: string;
    customer_id: string;
    attend_id: string;
    membership_id: string;
    created: Date;
    updated: Date;
    deleted: Date;


    constructor() {

        this._id = new ObjectId();
        this.service = null;
        this.total_amount = 0;
        this.user_id = null;
        this.customer_id = null;
        this.attend_id = null;
        this.membership_id = null;
        this.created = new Date();
        this.updated = new Date();
        this.deleted = null;
    }

}
