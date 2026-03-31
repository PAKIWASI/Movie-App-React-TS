import mongoose, { Schema, Document } from "mongoose";
import { User } from "../types/user.type";


// Main document interface for Users
export interface IUser extends User, Document {
    // User interface in types already defines all the fields
}

// define the Mongoose schema (for database validation)
const userSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        age: { type: Number, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
    },
    { timestamps: true }
);

// Text index for full-text search
userSchema.index({ name: "text" });

// make a document model from the schema
export default mongoose.model<IUser>("User", userSchema);
// mongodb will search for a "users" collection

