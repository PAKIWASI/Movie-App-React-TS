import mongoose from "mongoose";


// make a connection to the local or online mongodb User database
// it may be a collection in another database


const connectUserDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI as string);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database Name: ${conn.connection.name}`);
    } catch (error) {
        console.error("DB connection error:", error);
        process.exit(1);
    }
};

export default connectUserDB;
