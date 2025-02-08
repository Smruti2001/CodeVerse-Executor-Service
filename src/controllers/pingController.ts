import { Request, Response } from "express";

export function pingCheck(_: Request, res: Response) {
    return res.status(200).json({ message: 'Ping check is alive' });
}