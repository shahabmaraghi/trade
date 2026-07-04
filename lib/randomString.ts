export default function randomString(length = 12): string {
  let outString = ""
  const inOptions = "abcdefghijklmnopqrstuvwxyz0123456789"
  for (let i = 0; i < length; i++) {
    outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length))
  }
  return outString
}
