"use client"

import React, { useState, useEffect } from "react"
import styled, { keyframes } from "styled-components"
import Image from "next/image"
import Modal from "./Modal"
import Link from "next/link"

const openAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const closeAnimation = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
`

const rippleAnimation = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
`

const HeaderContainer = styled.header`
  background: rgba(26, 26, 26, 0.8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  direction: rtl;
  font-weight: 300;
  font-style: normal;
  width: 100%;
  margin: 0 auto;
  border-bottom: 1px solid rgba(255, 215, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    justify-content: center;
    padding: 15px;
  }
`

const ReferenceButton = styled.button`
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

  @media (max-width: 768px) {
    margin-top: 15px;
  }
`

const Logo = styled.div`
  margin-top: -5px;
  height: 50px;
  cursor: pointer;
  filter: brightness(1.2);
  position: relative;
  width: 50px;

  @media (max-width: 480px) {
    height: 40px;
    width: 40px;
  }
`

const MenuWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) {
    display: none;
  }
`

const Menu = styled.nav`
  display: flex;
  gap: 24px;
  align-items: center;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
`

const MenuItem = styled.div`
  color: rgba(255, 255, 255, 0.69);
  text-decoration: none;
  font-size: 15px;
  position: relative;
  padding: 5px 0;
  transition: color 0.3s ease;
  isolation: isolate;

  &:before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    padding-top: 100%;
    background: rgba(255, 255, 255, 0.69);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
    z-index: -1;
  }

  &.rippling:before {
    animation: ${rippleAnimation} 0.6s ease-out;
  }

  &:after {
    content: "";
    position: absolute;
    width: 100%;
    height: 1px;
    bottom: 0;
    left: 0;
    background-color: #ffd700;
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 100%, 5px 100%);
  }

  &:hover {
    color: #ffd700;

    &:after {
      transform: scaleX(1);
      transform-origin: left;
    }
  }

  @media (max-width: 480px) {
    font-size: 14px;
  }
`

interface MenuItemWithDelayProps {
  href: string
  children: React.ReactNode
}

const MenuItemWithDelay: React.FC<MenuItemWithDelayProps> = ({ href, children }) => {
  return (
    <Link href={href}>
      <MenuItem>{children}</MenuItem>
    </Link>
  )
}

const Submenu = styled.div`
  position: relative;

  &:hover > ul {
    display: block;
    opacity: 1;
    transform: translateY(0);
  }
`

const SubmenuList = styled.ul`
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: linear-gradient(to bottom, #2a2a2a, #1a1a1a);
  padding: 10px 0;
  list-style: none;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 10;
  width: 220px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 215, 0, 0.1);

  li {
    padding: 10px 20px;
    transition: all 0.3s ease;

    &:hover {
      background-color: rgba(255, 215, 0, 0.1);
      transform: translateX(-5px);
    }

    a {
      color: rgba(255, 255, 255, 0.69);
      text-decoration: none;
      font-size: 14px;
      display: block;
      transition: color 0.3s ease;

      &:hover {
        color: #ffd700;
      }
    }
  }
`

const HamburgerIcon = styled.div<{ isOpen: boolean }>`
  display: none;
  cursor: pointer;
  margin-top: 15px;
  z-index: 1100;

  @media (max-width: 768px) {
    display: block;
  }

  div {
    width: 25px;
    height: 2px;
    background-color: ${({ isOpen }) => (isOpen ? "#ffd700" : "white")};
    margin: 6px 0;
    transition: all 0.3s ease;

    &:nth-child(1) {
      transform: ${({ isOpen }) => (isOpen ? "translateY(8px) rotate(45deg)" : "none")};
    }

    &:nth-child(2) {
      opacity: ${({ isOpen }) => (isOpen ? "0" : "1")};
    }

    &:nth-child(3) {
      transform: ${({ isOpen }) => (isOpen ? "translateY(-8px) rotate(-45deg)" : "none")};
    }
  }
`

const MobileMenu = styled.nav<{ isOpen: boolean }>`
  display: none;
  background: linear-gradient(to bottom, #1a1a1a, #2a2a2a);
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100vh;
  padding: 80px 20px 20px;
  z-index: 1000;

  @media (max-width: 768px) {
    display: ${({ isOpen }) => (isOpen ? "block" : "none")};
  }

  animation: ${({ isOpen }) => (isOpen ? openAnimation : closeAnimation)} 0.3s
    forwards;

  a {
    display: block;
    padding: 15px;
    color: rgba(255, 255, 255, 0.69);
    text-decoration: none;
    text-align: right;
    font-size: 16px;
    transition: all 0.3s ease;
    border-bottom: 1px solid rgba(255, 215, 0, 0.1);

    &:hover {
      color: #ffd700;
      background-color: rgba(255, 215, 0, 0.1);
      padding-right: 25px;
    }
  }
`

interface MenuItem {
  title: string
  link: string
  submenu?: { title: string; link: string }[]
}

interface BlogCategory {
  _id: string
  name: string
  slug: string
  description?: string
}

const Header = () => {
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [isModalOpen, setModalOpen] = useState(false)
  const [isSubmenuOpen, setSubmenuOpen] = useState(false)
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([])

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen)
  }

  const toggleModal = () => {
    setModalOpen(!isModalOpen)
  }

  const toggleSubmenu = () => {
    setSubmenuOpen(!isSubmenuOpen)
  }

  // Fetch blog categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/blog/categories")
        const data = await response.json()

        if (data.categories) {
          setBlogCategories(data.categories)
        }
      } catch (error) {
        console.error("Failed to fetch blog categories:", error)
      }
    }

    fetchCategories()
  }, [])

  const menuItems: MenuItem[] = [
    { title: "صفحه اصلی", link: "/" },
    { title: "تحلیل‌ها", link: "/analyses" },
    { title: "پروژه‌ها", link: "/projects" },
    { title: "چارت‌ها", link: "/chart" },
    {
      title: "اخبار",
      link: "/blog",
      submenu: blogCategories.map((category) => ({
        title: category.name,
        link: `/blog/category/${category.slug}`,
      })),
    },
    { title: "خدمات", link: "/roadmap" },
    // { title: "رنکینگ", link: "#" },
    { title: "مشاوره", link: "/#counseling" },
    { title: "بررسی پروژه", link: "/#projectreview" },
    // { title: "معرفی مرکز", link: "#" },
  ]

  return (
    <>
      <style>{`* {margin: 0; padding: 0; box-sizing: border-box} body {overflow-x: hidden}`}</style>
      <HeaderContainer>
        <Logo>
          <Image src="/main/assets/images/Logo/plus-chart.png" alt="Tehran Chart Logo" width={50} height={50} style={{ objectFit: "cover" }} />
        </Logo>
        <MenuWrapper>
          <Menu>
            {menuItems.map((item, index) =>
              item.submenu ? (
                <Submenu key={index}>
                  <MenuItemWithDelay href={item.link}>{item.title}</MenuItemWithDelay>
                  <SubmenuList>
                    {item.submenu.map((subitem, subindex) => (
                      <li key={subindex}>
                        <MenuItemWithDelay href={subitem.link}>{subitem.title}</MenuItemWithDelay>
                      </li>
                    ))}
                  </SubmenuList>
                </Submenu>
              ) : (
                <MenuItemWithDelay key={index} href={item.link}>
                  {item.title}
                </MenuItemWithDelay>
              ),
            )}
          </Menu>
        </MenuWrapper>

        <ReferenceButton onClick={toggleModal}>مرجع دانش</ReferenceButton>

        <HamburgerIcon isOpen={isMenuOpen} onClick={toggleMenu}>
          <div />
          <div />
          <div />
        </HamburgerIcon>

        <MobileMenu isOpen={isMenuOpen}>
          {menuItems.map((item, index) =>
            item.submenu ? (
              <React.Fragment key={index}>
                <MenuItemWithDelay href={item.link}>{item.title}</MenuItemWithDelay>
                {isSubmenuOpen &&
                  item.submenu.map((subitem, subindex) => (
                    <MenuItemWithDelay key={subindex} href={subitem.link}>
                      {subitem.title}
                    </MenuItemWithDelay>
                  ))}
              </React.Fragment>
            ) : (
              <MenuItemWithDelay key={index} href={item.link}>
                {item.title}
              </MenuItemWithDelay>
            ),
          )}
        </MobileMenu>
      </HeaderContainer>
      <Modal isOpen={isModalOpen} toggleModal={toggleModal} />
    </>
  )
}

export default Header
