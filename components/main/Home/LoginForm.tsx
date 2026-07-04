"use client"

import type React from "react"

import { useState } from "react"
import styled, { keyframes } from "styled-components"

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const LoginFormContainer = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
  animation: ${fadeIn} 0.4s ease-out;
`

const InputContainer = styled.div`
  position: relative;
  margin: 1rem 0;
  width: 100%;
  max-width: 600px;

  @media (max-width: 600px) {
    width: 90%;
  }
`

const StyledInput = styled.input`
  width: 100%;
  margin: 0.5rem 0;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.1);
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.69);
  font-size: 0.875rem;
  transition: all 0.3s ease;
  text-align: right;

  &:focus {
      outline: none;
      border-color: rgba(255, 215, 0, 0.3);
      box-shadow: 0 0 10px rgba(255, 215, 0, 0.1);
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.69);
    }


    @media (max-width: 600px) {
      width: 90%;
      font-size: 0.9rem;
    }
`

const StyledLabel = styled.label`
  position: absolute;
  top: 1rem;
  left: 1rem;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.69);
  pointer-events: none;
  transition: all 0.3s ease;
  background: transparent;

  @media (max-width: 600px) {
    font-size: 0.9rem;
  }
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 20px;
  width: 100%;
  max-width: 600px;

  @media (max-width: 600px) {
    justify-content: center;
  }
`

const Button = styled.button<{ fullWidth?: boolean }>`
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #FFD700, #c8ad75);
  color: #1a1a1a;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: ${(props) => (props.fullWidth ? "100%" : "auto")};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  }

  @media (max-width: 600px) {
    width: 100%;
    padding: 1rem;
    font-size: 0.9rem;
  }
`

const ErrorMessage = styled.p`
  color: #ff4d4f;
  font-size: 0.9rem;
  margin: 0.5rem 0;
  animation: ${fadeIn} 0.3s ease-out;
  background: rgba(255, 77, 79, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 77, 79, 0.3);
  width: 100%;
  max-width: 600px;
  text-align: center;
`

const ForgotPasswordLink = styled.a`
  color: rgba(255, 215, 0, 0.7);
  text-decoration: none;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
  align-self: flex-end;
  cursor: pointer;

  &:hover {
    color: rgba(255, 215, 0, 1);
    text-decoration: underline;
  }

  @media (max-width: 600px) {
    align-self: center;
  }
`

interface LoginFormProps {
  setShowLoginForm: (show: boolean) => void
}

const LoginForm: React.FC<LoginFormProps> = ({ setShowLoginForm }) => {
  const [phonenumber, setphonenumber] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false)
  const [recoveryPhoneNumber, setRecoveryPhoneNumber] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phonenumber || !password) {
      setError("لطفا نام کاربری و گذرواژه را وارد کنید.")
      return
    }

    const formData = {
      phonenumber: phonenumber,
      password: password,
      remember_me: true,
    }

    try {
      const response = await fetch("https://api.hirmandtrade.ir/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("ورود با مشکل مواجه شد.")
      }

      const result = await response.json()

      if (result.ok === "1") {
        console.log("ورود موفقیت‌آمیز")
        setShowLoginForm(false)
      } else {
        setError("نام کاربری یا گذرواژه اشتباه است.")
      }
    } catch (error) {
      setError("خطا در ارتباط با سرور.")
    }
  }

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recoveryPhoneNumber) {
      setError("لطفا شماره تلفن خود را وارد کنید.")
      return
    }

    try {
      const response = await fetch("https://api.hirmandtrade.ir/v1/recover-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phonenumber: recoveryPhoneNumber }),
      })

      if (!response.ok) {
        throw new Error("بازیابی رمز عبور با مشکل مواجه شد.")
      }

      const result = await response.json()

      if (result.ok === "1") {
        setError("کد بازیابی به شماره تلفن شما ارسال شد.")
      } else {
        setError("شماره تلفن نامعتبر است.")
      }
    } catch (error) {
      setError("خطا در ارتباط با سرور.")
    }
  }

  if (showPasswordRecovery) {
    return (
      <LoginFormContainer onSubmit={handlePasswordRecovery}>
        <InputContainer>
          <StyledInput
            type="text"
            placeholder=" "
            value={recoveryPhoneNumber}
            onChange={(e) => setRecoveryPhoneNumber(e.target.value)}
          />
          <StyledLabel>شماره تلفن</StyledLabel>
        </InputContainer>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <ButtonContainer>
          <Button type="submit" fullWidth>
            ارسال کد بازیابی
          </Button>
          <ForgotPasswordLink
            onClick={() => {
              setShowPasswordRecovery(false)
              setError("")
            }}
          >
            بازگشت به ورود
          </ForgotPasswordLink>
        </ButtonContainer>
      </LoginFormContainer>
    )
  }

  return (
    <LoginFormContainer onSubmit={handleSubmit}>
      <InputContainer>
        <StyledInput type="text" placeholder=" " value={phonenumber} onChange={(e) => setphonenumber(e.target.value)} />
        <StyledLabel>نام کاربری</StyledLabel>
      </InputContainer>
      <InputContainer>
        <StyledInput type="password" placeholder=" " value={password} onChange={(e) => setPassword(e.target.value)} />
        <StyledLabel>گذرواژه</StyledLabel>
      </InputContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <ButtonContainer>
        <Button type="submit" fullWidth>
          ورود
        </Button>
        <ForgotPasswordLink onClick={() => setShowPasswordRecovery(true)}>فراموشی رمز عبور</ForgotPasswordLink>
      </ButtonContainer>
    </LoginFormContainer>
  )
}

export default LoginForm
