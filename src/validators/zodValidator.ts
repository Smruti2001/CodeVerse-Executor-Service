import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const dtoValidator = (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid request params received',
            data: {},
            error: error 
        });
    }
}