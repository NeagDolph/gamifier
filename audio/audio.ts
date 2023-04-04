import {ExecException} from "child_process";

const {exec} = require('child_process');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

const inputFilename = 'audio/data/input.txt';
const outputFilename = 'audio/output/output.wav';

const DEFAULT_SPEAKER = "p330"
const DEFAULT_MODEL = "tts_models/en/vctk/vits"


function generateAudio(message: string, outputFile: string, speaker=DEFAULT_SPEAKER): Promise<string> {
    return new Promise((res, rej) => {
        fs.writeFileSync(inputFilename, message);

        let dockerCommand = `docker run --env SPEAKER="${speaker}" --env MODEL="${DEFAULT_MODEL}" --rm -v "$(pwd)/audio/data:/app/data" speaker2`

        // Run the Docker container
        exec(dockerCommand, (error: ExecException | null, stdout: string, stderr: string) => {
            if (error) {
                console.error(`Error running Docker container: ${error}`);
                rej(`Error running Docker container: ${error}`)
            }


            let outputSplit = stdout.split("\n");
            // let splitSentences = outputSplit.slice(-5, -4).join("\n");
            let processingTime = outputSplit.slice(-4, -2).join("\n");


            console.log(processingTime);
            // console.log("Sentences:\n", splitSentences);

            // Move the output WAV file from the container to the host
            const containerOutputPath = `./audio/data/output.mp3`;
            const finalOutputPath = `./audio/output/${outputFile}`
            if (fs.existsSync(containerOutputPath)) {
                if (fs.existsSync(finalOutputPath)) fs.unlinkSync(finalOutputPath);
                fs.renameSync(containerOutputPath, finalOutputPath);
                res(finalOutputPath)
            }
        });
    })
}

function getAudioDuration(audioFile: string): Promise<number> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(audioFile, (err: Error, metadata: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(metadata.format.duration);
            }
        });
    });
}

export {generateAudio, getAudioDuration}
