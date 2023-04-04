import ErrnoException = NodeJS.ErrnoException;
import {Stats} from "fs";

const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');


const videoExtensions = ['.mov', '.mp4', ".mkv"];

function getRandomRawVideo(folderPath: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
        fs.readdir(folderPath, (err: ErrnoException | null, files: string[]) => {
            if (err) {
                reject(`Error reading directory: ${err.message}`);
                return;
            }

            const videoFiles = files.filter((file) =>
                videoExtensions.includes(path.extname(file).toLowerCase())
            );

            if (videoFiles.length === 0) {
                resolve(null);
                return;
            }

            const randomIndex = Math.floor(Math.random() * videoFiles.length);
            resolve(path.join(folderPath, videoFiles[randomIndex]));
        });
    });
}

function createGameClip(clipDuration: number = 120, inputVideo: string, outputVideo: string): Promise<string> {
    return new Promise<string>((res, rej) => {
        if (isNaN(clipDuration) || clipDuration <= 0) {
            rej('Invalid duration specified. Please provide a valid duration in seconds.');
            return;
        }

        ffmpeg.ffprobe(inputVideo, (err: ErrnoException | null, metadata: any) => {
            if (err) {
                rej('Input video file not found.');
                return;
            }

            const inputDuration = metadata.format.duration; // Approximate duration in seconds

            if (inputDuration <= clipDuration) {
                rej('Input video duration should be longer than the clip duration.');
                return;
            }

            const inputWidth = metadata.streams[0].width;
            const inputHeight = metadata.streams[0].height;

            if (inputDuration <= clipDuration) {
                console.error('Input video duration should be longer than the clip duration.');
                process.exit(1);
            }

            // Calculate new dimensions for the 9:16 aspect ratio
            const aspectRatio = 9 / 16;
            let newHeight = inputHeight;
            let newWidth = Math.round(inputHeight * aspectRatio);

            if (newWidth > inputWidth) {
                newWidth = newWidth;
                newWidth = Math.round(newWidth / aspectRatio);
            }

            const randomStart = Math.floor(Math.random() * (inputDuration - clipDuration));


            const outputPath = "./clips/output/" + outputVideo;

            ffmpeg(inputVideo)
                .setStartTime(randomStart)
                .setDuration(clipDuration)
                .videoFilter(`crop=${newWidth}:${newHeight}:(iw-${newWidth})/2:(ih-${newHeight})/2`)
                .output(outputPath)
                .on('end', () => {
                    console.log(`Clip successfully created: ${outputVideo}`);
                    res(outputPath)
                })
                .on('error', (err: Error) => {
                    rej(`Error creating clip: ${err.message}`);
                })
                .run();
        });
    })
}

export {createGameClip, getRandomRawVideo}
