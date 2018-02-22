import { Document, model } from "mongoose";
import { TimeStampedSchema } from "./common-dao";
import { ValueModel } from "../..";

export function getValueDAO(name: string) {
    return model<ValueModel>(name, new TimeStampedSchema({
        value: String
    }));
}
