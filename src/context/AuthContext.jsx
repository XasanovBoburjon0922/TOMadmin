"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const AuthContext = createContext(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check for token on page load
    const token = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")

    if (token && savedUser) {
      setIsAuthenticated(true)
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (name, password) => {
    try {
      const response = await fetch("https://api.tom-education.uz/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, password }),
      })

      if (!response.ok) {
        throw new Error("Invalid username or password")
      }

      const data = await response.json()
      const { token, user } = data

      setIsAuthenticated(true)
      setUser(user)
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      return true
    } catch (error) {
      console.error("Login error:", error.message)
      return false
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}