import { PYTHON_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import decodeDockerStream from "./dockerHelper";
import pullImage from "./pullImage";

async function runPython(code: string, inputTestCase: string) {

    const rawLogBuffer: Buffer[] = [];

    await pullImage(PYTHON_IMAGE);
    
    console.log('Initializing the python container');
    
    const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > test.py && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | python3 test.py`;
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

    await new Promise((res) => {
        loggerStream.on('end', () => {
            console.log(rawLogBuffer);
            const completeBuffer = Buffer.concat(rawLogBuffer);
            const decodedStream = decodeDockerStream(completeBuffer);
            console.log(decodedStream);
            res(decodedStream);
        });
    });

    await pythonDockerContainer.remove();

}

export default runPython;