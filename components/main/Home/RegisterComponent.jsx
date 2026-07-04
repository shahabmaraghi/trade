"use client"

/* eslint-disable no-unused-vars */
import { useState } from "react"
import styled, { keyframes } from "styled-components"

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
  animation: ${fadeIn} 0.4s ease-out;

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    margin: 0.5rem 0;
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
      color: rgba(255, 255, 255, 0.5);
    }

    @media (max-width: 600px) {
      width: 90%;
      font-size: 0.9rem;
    }
  }
`

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  margin: 1rem 0;
  
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.69);

  input {
    margin-right: 0.5rem;
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
    accent-color: #ffd700;
  }

  @media (max-width: 600px) {
    font-size: 0.8rem;
  }
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 20px;
  gap: 1rem;

  @media (max-width: 600px) {
    justify-content: space-between;
    width: 100%;
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

  @media (max-width: 600px) {
    width: 100%;
    padding: 1rem;
    font-size: 0.8rem;
  }
`

const Message = styled.p`
  
  font-size: 0.9rem;
  margin: 0.5rem 0;
  text-align: center;
  animation: ${fadeIn} 0.3s ease-out;

  &.error {
    color: #ff6b6b;
  }
  &.success {
    color: #51cf66;
  }
`

const RegisterComponent = ({ onClose }) => {
  const [phonenumber, setphonenumber] = useState("")
  const [fullname, setfullname] = useState("")
  const [referrer, setReferrer] = useState("")
  const [password, setPassword] = useState("")
  const [isAgreed, setIsAgreed] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError("")
    setSuccessMessage("")

    if (!phonenumber || !fullname || !password || !isAgreed) {
      setError("لطفا همه فیلدها را پر کنید و با شرایط موافق باشید")
      return
    }

    const formData = {
      phonenumber,
      fullname,
      referrer,
      password,
    }

    try {
      const response = await fetch("https://api.hirmandtrade.ir/v1/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.message || "مشکلی در ارسال اطلاعات رخ داده است")
        return
      }

      if (result.ok === "1") {
        setSuccessMessage("ثبت نام با موفقیت انجام شد")

        setphonenumber("")
        setfullname("")
        setReferrer("")
        setPassword("")
        setIsAgreed(false)

        setTimeout(onClose, 2000)
      } else {
        setError(result.message || "ثبت نام با مشکل مواجه شد")
      }
    } catch (error) {
      setError("خطا در ارسال اطلاعات: " + error.message)
    }
  }

  return (
    <LoginForm onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="شماره موبایل"
        value={phonenumber}
        onChange={(e) => setphonenumber(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="نام و نام خانوادگی"
        value={fullname}
        onChange={(e) => setfullname(e.target.value)}
        required
      />
      <input type="text" placeholder="معرف (اختیاری)" value={referrer} onChange={(e) => setReferrer(e.target.value)} />
      <input
        type="password"
        placeholder="رمز عبور"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <CheckboxContainer>
        <input type="checkbox" checked={isAgreed} onChange={() => setIsAgreed(!isAgreed)} required />
        <span>با قوانین ثبت نام موافقم</span>
      </CheckboxContainer>
      {error && <Message className="error">{error}</Message>}
      {successMessage && <Message className="success">{successMessage}</Message>}
      <ButtonContainer>
        <Button type="submit">ثبت نام</Button>
        <Button type="button" onClick={onClose}>
          بستن
        </Button>
      </ButtonContainer>
    </LoginForm>
  )
}

export default RegisterComponent
