"""
Local emotion detection server for Secret Punch Cards.

Setup (run once):
  pip install flask flask-cors transformers torch torchaudio pydub numpy
  brew install ffmpeg          # Mac — needed for WebM audio decoding

Run:
  python emotion_server.py

First run downloads the model (~95 MB) and caches it.
"""

import os, sys, tempfile
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173'])

print('Loading emotion model (first run downloads ~95 MB)…', flush=True)
try:
    pipe = pipeline(
        'audio-classification',
        model='superb/wav2vec2-base-superb-er',
    )
    print('Model ready ✓', flush=True)
    # Print the actual label set so you can see what the model outputs
    labels = [pipe.model.config.id2label[i] for i in range(len(pipe.model.config.id2label))]
    print('Labels:', labels, flush=True)
except Exception as e:
    print(f'Failed to load model: {e}', file=sys.stderr)
    sys.exit(1)

# Covers both abbreviated (ang) and full (anger) label strings
LABEL_MAP = {
    'ang':        'angry',
    'anger':      'angry',
    'hap':        'joy',
    'happiness':  'joy',
    'happy':      'joy',
    'exc':        'alive',
    'excited':    'alive',
    'sad':        'sad',
    'sadness':    'sad',
    'fru':        'anxious',
    'frustrated': 'anxious',
    'fea':        'fear',
    'fearful':    'fear',
    'fear':       'fear',
    'dis':        'numb',
    'disgust':    'numb',
    'neu':        None,
    'neutral':    None,
    'sur':        None,
    'surprised':  None,
}


@app.route('/health')
def health():
    return jsonify({'status': 'ok'})


@app.route('/detect', methods=['POST'])
def detect():
    if 'audio' not in request.files:
        return jsonify({'error': 'missing audio field'}), 400

    audio_file = request.files['audio']

    with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as tmp:
        audio_file.save(tmp.name)
        tmp_path = tmp.name

    try:
        from pydub import AudioSegment

        audio = AudioSegment.from_file(tmp_path)
        audio = audio.set_frame_rate(16000).set_channels(1)

        # Convert to float32 numpy array normalised to [-1, 1]
        raw = np.array(audio.get_array_of_samples(), dtype=np.float32)
        max_val = float(2 ** (8 * audio.sample_width - 1))
        samples = raw / max_val

        results = pipe({'array': samples, 'sampling_rate': 16000})
        top = results[0]

        raw_label = top['label'].lower()
        emotion = LABEL_MAP.get(raw_label)
        score = round(float(top['score']), 3)

        print(f'  → {raw_label} ({score:.0%}) → {emotion}', flush=True)
        return jsonify({'emotion': emotion, 'label': raw_label, 'score': score})

    except Exception as e:
        print(f'Error: {e}', file=sys.stderr)
        return jsonify({'error': str(e)}), 500

    finally:
        os.unlink(tmp_path)


if __name__ == '__main__':
    app.run(port=5000, debug=False)
