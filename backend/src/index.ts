import express from 'express'
import dotenv from 'dotenv';
import cors from 'cors'
import connectUserDB from './config/db';
import userRoutes from './routes/userRoutes'
import authRoutes from './routes/authRoutes';
import cookieParser from 'cookie-parser';
import movieRoutes from './routes/movieRoutes'
import { notFound, errorHandler } from './middleware/errorHandler';


// BACKEND ENTRY POINT
// evaluated top to bottom


dotenv.config(); // loads .env into process.env
connectUserDB(); // opens the MongoDB connection before any request hits

const app = express();                  // get the express app object
const PORT = process.env.PORT || 5000;  // set port from .env

// Global Middlewares (runs on every request, in order)

// cors allows frontend to call this backend api (kinda like IPC)
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));

// parses JSON request bodies into req.body
// if we have users and we do: 
// curl -X POST http://localhost:5000/api/users -H "Content-Type: application/json" -d '{"name":"Ali","age":25,"email":"ali@example.com"}'
// then this middleware will put the name, age and email into req.body
app.use(express.json());    

// parse cookies from requests
app.use(cookieParser());


// Routes 

// Any thing hitting /api/users will go to userRoutes
app.use("/api/users", userRoutes);

// Any thing hitting /api/auth will go to authRoutes
app.use("/api/auth", authRoutes);

app.use("/api/movies/", movieRoutes);


// Health check endpoint
app.get("/", (_req, res) => {
    res.json({ message: "User API is running" });
});


// Error middleware — must come LAST, order matters
app.use(notFound);      // catches requests to unknown routes
app.use(errorHandler);  // catches thrown errors from any route


app.listen(PORT, () => {
    console.log(`Express Server running at http://localhost:${PORT}`);
})

export default app;
