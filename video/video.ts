import {getAudioDuration} from "../audio/audio";

const ffmpeg = require('fluent-ffmpeg');
const path = require('path');


// Image scale and position
const image1Scale = 0.6;
const image1YOffset = 50;
const image2Scale = 0.4;
const image2YOffset = 200;

const { execFile } = require('child_process');


async function createVideo(promptImage: string, outputImage: string, promptAudio: string, outputAudio: string, promptDuration: number, outputDuration: number, gameClip: string, outputVideo: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const pythonScript = './video/video_processing.py';
        const args = [gameClip, promptImage, outputImage, promptAudio, outputAudio, outputVideo, promptDuration, outputDuration];

        const execInput = [pythonScript, ...args];

        console.log("Running Video Script: python3", execInput.join(" "))

        execFile('python3', execInput, (error: Error, stdout: string, stderr: string) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
}

export {createVideo}

