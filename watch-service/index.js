import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import watchRouter from './routes/watch.route.js'

dotenv.config();
const app = express();
const port = process.env.PORT || 8082

app.use(cors({
    allowedHeaders: ['*'],
    origin: '*'
}))


app.use(express.json());

app.get('/health-watch', (req, res) => {
    res.send('Everything seems fine in watch')
})

app.use('/api/v1/', watchRouter);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})