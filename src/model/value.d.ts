import { Document } from "mongoose";
declare module "model" {
    interface Value extends TimeStampedModel {
        value: string;
    }
    interface ValueModel extends Value, Document { }
}
