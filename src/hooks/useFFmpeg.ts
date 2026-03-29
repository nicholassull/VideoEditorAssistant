import { useState, useRef } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

// FFmpeg.wasm ships its core logic as separate files that must be loaded at
// runtime. We point to the CDN-hosted versions here so we don't have to bundle
// them ourselves — they're large (~30MB) and would bloat the app.
const FFMPEG_BASE_URL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'

export type FFmpegStatus = 'idle' | 'loading' | 'ready' | 'processing' | 'error'
export type FFmpegQuality = 'fast' | 'accurate'

export function useFFmpeg() {
    // useRef holds the FFmpeg instance across renders without causing re-renders
    // itself. We only ever want one instance alive at a time.
    const ffmpegRef = useRef<FFmpeg | null>(null)

    const [status, setStatus] = useState<FFmpegStatus>('idle')
    const [progress, setProgress] = useState(0)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    // load() fetches the FFmpeg core WASM binary and initialises the instance.
    // This only needs to be called once — subsequent calls are no-ops if the
    // instance is already ready.
    async function load() {
        if (ffmpegRef.current) return

        setStatus('loading')
        setErrorMessage(null)

        try {
            const ffmpeg = new FFmpeg()

            // The progress callback fires during any encode/decode operation.
            // `ratio` is a 0–1 value we convert to a percentage for the UI.
            ffmpeg.on('progress', ({ progress: ratio }) => {
                setProgress(Math.round(ratio * 100))
            })

            // toBlobURL fetches each file and turns it into a local blob URL.
            // This is required because browsers block WASM loaded from a CDN
            // without the right CORP headers — blob URLs bypass that restriction.
            await ffmpeg.load({
                coreURL: await toBlobURL(`${FFMPEG_BASE_URL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${FFMPEG_BASE_URL}/ffmpeg-core.wasm`, 'application/wasm'),
            })

            ffmpegRef.current = ffmpeg
            setStatus('ready')
        } catch (err) {
            setStatus('error')
            setErrorMessage(err instanceof Error ? err.message : 'Failed to load FFmpeg')
        }
    }

    // trimVideo() modifies a video file to only include what's between the start/end times. It returns
    // a URL pointing to the new video file.
    async function trimVideo(file: File, startSec: number, endSec: number, quality: FFmpegQuality = 'fast'): Promise<string> {
        const ffmpeg = ffmpegRef.current
        if (!ffmpeg) throw new Error('FFmpeg is not loaded')

        setStatus('processing')
        setProgress(0)

        await ffmpeg.writeFile('input.mp4', await fetchFile(file))

        if (quality === 'accurate') {
            // Re-encode with libx264 — frame-accurate cuts but slower.
            await ffmpeg.exec(['-ss', String(startSec), '-to', String(endSec), '-i', 'input.mp4', '-c:v', 'libx264', '-c:a', 'aac', 'output.mp4'])
        } else {
            // -c copy skips re-encoding (fast), -avoid_negative_ts make_zero fixes
            // the timestamp gap that causes choppiness at the start of the clip.
            await ffmpeg.exec(['-ss', String(startSec), '-to', String(endSec), '-i', 'input.mp4', '-c', 'copy', '-avoid_negative_ts', 'make_zero', 'output.mp4'])
        }

        // Read the output file back out of the virtual filesystem as a Uint8Array,
        // then wrap it in a Blob so the browser can create a usable URL from it.
        const data = await ffmpeg.readFile('output.mp4')
        const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: 'video/mp4' })

        setStatus('ready')
        return URL.createObjectURL(blob)
    }

    // removeSection() cuts out the segment between startSec and endSec, then
    // joins the two remaining pieces and returns a URL for the result.
    async function removeSection(file: File, startSec: number, endSec: number, quality: FFmpegQuality = 'fast'): Promise<string> {
        const ffmpeg = ffmpegRef.current
        if (!ffmpeg) throw new Error('FFmpeg is not loaded')

        setStatus('processing')
        setProgress(0)

        await ffmpeg.writeFile('input.mp4', await fetchFile(file))

        const codecArgs = quality === 'accurate'
            ? ['-c:v', 'libx264', '-c:a', 'aac']
            : ['-c', 'copy', '-avoid_negative_ts', 'make_zero']

        // Step 1: extract everything before the cut
        await ffmpeg.exec(['-ss', '0', '-to', String(startSec), '-i', 'input.mp4', ...codecArgs, 'part1.mp4'])

        // Step 2: extract everything after the cut (-ss with no -to runs to the end)
        await ffmpeg.exec(['-ss', String(endSec), '-i', 'input.mp4', ...codecArgs, 'part2.mp4'])

        // Step 3: write a concat list into the virtual FS.
        // The concat demuxer reads a plain text file listing the clips in order.
        // TextEncoder turns the string into the Uint8Array that writeFile expects.
        const concatList = 'file part1.mp4\nfile part2.mp4\n'
        await ffmpeg.writeFile('concat.txt', new TextEncoder().encode(concatList))

        // Step 4: join the two parts.
        // -f concat   tells FFmpeg to use the concat demuxer (reads the list file)
        // -safe 0     allows relative paths inside the list file
        // -c copy     no re-encoding, so this is fast
        await ffmpeg.exec([
            '-f',
            'concat',
            '-safe',
            '0',
            '-i',
            'concat.txt',
            '-c',
            'copy',
            'output.mp4',
        ])

        const data = await ffmpeg.readFile('output.mp4')
        const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: 'video/mp4' })

        setStatus('ready')
        return URL.createObjectURL(blob)
    }

    return { load, trimVideo, removeSection, status, progress, errorMessage }
}
