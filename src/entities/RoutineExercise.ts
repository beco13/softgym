import { Binary, ObjectId } from "mongodb";

export class RoutineExercise {

    _id: ObjectId;
    name: string;
    repetitions: string;

    constructor() {
        this._id = new ObjectId();
        this.name = null;
        this.repetitions = null;
    }

}
