import mongoose, { Document, Schema } from "mongoose";



interface IRefreshToken extends Document {
    token:      string;
    userId:     mongoose.Types.ObjectId;
    expiresAt:  Date;
};


const refreshTokenSchema = new Schema(
    {
        token:     { type: String, required: true, unique: true },
        userId:    { type: Schema.Types.ObjectId, ref: "User", required: true },
        expiresAt: { type: Date, required: true },
    }, 
    { timestamps: true }
);

                                                                        // IMP: 
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });  // MongoDB TTL index auto-deletes expired tokens


export default mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);
//collection called refreshtokens
