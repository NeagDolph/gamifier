import {ExecException} from "child_process";

const {exec} = require('child_process');
const fs = require('fs');

const inputFilename = 'audio/data/input.txt';
const outputFilename = 'audio/output/output.wav';

const DEFAULT_SPEAKER = "p330"
const DEFAULT_MODEL = "tts_models/en/vctk/vits"


function generateAudio(message: string, outputFile: string, speaker=DEFAULT_SPEAKER): Promise<string> {
    return new Promise((res, rej) => {
        fs.writeFileSync(inputFilename, message);

        let dockerCommand = `docker run --env SPEAKER="${speaker}" --env MODEL="${DEFAULT_MODEL}" --rm -v "$(pwd)/audio/data:/app/data" speaker`

        // Run the Docker container
        exec(dockerCommand, (error: ExecException | null, stdout: string, stderr: string) => {
            if (error) {
                console.error(`Error running Docker container: ${error}`);
                rej(`Error running Docker container: ${error}`)
            }


            let outputSplit = stdout.split("\n");
            let splitSentences = outputSplit.slice(-5, -4).join("\n");
            let processingTime = outputSplit.slice(-4, -2).join("\n");

            console.log("ProcessingTime:\n", processingTime);
            console.log("Sentences:\n", splitSentences);

            // Move the output WAV file from the container to the host
            const containerOutputPath = `./audio/data/output.wav`;
            if (fs.existsSync(containerOutputPath)) {
                fs.renameSync(containerOutputPath, `./audio/output/${outputFile}`);
                res(containerOutputPath)
            }
        });
    })
}

export {generateAudio}
