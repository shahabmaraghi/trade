"use client"

import type React from "react"

import { useState } from "react"
import styled from "styled-components"

const RecoveryContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const RecoveryForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
`

const RecoveryInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  margin: 0.7rem 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.1);
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.69);
`

const RecoveryButton = styled.button`
  padding: 12px 24px;
  margin: 1rem 0;
  background: linear-gradient(45deg, #ffd700, #b9ae71);
  color: #212121;
  border: none;
  border-radius: 8px;
`

const ErrorMessage = styled.p`
  color: red;
  text-align: center;
`

interface PasswordRecoveryProps {
  onClose: () => void
}

const PasswordRecovery: React.FC<PasswordRecoveryProps> = ({ onClose }) => {
  const [step, setStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState("")

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber) {
      setError("لطفا شماره تلفن را وارد کنید")
      return
    }

    try {
      const response = await fetch("https://api.hirmandtrade.ir/v1/recover-password/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phonenumber: phoneNumber }),
      })

      const result = await response.json()

      if (result.ok === "1") {
        setStep(2)
        setError("")
      } else {
        setError(result.message || "شماره تلفن نامعتبر است")
      }
    } catch (error) {
      setError("خطا در ارتباط با سرور")
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationCode) {
      setError("لطفا کد تایید را وارد کنید")
      return
    }

    try {
      const response = await fetch("https://api.hirmandtrade.ir/v1/recover-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phonenumber: phoneNumber,
          verification_code: verificationCode,
        }),
      })

      const result = await response.json()

      if (result.ok === "1") {
        setStep(3)
        setError("")
      } else {
        setError(result.message || "کد تایید نامعتبر است")
      }
    } catch (error) {
      setError("خطا در ارتباط با سرور")
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword) {
      setError("لطفا رمز عبور جدید را وارد کنید")
      return
    }

    try {
      const response = await fetch("https://api.hirmandtrade.ir/v1/recover-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phonenumber: phoneNumber,
          verification_code: verificationCode,
          new_password: newPassword,
        }),
      })

      const result = await response.json()

      if (result.ok === "1") {
        alert("رمز عبور با موفقیت تغییر یافت")
        onClose()
      } else {
        setError(result.message || "خطا در تغییر رمز عبور")
      }
    } catch (error) {
      setError("خطا در ارتباط با سرور")
    }
  }

  return (
    <RecoveryContainer>
      {step === 1 && (
        <RecoveryForm onSubmit={handleSendCode}>
          <RecoveryInput
            type="text"
            placeholder="شماره تلفن"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <RecoveryButton type="submit">ارسال کد تایید</RecoveryButton>
          <RecoveryButton type="button" onClick={onClose}>
            انصراف
          </RecoveryButton>
        </RecoveryForm>
      )}

      {step === 2 && (
        <RecoveryForm onSubmit={handleVerifyCode}>
          <RecoveryInput
            type="text"
            placeholder="کد تایید"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <RecoveryButton type="submit">تایید کد</RecoveryButton>
          <RecoveryButton type="button" onClick={() => setStep(1)}>
            بازگشت
          </RecoveryButton>
        </RecoveryForm>
      )}

      {step === 3 && (
        <RecoveryForm onSubmit={handleResetPassword}>
          <RecoveryInput
            type="password"
            placeholder="رمز عبور جدید"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <RecoveryButton type="submit">تغییر رمز عبور</RecoveryButton>
          <RecoveryButton type="button" onClick={() => setStep(2)}>
            بازگشت
          </RecoveryButton>
        </RecoveryForm>
      )}
    </RecoveryContainer>
  )
}

export default PasswordRecovery
