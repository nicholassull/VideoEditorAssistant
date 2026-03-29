import React from 'react'

interface FilePickerProps {
    file: File | null
    onChange: (file: File) => void
    accept?: string
    hint?: string
}

export default function FilePicker({
    file,
    onChange,
    accept = 'video/*',
    hint = 'MP4, MOV, WebM and more',
}: FilePickerProps) {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selected = e.target.files?.[0]
        if (selected) onChange(selected)
    }

    if (file) {
        return (
            <label className="group flex items-center justify-between gap-4 px-4 py-2 rounded-md border border-border hover:border-accent-border bg-surface transition-colors cursor-pointer">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">🎬</span>
                    <span className="text-sm text-text-heading truncate">{file.name}</span>
                </div>
                <span className="shrink-0 text-xs text-text group-hover:text-text-heading transition-colors duration-150">
                    Change file
                </span>
                <input type="file" accept={accept} onChange={handleChange} className="sr-only" />
            </label>
        )
    }

    return (
        <label className="flex flex-col items-center justify-center gap-2 p-8 rounded-md border-2 border-dashed border-border hover:border-accent hover:bg-accent-bg transition-colors cursor-pointer">
            <span className="text-2xl">🎬</span>
            <span className="text-sm font-medium text-text-heading">
                Click to select a video file
            </span>
            <span className="text-xs text-text">{hint}</span>
            <input type="file" accept={accept} onChange={handleChange} className="sr-only" />
        </label>
    )
}
