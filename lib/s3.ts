import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// Initialize S3 client with Liara credentials
const s3Client = new S3Client({
  region: process.env.LIARA_S3_REGION || "default",
  endpoint: process.env.LIARA_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.LIARA_S3_ACCESS_KEY || "",
    secretAccessKey: process.env.LIARA_S3_SECRET_KEY || "",
  },
})

const bucketName = process.env.LIARA_S3_BUCKET_NAME || ""

/**
 * Upload a file to Liara S3
 * @param fileBuffer - The file buffer to upload
 * @param fileName - The name to give the file in S3
 * @param contentType - The MIME type of the file
 * @returns The URL of the uploaded file
 */
export async function uploadFileToS3(fileBuffer: Buffer, fileName: string, contentType: string): Promise<string> {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
    }

    await s3Client.send(new PutObjectCommand(params))

    // Return the URL to the file
    return `${process.env.LIARA_S3_PUBLIC_URL}/${fileName}`
  } catch (error) {
    console.error("Error uploading file to S3:", error)
    throw new Error("Failed to upload file to S3")
  }
}

/**
 * Delete a file from Liara S3
 * @param fileKey - The key (path/filename) of the file to delete
 * @returns A boolean indicating success
 */
export async function deleteFileFromS3(fileKey: string): Promise<boolean> {
  try {
    // Extract the key from the full URL if needed
    const key = fileKey.includes(process.env.LIARA_S3_PUBLIC_URL || "") ? fileKey.split("/").pop() || fileKey : fileKey

    const params = {
      Bucket: bucketName,
      Key: key,
    }

    await s3Client.send(new DeleteObjectCommand(params))
    return true
  } catch (error) {
    console.error("Error deleting file from S3:", error)
    return false
  }
}

/**
 * Generate a presigned URL for a file in S3
 * @param fileKey - The key (path/filename) of the file
 * @param expiresIn - Expiration time in seconds (default: 3600)
 * @returns The presigned URL
 */
export async function getPresignedUrl(fileKey: string, expiresIn = 3600): Promise<string> {
  try {
    const key = fileKey.includes(process.env.LIARA_S3_PUBLIC_URL || "") ? fileKey.split("/").pop() || fileKey : fileKey

    const params = {
      Bucket: bucketName,
      Key: key,
    }

    const command = new GetObjectCommand(params)
    const url = await getSignedUrl(s3Client, command, { expiresIn })
    return url
  } catch (error) {
    console.error("Error generating presigned URL:", error)
    throw new Error("Failed to generate presigned URL")
  }
}

/**
 * Extract the file key from a full S3 URL
 * @param fileUrl - The full S3 URL
 * @returns The file key
 */
export function extractFileKeyFromUrl(fileUrl: string): string {
  if (!fileUrl) return ""

  const publicUrl = process.env.LIARA_S3_PUBLIC_URL
  if (publicUrl && fileUrl.startsWith(publicUrl)) {
    return fileUrl.substring(publicUrl.length + 1) // +1 to remove the leading slash
  }

  // If it's a local path starting with /uploads
  if (fileUrl.startsWith("/uploads")) {
    return fileUrl.substring(1) // Remove the leading slash
  }

  return fileUrl
}

/**
 * Check if a URL is an S3 URL
 * @param url - The URL to check
 * @returns Boolean indicating if it's an S3 URL
 */
export function isS3Url(url: string): boolean {
  return url.includes(process.env.LIARA_S3_PUBLIC_URL || "")
}
