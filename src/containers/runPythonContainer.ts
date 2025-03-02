import CodeExecutorStrategy, { ExecutionResponse } from "../types/codeExecutorStrategy";
import { PYTHON_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import decodeDockerStream from "./dockerHelper";
import pullImage from "./pullImage";


class PythonExecutor implements CodeExecutorStrategy {
    async execute(code: string, inputTestCases: string, outputTestCases: string): Promise<ExecutionResponse> {
        const rawLogBuffer: Buffer[] = [];

        console.log(code, inputTestCases, outputTestCases);

        await pullImage(PYTHON_IMAGE);
        console.log('Initializing the python container');

        const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > test.py && echo '${inputTestCases.replace(/'/g, `'\\"`)}' | python3 test.py`;
        console.log(runCommand);

        // const pythonDockerContainer = await createContainer(PYTHON_IMAGE, ['python3', '-c', code, 'stty -echo']);
        const pythonDockerContainer = await createContainer(PYTHON_IMAGE, ['bin/sh', '-c', runCommand]);

        await pythonDockerContainer.start();

        console.log('Started the Python container');

        const loggerStream = await pythonDockerContainer.logs({
            stdout: true,
            stderr: true,
            follow: true, // Real time logs -> Keeps the stdin active and whenever a new log is created it sends that to us
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
            await pythonDockerContainer.remove();
        }
    }

    fetchDecodedStream(loggerStream: NodeJS.ReadableStream, rawLogBuffer: Buffer[]): Promise<string> {
        return new Promise((res, rej) => {
            loggerStream.on('end', () => {
                const completeBuffer = Buffer.concat(rawLogBuffer);
                const decodedStream = decodeDockerStream(completeBuffer);
                if (decodedStream.stderr) {
                    rej(decodedStream.stderr);
                } else {
                    res(decodedStream.stdout);
                }
            });
        });
    }

}


export default PythonExecutor;