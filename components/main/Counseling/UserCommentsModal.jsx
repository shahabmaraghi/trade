"use client"
import styled, { keyframes } from "styled-components"
import { FaTimes } from "react-icons/fa"

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
  width: 400px;
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

const ModalHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid rgba(255, 215, 0, 0.1);
  padding-bottom: 0.75rem;
  margin: 1.25rem 0;
  position: relative;
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
  top: -1rem;
  right: -1rem;

  &:hover {
    color: #c8ad75;
    transform: scale(1.2);
  }
`

const MessageBox = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.1);
  padding: 1rem;
  margin-top: 1rem;
  text-align: center;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  
  border-radius: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 215, 0, 0.3);
    transform: translateY(-2px);
  }

  p {
    margin: 0.5rem 0;
  }
`

const UserCommentsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>نظرات کاربران</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <MessageBox>
          <p>در اینجا می‌توانید نظرات کاربران را مشاهده کنید.</p>
          <p>برای هر سوال یا مشکلی می‌توانید نظرات خود را در این بخش بنویسید و از مشاوران کمک بگیرید.</p>
        </MessageBox>
      </ModalContainer>
    </Overlay>
  )
}

export default UserCommentsModal
