# Video Editor Assistant

A browser-based video editor built with React and FFmpeg.wasm. All processing runs client-side via WebAssembly — no server required.

## Features

- Upload and preview MP4 video files
- **Trim**: Keep only the section between two timestamps
- **Delete Section**: Remove a segment and join the remaining parts
- Two processing modes:
  - **Fast**: No re-encoding, cuts at keyframe boundaries
  - **Accurate**: Full re-encode with libx264/AAC for frame-accurate cuts
- Download the edited video as an MP4

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- FFmpeg.wasm (runs entirely in the browser)

## Running Locally

**Prerequisites:** Node.js installed ([nodejs.org](https://nodejs.org) or `brew install node` on Mac)

**1. Set up environment variables**

Copy the example env file and add your API key:

```bash
cp .env.example .env
```

Then open `.env` and replace the placeholder with your Deepgram API key (ask Nick for the API key).

**2. Install dependencies and start the dev server**

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

> **Note:** FFmpeg core binaries (~30MB) are loaded from CDN on first use. The app requires a browser that supports SharedArrayBuffer (Chrome, Edge, or Firefox with cross-origin isolation).

## Sample Videos

`src/assets/sample-videos/` contains sample videos for testing functionality. Do not overwrite or delete these files.
