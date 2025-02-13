import express from "express";
import bodyParse from "body-parser";
import serverConfig from "./config/serverConfig";
import apiRouter from "./routes";
import sampleQueueProducer from "./producers/sampleQueueProducer";
import SampleWorker from "./workers/sampleWorker";
import serverAdapter from "./config/bullBoardConfig";

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

    sampleQueueProducer('SampleJob', {
        name: 'Smruti',
        role: 'Developer',
        comapny: 'Google'
    });
});
