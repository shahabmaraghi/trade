import ChartState from "@/models/ChartState"
import AiSetting from "@/models/AiSetting"
import { createOpenAI, openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { getCurrentUser } from "@/lib/auth"
import { User, Mentor } from "@/models"
import { generalMentorUsername } from "@/models/Mentor"
import { connectDBOr503 } from "@/lib/db"

interface IMessage {
  role: "assistant" | "user"
  content: string | TextContent[]
}

type TextContent = {
  type: "text"
  text: string
}

interface IChartState {
  _id: string
  name: string
  symbol: string
  interval: string
  updatedAt?: Date
}

type AiProvider = "chatgpt" | "gapgpt"
function getSelectedAiModel(activeProvider: AiProvider) {
  if (activeProvider === "gapgpt") {
    if (!process.env.GAPGPT_API_KEY) {
      throw new Error("GAPGPT_API_KEY is not defined")
    }

    if (!process.env.GAPGPT_BASE_URL) {
      throw new Error("GAPGPT_BASE_URL is not defined")
    }

    const gapgpt = createOpenAI({
      apiKey: process.env.GAPGPT_API_KEY,
      baseURL: process.env.GAPGPT_BASE_URL,
    })

    return gapgpt(process.env.GAPGPT_MODEL || "gpt-4o-mini")
  }

  return openai(process.env.OPENAI_MODEL || "gpt-4.1-2025-04-14")
}

export async function POST(req: Request) {
  try {
    const dbError = await connectDBOr503()
    if (dbError) return dbError

    const { messages, chartMode, drawingOwner } = (await req.json()) as {
      messages: any[]
      chartMode: boolean
      drawingOwner?: "public" | "mentor"
    }

    const aiSetting = await AiSetting.findOneAndUpdate(
      { key: "global" },
      {
        $setOnInsert: {
          activeProvider: "chatgpt",
        },
      },
      {
        new: true,
        upsert: true,
      }
    )

    const activeProvider = aiSetting.activeProvider as AiProvider
    const selectedModel = getSelectedAiModel(activeProvider)


    const processedMessages: IMessage[] = messages.map((msg: any) => {
      if (msg?.data?.symbol && msg?.data?.interval) {
        return {
          role: msg.role,
          content: [
            { type: "text", text: msg.content },
            {
              type: "text",
              text: `(chart context) symbol: ${msg.data.symbol}, interval: ${msg.data.interval}`,
            },
          ],
        }
      }

      return {
        role: msg.role,
        content: msg.content,
      }
    })

    console.log(
      "Processed messages:",
      JSON.stringify(
        processedMessages.map((m: any) => ({
          role: m.role,
          contentTypes: Array.isArray(m.content)
            ? m.content.map((c: any) => c.type)
            : "text",
        }))
      )
    )

    console.log("Active AI Provider:", activeProvider)

    let mentorIdFilter: any = null

    try {
      if (drawingOwner === "mentor") {
        const sessionUser = await getCurrentUser()

        if (sessionUser?.id) {
          const dbUser = await User.findById(sessionUser.id).lean<{
            mentorReferrer?: string
          }>()

          const code = dbUser?.mentorReferrer?.trim()

          if (code) {
            const mentorDoc = await Mentor.findOne({
              $or: [{ referralCode: code }, { username: code }],
            }).lean<{ _id: any }>()

            if (mentorDoc?._id) {
              mentorIdFilter = mentorDoc._id
            }
          }
        }
      }

      if (!mentorIdFilter) {
        const generalMentor = await Mentor.findOne({
          username: generalMentorUsername,
        }).lean<{ _id: any }>()

        mentorIdFilter = generalMentor?._id || null
      }
    } catch (e) {
      mentorIdFilter = null
    }

    let userChartStates: IChartState[] = []

    if (mentorIdFilter) {
      userChartStates = await ChartState.find({ userId: mentorIdFilter })
        .select("_id name symbol interval")
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean<IChartState[]>()
    }

    const chartStatesInfo =
      userChartStates.length > 0
        ? `\n\nچارت‌های موجود:\n${userChartStates
            .map(
              (cs) =>
                `- ${cs.name} (${cs.symbol} - ${cs.interval}) [ID: ${cs._id}]`
            )
            .join("\n")}`
        : "chartStatesInfo is empty"

    let systemPrompt = ""

    if (chartMode) {
      systemPrompt = `
Always return in json format: {message: string, chartSaveLoadId: string | null}.
All texts should be in message, never in out of that.
If chartStatesInfo is empty, tell the user that currently i can't draw on chart.

شما یک دستیار هوشمند تحلیل تکنیکال هستید که به کاربران در تحلیل چارت‌های معاملاتی کمک می‌کنید.

قابلیت‌های شما:
- تحلیل تکنیکال چارت‌های قیمتی
- شناسایی الگوهای کندل استیک
- تشخیص سطوح حمایت و مقاومت
- ارائه توصیه‌های معاملاتی
- پاسخ به سوالات مربوط به تحلیل تکنیکال

اگر کاربر درخواست تغییر در چارت داشت مثل کشیدن خط روند، افزودن اندیکاتور و غیره، می‌توانید در پاسخ خود یک chartState جدید ارسال کنید.

همیشه به زبان فارسی پاسخ دهید و توضیحات واضح و کاربردی ارائه دهید.

${chartStatesInfo}

به هیچ عنوان اعلام نکن که اطلاعات بالا اطلاعات ذخیره شده یا قبلا کشیده شده هستند. تظاهر کن که اطلاعات بالا را خودت همین الان رسم کرده ای.

اگر کاربر درخواست بارگذاری یکی از چارت‌های ذخیره شده را داشت، chartStateId مربوطه را در پاسخ قرار دهید.

با توجه به درخواست کاربر نزدیک‌ترین رسمی که می‌توان کشید را انتخاب کن. اگر متوجه شدی که رسمی که کاربر میخواهد حتی نزدیک به اطلاعاتی که داریم نیست محترمانه اعلام کن.

اگر دچار ابهام بین چند رسم شدی، از کاربر بپرس که کدام یک را می‌خواهد و به او حق انتخاب بده.

هیچگاه از لفظ بارگذاری یا استفاده کردن، استفاده نکن و به جای آن از الفاظ کشیده شد و یا رسم شد استفاده کن.

اگر خواستی از کاربر سوال بپرسی، او را ترغیب کن به گزینه های موجود. مثلا اگر کاربر خط روند خواست، به او بگو که تحلیل درست تر این است که من خط روند صعودی اصلی یا نزولی اصلی را بکشم.

پاسخ را به فرمت JSON و روی ساختار زیر ارسال کن:
{
  "chartSaveLoadId": string | null,
  "message": string
}

هر متنی که میخواهی بنویسی باید داخل message باشد و نه خارج از آن. همیشه از فرمت JSON استفاده کن.
`
    } else {
      systemPrompt = `
Always return in json format: {message: string, chartSaveLoadId: null}.
All texts should be in message, never in out of that.

شما یک دستیار هوشمند تحلیل تکنیکال هستید که به کاربران در تحلیل چارت‌های معاملاتی کمک می‌کنید.

قابلیت‌های شما:
- تحلیل تکنیکال چارت‌های قیمتی
- شناسایی الگوهای کندل استیک
- تشخیص سطوح حمایت و مقاومت
- ارائه توصیه‌های معاملاتی
- پاسخ به سوالات مربوط به تحلیل تکنیکال
- شما اکنون در حالت چت عمومی هستید و قابلیت رسم روی چارت ندارید، تنها به سوالات حوزهٔ ترید و بازارهای مالی پاسخ دهید.

اگر کاربر درخواست رسم روی چارت کرد، مثل خط روند، مقاومت، کانال و غیره، از او بخواه حالتی به نام «چت با چارت» را روشن کرده و دوباره پیام ارسال کند.
`
    }

  const { text } = await generateText({
  model: selectedModel,
  messages: processedMessages as any,
  system: systemPrompt,
  temperature: 0.7,
  maxTokens: 1000,

  maxRetries: 0,
  timeout: 25000,
})

    return new Response(
      JSON.stringify({
        content: text,
        provider: activeProvider,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("خطا در API چت:", error)

    return new Response(
      JSON.stringify({
        error: errorHandler(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}

export function errorHandler(error: unknown) {
  if (error == null) {
    return "unknown error"
  }

  if (typeof error === "string") {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  return JSON.stringify(error)
}