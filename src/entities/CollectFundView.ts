import { Binary, ObjectId } from "mongodb";
import { CollectFund } from "./CollectFund";
import { Customer } from "./Customer";
import { User } from "./User";
import { Attend } from "./Attend";
import { Membership } from "./Membership";

export class CollectFundView extends CollectFund {

    customer: Customer;
    user: User;
    attend: Attend;
    membership: Membership;

    constructor() {
        super();
        this.customer = null;
        this.user = null;
        this.attend = null;
        this.membership = null;
    }

}
