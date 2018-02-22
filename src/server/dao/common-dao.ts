import { Schema, SchemaDefinition, HookNextFunction } from "mongoose";

export function preUpdateTimeStaped(next: HookNextFunction, thisArgs = this) {
    if (!thisArgs.createdAt) {
        thisArgs.createdAt = new Date();
    } else {
        thisArgs.updatedAt = new Date();
    }
    if (next) {
        next();
    }
}

export class TimeStampedSchema extends Schema {
    constructor(definition?: SchemaDefinition) {
        definition.createdAt = Date;
        definition.updatedAt = Date;
        super(definition);
        this.pre("save", preUpdateTimeStaped);
    }
}
