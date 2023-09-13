import { ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from "openai";
import { PlotParameters, StoryParameters } from "./parameters";
const fs = require("fs");

// const GPT_MODEL = "gpt-3.5-turbo";
const GPT_MODEL = "gpt-4";

const PLOT_TEMPLATE_FILE = "./plot_creation_script.txt"
const STORY_TEMPLATE_FILE = "./story_creation_script.txt"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});


const openai = new OpenAIApi(configuration);

function generateTemplate(template: string, config: PlotParameters | StoryParameters): string {
  let plotTemplate = fs.readFileSync(template, 'utf-8');

  for (const [k, v] of Object.entries(config)) {
    if (config.hasOwnProperty(k)) {
      plotTemplate = plotTemplate.replace("${" + k + "}", v)
    }
  }

  return plotTemplate
}

function formatPlot(message: string, story: string): {prompt: string, story: string} {
  let chosenPrompt = /Prompt \d/.exec(story)?.[0] || "";

  let splitMessage = message.split("\n");

  let correctPrompt = splitMessage.find(e => e.includes(chosenPrompt)) || "";

  let storyFormatRegex = new RegExp("^[\\S\\s]*Output:$", "imy");

  let newStory = story.replace(storyFormatRegex, "");

  return {prompt: correctPrompt.replace(/P?p?rompt ?\d? ?\([\w, ]*\):? ?/, ""), story: newStory.trim()}
}

async function createCompletion(messages: string[], temperature: number=1): Promise<string> {
  const formattedMessages = messages.map(el => ({ role: ChatCompletionRequestMessageRoleEnum.User, content: el }));

  const completion = await openai.createChatCompletion({
    model: GPT_MODEL,
    messages: formattedMessages,
    temperature
  });

  const message = completion.data.choices[0].message

  return message ? message.content.trim() : "no response";
}

async function generatePlot(config: PlotParameters): Promise<string> {
  const plotTemplate: string = generateTemplate(PLOT_TEMPLATE_FILE, config);

  const completion: string = await createCompletion([plotTemplate], 1.2);

  return completion
}

async function generateStory(config: StoryParameters): Promise<string> {
  const plotTemplate: string = generateTemplate(STORY_TEMPLATE_FILE, config);

  const completion = await createCompletion([plotTemplate], 1);

  return completion
}



export { generatePlot, generateStory, formatPlot };
