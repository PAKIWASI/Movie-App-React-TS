import express from 'express'
import authMiddleware from '../middleware/authMiddleware';
import { getDashboard } from '../controllers/dashboardController';

const router = express.Router();


// Protected route

                // register the auth middleware here for validation
router.get('/', authMiddleware, getDashboard);



export default router;
