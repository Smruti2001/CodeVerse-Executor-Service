import { Job } from "bullmq";
import { SubmissionPayload } from "../types/sumissionPayload";
import runJava from "../containers/runJavaContainer";

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
            if(this.payload[key].language === 'JAVA') {
                const code = this.payload[key].code;
                const inputTestCases = this.payload[key].inputTestCases;
                const response = await runJava(code, inputTestCases);
                console.log('Evaluated response is: ', response);
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