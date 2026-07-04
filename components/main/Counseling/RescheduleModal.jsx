"use client"

import { useState } from "react"
import styled, { keyframes } from "styled-components"
import { FaTimes } from "react-icons/fa"

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

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
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
  width: 80%;
  max-width: 600px;
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
  margin-bottom: 1rem;
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

const Divider = styled.div`
  border: none;
  border-top: 1px solid rgba(255, 215, 0, 0.1);
  margin: 1.5rem 0;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
`

const DateBoxContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem 0;
  justify-content: flex-start;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 215, 0, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: #FFD700;
    border-radius: 2px;
  }
`

const DateBox = styled.div`
  min-width: 90px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.1);
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  color: rgba(255, 255, 255, 0.69);
  animation: ${fadeIn} 0.5s ease-out;

  &:hover {
    background: rgba(255, 215, 0, 0.1);
    border-color: rgba(255, 215, 0, 0.3);
    transform: translateY(-2px);
  }

  &.selected {
    background: linear-gradient(135deg, #FFD700, #c8ad75);
    border-color: #FFD700;
    color: #1a1a1a;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  }
`

const TimeSectionContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: space-around;
  gap: 1rem;
`

const TimeSection = styled.div`
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.1);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  text-align: center;
  width: 30%;
  color: rgba(255, 255, 255, 0.69);

  &.active {
    background: linear-gradient(135deg, #FFD700, #c8ad75);
    border-color: #FFD700;
    color: #1a1a1a;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  }

  &:hover {
    background: rgba(255, 215, 0, 0.1);
    border-color: rgba(255, 215, 0, 0.3);
    transform: translateY(-2px);
  }
`

const TimeSlotContainer = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
`

const TimeSlotButton = styled.button`
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.1);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  
  color: rgba(255, 255, 255, 0.69);

  &:hover {
    background: rgba(255, 215, 0, 0.1);
    border-color: rgba(255, 215, 0, 0.3);
    transform: translateY(-2px);
  }

  &.selected {
    background: linear-gradient(135deg, #FFD700, #c8ad75);
    border-color: #FFD700;
    color: #1a1a1a;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  }
`

const ReserveButton = styled.button`
  margin-top: 1.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #FFD700, #c8ad75);
  color: #1a1a1a;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  
  border-radius: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.5);
    cursor: not-allowed;
  }
`

const SuccessMessage = styled.p`
  margin-top: 1rem;
  color: #FFD700;
  animation: ${fadeIn} 0.5s ease-out;
`

const RescheduleModal = ({ isOpen, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(null)
  const [activeSection, setActiveSection] = useState("morning")
  const [selectedTime, setSelectedTime] = useState(null)
  const [isReserved, setIsReserved] = useState(false)

  const getDateForWeek = () => {
    const today = new Date()
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push({
        day: date.toLocaleDateString("fa-IR", { weekday: "long" }),
        date: date.toLocaleDateString("fa-IR", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }),
      })
    }
    return dates
  }

  const weekDates = getDateForWeek()

  const handleDateClick = (date) => {
    setSelectedDate(date)
    setIsReserved(false)
  }

  const handleSectionClick = (section) => {
    setActiveSection(section)
    setSelectedTime(null)
    setIsReserved(false)
  }

  const handleTimeClick = (time) => {
    setSelectedTime(time)
    setIsReserved(false)
  }

  const handleReserve = () => {
    if (selectedTime) {
      setIsReserved(true)
    }
  }

  const renderTimeSlots = () => {
    if (activeSection === "morning") {
      return ["۱۰:۰۰ صبح", "۱۱:۰۰ صبح", "۱۲:۰۰ ظهر"].map((time) => (
        <TimeSlotButton
          key={time}
          className={selectedTime === time ? "selected" : ""}
          onClick={() => handleTimeClick(time)}
        >
          {time}
        </TimeSlotButton>
      ))
    } else if (activeSection === "afternoon") {
      return ["۳:۰۰ بعدازظهر", "۴:۰۰ بعدازظهر", "۵:۰۰ بعدازظهر"].map((time) => (
        <TimeSlotButton
          key={time}
          className={selectedTime === time ? "selected" : ""}
          onClick={() => handleTimeClick(time)}
        >
          {time}
        </TimeSlotButton>
      ))
    } else if (activeSection === "night") {
      return ["۹:۰۰ شب", "۱۰:۰۰ شب", "۱۱:۰۰ شب"].map((time) => (
        <TimeSlotButton
          key={time}
          className={selectedTime === time ? "selected" : ""}
          onClick={() => handleTimeClick(time)}
        >
          {time}
        </TimeSlotButton>
      ))
    }
  }

  if (!isOpen) return null

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
        <Title>انتخاب زمان دیگری</Title>
        <Divider />

        <DateBoxContainer>
          {weekDates.map(({ day, date }) => (
            <DateBox key={day} className={selectedDate === day ? "selected" : ""} onClick={() => handleDateClick(day)}>
              {day} {date}
            </DateBox>
          ))}
        </DateBoxContainer>

        <TimeSectionContainer>
          <TimeSection
            className={activeSection === "morning" ? "active" : ""}
            onClick={() => handleSectionClick("morning")}
          >
            صبح
          </TimeSection>
          <TimeSection
            className={activeSection === "afternoon" ? "active" : ""}
            onClick={() => handleSectionClick("afternoon")}
          >
            بعدازظهر
          </TimeSection>
          <TimeSection
            className={activeSection === "night" ? "active" : ""}
            onClick={() => handleSectionClick("night")}
          >
            شب
          </TimeSection>
        </TimeSectionContainer>

        <TimeSlotContainer>{renderTimeSlots()}</TimeSlotContainer>

        <ReserveButton onClick={handleReserve} disabled={!selectedTime}>
          رزرو
        </ReserveButton>

        {isReserved && <SuccessMessage>رزرو با موفقیت انجام شد!</SuccessMessage>}
      </ModalContainer>
    </Overlay>
  )
}

export default RescheduleModal
