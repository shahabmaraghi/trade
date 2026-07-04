import type React from "react"
import { ConfigProvider } from "antd"
import faIR from "antd/locale/fa_IR"

export default function ConfigProviderWrapper({
  children,
  fontFamily,
}: { children: React.ReactNode; fontFamily?: string }) {
  return (
    <ConfigProvider
      locale={faIR}
      direction="rtl"
      theme={{
        // algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#a38f20",
          fontFamily,
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}
