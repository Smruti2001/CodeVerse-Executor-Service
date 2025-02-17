import express from "express";
import bodyParse from "body-parser";
import serverConfig from "./config/serverConfig";
import apiRouter from "./routes";
// import sampleQueueProducer from "./producers/sampleQueueProducer";
import SampleWorker from "./workers/sampleWorker";
import serverAdapter from "./config/bullBoardConfig";
import runJava from "./containers/runJavaContainer";

const app = express();

app.use(bodyParse.json());
app.use(bodyParse.urlencoded());
app.use(bodyParse.text());

app.use('/api', apiRouter);
app.use('/ui', serverAdapter.getRouter());

app.listen(serverConfig.PORT, () => {
    console.log(`Server started at PORT ${serverConfig.PORT}`);
    console.log(`Follow the link to access BullBoard dashboard: http://localhost:${serverConfig.PORT}/ui`);

    SampleWorker('SampleQueue');

    // sampleQueueProducer('SampleJob', {
    //     name: 'Smruti',
    //     role: 'Developer',
    //     comapny: 'Google'
    // });

    const code = `
    import java.util.*;
    public class Main {
        public static void main(String args[]) {
            Scanner sc = new Scanner(System.in);
            int input = sc.nextInt();
            for(int i=0;i<input;i++) {
                System.out.print(i + " ");
            }
        }
    }
    `

    runJava(code, '10');
});
