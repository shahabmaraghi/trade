"use client"

import { useState } from "react"
import styled, { keyframes, createGlobalStyle } from "styled-components"

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

const MainContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: stretch;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
  padding: 20px;
  margin: 0 auto;
  gap: 30px;
`

const MemberBox = styled.div`
  flex: 1 1 calc(33.333% - 30px);
  min-width: 280px;
  max-width: 400px;
  padding: 30px;
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  transition: all 0.4s ease;
  position: relative;
  cursor: pointer;
  

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
`

const MemberImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto 20px;
  border: 3px solid rgba(255, 215, 0, 0.2);
  padding: 3px;
  transition: all 0.5s ease;
`

const DefaultContent = styled.div`
  display: ${(props) => (props.isHovered ? "none" : "flex")};
  flex-direction: column;
  align-items: center;
`

const HoveredContent = styled.div`
  display: ${(props) => (props.isHovered ? "flex" : "none")};
  flex-direction: column;
  align-items: center;
  animation: ${fadeIn} 0.5s ease-out;
`

const MemberName = styled.h3`
  
  font-size: 1.4rem;
  color: #FFD700;
  margin: 15px 0;
  text-align: center;
`

const MemberDescription = styled.p`
  
  color: rgba(255, 255, 255, 0.69);
  text-align: center;
  line-height: 1.8;
  font-size: 1rem;
  margin: 20px 0;
`

const ResumeButton = styled.button`
  padding: 12px 24px;
  color: #fcffe4;
  background: linear-gradient(45deg, #212121, #323232);
  border: none;
  border-radius: 8px;
  border-bottom: 2px solid #b9ae71;
  cursor: pointer;
  
  margin-top: 20px;
`

const TeamMembers = () => {
  const [hoveredMember, setHoveredMember] = useState(null)

  const members = [
    {
      name: "مهندس میلاد کاکایی پلاس چارت",
      description: "مدیر و موسس هلدینگ تجاری پلاس چارت، معامله‌گر بازارهای مالی",
      resumeText: "دانلود رزومه  مهندس میلاد پلاس چارت",
    },
    {
      name: "مهندس سعید عزیزی",
      description: "مدیریت امور مشاوره و پشتیبانی",
      resumeText: "دانلود رزومه  مهندس سعید عزیزی",
    },
  ]

  const handleResumeDownload = (name) => {
    alert(`رزومه ${name} در حال دانلود است.`)
  }

  return (
    <>
      <GlobalStyle precedence="default" />
      <MainContainer>
        {members.map((member, index) => (
          <MemberBox
            key={index}
            onMouseEnter={() => setHoveredMember(index)}
            onMouseLeave={() => setHoveredMember(null)}
          >
            <DefaultContent isHovered={hoveredMember === index}>
              <MemberImage src="https://via.placeholder.com/100" alt={member.name} />
              <MemberName>{member.name}</MemberName>
              <MemberDescription>{member.description}</MemberDescription>
            </DefaultContent>

            <HoveredContent isHovered={hoveredMember === index}>
              <MemberImage
                src="https://via.placeholder.com/150"
                alt={member.name}
                style={{ width: "150px", height: "150px" }}
              />
              <MemberName>{member.name}</MemberName>
              <MemberDescription>{member.description}</MemberDescription>
              <ResumeButton onClick={() => handleResumeDownload(member.name)}>{member.resumeText}</ResumeButton>
            </HoveredContent>
          </MemberBox>
        ))}
      </MainContainer>
    </>
  )
}

export default TeamMembers
