import express from "express";
import { addSubmission } from "../../controllers/submissionController";
import { dtoValidator } from "../../validators/zodValidator";
import { CreateSubmissionZodSchema } from "../../dtos/CreateSubmissionDto";

const submissionRouter = express.Router();

submissionRouter.post('/', dtoValidator(CreateSubmissionZodSchema), addSubmission);

export default submissionRouter;