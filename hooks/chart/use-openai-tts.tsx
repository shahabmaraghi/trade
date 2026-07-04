import { useState, useRef, useCallback } from "react";

export const useOpenAITTS = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    
    // A ref to track intentional stops
    const isStoppingRef = useRef(false);

    const stopSpeech = useCallback(() => {
        // Set the flag before manipulating the audio element
        isStoppingRef.current = true;
        
        abortControllerRef.current?.abort();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            // Setting src to "" can trigger the error event, which is now handled.
            audioRef.current.src = ""; 
        }
        setIsPlaying(false);
        setIsLoading(false);
        setPlayingMessageId(null);
    }, []);

    const generateAndPlaySpeech = useCallback(async (text: string, messageId: string) => {
        if (isPlaying) {
            stopSpeech();
        }

        // Reset the flag at the beginning of a new playback
        isStoppingRef.current = false;

        setIsLoading(true);
        setIsPlaying(false);
        setPlayingMessageId(messageId);
        abortControllerRef.current = new AbortController();

        return new Promise<void>(async (resolve, reject) => {
            try {
                const response = await fetch("/api/chart/speech", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text }),
                    signal: abortControllerRef.current?.signal,
                });

                if (!response.ok) {
                    throw new Error("Failed to generate speech");
                }

                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);

                if (!audioRef.current) {
                    audioRef.current = new Audio();
                }
                
                const audio = audioRef.current;
                audio.src = audioUrl;
                
                const cleanupListeners = () => {
                    audio.removeEventListener("ended", onEnded);
                    audio.removeEventListener("error", onError);
                };
                
                const onEnded = () => {
                    setIsPlaying(false);
                    setPlayingMessageId(null);
                    URL.revokeObjectURL(audioUrl);
                    cleanupListeners();
                    resolve();
                };

                const onError = (e: Event) => {
                    URL.revokeObjectURL(audioUrl);
                    cleanupListeners();
                    
                    // Check if the stop was intentional
                    if (isStoppingRef.current) {
                        console.log("Audio stop was intentional. Resolving.");
                        // Resolve the promise because this is not a real error.
                        // The state has already been cleared by stopSpeech().
                        resolve();
                        return;
                    }

                    console.error("Audio playback error:", e);
                    setIsPlaying(false);
                    setPlayingMessageId(null);
                    reject(new Error("Audio playback failed."));
                };

                audio.addEventListener("ended", onEnded);
                audio.addEventListener("error", onError);
                
                await audio.play();
                setIsLoading(false);
                setIsPlaying(true);
            } catch (error: any) {
                if (error.name === 'AbortError') {
                    console.log('Speech generation aborted.');
                } else {
                    console.error("TTS Error:", error);
                }
                setIsLoading(false);
                setIsPlaying(false);
                setPlayingMessageId(null);
                // If the fetch was aborted by stopSpeech, we should resolve.
                if (error.name === 'AbortError' && isStoppingRef.current) {
                    resolve();
                } else {
                    reject(error);
                }
            }
        });
    }, [isPlaying, stopSpeech]);

    return { generateAndPlaySpeech, stopSpeech, isLoading, isPlaying, playingMessageId };
};