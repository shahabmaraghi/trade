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
  width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 2rem;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  text-align: right;
  animation: ${slideIn} 0.4s ease-out;
  margin-top: 50px;

  &:hover {
    border-color: rgba(255, 215, 0, 0.3);
    box-shadow: 0 6px 30px rgba(255, 215, 0, 0.15);
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 215, 0, 0.3);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 215, 0, 0.5);
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

const ScheduleTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  
  margin-top: 1rem;

  th, td {
    padding: 1rem;
    text-align: center;
    border: 1px solid rgba(255, 215, 0, 0.1);
    transition: all 0.3s ease;
  }

  th {
    background: linear-gradient(135deg, #FFD700, #c8ad75);
    color: #1a1a1a;
    font-weight: bold;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  td {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.69);
  }

  tr:hover td {
    background: rgba(255, 215, 0, 0.1);
    border-color: rgba(255, 215, 0, 0.3);
    transform: scale(1.01);
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.1);
  }

  tbody tr {
    transition: all 0.3s ease;
  }

  tbody tr:nth-child(even) td {
    background: rgba(255, 255, 255, 0.02);
  }
`

const ConsultantScheduleModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>تقویم برنامه کاری مشاورین</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ScheduleTable>
          <thead>
            <tr>
              <th>مشاور</th>
              <th>روز</th>
              <th>ساعت</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>مهندس عزیزی</td>
              <td>شنبه</td>
              <td>۲۳:۰۰ - ۱۰:۰۰</td>
            </tr>
            <tr>
              <td>مهندس عزیزی</td>
              <td>یکشنبه</td>
              <td>۲۳:۰۰ - ۱۰:۰۰</td>
            </tr>
            <tr>
              <td>مهندس عزیزی</td>
              <td>دوشنبه</td>
              <td>۲۳:۰۰ - ۱۰:۰۰</td>
            </tr>
            <tr>
              <td>مهندس عزیزی</td>
              <td>سه‌شنبه</td>
              <td>۲۳:۰۰ - ۱۰:۰۰</td>
            </tr>
            <tr>
              <td>مهندس عزیزی</td>
              <td>چهارشنبه</td>
              <td>۲۳:۰۰ - ۱۰:۰۰</td>
            </tr>
            <tr>
              <td>دکتر زندیان</td>
              <td>شنبه</td>
              <td>۲۳:۰۰ - ۱۰:۰۰</td>
            </tr>
            <tr>
              <td>دکتر زندیان</td>
              <td>یکشنبه</td>
              <td>۲۳:۰۰ - ۱۰:۰۰</td>
            </tr>
            <tr>
              <td>دکتر زندیان</td>
              <td>دوشنبه</td>
              <td>۲۳:۰۰ - ۱۰:۰۰</td>
            </tr>
            <tr>
              <td>دکتر زندیان</td>
              <td>سه‌شنبه</td>
              <td>۲۳:۰۰ - ۱۰:۰۰</td>
            </tr>
            <tr>
              <td>دکتر زندیان</td>
              <td>چهارشنبه</td>
              <td>۲۳:۰۰ - ۱۰:۰۰</td>
            </tr>
            <tr>
              <td>مهندس رزم‌آرا</td>
              <td>شنبه</td>
              <td>۲۳:۰۰ - ۱۰:۰۰</td>
            </tr>
            <tr>
              <td>مهندس رزم‌آرا</td>
              <td>یکشنبه</td>
              <td>۲۳:۰۰ - ۱۰:۰۰</td>
            </tr>
            <tr>
              <td>مهندس رزم‌آرا</td>
              <td>دوشنبه</td>
              <td>۲۳:۰۰ - ۱۰:۰۰</td>
            </tr>
            <tr>
              <td>مهندس رزم‌آرا</td>
              <td>سه‌شنبه</td>
              <td>۲۳:۰۰ - ۱۰:۰۰</td>
            </tr>
            <tr>
              <td>مهندس رزم‌آرا</td>
              <td>چهارشنبه</td>
              <td>۲۳:۰۰ - ۱۰:۰۰</td>
            </tr>
          </tbody>
        </ScheduleTable>
      </ModalContainer>
    </Overlay>
  )
}

export default ConsultantScheduleModal
