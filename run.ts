import {generatePlot, generateStory, formatPlot} from "./dialogue/story";
import {generateAudio, getAudioDuration} from "./audio/audio";
import {createChatImage} from "./images/process_images";
import {createGameClip, getRandomRawVideo} from "./clips/process_clip";
import {createVideo} from "./video/video";
import {performance} from 'perf_hooks';


function generateRandomCode(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
}

async function run() {
    let GOOD_VOICES = ["p330", "p287"];

    const randomCode = generateRandomCode(5);
    let outputVideo = `./video/output/video_${randomCode}.mov`;
    console.log("\nCREATING VIDEO", randomCode);

    // Generate prompt
    console.log("\nGenerating prompts");
    let prompt = await generatePlot({})
    console.log("\nPROMPT\n", prompt);
    console.log("\nGenerating output");

    let story = await generateStory({story_script: prompt.replace(/ ?\([\w ,]\)/g, "")})
    console.log("\nSTORY\n", story);

    let reformmated = formatPlot(prompt, story)
    story = reformmated.story
    prompt = reformmated.prompt

    console.log("\nGenerating prompt Image");
    let promptImage = await createChatImage(prompt, "prompt.png", true);

    // Generate audio for prompt
    console.log("\nGenerating prompt Audio")

    // let speaker1 = GOOD_VOICES.splice(Math.floor(Math.random() * GOOD_VOICES.length), 1)[0]
    let speaker1 = "en-US-Studio-O"
    let outputFilePrompt = await generateAudio(prompt, "prompt.mp3", speaker1);

    // Generate story with prompt
    console.log("\nGenerating output Image");
    let storyImage = await createChatImage(story, "output.png", false);

    // Generate audio for story
    console.log("\nGenerating output Audio")
    // let speaker2 = GOOD_VOICES.splice(Math.floor(Math.random() * GOOD_VOICES.length), 1)[0]
    let speaker2 = "en-US-Wavenet-J"
    let outputFileStory = await generateAudio(story, "output.mp3", speaker2);

    console.log("Getting audio durations")
    let promptDuration = await getAudioDuration(outputFilePrompt);
    let outputDuration = await getAudioDuration(outputFileStory);

    const randomVideo = await getRandomRawVideo("./clips/processed_clips");
    if (randomVideo) {
        console.log(`Randomly selected video: ${randomVideo}`);
        // let gameClipPath = await createGameClip(promptDuration + outputDuration + 8, randomVideo, "clip.mov")

        console.log(`Creating final video: ${outputVideo}`);
        let fileOutput = await createVideo(promptImage, storyImage, outputFilePrompt, outputFileStory, promptDuration, outputDuration, randomVideo, outputVideo);

        console.log("Output saved as", fileOutput)
    } else {
        console.log('No video files found in the folder.');
    }


}

(async function () {

    // Run x times
    const args = process.argv.slice(2).join("");
    let num = 1;

    if (!isNaN(parseFloat(args))) {
        num = Number(args);
    }

    console.log(`CREATING ${num} CHATGPT VIDEO${num > 1 ? "S" : ""}`)

    for (let i = 0; i < num; i++) {
        const startTime = performance.now();
        try {
            await run();
        } catch (e) {
            console.log("ERROR", e);
            continue;
        }
        const endTime = performance.now();
        const elapsedTime = endTime - startTime;
        const elapsedTimeInSeconds = elapsedTime / 1000;
        const minutes = Math.floor(elapsedTimeInSeconds / 60);
        const seconds = (elapsedTimeInSeconds % 60).toFixed(2);

        console.log('CODE TIME REPORT:');
        console.log(`The code took ${minutes} minutes and ${seconds} seconds to execute.`);
    }
})()

