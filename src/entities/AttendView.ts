import { Binary, ObjectId } from "mongodb";
import { Attend } from "./Attend";
import { Customer } from "./Customer";

export class AttendView extends Attend{

    customer: Customer;

    constructor() {

        super();
        this.customer = null;
    }

}
