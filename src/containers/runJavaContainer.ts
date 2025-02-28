import createContainer from "./containerFactory";
import { JAVA_IMAGE } from "../utils/constants";
import pullImage from "./pullImage";
import decodeDockerStream from "./dockerHelper";
import CodeExecutorStrategy, { ExecutionResponse } from "../types/codeExecutorStrategy";


class JavaExecutor implements CodeExecutorStrategy {
    async execute(code: string, inputTestCase: string): Promise<ExecutionResponse> {
        const rawLogBuffer: Buffer[] = [];

        await pullImage(JAVA_IMAGE);
        console.log('Initializing a Java container');

        const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > Main.java && javac Main.java && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | java Main`;
        console.log(runCommand);

        const javaDockerContainer = await createContainer(JAVA_IMAGE, ['bin/sh', '-c', runCommand]);

        await javaDockerContainer.start();

        const loggerStream = await javaDockerContainer.logs({
            stdout: true,
            stderr: true,
            follow: true,
            timestamps: false
        });

        loggerStream.on('data', (chunk) => {
            rawLogBuffer.push(chunk);
        });

        try {
            const codeResponse: string = await this.fetchDecodedStream(loggerStream, rawLogBuffer);
            return { output: codeResponse, status: 'COMPLETED' };
        } catch (error) {
            return { output: error as string, status: 'ERROR' }
        } finally {
            await javaDockerContainer.remove();
        }
    }

    fetchDecodedStream(loggerStream: NodeJS.ReadableStream, rawLogBuffer: Buffer[]): Promise<string> {
        return new Promise((res) => {
            loggerStream.on('end', () => {
                const completeBuffer = Buffer.concat(rawLogBuffer);
                const decodedStream = decodeDockerStream(completeBuffer);
                if (decodedStream.stderr) {
                    res(decodedStream.stderr);
                } else {
                    res(decodedStream.stdout);
                }
            });
        });
    }

}

export default JavaExecutor;