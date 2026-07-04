declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // MongoDB
      MONGODB_URI: string

      // JWT
      JWT_SECRET: string

      // Liara S3
      LIARA_S3_ENDPOINT: string
      LIARA_S3_REGION: string
      LIARA_S3_ACCESS_KEY: string
      LIARA_S3_SECRET_KEY: string
      LIARA_S3_BUCKET_NAME: string
      LIARA_S3_PUBLIC_URL: string

      // Other environment variables
      [key: string]: string | undefined
    }
  }
}

// This export is necessary to make this a module
export {}
