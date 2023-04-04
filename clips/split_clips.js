const path = require("path");

const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');


async function splitVideo(inputFile, outputDir) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputFile, (err, metadata) => {
            if (err) {
                console.error('Error reading video metadata:', err);
                reject(err);
                return;
            }

            const filesTemp = inputFile.split('/');
            const inputFileName = filesTemp[filesTemp.length - 1].split('.')[0];

            const duration = metadata.format.duration;
            const start = 60; // Skip first minute
            const end = duration - 60; // Skip last minute
            const segmentDuration = 300; // 5 minutes

            let segmentsProcessed = 0;
            let totalSegments = Math.ceil((end - start) / segmentDuration);

            const processSegment = (i) => {
                if (i >= end) {
                    resolve();
                    return;
                }

                const output = `${outputDir}/${inputFileName}_segment_${Math.floor(i / segmentDuration)}.mp4`;

                if (fs.existsSync(output)) {
                    console.log(output, "already exists. Skipping this file.")
                    segmentsProcessed++;
                    if (segmentsProcessed === totalSegments) {
                        resolve();
                        return;
                    } else {
                        processSegment(i + segmentDuration);
                        resolve();
                        return;
                    }
                }

                ffmpeg(inputFile)
                    .setStartTime(i)
                    .setDuration(segmentDuration)
                    .noAudio()
                    .output(output)
                    .on('error', (err) => {
                        console.error('Error splitting video:', err);
                        reject(err);
                    })
                    .on('end', () => {
                        console.log(`Segment saved as ${output}`);
                        segmentsProcessed++;
                        if (segmentsProcessed === totalSegments) {
                            resolve();
                        } else {
                            processSegment(i + segmentDuration);
                        }
                    })
                    .run();
            };

            processSegment(start);
        });
    });
}

async function splitVideosInDirectory(inputDir, outputDir) {
    fs.readdir(inputDir, (err, files) => {
        if (err) {
            console.error('Error reading input directory:', err);
            return;
        }

        const validExtensions = ['.mp4', '.mov', '.mkv', '.webm'];

        const videoFiles = files.filter((file) => validExtensions.includes(path.extname(file).toLowerCase()));
        const queue = videoFiles.map((file) => path.join(inputDir, file));

        (async function processNextVideo() {
            if (queue.length === 0) return;

            const inputFile = queue.shift();
            try {
                await splitVideo(inputFile, outputDir);
                processNextVideo();
            } catch (err) {
                console.error('Error processing video:', err);
            }
        })();
    });
}


// Example usage:
const input = './clips/raw';
const output = './clips/processed_clips';
splitVideosInDirectory(input, output)
