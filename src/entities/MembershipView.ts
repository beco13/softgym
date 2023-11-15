import { Binary, ObjectId } from "mongodb";
import { Customer } from "./Customer";
import { Membership } from "./Membership";

export class MembershipView extends Membership{

    customer: Customer;

    constructor() {

        super();
        this.customer = null;
    }
}
