import { Binary, ObjectId } from "mongodb";
import { RoutineExercise } from "./RoutineExercise";

export class Routine {

    _id: ObjectId;
    name: string;
    description: string;
    exercises: Array<RoutineExercise>;
    created: Date;
    updated: Date;
    deleted: Date;

    constructor() {
        this._id = new ObjectId();
        this.name = null;
        this.description = null;
        this.exercises = [];
        this.created = new Date();
        this.updated = new Date();
        this.deleted = null;
    }

}
