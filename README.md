# Video Transcoder App

Here's a brief overview of the project:

1) The client uploads a video and its metadata, which is processed by an upload service and stored in an S3 input bucket. For large files, AWS S3's multipart upload feature breaks them into chunks for enhanced security using pre-signed URLs.

2) Metadata like title, author etc are saved in a database, and a message is published to a Kafka topic by the upload service.

3) A transcoder service acts as a consumer, downloading the video from S3, transcoding it into multiple resolutions, and uploading the results to an S3 output bucket. It generates a master m3u8 file containing the resolution information.

4) A watch service allows clients to stream videos via an appropriate player using the m3u8 file.

# Tech stack used: NextJS, Express, Postgres, Prisma, Kafka, AWS S3, Aiven cloud (for service creation), ffmeg commands (for transcoding) and microservices architecture.
