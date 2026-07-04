import type React from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/main/globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import MainLayoutProvider from "@/components/main/main-layout-provider";
import Navbar from "@/components/main/Navbar/Navbar";
import Header from "@/components/main/Header/Header";
import NextTopLoader from "nextjs-toploader";

const iranSansX = localFont({
  src: [
    {
      path: "../../public/fonts/Iranian-Sans/IRANSansXV.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-iransans",
});
const iranSansXFaNum = localFont({
  src: [
    {
      path: "../../public/fonts/Iranian-Sans/IRANSansX-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Iranian-Sans/IRANSansX-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Iranian-Sans/IRANSansX-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-iransans-fanum",
});

export const metadata: Metadata = {
  title: "پلاس چارت",
  description: "پلتفرم تحلیل و آموزش بازارهای مالی",
};

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <body
      className={`
    ${iranSansX.variable}
    ${iranSansXFaNum.variable}
    [font-family:var(--font-iransans)]
  `}
    >
      <MainLayoutProvider>
        <NextTopLoader color="#ffd700" showSpinner={false} />
        <Navbar />
        <Header />
        {children}
      </MainLayoutProvider>
    </body>
  );
}
