import { Request, Response } from "express";
import { CreateSubmissionDto } from "../dtos/CreateSubmissionDto";

export function addSubmission(req: Request, res: Response) {
    const submissionDto = req.body as CreateSubmissionDto; // Telling TS that the type of the req.body is CreateSubmissionDto
    console.log(submissionDto);

    res.status(201).json({
        success: true,
        error: {},
        data: submissionDto,
        message: 'Successfully collected the submission'
    });
}