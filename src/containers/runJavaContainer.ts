import createContainer from "./containerFactory";
import { JAVA_IMAGE } from "../utils/constants";
import pullImage from "./pullImage";
import decodeDockerStream from "./dockerHelper";

async function runJava(code: string, inputTestCase: string) {
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

    const response = await new Promise((res) => {
        loggerStream.on('end', () => {
            const completeBuffer = Buffer.concat(rawLogBuffer);
            const decodedStream = decodeDockerStream(completeBuffer);
            console.log(decodedStream);
            res(decodedStream);
        });
    });

    await javaDockerContainer.remove();

    return response;
}

export default runJava;