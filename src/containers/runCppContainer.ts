import { CPP_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import pullImage from "./pullImage";
import decodeDockerStream from "./dockerHelper";

async function runCpp(code: string, inputTestCase: string) {
    const rawLogBuffer: Buffer[] = [];

    await pullImage(CPP_IMAGE);

    console.log('Initializing a CPP docker container');

    const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > main.cpp && g++ main.cpp -o main && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | ./main`;
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

    await new Promise((res) => {
        loggerStream.on('end', () => {
            console.log(rawLogBuffer);
            const completeBuffer = Buffer.concat(rawLogBuffer);
            const decodedStream = decodeDockerStream(completeBuffer);
            console.log(decodedStream);
            res(decodedStream);
        });
    });

    await cppDockerContainer.remove();

}

export default runCpp;