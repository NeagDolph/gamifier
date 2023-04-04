from moviepy.editor import *
from math import floor
import argparse
import sys
from random import random

# Add this code to parse command-line arguments
parser = argparse.ArgumentParser(description='Process video with images and audio')
parser.add_argument('game_clip')
parser.add_argument('image1_path')
parser.add_argument('image2_path')
parser.add_argument('audio1_path')
parser.add_argument('audio2_path')
parser.add_argument('output_file')
parser.add_argument('audio1_duration')
parser.add_argument('audio2_duration')

args = parser.parse_args()

# Replace the hardcoded values with the arguments passed from Node.js
promptDuration = float(args.audio1_duration)
outputDuration = float(args.audio2_duration)
game_clip = args.game_clip
image1_path = args.image1_path
image2_path = args.image2_path
audio1_path = args.audio1_path
audio2_path = args.audio2_path
output_file = args.output_file

# Image scales, positions and durations

fullLength = (1 + promptDuration + outputDuration)


video = VideoFileClip(game_clip)
image1 = ImageClip(image1_path)
image2 = ImageClip(image2_path)

# Load video, images and audio files
input_duration = VideoFileClip(game_clip).duration
input_width, input_height = VideoFileClip(game_clip).size

clip_duration = promptDuration + outputDuration + 8

if input_duration <= clip_duration:
    raise ValueError('Input video duration should be longer than the clip duration.')

aspect_ratio = 9 / 16
new_height = input_height
new_width = round(input_height * aspect_ratio)


if new_width > input_width:
    new_width = new_width
    new_width = round(new_width / aspect_ratio)

# Image sizing and timing
image1_scale = (new_width / float(image1.size[0])) * 0.9
image1_y_offset = 100
image1_start_time = 0
image1_duration = fullLength

image2_scale = (new_width / float(image2.size[0])) * 0.96
image2_y_offset = 260
image2_start_time = promptDuration + 1
image2_duration = outputDuration

# Audio start times
audio1_start_time = image1_start_time
audio2_start_time = image2_start_time

random_start = floor(random() * (input_duration - clip_duration))

video = (VideoFileClip(game_clip)
             .subclip(random_start, random_start + clip_duration)
             .crop(x_center=input_width / 2, y_center=input_height / 2, width=new_width, height=new_height)
             .without_audio())
image1 = ImageClip(image1_path, duration=image1_duration).resize(image1_scale).set_position(('center', image1_y_offset)).set_start(image1_start_time)
image2 = ImageClip(image2_path, duration=image2_duration).resize(image2_scale).set_position(('center', image2_y_offset)).set_start(image2_start_time)
audio1 = AudioFileClip(audio1_path).set_start(audio1_start_time)
audio2 = AudioFileClip(audio2_path).set_start(audio2_start_time)


# Overlay images onto the video
composite_video = CompositeVideoClip([video, image1, image2])

# Add audio clips to the video
mixed_audio = CompositeAudioClip([audio1, audio2])

# Set the mixed audio to the composite video
composite_video = composite_video.set_audio(mixed_audio).set_duration(fullLength + 2)

# Write the output video file
composite_video.write_videofile(output_file, codec='libx264', verbose=True, ffmpeg_params=['-c:v', 'h264_videotoolbox', '-b:v', '6000k'])

