import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import uploadRouter from './routes/upload.route.js'

dotenv.config();
const app=express();
const port=process.env.PORT||8080

app.use(cors({
    allowedHeaders:['*'],
    origin:'*'
}))


app.use(express.json());

app.get('/health', (req, res)=>{
    res.send('Everything seems fine')
})

app.use('/api/v1/', uploadRouter)

app.listen(port, ()=>{
    console.log(`Server is listening on port ${port}`)
})