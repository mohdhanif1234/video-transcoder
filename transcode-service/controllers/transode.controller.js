import AWS from 'aws-sdk';
import ffmpeg from "fluent-ffmpeg"
import ffmpegStatic from "ffmpeg-static"
import fs from "fs"
import path from 'path';
import { updateStreamUrlInDb } from '../db/index.js';
ffmpeg.setFfmpegPath(ffmpegStatic)

export const convertToHLS = async (req, res) => {
    const resolutions = [
        {
            resolution: '320x180',
            videoBitrate: '500k',
            audioBitrate: '64k'
        },
        {
            resolution: '854x480',
            videoBitrate: '1000k',
            audioBitrate: '128k'
        },
        {
            resolution: '1280x720',
            videoBitrate: '2500k',
            audioBitrate: '192k'
        }
    ];

    const mp4FileName = 'test.mp4';
    const variantPlaylists = [];

    for (const { resolution, videoBitrate, audioBitrate } of resolutions) {
        console.log(`HLS conversion starting for ${resolution}`);
        const outputFileName = `${mp4FileName.replace(
            '.',
            '_'
        )}_${resolution}.m3u8`;
        console.log(`Outputfilename`, outputFileName)
        const segmentFileName = `${mp4FileName.replace(
            '.',
            '_'
        )}_${resolution}_%03d.ts`;
        await new Promise((resolve, reject) => {
            ffmpeg('test.mp4')
                .outputOptions([
                    `-c:v h264`,
                    `-b:v ${videoBitrate}`,
                    `-c:a aac`,
                    `-b:a ${audioBitrate}`,
                    `-vf scale=${resolution}`,
                    `-f hls`,
                    `-hls_time 10`,
                    `-hls_list_size 0`,
                    `-hls_segment_filename output/${segmentFileName}`
                ])
                .output(`output/${outputFileName}`)
                .on('end', () => resolve())
                .on('error', (err) => reject(err))
                .run();
        });
        const variantPlaylist = {
            resolution,
            outputFileName
        };
        variantPlaylists.push(variantPlaylist);
        console.log(`HLS conversion done for ${resolution}`);
    }

    console.log(`HLS master m3u8 playlist generating`);
    let masterPlaylist = variantPlaylists
        .map((variantPlaylist) => {
            const { resolution, outputFileName } = variantPlaylist;
            const bandwidth =
                resolution === '320x180'
                    ? 676800
                    : resolution === '854x480'
                        ? 1353600
                        : 3230400;
            return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n${outputFileName}`;
        })
        .join('\n');
    masterPlaylist = `#EXTM3U\n` + masterPlaylist;

    const masterPlaylistFileName = `${mp4FileName.replace(
        '.',
        '_'
    )}_master.m3u8`;
    const masterPlaylistPath = `output/${masterPlaylistFileName}`;
    fs.writeFileSync(masterPlaylistPath, masterPlaylist);
    console.log(`HLS master m3u8 playlist generated`);

    console.log('Transcoding done....');

    res.status(200).send('Transcoding successfull....')
}

export const s3InputTos3Output = async (video_id, S3Key) => {
    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    const mp4FileName = S3Key;
    const inputbucketName = process.env.AWS_INPUT_BUCKET;
    const outputbucketName = process.env.AWS_OUTPUT_BUCKET;
    const hlsFolder = 'hls';

    console.log('Starting script');

    try {
        console.log('Downloading s3 mp4 file locally');
        const mp4FilePath = `${mp4FileName}`;
        const writeStream = fs.createWriteStream('local.mp4');
        const readStream = s3
            .getObject({ Bucket: inputbucketName, Key: mp4FilePath })
            .createReadStream();
        readStream.pipe(writeStream);


        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        console.log('Downloaded s3 mp4 file locally');

        const resolutions = [
            {
                resolution: '320x180',
                videoBitrate: '500k',
                audioBitrate: '64k'
            },
            {
                resolution: '854x480',
                videoBitrate: '1000k',
                audioBitrate: '128k'
            },
            {
                resolution: '1280x720',
                videoBitrate: '2500k',
                audioBitrate: '192k'
            }
        ];


        const variantPlaylists = [];
        for (const { resolution, videoBitrate, audioBitrate } of resolutions) {
            console.log(`HLS conversion starting for ${resolution}`);
            const outputFileName = `${mp4FileName.replace(
                '.',
                '_'
            )}_${resolution}.m3u8`;
            const segmentFileName = `${mp4FileName.replace(
                '.',
                '_'
            )}_${resolution}_%03d.ts`;
            await new Promise((resolve, reject) => {
                ffmpeg('./local.mp4')
                    .outputOptions([
                        `-c:v h264`,
                        `-b:v ${videoBitrate}`,
                        `-c:a aac`,
                        `-b:a ${audioBitrate}`,
                        `-vf scale=${resolution}`,
                        `-f hls`,
                        `-hls_time 10`,
                        `-hls_list_size 0`,
                        `-hls_segment_filename hls/${segmentFileName}`
                    ])
                    .output(`hls/${outputFileName}`)
                    .on('end', () => resolve())
                    .on('error', (err) => reject(err))
                    .run();
            });
            const variantPlaylist = {
                resolution,
                outputFileName
            };
            variantPlaylists.push(variantPlaylist);
            console.log(`HLS conversion done for ${resolution}`);
        }
        console.log(`HLS master m3u8 playlist generating`);
        let masterPlaylist = variantPlaylists
            .map((variantPlaylist) => {
                const { resolution, outputFileName } = variantPlaylist;
                const bandwidth =
                    resolution === '320x180'
                        ? 676800
                        : resolution === '854x480'
                            ? 1353600
                            : 3230400;
                return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n${outputFileName}`;
            })
            .join('\n');
        masterPlaylist = `#EXTM3U\n` + masterPlaylist;


        const masterPlaylistFileName = `${mp4FileName.replace(
            '.',
            '_'
        )}_master.m3u8`;
        const masterPlaylistPath = `hls/${masterPlaylistFileName}`;
        fs.writeFileSync(masterPlaylistPath, masterPlaylist);

        console.log(`HLS master m3u8 playlist generated`);

        console.log(`Deleting locally downloaded s3 mp4 file`);

        fs.unlinkSync('local.mp4');
        console.log(`Deleted locally downloaded s3 mp4 file`);

        console.log(`Uploading media m3u8 playlists and ts segments to s3 output bucket starts...`);

        const files = fs.readdirSync(hlsFolder);
        let results = []
        for (const file of files) {
            if (!file.startsWith(mp4FileName.replace('.', '_'))) {
                continue;
            }
            const filePath = path.join(hlsFolder, file);
            const fileStream = fs.createReadStream(filePath);
            const uploadParams = {
                Bucket: outputbucketName,
                Key: `${hlsFolder}/${file}`,
                Body: fileStream,
                ContentType: file.endsWith('.ts')
                    ? 'video/mp2t'
                    : file.endsWith('.m3u8')
                        ? 'application/x-mpegURL'
                        : null
            };
            results.push(await s3.upload(uploadParams).promise());
            fs.unlinkSync(filePath);
        }

        console.log(`FINAL RESULT AFTER UPLOAD....`, results)
        console.log(
            `Uploaded media m3u8 playlists and ts segments to s3 output bucket completed. Also deleted locally....`
        );

        console.log('Getting final steam pre signed url')
        const signedUrl = await getSignedUrl(results[results.length - 1].Key)
        console.log('Fetching final stream presigned url done......')

        console.log('Updating stream url in db starts....')
        const updatedVideoData = await updateStreamUrlInDb(video_id, results[results.length - 1].Location)

        console.log('Updating stream url in db completed...', updatedVideoData)

    } catch (error) {
        console.error('Error:', error);
    }
}


export const getSignedUrl = (videoKey) => {

    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: 'ap-south-1'
    });

    const params = {
        Bucket: process.env.AWS_INPUT_BUCKET,
        Key: videoKey,
        Expires: 1800 // this URL will expire in 30 mins
    };

    return new Promise((resolve, reject) => {
        s3.getSignedUrl('getObject', params, (err, url) => {
            if (err) {
                reject(err);
            } else {
                resolve(url);
            }
        });
    });
}
