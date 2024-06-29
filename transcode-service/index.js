import express, { json } from 'express'
import dotenv, { parse } from 'dotenv'
import cors from 'cors'
import KafkaConfig from './kafka/kafka.js'
import transcodeRouter from './routes/transcode.route.js'
import {s3InputTos3Output} from './controllers/transode.controller.js'

dotenv.config();
const app = express();
const port = process.env.PORT || 8081

app.use(cors({
    allowedHeaders: ['*'],
    origin: '*'
}))


app.use(express.json());

app.get('/health-transcode', (req, res) => {
    res.send('Everything seems fine in transcode')
});

app.use('/api/v1/', transcodeRouter)

const kafkaConfig = new KafkaConfig();
kafkaConfig.consume('transcode', async (data) => {
    console.log('Got data from kafka in transcode service: ', data)
    const parsedData = await JSON.parse(data)

    console.log(`Parsed Data----`, parsedData);

    const {video_id, S3Key}=parsedData
    await s3InputTos3Output(video_id, S3Key)

    console.log('Transcoding successfully done!!')
})

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})