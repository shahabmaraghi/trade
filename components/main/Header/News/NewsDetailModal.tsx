"use client"
import styled from "styled-components"
import type React from "react"

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`

const ModalContent = styled.div`
  border: 1px solid rgba(255, 215, 0, 0.1);
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(10px);
  padding: 40px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1), transparent 70%);
    pointer-events: none;
  
  }

  @media (max-width: 768px) {
    padding: 20px;
  }
`

const NewsImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`

const NewsTitle = styled.h3`
  font-size: 24px;
  margin-bottom: 20px;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  text-align: center;


  @media (max-width: 768px) {
    font-size: 20px;
  }
`

const NewsDescription = styled.p`
  text-align: justify;
  margin-bottom: 20px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.69);
  font-size: 16px;
`

const NewsDate = styled.div`
  text-align: left;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.69);
  margin-top: 20px;
  border-top: 1px solid rgba(255, 215, 0, 0.1);
  padding-top: 20px;
`

const CloseButton = styled.button`
  position: absolute;
  top: 5px;
  right: 10px;
  background: none;
  border: none;
  color: #ffd700;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 215, 0, 0.1);
    transform: rotate(90deg);
  }
`

interface NewsItem {
  id: number
  title: string
  description: string
  date: string
  imageUrl: string
}

interface NewsDetailModalProps {
  news: NewsItem | null
  onClose: () => void
  postId?: number
}

const NewsDetailModal: React.FC<NewsDetailModalProps> = ({ news, onClose, postId }) => {
  if (!news) return null

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent>
        <CloseButton onClick={onClose}>×</CloseButton>
        <NewsImage src={news.imageUrl} alt={news.title} />
        <NewsTitle>{news.title}</NewsTitle>
        <NewsDescription>{news.description}</NewsDescription>
        <NewsDate>{news.date}</NewsDate>
        {postId && (
          <div
            style={{
              color: "rgba(255, 255, 255, 0.69)",
              textAlign: "center",
              marginTop: "10px",
            }}
          >
            {/* Post ID: {postId} */}
          </div>
        )}
      </ModalContent>
    </ModalOverlay>
  )
}

export default NewsDetailModal
