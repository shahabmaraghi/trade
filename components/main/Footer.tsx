"use client"

import { useState, useEffect } from "react"
import styled, { keyframes } from "styled-components"

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`

const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 215, 0, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 215, 0, 0);
  }
`

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`

const FooterContainer = styled.footer`
  display: flex;
  align-items: center;
  justify-content: center;
  
  font-size: 1rem;
  padding: 20px;
  height: 60px;
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 215, 0, 0.1);
  color: rgba(255, 255, 255, 0.69);
  position: relative;
  z-index: 10;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.2), transparent);
  }

  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 15px;
    height: 50px;
  }
`

const ScrollButton = styled.button`
  position: fixed;
  bottom: 30px;
  left: 30px;
  padding: 12px 24px;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 215, 0, 0.1);
  border-radius: 8px;
  
  cursor: pointer;
  z-index: 999;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.5s ease-out;

  &:hover {
    transform: translateY(-5px);
    border-color: rgba(255, 215, 0, 0.3);
    box-shadow: 0 6px 30px rgba(255, 215, 0, 0.15);
    background: rgba(255, 215, 0, 0.1);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 2px solid transparent;
    border-radius: 8px;
    transition: all 0.4s ease;
  }

  &:hover::before {
    border-color: rgba(255, 215, 0, 0.2);
    transform: scale(1.05);
  }

  &:active {
    transform: translateY(-2px);
  }
`

const Tooltip = styled.div`
  visibility: hidden;
  width: auto;
  min-width: 80px;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.69);
  text-align: center;
  border-radius: 8px;
  padding: 8px 12px;
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  transition: all 0.3s ease;
  opacity: 0;
  border: 1px solid rgba(255, 215, 0, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  z-index: 1;

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: rgba(26, 26, 26, 0.95) transparent transparent transparent;
  }
`

const SupportButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(10px);
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.1);
  cursor: pointer;
  border-radius: 8px;
  
  animation: ${float} 3s ease-in-out infinite;
  transition: all 0.3s ease;
  z-index: 999;

  &:hover {
    transform: translateY(-5px);
    border-color: rgba(255, 215, 0, 0.3);
    box-shadow: 0 6px 30px rgba(255, 215, 0, 0.15);
    background: rgba(255, 215, 0, 0.1);
    animation: ${pulse} 2s infinite;
  }

  &:hover ${Tooltip} {
    visibility: visible;
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  i {
    margin-left: 8px;
    margin-right: 5px;
    font-size: 1.2rem;
    color: #ffd700;
  }
`

const Footer = () => {
  const [showButton, setShowButton] = useState<boolean>(false)

  const handleScroll = (): void => {
    if (window.scrollY > 300) {
      setShowButton(true)
    } else {
      setShowButton(false)
    }
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const scrollToTop = (): void => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSupportClick = (): void => {
    alert("به صفحه پشتیبانی هدایت می‌شوید.")
  }

  return (
    <>
      <FooterContainer>
        <p>© 2026 Plus Chart. تمامی حقوق محفوظ است.</p>
      </FooterContainer>

      {showButton && <ScrollButton onClick={scrollToTop}>بازگشت به بالا</ScrollButton>}

      {showButton && (
        <SupportButton onClick={handleSupportClick}>
          <span>پشتیبانی</span>
          <i className="fas fa-headphones"></i>
          <Tooltip> پشتیبانی</Tooltip>
        </SupportButton>
      )}
    </>
  )
}

export default Footer
