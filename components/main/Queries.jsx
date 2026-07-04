"use client"

import styled, { keyframes, createGlobalStyle } from "styled-components"
import "@fortawesome/fontawesome-free/css/all.min.css"

const GlobalStyle = createGlobalStyle`
  body {
   
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

const iconPulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`

const MainContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 70px auto;
  margin-top: 100px;
  margin-bottom: 2rem;
  max-width: 1200px;
  min-height: 400px;
  gap: 30px;
  padding: 0 20px;
  animation: ${fadeIn} 1.5s ease-in-out;

  @media (max-width: 1024px) {
    padding: 0 50px;
    gap: 20px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 0 20px;
    margin-top: 60px;
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

const Box = styled.div`
  position: relative;
  flex: 1;
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(10px);
  padding: 80px 20px 30px;
  min-height: 300px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.4s ease;
  opacity: 0;
  animation: ${fadeIn} 0.8s ease-out forwards;
  animation-delay: ${(props) => props.index * 0.2}s;

  &:hover {
    transform: translateY(-10px);
    border-color: rgba(255, 215, 0, 0.3);
    box-shadow: 0 6px 30px rgba(255, 215, 0, 0.15);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 2px solid transparent;
    transition: all 0.4s ease;
  }

  &:hover::before {
    border-color: rgba(255, 215, 0, 0.2);
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    margin: 40px 0;
    padding: 60px 20px 30px;
  }
`

const IconWrapper = styled.div`
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #FFD700, #c8ad75);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1a1a;
  font-size: 2rem;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
  transition: all 0.3s ease;
  animation: ${float} 3s ease-in-out infinite;

  i {
    animation: ${iconPulse} 2s ease-in-out infinite;
  }

  &:hover {
    transform: translateX(-50%) rotate(15deg);
    box-shadow: 0 6px 25px rgba(255, 215, 0, 0.4);
  }
`

const TextContainer = styled.div`
  padding: 20px;
  text-align: center;
  
`

const Title = styled.h2`
  margin: 15px 0;
  font-size: 1.4rem;
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);

  &::after {
    content: '';
    display: block;
    width: 50px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #FFD700, transparent);
    margin: 10px auto 0;
  }
`

const Description = styled.p`
  margin: 20px 0;
  line-height: 1.8;
  font-size: 1rem;
  padding: 0 10px;
`

const Queries = () => {
  return (
    <>
      <GlobalStyle precedence="default" />
      <TitleContainer>
        <DecorativeLine direction="left" />
        <SectionTitle>استعلامات</SectionTitle>
        <DecorativeLine direction="right" />
      </TitleContainer>
      <MainContainer>
        <Box index={0}>
          <IconWrapper>
            <i className="fas fa-certificate"></i>
          </IconWrapper>
          <TextContainer>
            <Title>مجوزها</Title>
            <Description>
              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.
            </Description>
          </TextContainer>
        </Box>

        <Box index={1}>
          <IconWrapper>
            <i className="fas fa-phone-alt"></i>
          </IconWrapper>
          <TextContainer>
            <Title>پل‌های ارتباطی</Title>
            <Description>
              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.
            </Description>
          </TextContainer>
        </Box>

        <Box index={2}>
          <IconWrapper>
            <i className="fas fa-handshake"></i>
          </IconWrapper>
          <TextContainer>
            <Title>مشارکت و همکاری با ما</Title>
            <Description>
              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.
            </Description>
          </TextContainer>
        </Box>
      </MainContainer>
    </>
  )
}

export default Queries
