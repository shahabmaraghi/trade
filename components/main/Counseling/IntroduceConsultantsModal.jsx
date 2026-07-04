"use client"
import styled, { keyframes } from "styled-components"

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
  border-radius: 1rem;
  width: 420px;
  padding: 1.5rem;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  text-align: center;
  animation: ${slideIn} 0.4s ease-out;

  &:hover {
    border-color: rgba(255, 215, 0, 0.3);
    box-shadow: 0 6px 30px rgba(255, 215, 0, 0.15);
  }
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid rgba(255, 215, 0, 0.1);
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  position: relative;
`

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  
  text-align: center;
  background: linear-gradient(90deg, #FFD700, #FFF, #FFD700);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 3s linear infinite;
`

const ModalContent = styled.div`
  font-size: 0.9rem;
  
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.69);
  text-align: right;

  p {
    margin-bottom: 1.5rem;
  }
`

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #FFD700;
  position: absolute;
  top: -1rem;
  right: 0;
  transition: all 0.3s ease;

  &:hover {
    color: #c8ad75;
    transform: scale(1.2);
  }
`

const ConsultantList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  margin-top: 5px;
`

const ConsultantItem = styled.li`
  margin-bottom: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(255, 215, 0, 0.1);
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 215, 0, 0.1);
    border-color: rgba(255, 215, 0, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.1);
  }
`

const ConsultantName = styled.span`
  font-weight: bold;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.69);
`

const ResumeLink = styled.a`
  background: linear-gradient(135deg, #FFD700, #c8ad75);
  color: #1a1a1a;
  text-decoration: none;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 0.25rem;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
    background: linear-gradient(135deg, #c8ad75, #FFD700);
  }
`

const IntroduceConsultantsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>معرفی مشاورین</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ModalContent>
          <p>در این بخش می‌توانید لیست مشاورین را مشاهده کرده و اطلاعات بیشتری کسب کنید.</p>
          <ConsultantList>
            <ConsultantItem>
              <ConsultantName>مهندس عزیزی</ConsultantName>
              <ResumeLink href="/path-to-resume/Azizi_Resume.pdf" target="_blank" rel="noopener noreferrer">
                دانلود رزومه
              </ResumeLink>
            </ConsultantItem>
            <ConsultantItem>
              <ConsultantName>دکتر زندیان</ConsultantName>
              <ResumeLink href="/path-to-resume/Zandian_Resume.pdf" target="_blank" rel="noopener noreferrer">
                دانلود رزومه
              </ResumeLink>
            </ConsultantItem>
            <ConsultantItem>
              <ConsultantName>مهندس رزم‌آرا</ConsultantName>
              <ResumeLink href="/path-to-resume/Razmara_Resume.pdf" target="_blank" rel="noopener noreferrer">
                دانلود رزومه
              </ResumeLink>
            </ConsultantItem>
          </ConsultantList>
        </ModalContent>
      </ModalContainer>
    </Overlay>
  )
}

export default IntroduceConsultantsModal
