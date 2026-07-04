export async function POST(req: Request) {
    try {
      const formData = await req.formData()
      const audioFile = formData.get("audio") as File
  
      if (!audioFile) {
        return new Response("Audio file is required", { status: 400 })
      }
  
      // Convert the audio file to the format expected by OpenAI
      const audioBuffer = await audioFile.arrayBuffer()
      const audioBlob = new Blob([audioBuffer], { type: audioFile.type })
  
      // Create a File object for OpenAI API
      const file = new File([audioBlob], "audio.webm", { type: audioFile.type })
  
      // Use OpenAI's Whisper API for speech-to-text
      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: (() => {
          const formData = new FormData()
          formData.append("file", file)
          formData.append("model", "whisper-1")
          formData.append("language", "fa") // Persian language
          return formData
        })(),
      })
  
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }
  
      const result = await response.json()
  
      return new Response(
        JSON.stringify({
          text: result.text,
          success: true,
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      )
    } catch (error) {
      console.error("Speech-to-text error:", error)
      return new Response(
        JSON.stringify({
          error: "Error processing audio",
          success: false,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }
  }
  