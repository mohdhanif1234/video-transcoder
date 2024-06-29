import KafkaConfig from "../kakfa/kafka.js";

export const publishMessageToKafka = async (req, res) => {
    console.log('Got here in upload service...')
    try {
        const message = req.body;
        console.log('Body: ', message);
        const kafkaConfig = new KafkaConfig();
        const msgs = [
            {
                key: 'key1',
                value: JSON.stringify(message)
            }
        ]
        await kafkaConfig.produce('transcode', msgs)
        res.status(200).send('message published successfully')
    } catch (error) {
        console.error(error)
    }
}

export const pushVideoForEncodingToKafka = async (title, url, video_id, S3Key) => {
    try {
        const message = {
            "title": title,
            "url": url,
            "video_id": video_id,
            "S3Key":S3Key
        }
        console.log("body : ", message)
        const kafkaconfig = new KafkaConfig()
        const msgs = [
            {
                key: "video",
                value: JSON.stringify(message)
            }
        ]
        await kafkaconfig.produce("transcode", msgs)
        console.log("message published to kafka successfully")

    } catch (error) {
        console.log(error)
    }
}