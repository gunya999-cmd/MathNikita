from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import tempfile
import wave
from pathlib import Path

from piper import PiperVoice, SynthesisConfig


def normalize_for_speech(text: str) -> str:
    text = text.replace("`", "")
    text = text.replace("№", "номер ")
    text = text.replace("…", ".")
    text = text.replace("→", ", затем ")
    text = text.replace("≤", " меньше либо равно ")
    text = text.replace("≥", " больше либо равно ")
    text = text.replace("<", " меньше ")
    text = text.replace(">", " больше ")
    text = text.replace("=", " равно ")
    text = text.replace("+", " плюс ")
    text = text.replace("−", " минус ")
    text = re.sub(r"\bN\b", "эн", text)
    text = re.sub(r"\bn\b", "эн", text)
    text = re.sub(r"\bk\b", "ка", text)
    text = re.sub(r"\bx\b", "икс", text)

    # Join thousands groups so the speech engine reads them as one number.
    previous = None
    while previous != text:
        previous = text
        text = re.sub(r"(?<=\d)[\s\u00a0](?=\d{3}(?:\D|$))", "", text)

    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s+([,.!?;:])", r"\1", text)
    text = re.sub(r"([,.!?;:])(?=\S)", r"\1 ", text)
    return text.strip()


def encode_mp3(wav_path: Path, mp3_path: Path) -> None:
    command = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        str(wav_path),
        "-af",
        "loudnorm=I=-18:LRA=7:TP=-1.5,afade=t=in:st=0:d=0.025,afade=t=out:st=0:d=0.04",
        "-ac",
        "1",
        "-ar",
        "24000",
        "-b:a",
        "64k",
        str(mp3_path),
    ]
    subprocess.run(command, check=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate static lesson narration with Piper.")
    parser.add_argument("--items", required=True, type=Path)
    parser.add_argument("--model", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--voice-name", default="Ирина")
    args = parser.parse_args()

    if not shutil.which("ffmpeg"):
        raise RuntimeError("ffmpeg is required")

    items = json.loads(args.items.read_text(encoding="utf-8"))
    output_dir = args.output
    clips_dir = output_dir / "irina"
    clips_dir.mkdir(parents=True, exist_ok=True)

    voice = PiperVoice.load(str(args.model))
    synthesis = SynthesisConfig(
        length_scale=1.08,
        noise_scale=0.62,
        noise_w_scale=0.78,
        normalize_audio=True,
    )

    manifest: dict[str, object] = {
        "engine": "piper",
        "voice": args.voice_name,
        "license": "MIT voice model; static generated audio",
        "clips": {},
    }

    with tempfile.TemporaryDirectory(prefix="mathnikita-voice-") as temp_dir:
        temp_root = Path(temp_dir)
        for index, item in enumerate(items, start=1):
            clip_id = item["id"]
            spoken_text = normalize_for_speech(item["text"])
            wav_path = temp_root / f"{clip_id}.wav"
            mp3_path = clips_dir / f"{clip_id}.mp3"

            with wave.open(str(wav_path), "wb") as wav_file:
                voice.synthesize_wav(spoken_text, wav_file, syn_config=synthesis)

            encode_mp3(wav_path, mp3_path)
            manifest["clips"][clip_id] = f"/audio/neural/irina/{clip_id}.mp3"
            print(f"[{index}/{len(items)}] {clip_id}")

    (output_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
