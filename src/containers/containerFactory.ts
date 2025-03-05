import Docker from 'dockerode';

async function createContainer(imageName: string, cmdExecutable: string[]) {
    const docker = new Docker();

    const container = await docker.createContainer({
        Image: imageName,
        Cmd: cmdExecutable,
        AttachStdin: true, // to enable input streams
        AttachStdout: true, // to enable output streams
        AttachStderr: true, // to enable error streams
        Tty: false,
        HostConfig: { // Setting a memory limit for the Docker
            Memory: 1024 * 1024 * 512 // 512 MB
        },
        OpenStdin: true // Keep the input stream up even if we are not interacting with it. Similar to that of the -it flag of docker where i ensures to keep the stdin up
    });

    return container;
}

export default createContainer;