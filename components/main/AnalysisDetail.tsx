"use client"

import { useState, useEffect } from "react"
import styled, { keyframes, createGlobalStyle } from "styled-components"
import Footer from "@/components/main/Footer"
import { formatDate } from "@/lib/utils"
import { useCookies } from "react-cookie"
import { Loader2, ArrowRight, Heart, Share2, LucideTag } from "lucide-react"
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
  position: relative;
  direction: rtl;
  padding-top: 120px;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  min-height: 100vh;
`

const BackButton = styled(Link)`
  display: flex;
  align-items: center;
  color: #ffd700;
  
  margin-bottom: 20px;
  text-decoration: none;
  transition: all 0.3s ease;
  width: fit-content;
  
  &:hover {
    transform: translateX(5px);
  }
`

const ContentContainer = styled.div`
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 30px;
  margin: 0 15px 50px;
  animation: ${fadeIn} 0.8s ease-out forwards;
  
  @media (max-width: 768px) {
    padding: 20px 15px;
  }
`

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 20px;
  
  background: linear-gradient(90deg, #ffd700, #fff, #ffd700);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 3s linear infinite;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`

const MetaContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
`

const UserInfoContainer = styled.div`
  display: flex;
  align-items: center;
`

const UserImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-left: 15px;
  object-fit: cover;
`

const UserName = styled.span`
  font-size: 16px;
  
`

const DateText = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  
`

const TypeBadge = styled.div`
  background: rgba(255, 215, 0, 0.1);
  color: #ffd700;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 14px;
  
  display: flex;
  align-items: center;
  gap: 5px;
`

const PremiumBadge = styled.div`
  background: linear-gradient(45deg, #ffd700, #b9ae71);
  color: #000;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  
`

const FeaturedImage = styled.img`
  width: 100%;
  max-height: 500px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 30px;
`

const Content = styled.div`
  font-size: 16px;
  line-height: 1.8;
  
  margin-bottom: 30px;
  
  & p {
    margin-bottom: 1rem;
  }
  
  & h1, & h2, & h3, & h4, & h5, & h6 {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
  }
  
  & ul, & ol {
    margin-bottom: 1rem;
    padding-right: 1.5rem;
  }
  
  & img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1rem 0;
  }
  
  & a {
    color: #ffd700;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`

const Description = styled.div`
  font-size: 16px;
  line-height: 1.8;
  margin: 20px 0;
  color: rgba(255, 255, 255, 0.85);
  
  
  & h1, & h2, & h3, & h4, & h5, & h6 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
    color: #ffd700;
  }
  
  & p {
    margin-bottom: 1em;
  }
  
  & ul, & ol {
    margin-bottom: 1em;
    padding-right: 1.5em;
  }
  
  & li {
    margin-bottom: 0.5em;
  }
  
  & a {
    color: #ffd700;
    text-decoration: underline;
    transition: color 0.3s ease;
    
    &:hover {
      color: #fff;
    }
  }
  
  & img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1em 0;
  }
  
  & blockquote {
    border-right: 3px solid #ffd700;
    padding: 0.5em 1em;
    margin: 1em 0;
    background: rgba(255, 215, 0, 0.1);
    border-radius: 4px;
  }
  
  & code {
    font-family: monospace;
    background: rgba(0, 0, 0, 0.3);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-size: 0.9em;
  }
  
  & pre {
    background: rgba(0, 0, 0, 0.3);
    padding: 1em;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1em 0;
    
    & code {
      background: transparent;
      padding: 0;
    }
  }
  
  & table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    
    & th, & td {
      border: 1px solid rgba(255, 215, 0, 0.3);
      padding: 0.5em;
      text-align: right;
    }
    
    & th {
      background: rgba(255, 215, 0, 0.1);
    }
  }
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 30px;
  margin-bottom: 20px;
`

const Tag = styled.span`
  background: rgba(255, 215, 0, 0.1);
  color: #ffd700;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 14px;
  
  display: flex;
  align-items: center;
  gap: 5px;
`

const ActionContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 215, 0, 0.1);
`

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(255, 215, 0, 0.1);
  color: rgba(255, 255, 255, 0.69);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 215, 0, 0.1);
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

const LikeButton = styled(ActionButton)`
  color: ${(props) => (props.disabled ? "rgba(255, 255, 255, 0.69)" : "#ffd700")};
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
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

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  text-align: center;
  width: 100%;
`

const ErrorText = styled.h3`
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

// Helper function to get type label in Persian
const getTypeLabel = (type: string): string => {
  switch (type) {
    case "technical":
      return "تحلیل تکنیکال"
    case "fundamental":
      return "تحلیل بنیادی"
    case "market":
      return "تحلیل بازار"
    case "other":
    default:
      return "سایر تحلیل‌ها"
  }
}

// Main component
const AnalysisDetail = ({ id }: { id: string }) => {
  const [cookies] = useCookies(["token"])
  const [hasLiked, setHasLiked] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [likeLoading, setLikeLoading] = useState(false)

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

  // Fetch analysis data
  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/analyses/${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch analysis")
        }

        const data = await response.json()
        setAnalysis(data)
      } catch (err) {
        console.error("Error fetching analysis:", err)
        setError("خطا در بارگذاری تحلیل. لطفا دوباره تلاش کنید.")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [id])

  // Check if user has liked this analysis
  const checkLikeStatus = async () => {
    if (!isLoggedIn || !analysis) return

    try {
      const response = await fetch(`/api/analyses/${id}/like`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setHasLiked(data.liked)
      }
    } catch (error) {
      console.error("Error checking like status:", error)
    }
  }

  // Add this effect to check like status when analysis is loaded and user is logged in
  useEffect(() => {
    checkLikeStatus()
  }, [analysis, isLoggedIn])

  // Handle like action
  const handleLike = async () => {
    if (!isLoggedIn || likeLoading || !analysis) return

    setLikeLoading(true)
    try {
      const response = await fetch(`/api/analyses/${id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to like analysis")
      }

      const data = await response.json()

      // Update the analysis state with the new like count
      setAnalysis((prev) => (prev ? { ...prev, likes: data.likes } : null))
      setHasLiked(data.liked)
    } catch (err) {
      console.error("Error liking analysis:", err)
    } finally {
      setLikeLoading(false)
    }
  }

  // Handle share action
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: analysis?.title || "تحلیل پلاس چارت",
          text: analysis?.description?.substring(0, 100) || "مشاهده تحلیل تخصصی در پلاس چارت",
          url: window.location.href,
        })
        .catch((err) => console.error("Error sharing:", err))
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert("لینک تحلیل کپی شد"))
        .catch((err) => console.error("Error copying to clipboard:", err))
    }
  }

  if (loading) {
    return (
      <>
        <GlobalStyle />
        <VideoBackground src="/main/assets/images/Analyzes/1.mp4" autoPlay loop muted playsInline />
        <Overlay />
        <PageContainer>
          <LoadingContainer>
            <LoadingSpinner size={40} />
          </LoadingContainer>
        </PageContainer>
        <Footer />
      </>
    )
  }

  if (error || !analysis) {
    return (
      <>
        <GlobalStyle />
        <VideoBackground src="/main/assets/images/Analyzes/1.mp4" autoPlay loop muted playsInline />
        <Overlay />
        <PageContainer>
          <ErrorContainer>
            <ErrorText>{error || "تحلیل مورد نظر یافت نشد"}</ErrorText>
            <BackButton href="/analyses">
              <ArrowRight size={16} />
              <span>بازگشت به تحلیل‌ها</span>
            </BackButton>
          </ErrorContainer>
        </PageContainer>
        <Footer />
      </>
    )
  }

  const date = analysis.createdAt ? new Date(analysis.createdAt) : new Date()
  const formattedDate = formatDate(date)

  return (
    <>
      <GlobalStyle />
      <VideoBackground src="/main/assets/images/Analyzes/1.mp4" autoPlay loop muted playsInline />
      <Overlay />

      <PageContainer>
        <BackButton href="/analyses">
          <ArrowRight size={16} />
          <span>بازگشت به تحلیل‌ها</span>
        </BackButton>

        <ContentContainer>
          <Title>{analysis.title}</Title>

          <MetaContainer>
            <UserInfoContainer>
              <UserImage
                src={analysis.author?.image || `/placeholder.svg?height=50&width=50&query=user avatar`}
                alt="User Avatar"
              />
              <div>
                <UserName>{analysis.author?.name || "کاربر پلاس چارت"}</UserName>
                <DateText>تاریخ: {formattedDate}</DateText>
              </div>
            </UserInfoContainer>

            <TypeBadge>
              <LucideTag size={16} />
              {getTypeLabel(analysis.type)}
            </TypeBadge>

            {analysis.isPremium && <PremiumBadge>ویژه</PremiumBadge>}
          </MetaContainer>

          <FeaturedImage
            src={analysis.image || "/placeholder.svg?height=500&width=1000&query=financial analysis chart"}
            alt={analysis.title}
          />

          <Description dangerouslySetInnerHTML={{ __html: analysis.description }} />

          {analysis.tags && analysis.tags.length > 0 && (
            <TagsContainer>
              {analysis.tags.map((tag, idx) => (
                <Tag key={idx}>
                  <LucideTag size={14} />
                  {tag}
                </Tag>
              ))}
            </TagsContainer>
          )}

          <ActionContainer>
            <LikeButton onClick={handleLike} disabled={!isLoggedIn || likeLoading}>
              <Heart size={18} fill={hasLiked ? "#ffd700" : "none"} />
              {analysis.likes || 0} {hasLiked ? "پسندیده شده" : "لایک"}
            </LikeButton>

            <ActionButton onClick={handleShare}>
              <Share2 size={18} />
              اشتراک‌گذاری
            </ActionButton>
          </ActionContainer>
        </ContentContainer>
      </PageContainer>

      <Footer />
    </>
  )
}

export default AnalysisDetail
