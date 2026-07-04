"use client"

import type React from "react"

import { useState } from "react"
import styled, { keyframes } from "styled-components"
import DocumentGallery from "./DocumentGallery"

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

const ModalContainer = styled.div`
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 0.75rem;
  width: 450px; 
  height: auto; 
  max-height: 90vh; 
  overflow-y: auto;
  padding: 1.25rem;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  text-align: center;
  animation: ${slideIn} 0.4s ease-out;
  
  &:hover {
    border-color: rgba(255, 215, 0, 0.3);
    box-shadow: 0 6px 30px rgba(255, 215, 0, 0.15);
  }
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

const Title = styled.h5`
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

const Divider = styled.hr`
  border: none;
  border-top: 1px solid rgba(255, 215, 0, 0.1);
  margin: 1rem auto;
  width: 80%;
`

const Section = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(255, 215, 0, 0.3);
    transform: translateY(-5px);
  }

  h4 {
    font-size: 1.2rem;
    color: #FFD700;
    margin-bottom: 0.75rem;
    font-weight: bold;
  }

  p {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.5;
  }
`

const OptionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.9rem;

  li {
    margin: 0.5rem 0;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 215, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 215, 0, 0.1);
      transform: scale(1.05);
      cursor: pointer;
      border-color: rgba(255, 215, 0, 0.3);
    }

    span {
      display: block;
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.6);
      margin-top: 0.25rem;
    }
  }

  li ul {
    margin-top: 0.5rem;
    padding-left: 1rem;

    li {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 215, 0, 0.1);
      padding: 0.3rem 0.5rem;
      font-size: 0.85rem;
    }
  }
`

const ViewImagesButton = styled.button`
  background: linear-gradient(135deg, #FFD700, #c8ad75);
  color: #1a1a1a;
  border: none;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  }
`

interface ModalProps {
  isOpen: boolean
  toggleModal: () => void
}

const Modal: React.FC<ModalProps> = ({ isOpen, toggleModal }) => {
  const [isGalleryOpen, setGalleryOpen] = useState(false)

  const toggleGallery = () => setGalleryOpen(!isGalleryOpen)

  if (!isOpen) return null

  return (
    <>
      <Overlay>
        <ModalContainer>
          <CloseButton onClick={toggleModal}>&times;</CloseButton>
          <Title>درخواست عضویت و مدارک قابل صدور</Title>
          <Divider />
          <Section>
            <h4>درخواست عضویت</h4>
            <p>درخواست عضویت در پژوهشگاه دانش‌های معاملاتی</p>
          </Section>
          <Section>
            <h4>مدارک قابل صدور</h4>
            <p>موارد زیر برای شما قابل صدور هستند:</p>
            <OptionList>
              <li>
                کارت عضویت دوزبانه
                <span>هزینه: {Number(800000).toLocaleString("fa-IR")} تومان</span>
              </li>
              <li>
                گواهینامه عضویت دوزبانه
                <span>هزینه: {Number(1500000).toLocaleString("fa-IR")} تومان</span>
              </li>
              <li>
                اپلای و دریافت مدرک بین المللی UIUD
                <span>هزینه: $45</span>
              </li>
              <li>
                مدارک آکادمیک قابل ترجمه
                <ul>
                  <li>انگلستان URS</li>
                  <li>دانشگاه تهران</li>
                </ul>
              </li>
              <li>مدرک فنی حرفه‌ای قابل ترجمه</li>
            </OptionList>
          </Section>
          <ViewImagesButton onClick={toggleGallery}>مشاهده تصاویر مدارک</ViewImagesButton>
        </ModalContainer>
      </Overlay>

      <DocumentGallery isOpen={isGalleryOpen} toggleGallery={toggleGallery} />
    </>
  )
}

export default Modal
