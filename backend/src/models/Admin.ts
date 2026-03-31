import mongoose, { Schema, Document } from "mongoose";


interface IAdmin extends Document {
    userId: mongoose.Types.ObjectId;
    addedBy: mongoose.Types.ObjectId; // Track who added this admin
}


interface IAdminModel extends mongoose.Model<IAdmin> {
    getRole(userId: string): Promise<Roles>;
}

const adminSchema: Schema = new Schema(
    {
        userId: { 
            type: Schema.Types.ObjectId, 
            required: true, 
            unique: true // One document per admin user
        },
        addedBy: { 
            type: Schema.Types.ObjectId, 
            required: true 
        }
    },
    { timestamps: true }
);

export enum Roles {
    user,
    admin,
};


adminSchema.statics.getRole = async function(userId: string): Promise<Roles> {
    const id = await this.exists({ userId });
    return id ? Roles.admin : Roles.user;
};

// export default mongoose.model<IAdmin>("Admin", adminSchema);
// collection name admins
export default mongoose.model<IAdmin, IAdminModel>("Admin", adminSchema);
// colledtion called admins

