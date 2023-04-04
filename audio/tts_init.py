import os
from TTS.api import TTS

# Define input and output file paths
output_file_path = "/app/data/test.mp3"

#tts --text "Text for TTS" --model_name "tts_models/en/vctk/vits" --speaker_idx "p287" --out_path /app/data/output.wav

# Define model and speaker types
speaker = "p287"
tts_model = "tts_models/en/vctk/vits"

tts = TTS(tts_model)

# Generate the output WAV file
tts.tts_to_file(text="hello", speaker=speaker, file_path=output_file_path)

print(f"WAV file has been saved at {output_file_path}")
