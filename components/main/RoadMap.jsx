"use client"
// eslint-disable-next-line no-unused-vars
import { useState } from "react"
import styled, { keyframes } from "styled-components"
import Footer from "./Footer"

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
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

const RoadmapContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 100px auto;
  max-width: 1200px;
  padding: 0 20px;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at 50% 50%,
      rgba(255, 215, 0, 0.1),
      transparent 70%
    );
    pointer-events: none;
  }
`

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 10px 0;
`

const DecorativeLine = styled.div`
  height: 2px;
  width: 100px;
  background: linear-gradient(
    90deg,
    ${(props) => (props.direction === "left" ? "transparent, #FFD700" : "#FFD700, transparent")}
  );
  position: relative;
  animation: ${slideIn} 1s ease-out;

  &::after {
    content: "";
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
  
  font-size: 3.2rem;
  margin: 0;
  padding: 0 20px;
  background: linear-gradient(90deg, #ffd700, #fff, #ffd700);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 3s linear infinite;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`

const StepContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: ${({ isEven }) => (isEven ? "flex-start" : "flex-end")};
  align-items: center;
  position: relative;
  margin: 20px 0;

  @media (max-width: 768px) {
    flex-direction: column;
    justify-content: center;
  }
`

const VerticalLine = styled.div`
  width: 5px;
  background: linear-gradient(to bottom, transparent, #ffd700, transparent);
  height: 100%;
  position: absolute;
  left: ${({ isEven }) => (isEven ? "calc(50% - 2.5px)" : "calc(50% - 2.5px)")};
  top: 0;
  opacity: 0.6;

  @media (max-width: 768px) {
    left: calc(50% - 2.5px);
  }
`

const Circle = styled.div`
  width: 20px;
  height: 20px;
  background: linear-gradient(45deg, #ffd700, #fff);
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  position: absolute;
  left: ${({ isEven }) => (isEven ? "calc(50% - 10px)" : "calc(50% - 10px)")};
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
`

const StepBox = styled.div`
  border: 1px solid rgba(255, 215, 0, 0.1);
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 40%;
  text-align: center;
  margin: 10px;
  position: relative;
  animation: ${fadeIn} 0.6s ease forwards;
  z-index: 2;
  transition: all 0.4s ease;
  opacity: 0;
  &:hover {
    transform: translateY(-10px);
    border-color: rgba(255, 215, 0, 0.3);
    box-shadow: 0 6px 30px rgba(255, 215, 0, 0.15);
  }

  &::before {
    content: "";
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
    width: 80%;
  }

  &:hover .tooltip {
    display: block;
  }
`

const Tooltip = styled.div`
  display: none;
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #181818;
  backdrop-filter: blur(5px);
  color: rgba(255, 255, 255, 0.69);
  padding: 8px 15px;
  border-radius: 8px;
  font-size: 0.8rem;
  
  white-space: nowrap;
  z-index: 3;
  border: 1px solid rgba(255, 215, 0, 0.2);

  &:after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: #181818 transparent transparent transparent;
  }
`

const StepTitle = styled.h3`
  
  font-size: 1.5rem;
  color: #ffd700;
  margin-bottom: 10px;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
`

const StepDescription = styled.p`
  
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.69);
  line-height: 1.6;
`

const LoadMoreButton = styled.button`
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
    content: "";
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

const Roadmap = () => {
  const steps = [
    {
      title: "مرحله ۱",
      description:
        "هوش مصنوعی پلتفرم پلاس چارت با بررسی دیتای سبکهای مختلف و داشتن اطلاعات کافی برای هر سبک به شما در نکات تکنیکالی کمک میکند و میتواند مانند یک منتور خطاهای موجود در موادر تکنیکالی شما را اصلاح کند.",
    },
    {
      title: "مرحله ۲",
      description:
        "در پلتفرم پلاس چارت میتوانید به تمامی نمودارهای بازار فارکس دسترسی داشته باشید و از تمامی ابزارهای تحلیل تکنیکال برروی نمودار استفاده کنید.",
    },
    {
      title: "مرحله ۳",
      description:
        "در پلتفرم پلاس چارت میتوانید به تمامی نمودارهای بازار رمز ارز ها دسترسی داشته باشید و از تمامی ابزارهای تحلیل تکنیکال برروی نمودار استفاده کنید.",
    },
    {
      title: "مرحله ۴",
      description:
        "در پلتفرم پلاس چارت میتوانید به تمامی نمودارهای بازار داخلی از جمله شاخص های بورس و نمودارهای طلا و سکه و ... دسترسی داشته باشید و از تمامی ابزارهای تحلیل تکنیکال برروی نمودار استفاده کنید.",
    },
    {
      title: "مرحله ۵",
      description:
        " شما میتوانید از دیدگاه و نظرات کاربران دیگر برای تحیل بهتر کمک بگیرید و همچنین میتوانید نظر و دیدگاه خود را به اشتراک بذارید ،میتوانید در صورت مفید بودن تحلیل در مورد تحیل گر نظر بدید و به پلتفرم در شناسایی تحلیلگر برتر کمک کنید.",
    },
    {
      title: "مرحله ۶",
      description: "در حال آماده‌سازی، به زودی در خدمت شما خواهیم بود... هر روز برای شما بهتر از دیروز 🌟",
    },
    {
      title: "مرحله ۷",
      description: "در حال آماده‌سازی، به زودی در خدمت شما خواهیم بود... هر روز برای شما بهتر از دیروز 🌟",
    },
    {
      title: "مرحله ۸",
      description: "در حال آماده‌سازی، به زودی در خدمت شما خواهیم بود... هر روز برای شما بهتر از دیروز 🌟",
    },
    {
      title: "مرحله ۹",
      description: "در حال آماده‌سازی، به زودی در خدمت شما خواهیم بود... هر روز برای شما بهتر از دیروز 🌟",
    },
    {
      title: "مرحله ۱۰",
      description: "در حال آماده‌سازی، به زودی در خدمت شما خواهیم بود... هر روز برای شما بهتر از دیروز 🌟",
    },
    {
      title: "مرحله ۱۱",
      description: "در حال آماده‌سازی، به زودی در خدمت شما خواهیم بود... هر روز برای شما بهتر از دیروز 🌟",
    },
    {
      title: "مرحله ۱۲",
      description: "در حال آماده‌سازی، به زودی در خدمت شما خواهیم بود... هر روز برای شما بهتر از دیروز 🌟",
    },
    {
      title: "مرحله ۱۳",
      description: "در حال آماده‌سازی، به زودی در خدمت شما خواهیم بود... هر روز برای شما بهتر از دیروز 🌟",
    },
    {
      title: "مرحله ۱۴",
      description: "در حال آماده‌سازی، به زودی در خدمت شما خواهیم بود... هر روز برای شما بهتر از دیروز 🌟",
    },
    {
      title: "مرحله ۱۵",
      description: "در حال آماده‌سازی، به زودی در خدمت شما خواهیم بود... هر روز برای شما بهتر از دیروز 🌟",
    },
    {
      title: "مرحله ۱۶",
      description: "در حال آماده‌سازی، به زودی در خدمت شما خواهیم بود... هر روز برای شما بهتر از دیروز 🌟",
    },
    {
      title: "مرحله ۱۷",
      description: "در حال آماده‌سازی، به زودی در خدمت شما خواهیم بود... هر روز برای شما بهتر از دیروز 🌟",
    },
    {
      title: "مرحله ۱۸",
      description: "در حال آماده‌سازی، به زودی در خدمت شما خواهیم بود... هر روز برای شما بهتر از دیروز 🌟",
    },
    {
      title: "مرحله ۱۹",
      description: "در حال آماده‌سازی، به زودی در خدمت شما خواهیم بود... هر روز برای شما بهتر از دیروز 🌟",
    },
  ]

  const [visibleSteps, setVisibleSteps] = useState(5)

  const handleLoadMore = () => {
    setVisibleSteps((prev) => prev + 5)
  }

  return (
    <>
      <style>{`body {background-color: #181818; color: rgba(255, 255, 255, 0.69)}`}</style>
      <RoadmapContainer>
        <TitleContainer>
          <DecorativeLine direction="left" />
          <SectionTitle> خدمات</SectionTitle>
          <DecorativeLine direction="right" />
        </TitleContainer>
        {steps.slice(0, visibleSteps).map((step, index) => (
          <StepContainer key={index} isEven={index % 2 === 0}>
            <VerticalLine isEven={index % 2 === 0} />
            <Circle isEven={index % 2 === 0} />
            <StepBox>
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
              {index + 1 > 5 && <Tooltip className="tooltip">به زودی</Tooltip>}
            </StepBox>
          </StepContainer>
        ))}
        {visibleSteps < steps.length && <LoadMoreButton onClick={handleLoadMore}>نمایش بیشتر</LoadMoreButton>}
      </RoadmapContainer>

      <Footer />
    </>
  )
}

export default Roadmap
