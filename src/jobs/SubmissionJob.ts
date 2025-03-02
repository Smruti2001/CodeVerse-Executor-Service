import { Job } from "bullmq";
import { SubmissionPayload } from "../types/sumissionPayload";
import createCodeExecutor from "../utils/codeExecutorFactory";
import { ExecutionResponse } from "../types/codeExecutorStrategy";

export default class SubmissionJob {
    name: string;
    payload: Record<string, SubmissionPayload>;
    constructor(payload: Record<string, SubmissionPayload>) {
        this.name = this.constructor.name;
        this.payload = payload;
    }

    async handler(job: Job) {
        console.log('Submission Job handler triggered');
        if(job) {
            const key = Object.keys(this.payload)[0];
            const language = this.payload[key].language;
            const code = this.payload[key].code;
            const inputTestCases = this.payload[key].inputTestCases;
            const outputTestCases = this.payload[key].outputTestCases;
            const strategy = createCodeExecutor(language);

            if(strategy) {
                const response: ExecutionResponse = await strategy.execute(code, inputTestCases, outputTestCases);
                if(response.status == 'COMPLETED') {
                    console.log('Code executed successfully.');
                    console.log(response);
                } else {
                    console.log('Something went wrong while executing the code');
                    console.log(response);
                }
            }
        }
    }

    error(job: Job) {
        console.log('Job failed');
        if (job) {
            console.log(job.name, job.id, job.data);
        }
    }
}