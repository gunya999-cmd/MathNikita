#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / ".cache" / "piper"
MODEL = MODEL_DIR / "ru_RU-irina-medium.onnx"
CONFIG = MODEL_DIR / "ru_RU-irina-medium.onnx.json"
OUTPUT_DIR = ROOT / "public" / "audio" / "neural" / "irina"
MANIFEST_PATH = ROOT / "public" / "audio" / "neural" / "manifest.json"
NARRATION_PATH = ROOT / "src" / "data" / "lessonFourNarration.json"
MENTOR_PATH = ROOT / "src" / "data" / "lessonFourMentorScripts.json"


def synthesize(key: str, text: str) -> str:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    target = OUTPUT_DIR / f"{key}.mp3"
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "speech.wav"
        subprocess.run(
            [
                sys.executable,
                "-m",
                "piper",
                "--model",
                str(MODEL),
                "--config",
                str(CONFIG),
                "--output-file",
                str(wav),
                "--length-scale",
                "1.04",
                "--sentence-silence",
                "0.18",
            ],
            input=text,
            text=True,
            check=True,
        )
        subprocess.run(
            [
                "ffmpeg",
                "-hide_banner",
                "-loglevel",
                "error",
                "-y",
                "-i",
                str(wav),
                "-codec:a",
                "libmp3lame",
                "-b:a",
                "48k",
                "-ar",
                "22050",
                str(target),
            ],
            check=True,
        )
    return f"/audio/neural/irina/{target.name}"


def main() -> None:
    if not MODEL.exists() or not CONFIG.exists():
        raise SystemExit("Piper model files are missing in .cache/piper")

    narration = json.loads(NARRATION_PATH.read_text(encoding="utf-8"))
    mentor = json.loads(MENTOR_PATH.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    clips = manifest.setdefault("clips", {})

    jobs: list[tuple[str, str]] = list(narration.items())
    for script_key, responses in mentor.items():
        for response, text in responses.items():
            jobs.append((f"mentor-{script_key}-{response}", text))

    for index, (key, text) in enumerate(jobs, start=1):
        print(f"[{index}/{len(jobs)}] {key}", flush=True)
        clips[key] = synthesize(key, text)

    manifest["engine"] = "piper"
    manifest["voice"] = "Ирина"
    manifest["license"] = "MIT voice model; static generated audio"
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Generated {len(jobs)} clips")


if __name__ == "__main__":
    main()
