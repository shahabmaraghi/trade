"use client"

/* eslint-disable no-unused-vars */
import { useState } from "react"
import styled, { keyframes } from "styled-components"
import ReservationOnlineModal from "../Counseling/ReservationOnline/ReservationOnlineModal"
import ReservationOfflineModal from "../Counseling/ReservationOfflineModal"
import { useRouter } from "next/navigation"

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const slideIn = keyframes`
  from {
    width: 0;
  }
  to {
    width: 100px;
  }
`

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
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

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`

const CounselingContainer = styled.div`
  width: calc(100% - 40px);
  margin: 20px;
  padding: 20px;
  border-radius: 16px;
  
  text-align: center;
  background: #181818;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 1s ease-out;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
`

const DecorativeLine = styled.div`
  height: 2px;
  width: 100px;
  background: linear-gradient(90deg, ${(props) =>
    props.direction === "left" ? "transparent, #FFD700" : "#FFD700, transparent"});
  position: relative;
  animation: ${slideIn} 1s ease-out;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    ${(props) => (props.direction === "left" ? "right: -10px" : "left: -10px")};
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
  
  }
`

const SectionTitle = styled.h2`
  
  font-size: 2.2rem;
  margin: 0;
  padding: 0 20px;
  background: linear-gradient(90deg, #FFD700, #FFF, #FFD700);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 3s linear infinite;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`

const StrongText = styled.strong`
  display: block;
  margin: 30px 0;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.69);
  animation: ${float} 3s ease-in-out infinite;
`

const BoxContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 50px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`

const Box = styled.div`
  flex: 0.2;
  padding: 20px;
  background: linear-gradient(45deg, #212121, #323232);
  color: #fcffe4;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: #b9ae71;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.15);
    animation: ${pulse} 1s ease-in-out;
  }
`

const ReservationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
  gap: 15px;
  opacity: 0;
  animation: ${fadeIn} 0.5s ease-out forwards;
  animation-delay: 0.5s;
`

const ReservationText = styled.div`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.69);
`

const Button = styled.button`
 padding: 12px 24px;
  color: #fcffe4;
  background: linear-gradient(45deg, #212121, #323232);
  border: none;
  border-radius: 8px;
  border-bottom: 2px solid #b9ae71;
  cursor: pointer;
  
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      120deg,
      transparent,
      rgba(255, 215, 0, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  &:hover {
    background: linear-gradient(45deg, #ffd700, #b9ae71);
    transform: translateY(-3px);
    border-bottom: 2px solid #fff;
    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
    color: #212121;

    &:before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px);
  }
`

const Counseling = () => {
  const [isOnlineModalOpen, setOnlineModalOpen] = useState(false)
  const [isOfflineModalOpen, setOfflineModalOpen] = useState(false)
  const router = useRouter()

  const handleReservationClick = () => {
    router.push("/reservation")
  }

  return (
    <>
      <CounselingContainer>
        <TitleContainer>
          <DecorativeLine direction="left" />
          <SectionTitle>مشاوره</SectionTitle>
          <DecorativeLine direction="right" />
        </TitleContainer>

        <StrongText >حرفه‌ای‌ترین‌ها هم گاهی لحظات سختی دارند، خوشحال می‌شویم با ما صحبت کنید.</StrongText>

        <BoxContainer>
          <Box>تیم چندمهارتی حرفه‌ای</Box>
          <Box>پاسخ‌گویی دوستانه و ساده</Box>
          <Box>پاسخ‌گویی در تمامی روزهای سال</Box>
        </BoxContainer>

        <ReservationContainer>
          <ReservationText>رزرو تایم :</ReservationText>
          <Button onClick={handleReservationClick}>رزرو وقت مشاوره</Button>
        </ReservationContainer>
      </CounselingContainer>

      <ReservationOnlineModal isOpen={isOnlineModalOpen} onClose={() => setOnlineModalOpen(false)} />

      <ReservationOfflineModal isOpen={isOfflineModalOpen} onClose={() => setOfflineModalOpen(false)} />
    </>
  )
}

export default Counseling
