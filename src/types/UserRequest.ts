import { Request } from 'express';
import { SessionIdentity } from "../helpers/SessionIdentity";

export interface UserRequest extends Request {
    user: SessionIdentity
}