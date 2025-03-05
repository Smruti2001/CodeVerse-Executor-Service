import { CPP_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import pullImage from "./pullImage";
import decodeDockerStream from "./dockerHelper";
import CodeExecutorStrategy, { ExecutionResponse } from "../types/codeExecutorStrategy";


class CppExecutor implements CodeExecutorStrategy {
    async execute(code: string, inputTestCases: string, outputTestCases: string): Promise<ExecutionResponse> {
        const rawLogBuffer: Buffer[] = [];

        console.log(code, inputTestCases, outputTestCases)

        await pullImage(CPP_IMAGE);
        console.log('Initializing a CPP docker container');

        const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > main.cpp && g++ main.cpp -o main && echo '${inputTestCases.replace(/'/g, `'\\"`)}' | ./main`;
        console.log(runCommand);

        const cppDockerContainer = await createContainer(CPP_IMAGE, ['/bin/sh', '-c', runCommand]);

        await cppDockerContainer.start();

        const loggerStream = await cppDockerContainer.logs({
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
            
            // Test case matching
            if(codeResponse.trim() === outputTestCases.trim()) {
                return { output: codeResponse, status: 'SUCCESS' };
            } else {
                return { output: codeResponse, status: 'WA' };
            }

        } catch (error) {
            if(error == 'TLE') {
                await cppDockerContainer.kill(); // Kill the container if TLE occurs
            }
            return { output: error as string, status: 'ERROR' }
        } finally {
            await cppDockerContainer.remove();
        }

    }

    fetchDecodedStream(loggerStream: NodeJS.ReadableStream, rawLogBuffer: Buffer[]): Promise<string> {
        return new Promise((res, rej) => {
            
            const timeOut = setTimeout(() => {
                console.log('Time limit exceeded');
                rej('TLE');
            }, 2000);

            loggerStream.on('end', () => {
                clearTimeout(timeOut);
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


export default CppExecutor;