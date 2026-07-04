"use client"

import React from "react"

import { useState, useEffect } from "react"
import styled, { keyframes, createGlobalStyle } from "styled-components"
import Footer from "@/components/main/Footer"
import { formatDate } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import Link from "next/link"

// Animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

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

// Styled components
const GlobalStyle = createGlobalStyle`
  body {
    background-color: #181818;
    color: rgba(255, 255, 255, 0.69);
  }
`

const VideoBackground = styled.video`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
`

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: -1;
`

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  direction: rtl;
  padding-top: 120px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  justify-content: center;
  margin-top: 30px;
  padding: 0 15px;
  
  @media (min-width: 1400px) {
    gap: 40px;
  }
`

const SearchIcon = styled.i`
  font-size: 18px;
  color: #ffd700;
  margin-left: 8px;
`

const SearchBoxWrapper = styled.div`
  position: absolute;
  left: 20px;
  top: 30px;
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-radius: 8px;

  &:hover {
    box-shadow: 0 6px 30px rgba(255, 215, 0, 0.15);
  }

  @media (max-width: 768px) {
    left: 10px;
    width: calc(100% - 20px);
  }
`

const SearchBox = styled.input`
  width: 100%;
  max-width: 350px;
  padding: 12px 15px;
  font-size: 16px;
  border: none;
  outline: none;
  
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  border-radius: 6px;

  &:focus {
    box-shadow: 0 0 8px rgba(200, 173, 117, 0.5);
    border-color: #c8ad75;
  }

  &::placeholder {
    color: #888;
  }
`

const Box = styled.div<{ delay?: number }>`
  flex: 1 1 calc(33.333% - 30px);
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(10px);
  padding: 80px 20px 30px;
  min-height: 300px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  text-align: right;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  transition: all 0.4s ease;
  opacity: 0;
  animation: ${fadeIn} 0.8s ease-out forwards;
  animation-delay: ${(props) => props.delay || 0}s;
  position: relative;

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

  &:hover::before {
    border-color: rgba(255, 215, 0, 0.2);
    transform: scale(1.05);
  }

  @media (min-width: 1400px) {
    flex: 1 1 calc(25% - 40px);
  }

  @media (max-width: 1024px) {
    flex: 1 1 calc(50% - 30px);
  }

  @media (max-width: 768px) {
    flex: 1 1 100%;
  }
`

const Title = styled.h2`
  font-size: 18px;
  margin-bottom: 8px;
  
`

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
`

const DecorativeLine = styled.div<{ direction?: string }>`
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

const Subtitle = styled.p`
  font-size: 48px !important;
  margin-bottom: 20px;
  
  text-align: center;
  display: inline-block;
  -webkit-text-stroke: 0.7px #fff;

  &::after {
    content: "";
    display: block;
    width: 200px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #ffd700, transparent);
    margin: 10px auto 0;
  }

  @media (min-width: 1400px) {
    font-size: 21px;
  }

  @media (max-width: 768px) {
    font-size: 14px;
  }
`

const Image = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  margin-bottom: 8px;
  border-radius: 8px;
`

const Description = styled.div`
  font-size: 14px;
  margin-top: 15px;
  
  line-height: 1.6;
  flex-grow: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  
  & * {
    margin: 0;
    font-size: 14px;
  }
`

const UserInfoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
`

const UserImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-left: 10px;
  object-fit: cover;
`

const UserName = styled.span`
  font-size: 14px;
  margin-left: 7px;
  
`

const DateText = styled.p`
  font-size: 12px;
  text-align: left;
  margin-top: 5px;
  
  color: rgba(255, 255, 255, 0.5);
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`

const Button = styled.button`
  
  padding: 5px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
  transition: transform 0.3s ease, background-color 0.3s ease,
    box-shadow 0.3s ease;
  background-color: transparent;
  color: rgba(255, 255, 255, 0.69);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
  &:active {
    transform: scale(0.95);
  }
`

const FolderIcon = styled.span`
  margin-right: 5px;
  font-size: 21px;
  transition: transform 0.3s ease;
`

const BoostButton = styled(Button)`
  padding: 3px 10px;
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

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    &:hover {
      transform: none;
      background: linear-gradient(45deg, #212121, #323232);
      border-bottom: 2px solid #b9ae71;
      color: #fcffe4;
      box-shadow: none;
    }
  }
`

const LikeIcon = styled.span`
  margin-left: 5px;
  font-size: 20px;
  transition: transform 0.3s ease;
`

const ClickCount = styled.span`
  margin-left: 10px;
  font-weight: bold;
  font-size: 16px;
`

const Tooltip = styled.div<{ show: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #181819;
  color: rgba(255, 255, 255, 0.69);
  padding: 5px;
  border-radius: 5px;
  font-size: 0.875rem;
  white-space: nowrap;
  opacity: ${({ show }) => (show ? "1" : "0")};
  visibility: ${({ show }) => (show ? "visible" : "hidden")};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  z-index: 10;
  margin-bottom: 5px;
  

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: #181818 transparent transparent transparent;
  }
`

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 40px 0;
  gap: 10px;
`

const PaginationButton = styled.button<{ active?: boolean }>`
  padding: 8px 16px;
  background: ${(props) => (props.active ? "rgba(255, 215, 0, 0.3)" : "rgba(26, 26, 26, 0.8)")};
  border: 1px solid ${(props) => (props.active ? "rgba(255, 215, 0, 0.5)" : "rgba(255, 215, 0, 0.1)")};
  color: ${(props) => (props.active ? "#ffd700" : "rgba(255, 255, 255, 0.69)")};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  

  &:hover {
    background: rgba(255, 215, 0, 0.2);
    border-color: rgba(255, 215, 0, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      background: rgba(26, 26, 26, 0.8);
      border-color: rgba(255, 215, 0, 0.1);
    }
  }
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
`

const LoadingSpinner = styled(Loader2)`
  animation: spin 1s linear infinite;
  color: #ffd700;
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`

const Tag = styled.span`
  background: rgba(255, 215, 0, 0.1);
  color: #ffd700;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  
`

const PremiumBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(45deg, #ffd700, #b9ae71);
  color: #000;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  
  z-index: 1;
`

const NoResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  text-align: center;
  width: 100%;
`

const NoResultsText = styled.h3`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.69);
  margin-bottom: 20px;
  
`

// Types
interface Analysis {
  _id: string
  title: string
  description: string
  image: string
  authorId: string
  likes: number
  type: "technical" | "fundamental" | "market" | "other"
  isPremium: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
  author?: {
    name: string
    image: string
  }
  userHasLiked?: boolean
}

interface PaginationData {
  total: number
  page: number
  limit: number
  pages: number
}

// Component for a single analysis post
const AnalysisPostBox = ({
  analysis,
  index,
  isLoggedIn,
  onLike,
}: {
  analysis: Analysis
  index: number
  isLoggedIn: boolean
  onLike: (id: string) => void
}) => {
  const [boostTooltipVisible, setBoostTooltipVisible] = useState(false)
  const [commentTooltipVisible, setCommentTooltipVisible] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)

  const date = analysis.createdAt ? new Date(analysis.createdAt) : new Date()
  const formattedDate = formatDate(date)

  const handleLikeClick = async () => {
    if (!isLoggedIn || likeLoading) return

    setLikeLoading(true)
    try {
      await onLike(analysis._id)
    } catch (error) {
      console.error("Error liking analysis:", error)
    } finally {
      setLikeLoading(false)
    }
  }

  return (
    <Box delay={index * 0.1}>
      {analysis.isPremium && <PremiumBadge>ویژه</PremiumBadge>}
      <Title>{analysis.title}</Title>
      <Image
        src={analysis.image || "/placeholder.svg?height=200&width=400&query=financial analysis chart"}
        alt={analysis.title}
      />
      <UserInfoContainer>
        <UserImage
          src={analysis.author?.image || `/placeholder.svg?height=40&width=40&query=user avatar`}
          alt="User Avatar"
        />
        <UserName>{analysis.author?.name || "کاربر پلاس چارت"}</UserName>
      </UserInfoContainer>
      <DateText>تاریخ: {formattedDate}</DateText>
      <Description dangerouslySetInnerHTML={{ __html: analysis.description }} />

      {analysis.tags && analysis.tags.length > 0 && (
        <TagsContainer>
          {analysis.tags.map((tag, idx) => (
            <Tag key={idx}>{tag}</Tag>
          ))}
        </TagsContainer>
      )}

      <ButtonContainer>
        <BoostButton
          onClick={handleLikeClick}
          onMouseEnter={() => setBoostTooltipVisible(true)}
          onMouseLeave={() => setBoostTooltipVisible(false)}
          disabled={likeLoading || !isLoggedIn}
        >
          {isLoggedIn ? (
            <>
              <LikeIcon>{analysis.userHasLiked ? "❤️" : "🤍"}</LikeIcon>
              <ClickCount>{analysis.likes || 0}</ClickCount>
              <Tooltip show={boostTooltipVisible}>{analysis.userHasLiked ? "حذف لایک" : "لایک"}</Tooltip>
            </>
          ) : (
            "جهت لایک وارد شوید"
          )}
        </BoostButton>
        <Link href={`/analyses/${analysis._id}`} passHref>
          <Button
            as="a"
            onMouseEnter={() => setCommentTooltipVisible(true)}
            onMouseLeave={() => setCommentTooltipVisible(false)}
          >
            <FolderIcon>📁</FolderIcon>
            <Tooltip show={commentTooltipVisible}>مشاهده</Tooltip>
          </Button>
        </Link>
      </ButtonContainer>
    </Box>
  )
}

// Main component
const Analyses = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 9,
    pages: 0,
  })
  const [filter, setFilter] = useState<string | null>(null)

  // Fetch analyses data
  const fetchAnalyses = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (searchTerm) {
        queryParams.append("search", searchTerm)
      }

      if (filter) {
        queryParams.append("type", filter)
      }

      const response = await fetch(`/api/analyses?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch analyses")
      }

      const data = await response.json()
      setAnalyses(data.analyses)
      setPagination(data.pagination)

      // If current page is greater than total pages, reset to page 1
      if (data.pagination.page > data.pagination.pages && data.pagination.pages > 0) {
        setPagination((prev) => ({ ...prev, page: 1 }))
      }
    } catch (err) {
      console.error("Error fetching analyses:", err)
      setError("خطا در بارگذاری تحلیل‌ها. لطفا دوباره تلاش کنید.")
    } finally {
      setLoading(false)
    }
  }

  // Handle like action
  const handleLike = async (id: string) => {
    if (!isLoggedIn) {
      // Redirect to login or show a message
      return
    }

    try {
      const response = await fetch(`/api/analyses/${id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized
          setIsLoggedIn(false)
          throw new Error("Please login to like analyses")
        }
        throw new Error("Failed to like analysis")
      }

      const data = await response.json()

      // Update the analyses state with the updated like count and liked status
      setAnalyses((prevAnalyses) =>
        prevAnalyses.map((analysis) =>
          analysis._id === id ? { ...analysis, likes: data.likes, userHasLiked: data.liked } : analysis,
        ),
      )

      return data
    } catch (err) {
      console.error("Error liking analysis:", err)
      throw err
    }
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }))
  }

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchAnalyses()
  }, [pagination.page, searchTerm, filter])

  // Add this new effect to check like status for each analysis when user is logged in
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!isLoggedIn || analyses.length === 0) return

      try {
        // Create an array of promises for each analysis
        const likeChecks = analyses.map(async (analysis) => {
          const response = await fetch(`/api/analyses/${analysis._id}/like`, {
            credentials: "include",
          })

          if (response.ok) {
            const data = await response.json()
            return { id: analysis._id, liked: data.liked }
          }
          return { id: analysis._id, liked: false }
        })

        // Wait for all promises to resolve
        const results = await Promise.all(likeChecks)

        // Update analyses with like status
        setAnalyses((prevAnalyses) =>
          prevAnalyses.map((analysis) => {
            const result = results.find((r) => r.id === analysis._id)
            return {
              ...analysis,
              userHasLiked: result ? result.liked : false,
            }
          }),
        )
      } catch (error) {
        console.error("Error checking like status:", error)
      }
    }

    checkLikeStatus()
  }, [isLoggedIn, analyses.length])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination((prev) => ({
          ...prev,
          page: 1,
        }))
      } else {
        fetchAnalyses()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          setIsLoggedIn(true)
        } else {
          setIsLoggedIn(false)
          setUser(null)
        }
      } catch (error) {
        console.error("Error checking auth status:", error)
        setIsLoggedIn(false)
        setUser(null)
      }
    }

    checkAuthStatus()
  }, [])

  // Add this useEffect to sync URL with pagination
  useEffect(() => {
    const url = new URL(window.location.href)
    if (pagination.page > 1) {
      url.searchParams.set("page", pagination.page.toString())
    } else {
      url.searchParams.delete("page")
    }
    if (searchTerm) {
      url.searchParams.set("search", searchTerm)
    } else {
      url.searchParams.delete("search")
    }
    window.history.replaceState({}, "", url.toString())
  }, [pagination.page, searchTerm])

  // Add this useEffect to read URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const pageParam = urlParams.get("page")
    const searchParam = urlParams.get("search")

    if (pageParam) {
      const page = Number.parseInt(pageParam)
      if (page > 0) {
        setPagination((prev) => ({ ...prev, page }))
      }
    }

    if (searchParam) {
      setSearchTerm(searchParam)
    }
  }, [])

  return (
    <>
      <GlobalStyle />
      <VideoBackground src="/main/assets/images/Analyzes/1.mp4" autoPlay loop muted playsInline />
      <Overlay />

      <PageContainer>
        <SearchBoxWrapper>
          <SearchIcon className="fas fa-search" />
          <SearchBox
            type="text"
            placeholder="جستجو..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBoxWrapper>

        <TitleContainer>
          <DecorativeLine direction="left" />
          <SectionTitle>تحلیل کاربران</SectionTitle>
          <DecorativeLine direction="right" />
        </TitleContainer>

        <Subtitle data-text="تحلیل کاربران">تحلیل‌های منتشر شده توسط کاربران پلاس چارت</Subtitle>

        {loading ? (
          <LoadingContainer>
            <LoadingSpinner size={40} />
          </LoadingContainer>
        ) : error ? (
          <NoResultsContainer>
            <NoResultsText>{error}</NoResultsText>
          </NoResultsContainer>
        ) : analyses.length === 0 ? (
          <NoResultsContainer>
            <NoResultsText>هیچ تحلیلی یافت نشد</NoResultsText>
          </NoResultsContainer>
        ) : (
          <Container>
            {analyses.map((analysis, index) => (
              <AnalysisPostBox
                key={analysis._id}
                analysis={analysis}
                index={index}
                isLoggedIn={isLoggedIn}
                onLike={handleLike}
              />
            ))}
          </Container>
        )}

        {!loading && analyses.length > 0 && pagination.pages > 1 && (
          <PaginationContainer>
            <PaginationButton onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1}>
              قبلی
            </PaginationButton>

            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
              let page
              if (pagination.pages <= 7) {
                page = i + 1
              } else if (pagination.page <= 4) {
                page = i + 1
              } else if (pagination.page >= pagination.pages - 3) {
                page = pagination.pages - 6 + i
              } else {
                page = pagination.page - 3 + i
              }

              return (
                <React.Fragment key={page}>
                  {i === 0 && page > 1 && (
                    <>
                      <PaginationButton onClick={() => handlePageChange(1)}>1</PaginationButton>
                      {page > 2 && <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>...</span>}
                    </>
                  )}
                  <PaginationButton active={page === pagination.page} onClick={() => handlePageChange(page)}>
                    {page}
                  </PaginationButton>
                  {i === Math.min(pagination.pages, 7) - 1 && page < pagination.pages && (
                    <>
                      {page < pagination.pages - 1 && <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>...</span>}
                      <PaginationButton onClick={() => handlePageChange(pagination.pages)}>
                        {pagination.pages}
                      </PaginationButton>
                    </>
                  )}
                </React.Fragment>
              )
            })}

            <PaginationButton
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            >
              بعدی
            </PaginationButton>
          </PaginationContainer>
        )}
      </PageContainer>

      <Footer />
    </>
  )
}

export default Analyses
