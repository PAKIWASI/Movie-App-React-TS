import { Request, Response } from 'express';


export const getDashboard = async (req: Request, res: Response) : Promise<void> => {
    try {
        res.status(200).json({ message: "Welcome to the protected dashboard!", user: (req as any).user }); // TODO: last one is wrong in typescript
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to get dashboard" });
    }
}
