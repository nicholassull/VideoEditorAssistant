import { useState } from 'react';
import { useSpeechToText } from '@/hooks/useSpeechToText';

interface Props {
    file: File;
}

export const TranscriptionControls = ({ file }: Props) => {
    const [transcribedText, setTranscribedText] = useState<string>('');
    const { transcribeFile, isLoading } = useSpeechToText();

    const handleTranscribe = async () => {
        const response = await transcribeFile(file);
        const transcript = response.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? '';
        setTranscribedText(transcript);
    };

    return (
        <div className="flex flex-row gap-2 w-full items-center">
            <div className="flex gap-1 w-[140px]">
                <button onClick={handleTranscribe} className={`btn h-12 btn-primary`}>
                    Transcribe
                </button>
            </div>

            <div className="w-full ">
                <textarea
                    value={transcribedText}
                    readOnly
                    placeholder="Transcription result will be shown here."
                    className="w-full h-[200px]"
                />
            </div>
        </div>
    );
};
