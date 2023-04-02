import { generatePlot, generateStory, formatPlot } from "./dialogue/story";
import {generateAudio} from "./audio/audio";


(async function () {
    // Generate prompt
    let prompt = formatPlot(await generatePlot({}))
    console.log("PROMPT\n", prompt);

    // Generate audio for prompt
    console.log("\nGenerating audio for prompt")
    let outputFilePrompt = await generateAudio(prompt, "plot.wav", 'p305');

    // Generate story with prompt
    let story = await generateStory({story_script: prompt})
    console.log("\n\n\nSTORY\n", story);

    // Generate audio for story
    console.log("\nGenerating audio for story:")
    let outputFileStory = await generateAudio(story, "output.wav", 'p330');

    console.log("Output saved as", outputFileStory)
}())

