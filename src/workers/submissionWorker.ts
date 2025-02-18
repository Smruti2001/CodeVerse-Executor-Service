import { Job, Worker } from "bullmq";
import redisConnection from "../config/redisConfig";
import SubmissionJob from "../jobs/SubmissionJob";

export default async function SubmissionWorker(queueName: string) {
    new Worker(
        queueName,
        async (job: Job) => {
            if(job.name === 'SubmissionJob') {
                const submissionJobInstance = new SubmissionJob(job.data);
                await submissionJobInstance.handler(job);
                return true;
            }
        },
        {connection: redisConnection}
    )
}