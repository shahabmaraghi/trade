"use client"

import type React from "react"
import { useState, Suspense, useEffect } from "react"
import styled, { keyframes } from "styled-components"
import { useCookies } from "react-cookie"
import RegisterComponent from "./RegisterComponent"
import PasswordRecovery from "./PasswordRecovery"
import { Loader2 } from "lucide-react"
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
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`

const MainContainer = styled.main`
  position: relative;
  width: 100vw;
  height: 100vh;
  margin: 0;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
`

const VideoBackground = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
  filter: brightness(0.7);
  transition: filter 0.5s ease;
`

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  width: 90%;
  max-width: 1200px;
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  margin-top: -30px;
  animation: ${fadeIn} 1s ease-out;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
  }
`

const TextContainer = styled.div`
  text-align: right;
  color: white;
`

const Title = styled.h1`
  font-weight: 600;
  font-size: 3.5rem;
  margin: 0;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
  animation: ${float} 3s ease-in-out infinite;
  text-align: right;

  @media (max-width: 1024px) {
    font-size: 2.8rem;
  }

  @media (max-width: 600px) {
    font-size: 2.2rem;
    text-align: center;
  }
`

const Highlight = styled.span`
  color: #ffd700;
  background: linear-gradient(90deg, #ffd700, #fff, #ffd700);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 3s linear infinite;
`

const Subtitle = styled.h3`
  font-weight: 400;
  font-size: 2rem;
  margin: 0.5rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  opacity: 0;
  animation: ${fadeIn} 1s ease-out forwards;
  animation-delay: 0.3s;
  direction: ltr;


  @media (max-width: 600px) {
    font-size: 1.4rem;
    text-align: center;
  }
`

const Description = styled.div`
  font-size: 1.1rem;
  line-height: 1.8;
  margin: 1.5rem 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  opacity: 0;
  animation: ${fadeIn} 1s ease-out forwards;
  animation-delay: 0.6s;

  @media (max-width: 600px) {
    font-size: 0.9rem;
    line-height: 1.6;
  }
`

const StrongText = styled.strong`
  display: block;
  margin-bottom: 1.2rem;
  color: #ffd700;
  font-size: 1.2rem;
`

const LoginForm = styled.form`
  margin-top: 2rem;
  opacity: 0;
  animation: ${fadeIn} 0.5s ease-out forwards;

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    margin: 0.7rem 0;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 215, 0, 0.1);
    border-radius: 0.5rem;
    color: rgba(255, 255, 255, 0.69);
    backdrop-filter: blur(5px);
    font-size: 1rem;
    text-align: right;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: rgba(255, 215, 0, 0.3);
      box-shadow: 0 0 10px rgba(255, 215, 0, 0.1);
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
  }
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  margin-top: 2rem;
  opacity: 0;
  animation: ${fadeIn} 1s ease-out forwards;
  animation-delay: 0.9s;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.8rem;
  }
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

const LoadingOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`

const LoadingSpinner = styled(Loader2)`
  width: 2.5rem;
  height: 2.5rem;
  color: #ffd700;
  animation: spin 1s linear infinite;
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`

const Home = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["token"])
  const [userName, setUserName] = useState("")
  const [password, setPassword] = useState("")
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  useEffect(() => {
    router.prefetch("/auth/login")
  }, [])

  const handleLoginClick = () => {
    setShowLoginForm(!showLoginForm)
    setShowRegisterForm(false)
  }

  const handleRegisterClick = () => {
    setShowRegisterForm(!showRegisterForm)
    setShowLoginForm(false)
  }

  const submitLogin = async (e: React.FormEvent, phonenumber: string, password: string) => {
    e.preventDefault()
    setIsLoading(true)

    if (!phonenumber || !password) {
      console.log("لطفا نام کاربری و رمز عبور را وارد کنید")
      setIsLoading(false)
      return
    }

    const objectLogin = { phonenumber, password, remember_me: true }

    try {
      const response = await fetch("https://api.hirmandtrade.ir/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(objectLogin),
      })

      if (!response.ok) {
        throw new Error("مشکلی در ارسال اطلاعات رخ داده است")
      }

      const result = await response.json()

      if (result?.data?.token) {
        const expires = objectLogin.remember_me
          ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)
          : new Date(Date.now() + 1000 * 60 * 60 * 24)

        setCookie("token", result.data.token, {
          path: "/",
          expires,
        })

        window.location.reload()
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainContainer>
      {isLoading && (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      )}
      <VideoBackground src="/main/assets/images/Main/1.mp4" autoPlay loop muted playsInline />
      <ContentWrapper>
        <TextContainer>
          <Title>
            مهاجرت به <Highlight>پلاس چارت</Highlight>
          </Title>
          <Subtitle>*۶۶۵۵*۱*۶۵۱۱#</Subtitle>
          <Description>
            <StrongText>گذشته غیر قابل تغییر است، ریسک اقدامات آینده‌تان را به حداقل برسانید.</StrongText>
            هلدینگ تجارت و اقتصاد تهران با نشان تجاری پلاس چارت از سال ۱۳۹۸ فعالیت خود را به صورت انحصاری در ایران با احداث
            دپارتمان‌های مختلف در حوزه تجارت بین‌الملل و کارآفرینی آغاز و با توجه به دستاوردهای قابل‌تامل و رضایت کاربران
            تا امروز به فعالیت خود ادامه داده است. این مجموعه همواره در جهت منافع مخاطبان خود، در مسیر آگاه‌سازی و روش‌های
            استعلام و کلیه امور بین‌المللی مرتبط را پیش گرفته تا از هرگونه کلاهبرداری یا اجحاف درحقوق آنها در این مسیر
            جلوگیری شود.
          </Description>

          {showPasswordRecovery ? (
            <PasswordRecovery
              onClose={() => {
                setShowPasswordRecovery(false)
                setShowLoginForm(true)
              }}
            />
          ) : showRegisterForm ? (
            <RegisterComponent onClose={() => setShowRegisterForm(false)} />
          ) : showLoginForm ? (
            <LoginForm onSubmit={(e) => submitLogin(e, userName, password)}>
              <input
                type="text"
                placeholder="نام کاربری"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="گذرواژه"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <ButtonContainer>
                <Button type="submit">ورود</Button>

                <Button type="button" onClick={() => setShowLoginForm(false)}>
                  بستن
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowLoginForm(false)
                    setShowPasswordRecovery(true)
                  }}
                >
                  فراموشی رمز
                </Button>
              </ButtonContainer>
            </LoginForm>
          ) : cookies.token ? (
            <ButtonContainer>
              <span style={{ color: "#4CAF50", display: "flex", alignItems: "center" }}>
                شما به حساب کاربری خود وارد شده‌اید
              </span>
              <Button onClick={() => { }}>مشاهده پنل کاربری</Button>
              <Button onClick={() => removeCookie("token")}>خروج از حساب</Button>
            </ButtonContainer>
          ) : (
            <ButtonContainer>
              <Button onClick={() => { router.push("/auth/login") }}>ورود به پنل کاربری</Button>
            </ButtonContainer>
          )}
        </TextContainer>
      </ContentWrapper>
    </MainContainer>
  )
}

export default Home
