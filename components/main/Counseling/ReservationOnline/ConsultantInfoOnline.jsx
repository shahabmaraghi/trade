"use client"

import { useState } from "react"
import styled, { keyframes } from "styled-components"
import { FaCircle } from "react-icons/fa"

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

const Title = styled.h3`
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
  top: 0.5rem;
  right: 0.5rem;

  &:hover {
    color: #c8ad75;
    transform: scale(1.2);
  }
`

const Divider = styled.hr`
  border: none;
  border-top: 1px solid rgba(255, 215, 0, 0.1);
  margin: 1rem 0;
  width: 90%;
`

const StatusContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
`

const StatusText = styled.p`
  font-size: 1rem;
  color: #4caf50;
  font-weight: bold;
`

const GreenLightIcon = styled(FaCircle)`
  color: #4caf50;
  font-size: 1rem;
  animation: ${blinkAnimation} 1.5s infinite;
`

const InfoText = styled.p`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  margin-top: 1rem;
  text-align: center;
`

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  margin-top: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.1);
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: rgba(255, 215, 0, 0.3);
    box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`

const AddressText = styled.p`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  margin-top: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.1);
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
`

const PriceText = styled.p`
  font-size: 1.25rem;
  color: #FFD700;
  font-weight: bold;
  margin-top: 1rem;
`

const FreeTimeText = styled.p`
  font-size: 1rem;
  color: #4caf50;
  font-weight: bold;
  margin-top: 0.5rem;
  text-align: center;
`

const StartVisitButton = styled.button`
  margin-top: 1rem;
  padding: 0.75rem 1.25rem;
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

const toPersianNumbers = (num) => {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
  return num
    .toString()
    .split("")
    .map((digit) => persianDigits[Number.parseInt(digit, 10)] || digit)
    .join("")
}

const ConsultantInfoModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [date, setDate] = useState("")

  const paymentLink = "https://payment-gateway.com/pay"

  const handleStartVisit = () => {
    window.location.href = paymentLink
  }

  const handleInputChange = (setter) => (e) => setter(e.target.value)

  const address = "تهران، خیابان ولیعصر، پلاک 100، واحد 10"
  const price = 900000
  const formattedPrice = toPersianNumbers(price.toLocaleString())

  if (!isOpen) return null

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <Title>مشاوره حضوری</Title>

        <Divider />

        <StatusContainer>
          <GreenLightIcon />
          <StatusText>در حال حاضر پذیرش مشاوره حضوری</StatusText>
        </StatusContainer>

        <InfoText>لطفا اطلاعات خود را وارد کنید تا بتوانید مشاوره حضوری رزرو کنید.</InfoText>

        <Input type="text" placeholder="نام و نام خانوادگی" value={name} onChange={handleInputChange(setName)} />
        <Input type="tel" placeholder="شماره تماس" value={phone} onChange={handleInputChange(setPhone)} />
        <Input type="date" value={date} onChange={handleInputChange(setDate)} />

        <AddressText>{address}</AddressText>

        <FreeTimeText>نیم ساعت اول مشاوره رایگان است.</FreeTimeText>
        <PriceText>قیمت مشاوره: {formattedPrice} تومان</PriceText>

        <StartVisitButton onClick={handleStartVisit}>شروع مشاوره حضوری</StartVisitButton>
      </ModalContainer>
    </Overlay>
  )
}

export default ConsultantInfoModal
