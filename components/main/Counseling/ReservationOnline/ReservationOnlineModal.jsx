"use client"

// eslint-disable-next-line no-unused-vars
import { useState } from "react"
import styled, { keyframes } from "styled-components"
import { FaSearch, FaCalendarAlt } from "react-icons/fa"
import ConsultantInfoModal from "./ConsultantInfoOnline"
import ScheduleConsultationModal from "../ScheduleConsultationModal"
import IntroduceConsultantsModal from "./IntroduceConsultantsOnline"
import ConsultantScheduleModal from "./ConsultantScheduleOnline"
import UserCommentsModal from "../UserCommentsModal"

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

const float = keyframes`
  0% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
  100% {
    transform: translateY(0) rotate(0deg);
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

const LogoContainer = styled.div`
  position: absolute;
  top: -2.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #FFD700, #c8ad75);
  border-radius: 50%;
  padding: 0.5rem;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
  animation: ${float} 3s ease-in-out infinite;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid rgba(255, 215, 0, 0.1);
  padding-bottom: 0.75rem;
  margin: 1.25rem 0;
  margin-top: 2rem;
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
  top: -3rem;
  right: -0.5rem;

  &:hover {
    color: #c8ad75;
    transform: scale(1.2);
  }
`

const SearchBoxContainer = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid rgba(255, 215, 0, 0.1);
  padding: 0.25rem 0.75rem;
  margin-top: 1rem;
  position: relative;
  animation: ${fadeIn} 0.4s ease-out;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;

  &:hover {
    border-color: rgba(255, 215, 0, 0.3);
  }
`

const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  padding: 0.5rem 0.5rem 0.5rem 3rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  
  background: transparent;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`

const SearchIcon = styled(FaSearch)`
  color: #FFD700;
  font-size: 1.25rem;
  position: absolute;
  left: 0.75rem;
  cursor: pointer;
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
  cursor: pointer;
  transition: all 0.3s ease;
  
  border-radius: 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 215, 0, 0.3);
    transform: translateY(-2px);
  }
`

const Highlight = styled.span`
  color: #FFD700;
  font-weight: bold;
`

const ModalButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1.5rem;
`

const Button = styled.button`
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  
  color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.5rem;

  &:focus {
    outline: none;
  }

  ${(props) =>
    props.primary
      ? `
    background: linear-gradient(135deg, #FFD700, #c8ad75);
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
    }
  `
      : props.secondary
        ? `
    background: linear-gradient(135deg, #c8ad75, #83704c);
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(200, 173, 117, 0.3);
    }
  `
        : props.danger
          ? `
    background: linear-gradient(135deg, #2c2c2c, #1a1a1a);
    color: #FFD700;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }
  `
          : `
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.9);
    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }
  `}
`

const BlinkIcon = styled(FaCalendarAlt)`
  animation: ${float} 2s infinite;
  font-size: 1.25rem;
`

// eslint-disable-next-line react/prop-types
const Modal = ({ isOpen, onClose }) => {
  const [searchText, setSearchText] = useState("")
  const [isConsultantModalOpen, setConsultantModalOpen] = useState(false)
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [isIntroduceConsultantsModalOpen, setIntroduceConsultantsModalOpen] = useState(false)
  const [isConsultantScheduleModalOpen, setConsultantScheduleModalOpen] = useState(false)
  const [isUserCommentsModalOpen, setUserCommentsModalOpen] = useState(false)

  if (!isOpen) return null

  return (
    <>
      <Overlay onClick={onClose}>
        <ModalContainer onClick={(e) => e.stopPropagation()}>
          <LogoContainer>
            <Image
              alt="Logo"
              src={"/main/assets/images/Logo/Logo-replacement.png"}
              style={{ width: "4rem", height: "4rem", borderRadius: "50%", objectFit: "cover" }}
              width={64}
              height={64}
            />
          </LogoContainer>
          <ModalHeader>
            <ModalTitle>گروه مشاوران مالی و سرمایه گذاری پلاس چارت</ModalTitle>
            <CloseButton onClick={onClose}>&times;</CloseButton>
          </ModalHeader>

          <SearchBoxContainer>
            <SearchInput
              type="text"
              placeholder="نام مشاور \ تخصص"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <SearchIcon />
          </SearchBoxContainer>

          <MessageBox onClick={() => setConsultantModalOpen(true)}>
            می‌خواهم همین امروز مشاوره <Highlight>فوری</Highlight> داشته باشم
          </MessageBox>

          <ModalButtonsContainer>
            <Button primary onClick={() => setScheduleModalOpen(true)}>
              انتخاب زمان مشاوره
            </Button>
            <Button danger onClick={() => setIntroduceConsultantsModalOpen(true)}>
              معرفی مشاورین
            </Button>
            <Button secondary onClick={() => setConsultantScheduleModalOpen(true)}>
              <BlinkIcon />
              تقویم برنامه کاری مشاورین
            </Button>

            <Button onClick={() => setUserCommentsModalOpen(true)} primary>
              نظرات کاربران
            </Button>
          </ModalButtonsContainer>
        </ModalContainer>
      </Overlay>

      {/* مدال‌ها */}
      <ConsultantInfoModal isOpen={isConsultantModalOpen} onClose={() => setConsultantModalOpen(false)} />
      <ScheduleConsultationModal isOpen={isScheduleModalOpen} onClose={() => setScheduleModalOpen(false)} />
      <IntroduceConsultantsModal
        isOpen={isIntroduceConsultantsModalOpen}
        onClose={() => setIntroduceConsultantsModalOpen(false)}
      />
      <ConsultantScheduleModal
        isOpen={isConsultantScheduleModalOpen}
        onClose={() => setConsultantScheduleModalOpen(false)}
      />

      <UserCommentsModal isOpen={isUserCommentsModalOpen} onClose={() => setUserCommentsModalOpen(false)} />
    </>
  )
}

export default Modal
