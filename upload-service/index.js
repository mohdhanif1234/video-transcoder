import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import uploadRouter from './routes/upload.route.js'
import kafkaPublisherRouter from './routes/kafkapublisher.route.js'
import multipartUploadRouter from './routes/mutipartupload.route.js'

dotenv.config();
const app = express();
const port = process.env.PORT || 8080

app.use(cors({
    allowedHeaders: ['*'],
    origin: '*'
}))


app.use(express.json());

app.get('/health-upload', (req, res) => {
    res.send('Everything seems fine in upload')
})

app.use('/api/v1/', uploadRouter)
app.use('/api/v1/', kafkaPublisherRouter)
app.use('/api/v1/', multipartUploadRouter)

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})