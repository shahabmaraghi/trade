"use client"

import type React from "react"

import { useState, useEffect } from "react"
import styled, { keyframes } from "styled-components"
import Header from "@/components/main/Header/Header"
import Footer from "@/components/main/Footer"
import NewsDetailModal from "./NewsDetailModal"
import Image from "next/image"

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`

const slideIn = keyframes`
  from {
    width: 0;
  }
  to {
    width: 100px;
  }
`

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #181818;
`

const NewsContainer = styled.div`
  display: flex;
  gap: 40px;
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  max-width: 1600px;
  width: 100%;
  padding: 40px;
  flex: 1;
  margin: 0 auto;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at 50% 50%,
      rgba(255, 215, 0, 0.1),
      transparent 70%
    );
    pointer-events: none;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 20px;
    gap: 20px;
  }
`

const MainNews = styled.div`
  border: 1px solid rgba(255, 215, 0, 0.1);
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(10px);
  padding: 40px;
  margin-bottom: 40px;
  margin-top: 80px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  font-size: 18px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  transition: all 0.4s ease;
  h3 {
    display: none; // Hide the title in main content since it will be shown in modal
  }

  &:hover {
    transform: translateY(-10px);
    border-color: rgba(255, 215, 0, 0.3);
    box-shadow: 0 6px 30px rgba(255, 215, 0, 0.15);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 2px solid transparent;
    transition: all 0.4s ease;
  }

  h3 {
    margin-bottom: 20px;
    color: #ffd700;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  }

  p {
    text-align: center;
    margin-bottom: 20px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.69);
  }

  .news-date {
    align-self: flex-end;
    margin-top: auto;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
  }

  @media (max-width: 768px) {
    padding: 20px;
    margin-top: 80px;
    font-size: 16px;
  }
`

const SecondaryNewsContainer = styled.div`
  display: flex;
  gap: 40px;
  flex: 1;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`

const SecondaryNewsItem = styled.div`
  border: 1px solid rgba(255, 215, 0, 0.1);
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(10px);
  flex: 1;
  padding: 30px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  transition: all 0.4s ease;

  &:hover {
    transform: translateY(-10px);
    border-color: rgba(255, 215, 0, 0.3);
    box-shadow: 0 6px 30px rgba(255, 215, 0, 0.15);
  }

  h3 {
    margin-bottom: 20px;
    color: #ffd700;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
    display: none;
  }

  p {
    text-align: center;
    margin-bottom: 20px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.69);
  }

  .news-date {
    align-self: flex-end;
    margin-top: auto;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
  }

  @media (max-width: 768px) {
    padding: 20px;
    font-size: 14px;
  }
`

const SidebarContainer = styled.div`
  width: 300px;
  border: 1px solid rgba(255, 215, 0, 0.1);
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(10px);
  padding: 20px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  position: sticky;
  margin-top: 78px;

  @media (max-width: 768px) {
    width: 100%;
    position: static;
    margin-top: 20px;
  }
`

const SidebarTitle = styled.h3`
  font-size: 24px;
  margin-bottom: 20px;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 20px;
  }
`

const SidebarNewsItem = styled.div`
  border: 1px solid rgba(255, 215, 0, 0.1);
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(10px);
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  font-size: 16px;
  transition: all 0.4s ease;

  &:hover {
    transform: translateY(-10px);
    border-color: rgba(255, 215, 0, 0.3);
    box-shadow: 0 6px 30px rgba(255, 215, 0, 0.15);
  }

  h4 {
    margin-bottom: 10px;
    color: #ffd700;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
    display: none;
  }

  p {
    color: rgba(255, 255, 255, 0.69);
  }

  .news-date {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
  }

  .news-image {
    max-width: 100%;
    height: auto;
    margin-bottom: 10px;
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    padding: 10px;
    font-size: 14px;
  }
`

const Button = styled.button`
  padding: 12px 24px;
  color: #fcffe4;
  background: linear-gradient(45deg, #212121, #323232);
  border: none;
  border-radius: 8px;
  border-bottom: 2px solid #b9ae71;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      120deg,
      transparent,
      rgba(255, 215, 0, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  &:hover {
    background: linear-gradient(45deg, #ffd700, #b9ae71);
    transform: translateY(-3px);
    border-bottom: 2px solid #fff;
    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
    color: #212121;

    &:before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px);
  }
`

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 10px 0;
`

const DecorativeLine = styled.div<{ direction: "left" | "right" }>`
  height: 2px;
  width: 100px;
  background: linear-gradient(
    90deg,
    ${(props) => (props.direction === "left" ? "transparent, #FFD700" : "#FFD700, transparent")}
  );
  position: relative;
  animation: ${slideIn} 1s ease-out;

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    ${(props) => (props.direction === "left" ? "right: -10px" : "left: -10px")};
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
  }
`

const SectionTitle = styled.h2`
  font-size: 3.2rem;
  margin: 0;
  padding: 0 20px;
  background: linear-gradient(90deg, #ffd700, #fff, #ffd700);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 3s linear infinite;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`

interface NewsItem {
  id: number
  categoryId: number
  title: string
  date: string
  description: string
  imageUrl: string
}

interface CryptoNewsProps {
  categoryId?: number
}

const formatPersianDate = (date: string) => {
  const [year, month, day] = date.split("/")
  const persianDate = new Date(Number.parseInt(year) + 621, Number.parseInt(month) - 1, Number.parseInt(day))
  return persianDate.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const CryptoNews: React.FC<CryptoNewsProps> = ({ categoryId }) => {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [sidebarExpanded, setSidebarExpanded] = useState<number | null>(null)
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([])
  const [filteredSidebarNews, setFilteredSidebarNews] = useState<NewsItem[]>([])
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)

  const toggleDescription = (newsItem: NewsItem) => {
    setSelectedNews({
      id: newsItem.id,
      title: newsItem.title,
      description: newsItem.description,
      date: newsItem.date,
      imageUrl: newsItem.imageUrl,
      categoryId: newsItem.categoryId,
    })
  }

  const news: NewsItem[] = [
    {
      id: 1,
      categoryId: 1,
      title: "قیمت بیت‌کوین به اوج تاریخی رسید",
      date: "1403/09/17",
      description:
        "بیت‌کوین به بالاترین قیمت خود در تاریخ رسید و این دستاوردی بی‌سابقه محسوب می‌شود. این رشد قیمتی ممکن است بر روند بازارهای مالی تأثیرات زیادی بگذارد و بسیاری از تحلیلگران اقتصادی در مورد آن صحبت می‌کنند. بسیاری از سرمایه‌گذاران به شدت نگران تغییرات ناگهانی در قیمت‌ها هستند.",
      imageUrl: "https://via.placeholder.com/600x300",
    },
    {
      id: 2,
      categoryId: 2,
      title: "اتریوم برنامه به‌روزرسانی شبکه خود را اعلام کرد",
      date: "1403/09/16",
      description:
        "اتریوم به‌روزرسانی مهمی در شبکه خود را برای بهبود عملکرد اعلام کرده است. این به‌روزرسانی باعث افزایش سرعت تراکنش‌ها و کاهش هزینه‌ها خواهد شد. تیم توسعه‌دهنده اتریوم به این تغییرات امیدوار است که مقیاس‌پذیری شبکه را بهبود بخشد.",
      imageUrl: "https://via.placeholder.com/600x300",
    },
    {
      id: 3,
      categoryId: 1,
      title: "صعود ارزش بازار ارزهای دیجیتال",
      date: "1403/09/15",
      description:
        "ارزش بازار ارزهای دیجیتال با رشد قابل‌توجهی مواجه شده است. این رشد به‌ویژه در ارزهای برتر مانند بیت‌کوین و اتریوم دیده می‌شود و بسیاری از تحلیلگران معتقدند که این روند ادامه خواهد داشت.",
      imageUrl: "https://via.placeholder.com/600x300",
    },
    {
      id: 4,
      categoryId: 2,
      title: "صعود ارزش بازار ارزهای دیجیتال",
      date: "1403/09/15",
      description:
        "روند صعودی در بازار ارزهای دیجیتال همچنان ادامه دارد. بسیاری از سرمایه‌گذاران بزرگ در حال سرمایه‌گذاری بیشتر در ارزهای دیجیتال هستند. تحلیلگران پیش‌بینی می‌کنند که این روند تا پایان سال جاری ادامه خواهد یافت.",
      imageUrl: "https://via.placeholder.com/600x300",
    },
  ]

  const sidebarNews: NewsItem[] = [
    {
      id: 7,
      categoryId: 1,
      title: "راه‌اندازی بلاک‌چین جدید توسط سازمان XYZ",
      date: "1403/09/12",
      description:
        "سازمان XYZ اعلام کرده که به‌زودی یک بلاک‌چین جدید راه‌اندازی خواهد کرد که هدف آن تسهیل تراکنش‌های سریع و امن است.",
      imageUrl: "https://via.placeholder.com/300x200",
    },
    {
      id: 8,
      categoryId: 2,
      title: "پیشرفت‌های جدید در الگوریتم‌های هوش مصنوعی بلاک‌چین",
      date: "1403/09/13",
      description:
        "هوش مصنوعی به یکی از مهم‌ترین اجزای فناوری بلاک‌چین تبدیل شده است و این هفته پیشرفت‌های جدیدی در این حوزه معرفی شده است.",
      imageUrl: "https://via.placeholder.com/300x200",
    },
  ]

  useEffect(() => {
    if (categoryId) {
      setFilteredNews(news.filter((item) => item.categoryId === categoryId))
      setFilteredSidebarNews(sidebarNews.filter((item) => item.categoryId === categoryId))
    } else {
      setFilteredNews(news)
      setFilteredSidebarNews(sidebarNews)
    }
  }, [categoryId])

  return (
    <PageWrapper>
      <style>{`body { background-color: #181818; color: rgba(255, 255, 255, 0.69) }`}</style>
      <Header />
      <TitleContainer>
        <DecorativeLine direction="left" />
        <SectionTitle>اخبار داخلی</SectionTitle>
        <DecorativeLine direction="right" />
      </TitleContainer>

      <NewsContainer>
        <div style={{ flex: 2 }}>
          {filteredNews.length > 0 && (
            <MainNews>
              <Image
                src={filteredNews[0].imageUrl || "/placeholder.svg"}
                alt={filteredNews[0].title}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              />
              <h3>{filteredNews[0].title}</h3>
              <p>
                {expanded === filteredNews[0].id
                  ? filteredNews[0].description
                  : filteredNews[0].description.substring(0, 100) + "..."}
              </p>
              <Button onClick={() => toggleDescription(filteredNews[0])}>
                {expanded === filteredNews[0].id ? "بستن" : "ادامه مطلب"}
              </Button>
              <div className="news-date">{formatPersianDate(filteredNews[0].date)}</div>
            </MainNews>
          )}
          <SecondaryNewsContainer>
            {filteredNews.slice(1).map((item) => (
              <SecondaryNewsItem key={item.id}>
                <Image
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.title}
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "8px",
                    marginBottom: "20px",
                  }}
                />
                <h3>{item.title}</h3>
                <p>{expanded === item.id ? item.description : item.description.substring(0, 100) + "..."}</p>
                <Button onClick={() => toggleDescription(item)}>{expanded === item.id ? "بستن" : "ادامه مطلب"}</Button>
                <div className="news-date">{formatPersianDate(item.date)}</div>
              </SecondaryNewsItem>
            ))}
          </SecondaryNewsContainer>
        </div>

        <SidebarContainer>
          <SidebarTitle>اخبار جانبی</SidebarTitle>
          {filteredSidebarNews.map((item) => (
            <SidebarNewsItem key={item.id}>
              <Image
                src={item.imageUrl || "/placeholder.svg"}
                alt={item.title}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              />
              <h4>{item.title}</h4>
              <p>{sidebarExpanded === item.id ? item.description : item.description.substring(0, 60) + "..."}</p>
              <Button onClick={() => toggleDescription(item)}>ادامه مطلب</Button>
              <div className="news-date">{formatPersianDate(item.date)}</div>
            </SidebarNewsItem>
          ))}
        </SidebarContainer>
      </NewsContainer>
      <Footer />
      <NewsDetailModal news={selectedNews} postId={selectedNews?.id} onClose={() => setSelectedNews(null)} />
    </PageWrapper>
  )
}

export default CryptoNews
