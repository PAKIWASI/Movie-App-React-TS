import mongoose from "mongoose";
import Movie from "../models/Movie";


const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI as string);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database Name: ${conn.connection.name}`);
        console.log(`Collection Name: ${Movie.collection.name}`);
    } catch (error) {
        console.error("DB connection error:", error);
        process.exit(1);
    }
};

export default connectDB;
