import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import KafkaConfig from './kafka/kafka.js'

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

const kafkaConfig = new KafkaConfig();
kafkaConfig.consume('transcode', (data) => {
    console.log('Got data from kafka in transcode service: ', data)
})

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})