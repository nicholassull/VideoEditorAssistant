import { useState } from 'react';

// Example response data.results:
//   "results": {
//     "channels": [
//       {
//         "alternatives": [
//           {
//             "transcript": "The Artemis two mission at its heart is a...",
//             "confidence": 0.998841,
//             "words": [
//               {
//                 "word": "the",
//                 "start": 2,
//                 "end": 2.24,
//                 "confidence": 0.99155605,
//                 "punctuated_word": "The"
//               },
//               {
//                 "word": "artemis",
//                 "start": 2.24,
//                 "end": 2.72,
//                 "confidence": 0.9962034,
//                 "punctuated_word": "Artemis"
//               },
//               ...
//         ],
//         "id": "aa33ecdf-bb10-416a-924f-4cbc1c55e049"
//       }
//     ]
//   }
// }

export const useSpeechToText = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const transcribeFile = async (file: File) => {
        setIsLoading(true);
        const response = await fetch(
            'https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&utterances=true',
            {
                method: 'POST',
                headers: {
                    Authorization: `Token ${import.meta.env.VITE_DEEPGRAM_API_KEY}`,
                    'Content-Type': file.type,
                },
                body: file,
            }
        );
        setIsLoading(false);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
        return data;
    };

    return { transcribeFile, isLoading };
};
