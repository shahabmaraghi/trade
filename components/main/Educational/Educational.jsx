"use client"

import { useState } from "react"
import styled, { keyframes, createGlobalStyle } from "styled-components"
import Image from "next/image"

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #1a1a1a;
    color: rgba(255, 255, 255, 0.69);
  }
`

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

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
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

const BoxContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  margin: 70px;
  margin-top: 30px;
  margin-bottom: 2rem;
  height: auto;
  animation: ${fadeIn} 1s ease-out;

  @media (max-width: 1024px) {
    flex-wrap: wrap;
    margin: 20px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    margin: 20px;
  }
`

const Box = styled.div`
  flex: 1 1 30%;  
  padding: 20px;
  margin: 10px;
  text-align: center;
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(255, 215, 0, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 1s ease-out;
  animation-delay: ${(props) => props.index * 0.2}s;
  opacity: 0;
  animation-fill-mode: forwards;

  transition: all 0.4s ease;

  &:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 6px 30px rgba(255, 215, 0, 0.15);
    border-color: rgba(255, 215, 0, 0.3);
    cursor: pointer;
  }

  @media (max-width: 1024px) {
    flex: 1 1 45%;
    margin-bottom: 20px;
  }

  @media (max-width: 768px) {
    flex: 1 1 90%;
    margin-bottom: 20px;
  }
`

const BoxImage = styled.img`
  width: 100%;
  height: 500px;  
  object-fit: cover; 
  margin-bottom: 15px;
  border-radius: 10px;
  transition: all 0.4s ease;

  &:hover {
    transform: scale(1.03);
    box-shadow: 0 8px 20px rgba(255, 215, 0, 0.2);
  }
`

const BoxTitle = styled.h3`
  
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`

const BoxDescription = styled.p`
  
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.69);
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 40px 0;
  animation: ${fadeIn} 1s ease-out;
`

const DecorativeLine = styled.div`
  height: 2px;
  width: 100px;
  background: linear-gradient(90deg, ${(props) =>
    props.direction === "left" ? "transparent, #FFD700" : "#FFD700, transparent"});
  position: relative;
  animation: ${slideIn} 1s ease-out;
  opacity: 0.6;

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
  
  font-size: 2.5rem;
  margin: 0;
  padding: 0 20px;
  background: linear-gradient(90deg, #FFD700, #FFF, #FFD700);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 3s linear infinite;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`

const Educational = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen)
  }

  return (
    <>
      <GlobalStyle precedence="default" />
      <TitleContainer>
        <DecorativeLine direction="left" />
        <SectionTitle>دپارتمان ها</SectionTitle>
        <DecorativeLine direction="right" />
      </TitleContainer>

      <BoxContainer>
        <Box index={0}>
          <Image
            alt="دپارتمان هوش مصنوعی"
            src={"/main/assets/images/Educational/2.jpg"}
            style={{
              width: "100%",
              height: "500px",
              objectFit: "cover",
              marginBottom: "15px",
              borderRadius: "10px",
              transition: "all 0.4s ease",
              "&:hover": {
                transform: "scale(1.03)",
                boxShadow: "0 8px 20px rgba(255, 215, 0, 0.2)",
              },
            }}
            width={500}
            height={500}
          />
          <BoxTitle>دپارتمان هوش مصنوعی</BoxTitle>
          <BoxDescription>
            تمرکز بر تولید سامانه های مبتنی بر هوش مصنوعی قرار داده وبا به کارگیری فناوری های نوین ومنابع انسانی
          </BoxDescription>
        </Box>

        <Box index={1}>
          <Image
            alt="دپارتمان کارآفرینی"
            src={"/main/assets/images/Educational/3.jpg"}
            style={{
              width: "100%",
              height: "500px",
              objectFit: "cover",
              marginBottom: "15px",
              borderRadius: "10px",
              transition: "all 0.4s ease",
              "&:hover": {
                transform: "scale(1.03)",
                boxShadow: "0 8px 20px rgba(255, 215, 0, 0.2)",
              },
            }}
            width={500}
            height={500}
          />
          <BoxTitle>دپارتمان کارآفرینی</BoxTitle>
          <BoxDescription>
            توانمندسازی و فراهم آوردن زمینه های توسعه پایدار،همراه با گروهی از سرمایه گذاران برروی شرکت های نوپا حوزه
            بلاکچین
          </BoxDescription>
        </Box>
      </BoxContainer>
    </>
  )
}

export default Educational
