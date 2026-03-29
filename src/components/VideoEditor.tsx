import { useState } from 'react'
import { useFFmpeg, type FFmpegQuality } from '@/hooks/useFFmpeg'
import FilePicker from '@/components/FilePicker'

type Mode = 'trim' | 'remove'

export default function VideoEditor() {
    const { load, trimVideo, removeSection, status, progress, errorMessage } = useFFmpeg()

    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [previewURL, setPreviewURL] = useState<string | null>(null)
    const [outputURL, setOutputURL] = useState<string | null>(null)
    const [startSec, setStartSec] = useState(0)
    const [endSec, setEndSec] = useState(10)
    const [mode, setMode] = useState<Mode>('remove')
    const [quality, setQuality] = useState<FFmpegQuality>('fast')

    async function handleProcess() {
        if (!videoFile) return
        if (status === 'idle') await load()
        const url =
            mode === 'remove'
                ? await removeSection(videoFile, startSec, endSec, quality)
                : await trimVideo(videoFile, startSec, endSec, quality)
        setOutputURL(url)
    }

    const isWorking = status === 'loading' || status === 'processing'

    return (
        <div className="flex flex-col gap-6 p-8 text-left">
            <h1 className="text-2xl font-semibold text-text-heading">Video Editor</h1>

            <FilePicker
                file={videoFile}
                onChange={(file) => {
                    setVideoFile(file)
                    setOutputURL(null)
                    setPreviewURL(URL.createObjectURL(file))
                }}
            />

            {previewURL && (
                <video src={previewURL} controls className="w-full rounded-md border border-border" />
            )}

            {videoFile && (
                <div className="flex flex-col gap-4">
                    {/* Mode toggle */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setMode('remove')}
                            className={`btn ${mode === 'remove' ? 'btn-primary' : 'btn-outline'}`}
                        >
                            Delete section
                        </button>
                        <button
                            onClick={() => setMode('trim')}
                            className={`btn ${mode === 'trim' ? 'btn-primary' : 'btn-outline'}`}
                        >
                            Trim video
                        </button>
                    </div>

                    <p className="text-sm text-text">
                        {mode === 'remove'
                            ? 'The section between these times will be cut out. The remaining parts will be joined.'
                            : 'Only the section between these times will be kept.'}
                    </p>

                    {/* Quality toggle */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setQuality('fast')}
                            className={`btn ${quality === 'fast' ? 'btn-primary' : 'btn-outline'}`}
                        >
                            Fast
                        </button>
                        <button
                            onClick={() => setQuality('accurate')}
                            className={`btn ${quality === 'accurate' ? 'btn-primary' : 'btn-outline'}`}
                        >
                            Accurate (slow)
                        </button>
                    </div>

                    <div className="flex gap-4">
                        <label className="flex flex-col gap-1 text-sm text-text">
                            Start (seconds)
                            <input
                                type="number"
                                min={0}
                                value={startSec}
                                onChange={(e) => setStartSec(Number(e.target.value))}
                                className="w-24 px-2 py-1 rounded border border-border bg-background text-text-heading"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm text-text">
                            End (seconds)
                            <input
                                type="number"
                                min={0}
                                value={endSec}
                                onChange={(e) => setEndSec(Number(e.target.value))}
                                className="w-24 px-2 py-1 rounded border border-border bg-background text-text-heading"
                            />
                        </label>
                    </div>

                    <button
                        onClick={handleProcess}
                        disabled={isWorking}
                        className="btn btn-primary px-4 py-2 w-fit"
                    >
                        {status === 'loading' && 'Loading FFmpeg…'}
                        {status === 'processing' && `Processing… ${progress}%`}
                        {!isWorking && (mode === 'remove' ? 'Delete section' : 'Trim video')}
                    </button>

                    {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
                </div>
            )}

            {outputURL && (
                <div className="flex flex-col gap-2">
                    <p className="text-sm text-text">Done! Preview or download below.</p>
                    <video
                        src={outputURL}
                        controls
                        className="w-full rounded-md border border-border"
                    />
                    <a
                        href={outputURL}
                        download="edited.mp4"
                        className="btn btn-outline px-4 py-2 w-fit border-accent text-accent hover:bg-accent hover:text-white"
                    >
                        Download edited video
                    </a>
                </div>
            )}
        </div>
    )
}
