import os
from TTS.api import TTS

# Define input and output file paths
input_file_path = "/app/data/input.txt"
output_file_path = "/app/data/output.wav"

#tts --text "Text for TTS" --model_name "tts_models/en/vctk/vits" --speaker "p287" --out_path /app/data/output.wav

# Define model and speaker types
speaker = os.getenv('SPEAKER')
tts_model = os.getenv('MODEL')

# Read the input text
with open(input_file_path, "r") as f:
    text = f.read()

# Initialize the TTS model
model_name = TTS.list_models()
tts = TTS(tts_model)

# Generate the output WAV file
tts.tts_to_file(text=text, speaker=speaker, file_path=output_file_path)

print(f"WAV file has been saved at {output_file_path}")
