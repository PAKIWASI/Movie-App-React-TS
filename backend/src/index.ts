import cors                       from 'cors';
import dotenv                     from 'dotenv';
import helmet                     from 'helmet';
import express                    from 'express';
import connectUserDB              from './config/db';
import cookieParser               from 'cookie-parser';
import userRoutes                 from './routes/userRoutes';
import authRoutes                 from './routes/authRoutes';
import movieRoutes                from './routes/movieRoutes';
import { notFound, errorHandler } from './middleware/errorHandler';
import { authMiddleware }         from './middleware/authMiddleware';


// BACKEND ENTRY POINT
// evaluated top to bottom


dotenv.config(); // loads .env into process.env
connectUserDB(); // opens the MongoDB connection using credentials from .env

const app = express();                  // get the express app object
const PORT = process.env.PORT || 5000;  // set port from .env


// Global Middlewares (runs on every request, in order)

// This backend allows requests from http://localhost:5173
// Only requests from this website are allowed to read my responses
app.use(cors({ 
    origin: process.env.CLIENT_URL || "http://localhost:5173", // this can be any url (~origin)
    credentials: true
}));   

// HTTP security headers (X-Content-Type-Options, CSP, HSTS, etc)
// Web browsers respect certain HTTP headers that improve security. Helmet sets these headers to help protect against attacks
app.use(helmet());

// parses JSON request bodies into req.body
app.use(express.json());

// parse cookies from requests onto req.cookies
app.use(cookieParser());


// Routes - Deciding which route to go based on url. Each route has many endpoints
// we register middle

app.use("/api/auth", authRoutes);

app.use("/api/user", authMiddleware, userRoutes);

app.use("/api/movie", movieRoutes);



// Health check endpoint
app.get("/", (_req, res) => {
    res.json({ message: "Backend is running" });
});


// Error middleware — must come LAST, order matters
// we come here if any of the middlewares do next(error)
app.use(notFound);      // catches requests to unknown routes
app.use(errorHandler);  // catches thrown errors from any route
// we can also have local error middlewares on each of the routes


app.listen(PORT, () => {
    console.log(`Express Server running at http://localhost:${PORT}`);
})

/*  TODO:  
    1. change password route

*/
export default app;
