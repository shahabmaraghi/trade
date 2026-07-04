interface SendSimpleSmsResponse {
  status?: string;
  message?: string;
  data?: any;
}

 export default async function sendPattern(
  patternCode: string,
  phoneNumber: string,
  patternVariables: Record<string, string>,
): Promise<boolean> {
  try {
    const apiKey = process.env.SMS_API_KEY?.trim();
    const lineNumber = process.env.SMS_LINE_NUMBER?.trim();
    const apiUrl = process.env.SMS_API_URL?.trim();
    const patternCode = process.env.SMS_PATTERN_CODE?.trim();
    if (!apiKey || !lineNumber || !apiUrl || !patternCode) {
      console.error("SMS ENV VARIABLES ARE MISSING");
      return false;
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: patternCode,
        recipient: phoneNumber,
        line_number: lineNumber,
        attributes: patternVariables,
        number_format: "english",
      }),
    });

    console.log("STATUS:", response.status);
    const text = await response.text();
    console.log("BODY RESPONSE:", JSON.parse(text));

    return response.ok;
  } catch (error) {
    console.error("SEND SMS ERROR:", error);
    return false;
  }
}