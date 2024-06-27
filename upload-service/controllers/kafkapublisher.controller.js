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