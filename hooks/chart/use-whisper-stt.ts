import { useState, useRef, useCallback } from "react"

export const useWhisperSTT = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    setError(null)
    setTranscript("")
    if (mediaRecorderRef.current) {
        console.warn("Recording is already in progress.")
        return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      recorder.onstart = () => {
        setIsRecording(true)
      }

      recorder.start()
    } catch (err: any) {
      console.error("Error starting recording:", err)
      setError("Microphone access was denied or an error occurred.")
      setIsRecording(false)
    }
  }, [])

  const stopRecordingAndTranscribe = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
        console.warn("No active recording to stop.")
        return resolve("")
      }
      
      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false)
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        audioChunksRef.current = []
        
        // Stop all media tracks to turn off the microphone indicator
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop())
        mediaRecorderRef.current = null

        if (audioBlob.size < 100) { // Very small file, likely no speech
            return resolve("")
        }

        const formData = new FormData()
        formData.append("audio", audioBlob, "recording.webm")

        try {
          const response = await fetch("/api/chart/speech-to-text", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            const errText = await response.text()
            throw new Error(`Server error: ${errText}`)
          }

          const result = await response.json()
          if (result.success && result.text) {
            setTranscript(result.text)
            resolve(result.text)
          } else {
            throw new Error(result.error || "Transcription failed.")
          }
        } catch (err: any) {
          console.error("Error during transcription:", err)
          setError(err.message || "Failed to transcribe audio.")
          reject(err)
        }
      }
      
      mediaRecorderRef.current.stop()
    })
  }, [])

  return {
    isRecording,
    transcript,
    error,
    startRecording,
    stopRecordingAndTranscribe,
  }
}