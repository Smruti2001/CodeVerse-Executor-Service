import Docker from "dockerode";

export default async function pullImage(iamgeName: string) {
    try {
        const docker = new Docker();
        return new Promise((res, rej) => {
            docker.pull(iamgeName, (err: Error, stream: NodeJS.ReadableStream) => {
                if (err) throw err;
                docker.modem.followProgress(stream, (err, result) => err ? rej(err) : res(result), (event) => {
                    console.log(event.status);
                })
            })
        })
    } catch (error) { 
        console.log('Error from pullImage: ', error);
    }
}