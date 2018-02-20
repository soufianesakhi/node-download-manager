import { Schema, SchemaDefinition } from "mongoose";

export class TimeStampedSchema extends Schema {
    constructor(definition?: SchemaDefinition) {
        definition.createdAt = Date;
        definition.updatedAt = Date;
        super(definition);
        this.pre("save", function (next) {
            if (!this.createdAt) {
                this.createdAt = new Date();
            } else {
                this.updatedAt = new Date();
            }
            next();
        });
    }
}
