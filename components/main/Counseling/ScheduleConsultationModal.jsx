"use client"

import { useState } from "react"
import styled, { keyframes } from "styled-components"
import { FaTimes } from "react-icons/fa"
import moment from "moment-jalaali"
import RescheduleModal from "./RescheduleModal"
import Select from "react-select"

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

const Divider = styled.hr`
  border: none;
  border-top: 1px solid rgba(255, 215, 0, 0.1);
  margin: 1.5rem 0;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
`

const DateText = styled.p`
  color: rgba(255, 255, 255, 0.9);
  margin: 0.5rem 0;
  font-size: 1rem;
  animation: ${fadeIn} 0.5s ease-out;
`

const TimeSelection = styled.div`
  margin-top: 2rem;
  animation: ${fadeIn} 0.5s ease-out;
`

const Button = styled.button`
  margin-top: 1rem;
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

  animation: ${fadeIn} 0.5s ease-out;
`

const AdditionalButton = styled(Button)`
  background: linear-gradient(135deg, #c8ad75, #83704c);
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;

  &:hover {
    background: linear-gradient(135deg, #83704c, #665939);
  }
`

const ScheduleConsultationModal = ({ isOpen, onClose }) => {
  const [selectedTime, setSelectedTime] = useState("")
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)

  const handleTimeChange = (selectedOption) => {
    setSelectedTime(selectedOption.value)
  }

  const handleSubmit = () => {
    alert(`مشاوره برای ساعت ${selectedTime} انتخاب شد.`)
    onClose()
  }

  const handleAdditionalTimeClick = () => {
    setIsRescheduleOpen(true)
  }

  moment.locale("fa")
  const currentDate = moment().format("jYYYY/jMM/jDD")

  const daysOfWeek = {
    Sunday: "یکشنبه",
    Monday: "دوشنبه",
    Tuesday: "سه‌شنبه",
    Wednesday: "چهارشنبه",
    Thursday: "پنج‌شنبه",
    Friday: "جمعه",
    Saturday: "شنبه",
  }

  const currentDay = daysOfWeek[moment().format("dddd")]

  const timeOptions = [
    { value: "9:00 AM", label: "۹:۰۰ صبح" },
    { value: "10:00 AM", label: "۱۰:۰۰ صبح" },
    { value: "11:00 AM", label: "۱۱:۰۰ صبح" },
    { value: "12:00 PM", label: "۱۲:۰۰ ظهر" },
    { value: "1:00 PM", label: "۱:۰۰ بعدازظهر" },
    { value: "2:00 PM", label: "۲:۰۰ بعدازظهر" },
    { value: "3:00 PM", label: "۳:۰۰ بعدازظهر" },
    { value: "4:00 PM", label: "۴:۰۰ بعدازظهر" },
  ]

  const customStyles = {
    control: (provided) => ({
      ...provided,
      padding: "0.5rem",
      borderRadius: "0.5rem",
      borderColor: "rgba(255, 215, 0, 0.3)",
      boxShadow: "none",
      backgroundColor: "rgba(26, 26, 26, 0.8)",
      fontFamily: "'IBM Plex Sans Arabic', sans-serif",
      transition: "all 0.3s ease",
      color: "white",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "rgba(26, 26, 26, 0.95)",
      borderRadius: "0.5rem",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
      border: "1px solid rgba(255, 215, 0, 0.1)",
    }),
    option: (provided, state) => ({
      ...provided,
      padding: "10px",
      fontSize: "1rem",
      backgroundColor: state.isSelected
        ? "rgba(255, 215, 0, 0.2)"
        : state.isFocused
          ? "rgba(255, 215, 0, 0.1)"
          : "transparent",
      color: state.isSelected ? "#FFD700" : "rgba(255, 255, 255, 0.9)",
      cursor: "pointer",
      transition: "all 0.3s ease",
      "&:hover": {
        backgroundColor: "rgba(255, 215, 0, 0.1)",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "rgba(255, 255, 255, 0.9)",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "rgba(255, 255, 255, 0.5)",
      fontSize: "1rem",
    }),
    input: (provided) => ({
      ...provided,
      color: "rgba(255, 255, 255, 0.9)",
    }),
  }

  if (!isOpen) return null

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
        <Title>انتخاب زمان نوبت</Title>
        <Divider />

        <DateText>تاریخ امروز: {currentDate}</DateText>
        <DateText>روز هفته: {currentDay}</DateText>

        <TimeSelection>
          <Select
            options={timeOptions}
            onChange={handleTimeChange}
            value={timeOptions.find((option) => option.value === selectedTime)}
            placeholder="زودترین زمان نوبت خالی"
            styles={customStyles}
          />
        </TimeSelection>

        <AdditionalButton onClick={handleAdditionalTimeClick}>انتخاب زمان دیگری</AdditionalButton>

        <Button onClick={handleSubmit} disabled={!selectedTime}>
          تایید انتخاب زمان
        </Button>
      </ModalContainer>

      <RescheduleModal isOpen={isRescheduleOpen} onClose={() => setIsRescheduleOpen(false)} />
    </Overlay>
  )
}

export default ScheduleConsultationModal
