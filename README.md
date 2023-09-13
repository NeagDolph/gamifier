# Gamifier: Vertical Video Generator 🎮🎥

Powered by ChatGPT, Gamifier is your go-to tool for generating captivating vertical videos that feature interactive conversations with ChatGPT.

## 📋 Table of Contents
- [Overview](#overview)
- [Video Creation Workflow](#video-creation-workflow)
- [Example Outputs](#example-outputs)

## 🌐 Overview

Gamifier leverages the power of the ChatGPT API to create engaging vertical videos. These videos simulate a conversation with ChatGPT and are perfect for showcasing artificial intelligence in an interactive and visually appealing manner.

## 🛠️ Video Creation Workflow

The video creation process follows these steps:

1. **Prompt Generation**: Utilizes CoT prompting to generate an intriguing conversation starter with ChatGPT.
2. **ChatGPT Response**: Acquires a response to the generated prompt using ChatGPT.
3. **Simulated Screenshots**: Crafts simulated screenshots of the conversation using the Node.js HTML Canvas library.
4. **Voice-Over**: Generates voice-over clips using a self-hosted [Coqui-AI model](https://github.com/coqui-ai/TTS) running in a Docker instance.
5. **Background Video**: Selects and trims a random video-game clip to match the length of the voice-over clips using the FFMPEG library.
6. **Final Compilation**: Merges the audio, simulated screenshots, and background clip into a seamless video using a Python FFMPEG script.

## 🎬 Example Outputs

Check out these example videos to get a sense of what Gamifier can do:

- [**Example Video 1**](https://youtube.com/shorts/XlI-ygVeDjo?feature=share)
- [**Example Video 2**](https://youtube.com/shorts/KbbRnB4mJhU?feature=share)
- [**Example Video 3**](https://youtube.com/shorts/tWfsAyXDiWc?feature=share)
- [**Example Video 4**](https://youtube.com/shorts/H9l4a7QOh8E?feature=share)
- [**Example Video 5**](https://youtube.com/shorts/zcKsvzPUUA4?feature=share)
