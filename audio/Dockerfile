# Dockerfile
FROM ghcr.io/coqui-ai/tts-cpu

WORKDIR /app

RUN ["python"]

# Override the ENTRYPOINT
ENTRYPOINT []

# Copy the TTS script
COPY tts_script.py .
COPY tts_init.py .

RUN ["mkdir", "data"]

RUN ["python", "tts_init.py"]

CMD ["python", "tts_script.py"]
