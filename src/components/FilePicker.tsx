interface FilePickerProps {
    file: File | null
    onChange: (file: File) => void
    accept?: string
    hint?: string
}

export default function FilePicker({ file, onChange, accept = 'video/*', hint = 'MP4, MOV, WebM and more' }: FilePickerProps) {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selected = e.target.files?.[0]
        if (selected) onChange(selected)
    }

    return (
        <label className="flex flex-col items-center justify-center gap-2 p-8 rounded-md border-2 border-dashed border-border hover:border-accent hover:bg-accent-bg transition-colors cursor-pointer">
            <span className="text-2xl">🎬</span>
            <span className="text-sm font-medium text-text-heading">
                {file ? file.name : 'Click to select a video file'}
            </span>
            <span className="text-xs text-text">{hint}</span>
            <input
                type="file"
                accept={accept}
                onChange={handleChange}
                className="sr-only"
            />
        </label>
    )
}
