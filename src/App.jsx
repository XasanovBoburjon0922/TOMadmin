"use client"

import { Layout, Menu, theme, Avatar, Dropdown, Badge } from "antd"
import { useState } from "react"
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "./context/AuthContext"
import {
  DashboardOutlined,
  BranchesOutlined,
  BookOutlined,
  PictureOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons"
import Dashboard from "./pages/Dashboard"
import Branches from "./pages/Branches"
import Courses from "./pages/Courses"
import Gallery from "./pages/Gallery"
import Teachers from "./pages/Teachers"
import Login from "./pages/Login"
import LanguageSwitcher from "./components/LanguageSwitcher"

const { Header, Sider, Content } = Layout

const App = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { t } = useTranslation()
  const { logout, user, isLoading } = useAuth()
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  const getSelectedKey = () => {
    const path = location.pathname
    switch (path) {
      case "/":
        return "1"
      case "/branches":
        return "2"
      case "/courses":
        return "3"
      case "/gallery":
        return "4"
      case "/teachers":
        return "5"
      default:
        return "1"
    }
  }

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: t("logout"),
      danger: true,
      onClick: logout,
    },
  ]

  const getPageTitle = () => {
    const path = location.pathname
    switch (path) {
      case "/":
        return t("dashboard")
      case "/branches":
        return t("branches")
      case "/courses":
        return t("courses")
      case "/gallery":
        return t("gallery")
      case "/teachers":
        return t("teachers")
      default:
        return t("dashboard")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth="0"
        className="shadow-lg"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div className="flex items-center justify-center p-6 border-b border-white/10">
          <div className="text-white text-center">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-2 mx-auto backdrop-blur-sm">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            {!collapsed && (
              <div>
                <div className="font-bold text-lg">TOM</div>
                <div className="text-xs text-white/80">Admin Panel</div>
              </div>
            )}
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          className="border-none bg-transparent"
          style={{ background: "transparent" }}
          items={[
            {
              key: "1",
              icon: <DashboardOutlined className="text-lg" />,
              label: (
                <Link to="/" className="font-medium">
                  {t("dashboard")}
                </Link>
              ),
              className: "hover:bg-white/10 rounded-lg mx-2 my-1",
            },
            {
              key: "2",
              icon: <BranchesOutlined className="text-lg" />,
              label: (
                <Link to="/branches" className="font-medium">
                  {t("branches")}
                </Link>
              ),
              className: "hover:bg-white/10 rounded-lg mx-2 my-1",
            },
            {
              key: "3",
              icon: <BookOutlined className="text-lg" />,
              label: (
                <Link to="/courses" className="font-medium">
                  {t("courses")}
                </Link>
              ),
              className: "hover:bg-white/10 rounded-lg mx-2 my-1",
            },
            {
              key: "4",
              icon: <PictureOutlined className="text-lg" />,
              label: (
                <Link to="/gallery" className="font-medium">
                  {t("gallery")}
                </Link>
              ),
              className: "hover:bg-white/10 rounded-lg mx-2 my-1",
            },
            {
              key: "5",
              icon: <UserOutlined className="text-lg" />,
              label: (
                <Link to="/teachers" className="font-medium">
                  {t("teachers")}
                </Link>
              ),
              className: "hover:bg-white/10 rounded-lg mx-2 my-1",
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          className="flex items-center justify-between px-6 shadow-sm border-b border-gray-100"
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            height: "70px",
          }}
        >
          <div className="flex items-center">
            <button
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <MenuUnfoldOutlined className="text-lg text-gray-600" />
              ) : (
                <MenuFoldOutlined className="text-lg text-gray-600" />
              )}
            </button>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-800 m-0">{getPageTitle()}</h1>
              <p className="text-sm text-gray-500 m-0">
                {t("welcome")}, {user?.username || "Admin"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200">
                <Avatar
                  size={40}
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || "A"}
                </Avatar>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-800">{user?.username || "Admin"}</div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          className="m-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100"
          style={{
            minHeight: "calc(100vh - 134px)",
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/branches" element={<Branches />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
