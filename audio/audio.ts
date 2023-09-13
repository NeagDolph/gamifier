import {ExecException} from "child_process";
import {protos} from "@google-cloud/text-to-speech";
import * as util from "util";

const {exec} = require('child_process');
const fs = require('fs');
const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');
const textToSpeech = require('@google-cloud/text-to-speech');

const inputFilename = 'audio/data/input.txt';

const DEFAULT_SPEAKER = "p330"
const DEFAULT_MODEL = "tts_models/en/vctk/vits"

const client = new textToSpeech.TextToSpeechClient({
    keyFilename: "/Users/neil/gamifier.json",
    projectId: "gamifier-385921"
});


function generateAudioOld(message: string, outputFile: string, speaker = DEFAULT_SPEAKER): Promise<string> {
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

async function generateAudio(message: string, outputFile: string, speaker?: string): Promise<string> {
    const request = {
        input: {text: message},
        // Select the language and SSML voice gender (optional)
        voice: {languageCode: 'en-US', name: speaker ?? "en-US-Studio-O"},
        // select the type of audio encoding
        audioConfig: {audioEncoding: 'MP3'},
    };

    const [response] = await client.synthesizeSpeech(request);

    const finalOutputPath = `./audio/output/${outputFile}`

    const writeFile = util.promisify(fs.writeFile);
    await writeFile(finalOutputPath, response.audioContent, 'binary');

    return finalOutputPath;
}

//  function getAudioDuration(audioFile: string): Promise<number> {
//     return new Promise((resolve, reject) => {
//         ffmpeg.ffprobe(audioFile, (err: Error, metadata: any) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(metadata.format.duration);
//             }
//         });
//     });
// }

async function getAudioDuration(filePath: string): Promise<number> {
    try {
        const probeResult = await ffprobe(filePath, { path: ffprobeStatic.path });
        const audioStream = probeResult.streams.find((stream: any) => stream.codec_type === 'audio');
        return audioStream.duration;
    } catch (error) {
        console.error('Error while calculating audio duration:', error);
        // return null;
    }
}

export {generateAudio, getAudioDuration}
