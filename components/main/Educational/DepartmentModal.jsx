"use client"
import styled, { keyframes } from "styled-components"
import { MdClose, MdChair, MdWifi, MdVideoLibrary } from "react-icons/md"

const blinkAnimation = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
`

const modalFadeIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 80%;
  max-width: 400px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-top: 70px;
  position: relative;
  animation: ${modalFadeIn} 0.5s ease-in-out;
`

const ModalTitle = styled.h2`
  // 
  font-size: 1.5rem;
  margin-bottom: 15px;
`

const CloseIcon = styled(MdClose)`
  position: absolute;
  top: 15px;
  right: 15px;
  transition: color 0.3s;
  background: transparent;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  padding: 0.25rem;
  color: #c8ad75;

  &:hover {
    color: #83704c;
  }
`

const BoxContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`

const Box = styled.div`
  margin-bottom: 20px;
  background-color: #f9f9f9;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  text-align: center;
`

const BoxIcon = styled.div`
  font-size: 2.5rem;
  color: #c8ad75;
  margin-bottom: 10px;
  animation: ${blinkAnimation} 1.5s infinite ease-in-out;
`

const BoxTitle = styled.h3`
   
  font-size: 1.2rem;
  margin-bottom: 5px;
`

const BoxDescription = styled.p`
   
  font-size: 1rem;
  color: #666;
`

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 1.5rem 0;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
`

const DepartmentModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalTitle>دپارتمان آموزش</ModalTitle>
        <Divider />
        <CloseIcon onClick={onClose} />

        <BoxContainer>
          <Box>
            <BoxIcon>
              <MdChair />
            </BoxIcon>
            <BoxTitle>دوره های حضوری</BoxTitle>
            <BoxDescription>با شبکه سازی گسترده</BoxDescription>
          </Box>

          <Box>
            <BoxIcon>
              <MdWifi />
            </BoxIcon>
            <BoxTitle>دوره های آنلاین</BoxTitle>
            <BoxDescription>با قابلیت ضبط کلاس</BoxDescription>
          </Box>

          <Box>
            <BoxIcon>
              <MdVideoLibrary />
            </BoxIcon>
            <BoxTitle>دوره های ویدیویی</BoxTitle>
            <BoxDescription>به تناسب نیاز شما</BoxDescription>
          </Box>
        </BoxContainer>
      </ModalContainer>
    </ModalOverlay>
  )
}

export default DepartmentModal
