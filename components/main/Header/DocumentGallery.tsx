"use client"
import styled, { keyframes } from "styled-components"
import type React from "react"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import Image from "next/image"

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const slideIn = keyframes`
  from {
    transform: translateY(-50px);
  }
  to {
    transform: translateY(0);
  }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  animation: ${fadeIn} 0.3s ease-out;
`

const DocumentGalleryContainer = styled.div`
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 0.75rem;
  width: 90%;
  max-width: 1200px;
  padding: 1.25rem;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  text-align: center;
  animation: ${slideIn} 0.4s ease-out;
`

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  color: #FFD700;
  transition: all 0.3s ease;
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;

  &:hover {
    color: #c8ad75;
    transform: scale(1.2);
  }
`

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  text-align: center;
  background: linear-gradient(90deg, #FFD700, #FFF, #FFD700);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 3s linear infinite;
  margin-bottom: 1rem;
`

const GlowOverlay = styled.div`
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  background: radial-gradient(
    circle at center, 
    rgba(255, 215, 0, 0.1), 
    transparent 50%
  );
  pointer-events: none;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
`

const Divider = styled.hr`
  border: none;
  border-top: 1px solid rgba(255, 215, 0, 0.1);
  margin: 1rem auto;
  width: 80%;
`

const GalleryContainer = styled.div`
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 0.75rem;
  width: 90%;
  max-width: 1200px;
  padding: 1.25rem;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  text-align: center;
  animation: ${slideIn} 0.4s ease-out;
  overflow: hidden;
  
  &:hover {
    border-color: rgba(255, 215, 0, 0.3);
    box-shadow: 0 6px 30px rgba(255, 215, 0, 0.15);

    ${GlowOverlay} {
      opacity: 1;
    }
  }
`

const SwiperWrapper = styled.div`
  .swiper-pagination-bullet {
    background: #FFD700;
    opacity: 0.6;
    transition: opacity 0.3s ease, transform 0.3s ease;

    &-active {
      opacity: 1;
      background: #FFD700;
    }

    &:hover {
      opacity: 1;
      transform: scale(1.2);
    }
  }

  .swiper-button-next,
  .swiper-button-prev {
    color: #FFD700; 
    transition: transform 0.3s ease, color 0.3s ease;

    &:hover {
      color: #c8ad75;  
      transform: scale(1.1);
    }
  }
`

const ImageWrapper = styled.div`
  width: 100%;
  height: 500px;
  position: relative;
  border-radius: 0.75rem;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 30px rgba(255, 215, 0, 0.3);
  }
`

interface DocumentGalleryProps {
  isOpen: boolean
  toggleGallery: () => void
}

const DocumentGallery: React.FC<DocumentGalleryProps> = ({ isOpen, toggleGallery }) => {
  const images = [
    "/main/assets/images/Documents/1.jpg",
    "/main/assets/images/Documents/2.jpg",
    "/main/assets/images/Documents/3.jpg",
    "/main/assets/images/Documents/4.jpg",
    "/main/assets/images/Documents/5.jpg",
    "/main/assets/images/Documents/6.jpg",
  ]

  if (!isOpen) return null

  return (
    <Overlay onClick={toggleGallery}>
      <DocumentGalleryContainer onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={toggleGallery}>&times;</CloseButton>
        <ModalTitle>تصاویر مدارک</ModalTitle>
        <Divider />
        <SwiperWrapper>
          <Swiper
            navigation
            pagination={{ clickable: true }}
            modules={[Navigation, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            loop
            effect="fade"
            speed={600}
          >
            {images.map((src, index) => (
              <SwiperSlide key={index}>
                <ImageWrapper>
                  <Image
                    src={src || "/placeholder.svg"}
                    alt={`Document ${index + 1}`}
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </ImageWrapper>
              </SwiperSlide>
            ))}
          </Swiper>
        </SwiperWrapper>
      </DocumentGalleryContainer>
    </Overlay>
  )
}

export default DocumentGallery
