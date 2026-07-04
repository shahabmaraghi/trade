import { openai } from "@ai-sdk/openai"
import { experimental_generateSpeech as generateSpeech } from "ai"

export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    if (!text) {
      return new Response("Text is required", { status: 400 })
    }

    const { audio } = await generateSpeech({
      model: openai.speech("gpt-4o-mini-tts"),
      text: text,
      voice: "nova",
      instructions: "Speak in a cheerful and positive tone. Speak in Tehrani Persian accent. Speak briefly.",
      outputFormat: "opus"
    })

    const audioBuffer = Buffer.from(audio.uint8Array)

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/opus",
        "Content-Length": audioBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Speech generation error:", error)
    return new Response("Error generating speech", { status: 500 })
  }
}