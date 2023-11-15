import { Binary, ObjectId } from "mongodb";
import { CustomerRoutine } from "./CustomerRoutine";
import { Routine } from "./Routine";
import { User } from "./User";

export class CustomerRoutineView extends CustomerRoutine{

    routine: Routine;
    user_coach: User;

    constructor() {
        super();
        this.routine = null;
        this.user_coach = null;
    }

}
