import { Document, Model, Schema, model } from "mongoose";

export interface User {
    email: string;
    firstName: string;
    lastName: string;
}

export interface UserModel extends User, Document {
    createdAt: Date;
}

const userSchema = new Schema({
    email: String,
    firstName: {
        type: String,
        required: true
    },
    lastName: String,
    createdAt: Date
});

userSchema.pre("save", function (next) {
    if (!this.createdAt) {
        this.createdAt = new Date();
    }
    next();
});

export const UsersDAO = model('User', userSchema);
