"use client"
import styled from "styled-components"
import { LogIn, UserCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const NavbarContainer = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 215, 0, 0.1);
  color: rgba(255, 255, 255, 0.69);
  position: relative;
  z-index: 10;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.2), transparent);
  }

  @media (max-width: 768px) {
    height: 50px;
    font-size: 0.9rem;
  }
`

const NavbarContent = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 1rem;
  margin-right: 10px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`

const StyledIcon = styled.div`
  width: 2rem;
  height: 2rem;
  color: rgba(255, 255, 255, 0.69);
  cursor: pointer;
  transition: color 0.2s;

  svg {
    width: 100%;
    height: 100%;
  }

  &:hover {
    color: #ffd700;
  }

  @media (max-width: 480px) {
    width: 1.5rem;
    height: 1.5rem;
  }
`

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 215, 0, 0.1);
  }
`

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-left: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-left: 0.5rem;
  }
`

const UserName = styled.span`
  margin-left: 0.5rem;
  font-weight: 500;
  background: linear-gradient(90deg, #ffd700, #f5a623);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent);
  }
`

interface UserData {
  id: string
  fullName?: string
  phone?: string
  role?: string
  subscription?: {
    plan: {
      id: string
      title: string
      price: number
      features: string[]
    }
    expiryDate?: string
    isActive: boolean
  }
}

const Navbar = () => {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/auth/me")

        if (!response.ok) {
          if (response.status === 401) {
            // User is not authenticated
            setUserData(null)
            setAuthError(false)
          } else {
            // Other error
            setAuthError(true)
          }
          return
        }

        const data = await response.json()
        setUserData(data)
        setAuthError(false)
      } catch (error) {
        console.error("Error fetching user data:", error)
        setAuthError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleIconClick = () => {
    if (userData || authError) {
      router.push("/user")
    } else {
      router.push("/auth/login")
    }
  }

  return (
    <NavbarContainer>
      <NavbarContent>
        <IconWrapper onClick={handleIconClick}>
          {isLoading ? (
            <StyledIcon>
              <Loader2 className="animate-spin" />
            </StyledIcon>
          ) : userData || authError ? (
            <StyledIcon>
              <UserCircle />
            </StyledIcon>
          ) : (
            <StyledIcon>
              <LogIn />
            </StyledIcon>
          )}
        </IconWrapper>

        {!isLoading && userData && (
          <UserInfo>
            <UserName>{userData.fullName || userData.phone || "کاربر"}</UserName>
          </UserInfo>
        )}
      </NavbarContent>
    </NavbarContainer>
  )
}

export default Navbar
