import { JwtPayload } from "jsonwebtoken";

// BUG: not working ? is ts-node the issue ?
// TODO: test the new fix

// req.user doesn't exist on Express's Request type, we need to extend it
// This resolves the TypeScript error on req.user = decoded and on req.user in dashboardController

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
    }
  }
}

export {};
