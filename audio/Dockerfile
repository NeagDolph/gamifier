# Dockerfile
FROM ghcr.io/coqui-ai/tts-cpu

WORKDIR /app

# Override the ENTRYPOINT
ENTRYPOINT []

# Copy the TTS script
COPY tts_script.py .

CMD ["python", "tts_script.py"]
