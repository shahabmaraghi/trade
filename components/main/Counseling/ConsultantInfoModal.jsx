"use client"
import styled, { keyframes } from "styled-components"
import { FaCircle, FaWhatsapp } from "react-icons/fa"

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

const blinkAnimation = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
  animation: ${fadeIn} 0.3s ease-out;
`

const ModalContainer = styled.div`
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 0.75rem;
  width: 350px;
  padding: 1.5rem;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: relative;
  
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
  color: #FFD700;
  position: absolute;
  top: 10px;
  right: 10px;
  transition: all 0.3s ease;

  &:hover {
    color: #c8ad75;
    transform: scale(1.2);
  }
`

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #FFD700, #FFF, #FFD700);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 3s linear infinite;
`

const StatusContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  color: rgba(255, 255, 255, 0.69);
`

const StatusText = styled.p`
  font-size: 1rem;
  color: #4caf50;
  font-weight: bold;
`

const PriceText = styled.p`
  font-size: 1rem;
  color: #FFD700;
  font-weight: bold;
`

const GreenLightIcon = styled(FaCircle)`
  color: #4caf50;
  font-size: 1rem;
  animation: ${blinkAnimation} 1.5s infinite;
`

const Divider = styled.hr`
  border: none;
  border-top: 1px solid rgba(255, 215, 0, 0.1);
  margin: 1.5rem 0;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
`

const InfoText = styled.p`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.69);
  line-height: 1.5;
  margin-top: 1rem;
  text-align: center;
`

const WhatsAppButton = styled.a`
  position: absolute;
  bottom: 290px;
  left: 10px;
  background-color: #25d366;
  color: white;
  border-radius: 50%;
  padding: 0.75rem;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  animation: ${blinkAnimation} 1.5s infinite;
  box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);

  &:hover {
    background-color: #128c7e;
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
  }
`

const StartVisitButton = styled.button`
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #FFD700, #c8ad75);
  color: #1a1a1a;
  font-size: 1rem;
  border: none;
  border-radius: 0.5rem;
  
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  }
`

const ConsultantInfoModal = ({ isOpen, onClose }) => {
  const whatsappLink = "https://wa.me/989123456789"
  const paymentLink = "https://payment-gateway.com/pay"

  const handleStartVisit = () => {
    window.location.href = paymentLink
  }

  if (!isOpen) return null

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <Title>همین الان آنلاین ویزیت شوید</Title>
        <StatusContainer>
          <GreenLightIcon />
          <StatusText>در حال حاضر آنلاین</StatusText>
          <PriceText>- 300,000 تومان</PriceText>
        </StatusContainer>
        <Divider />
        <InfoText>
          ویزیت آنلاین در پیام رسان :<br />
          تضمین بازپرداخت مبلغ ویزیت در صورت نارضایتی <br />
          امکان برقراری تماس با این پزشک وجود دارد. <br />
          تا ۳ روز میتوانید هر سوالی دارید از مشاور بپرسید.
        </InfoText>

        <StartVisitButton onClick={handleStartVisit}>شروع ویزیت با مشاور</StartVisitButton>

        <WhatsAppButton href={whatsappLink} target="_blank">
          <FaWhatsapp />
        </WhatsAppButton>
      </ModalContainer>
    </Overlay>
  )
}

export default ConsultantInfoModal
