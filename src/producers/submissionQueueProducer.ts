import submissionQueue from "../queues/submissionQueue";
import { SubmissionPayload } from "../types/sumissionPayload";

export default async function(payload: Record<string, SubmissionPayload>) {
    await submissionQueue.add("SubmissionJob", payload);
}