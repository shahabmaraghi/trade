"use client"

/* eslint-disable no-unused-vars */
import { useState } from "react"
import styled, { keyframes, createGlobalStyle } from "styled-components"
import useAuth from "@/hooks/main/useAuth"
import { syfetch } from "@/services/syfetch"

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #1a1a1a;
    color: rgba(255, 255, 255, 0.69);
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
const blink = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`

const Container = styled.div`
  
  display: flex;
  justify-content: center;
  gap: 40px;
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  animation: ${fadeIn} 1s ease-in-out;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`

const FormContainer = styled.div`
  width: 45%;
  padding: 40px;
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.8s ease-out;
  transition: all 0.4s ease;

  &:hover {
    border-color: rgba(255, 215, 0, 0.3);
    box-shadow: 0 6px 30px rgba(255, 215, 0, 0.15);
  }

  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 30px;
  }
`

const DescriptionContainer = styled(FormContainer)`
  animation-delay: 0.2s;
`

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
`

const SectionTitle = styled.h2`
  
  font-size: 6.2rem;
  margin: 0;
  padding: 0;
  color: transparent;
  line-height: 1.2;
  position: relative;
  -webkit-text-stroke: 0.7px #fff;
  display: inline-block;
  text-align: center;
  animation: ${blink} 2.5s infinite;

  @media (max-width: 768px) {
    font-size: 4.2rem;
  }
`

const Input = styled.input`
  width: 100%;
  padding: 14px;
  margin: 12px 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 8px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  

  &:focus {
    outline: none;
    border-color: #ffd700;
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`

const Textarea = styled(Input).attrs({ as: "textarea" })`
  height: 150px;
  resize: vertical;
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

const Title = styled.h2`
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 30px;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);

  &::after {
    content: "";
    display: block;
    width: 50px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #ffd700, transparent);
    margin: 10px auto 0;
  }
`

const Label = styled.label`
  font-weight: 500;
  margin: 12px 0 8px;
  display: block;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
`

const Paragraph = styled.p`
  font-size: 1rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.69);
  margin: 20px 0;
  text-align: justify;
`

const Subtitle = styled.h3`
  font-size: 1.2rem;
  margin: 24px 0 16px;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
`

const ProjectReviewForm = () => {
  const { isAuthenticated } = useAuth()

  const initialFormData = {
    platform_name: "",
    platform_website: "",
    description: "",
  }
  const [formData, setFormData] = useState(initialFormData)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await syfetch.post(`/users/projects`, formData)
    if (!result.ok) {
      alert("خطا در ثبت پروژه")
      return
    }
    alert("پروژه ثبت شد")
    setFormData(initialFormData)
  }

  return (
    <>
      <GlobalStyle precedence="default" />
      <TitleContainer>
        <SectionTitle data-text="بررسی پروژه">بررسی پروژه</SectionTitle>
      </TitleContainer>
      <Container>
        <FormContainer>
          <Title>فرم ثبت پروژه</Title>
          {!isAuthenticated ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                textAlign: "center",
              }}
            >
              <span>نخست وارد وب‌سایت شده و یا ثبت‌نام کنید تا به رایگان درخواست بررسی پروژه خود را ثبت کنید</span>
              <br />
              <Button
                onClick={() =>
                  (window.location.href =
                    "https://hirmandtrade.ir/sign-in?redirectUrl=https://hirmandtrade.ir/#projectreview")
                }
              >
                ورود و یا ثبت‌نام
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="platform_name">نام پلتفرم</Label>
                <Input
                  type="text"
                  id="platform_name"
                  name="platform_name"
                  value={formData.platform_name}
                  onChange={handleInputChange}
                  required
                  placeholder="نام پلتفرم مدنظر خود را وارد کنید"
                />
              </div>
              <div>
                <Label htmlFor="platform_website">آدرس وب‌سایت پلتفرم</Label>
                <Input
                  type="platform_website"
                  id="platform_website"
                  name="platform_website"
                  value={formData.platform_website}
                  onChange={handleInputChange}
                  required
                  placeholder="نشانی وب‌سایت پلتفرم مدنظر خود را وارد کنید"
                />
              </div>
              <div>
                <Label htmlFor="description">توضیحات پروژه</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="توضیحات پروژه خود را وارد کنید"
                />
              </div>
              <Button type="submit">ثبت درخواست</Button>
            </form>
          )}
        </FormContainer>

        <DescriptionContainer>
          <Title>توضیحات</Title>
          <Subtitle>چگونه پروژه خود را معرفی کنید؟</Subtitle>
          <Paragraph>
            در قسمت بررسی پروژه میتونی قبل از سرمایه گذاری روی هر پلتفرمی که بهت پیشنهاد درصد سود میدن یا پروژه های ارزی
            که معرفی میشن، کافیه لینک سایت و اسم پروژه رو به پلاس چارت بفرستی تا ما برات بررسی کنیم و بهت بگیم پروژه
            کلاهبرداری هست یا نه و درصد ریسکشو برات بگیم. هدف از این قسمت کوتاه کردن دست کلاه بردارا از سرمایه کاربرای
            عزیزمون هستش. هر جایی سرمایه نذار. بفرست بررسی کنیم آفرین😒
          </Paragraph>
          {/* <Paragraph>
            شما می‌توانید جزئیات مربوط به نیازمندی‌ها، اهداف پروژه، و هر اطلاعات
            دیگری که فکر می‌کنید مهم است را وارد کنید. همچنین در صورت نیاز،
            می‌توانید پیوست‌های مرتبط با پروژه خود را ارسال کنید.
          </Paragraph> */}
        </DescriptionContainer>
      </Container>
    </>
  )
}

export default ProjectReviewForm
