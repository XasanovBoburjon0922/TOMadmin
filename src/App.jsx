"use client"

import { useState } from "react"
import { Layout, Menu, Spin } from "antd"
import {
  DashboardOutlined,
  TeamOutlined,
  BankOutlined,
  BookOutlined,
  PictureOutlined,
  UserOutlined,
  LogoutOutlined,
  FileTextOutlined,
} from "@ant-design/icons"
import Dashboard from "./pages/Dashboard"
import Teachers from "./pages/Teachers"
import Branches from "./pages/Branches"
import Courses from "./pages/Courses"
import Gallery from "./pages/Gallery"
import Students from "./pages/Students"
import Login from "./pages/Login"
import CourseApplications from "./pages/Application"

const { Header, Sider, Content } = Layout

export default function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedKey, setSelectedKey] = useState("1")
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(true) // Set to false for login

  const menuItems = [
    {
      key: "1",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "2",
      icon: <TeamOutlined />,
      label: "O'qituvchilar",
    },
    {
      key: "3",
      icon: <BankOutlined />,
      label: "Filiallar",
    },
    {
      key: "4",
      icon: <BookOutlined />,
      label: "Kurslar",
    },
    {
      key: "5",
      icon: <PictureOutlined />,
      label: "Galereya",
    },
    {
      key: "6",
      icon: <UserOutlined />,
      label: "O'quvchilar",
    },
    {
      key: "7",
      icon: <FileTextOutlined />,
      label: "Kurs Arizalari",
    },
  ]

  const renderContent = () => {
    switch (selectedKey) {
      case "1":
        return <Dashboard />
      case "2":
        return <Teachers />
      case "3":
        return <Branches />
      case "4":
        return <Courses />
      case "5":
        return <Gallery />
      case "6":
        return <Students />
      case "7":
        return <CourseApplications />
      default:
        return <Dashboard />
    }
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: "linear-gradient(135deg, #22c55e 0%, #059669 100%)",
        }}
      >
        <div
          style={{
            height: 64,
            margin: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              background: "linear-gradient(135deg, #16a34a 0%, #059669 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            T
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => setSelectedKey(key)}
          style={{
            background: "transparent",
            border: "none",
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#16a34a",
              fontSize: 24,
              fontWeight: "bold",
            }}
          >
            Tom Education
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: "linear-gradient(135deg, #22c55e 0%, #059669 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UserOutlined style={{ color: "white" }} />
              </div>
              <span style={{ color: "#374151" }}>Admin</span>
            </div>
            <LogoutOutlined
              style={{
                color: "#6b7280",
                cursor: "pointer",
                fontSize: 16,
              }}
              onClick={() => setIsAuthenticated(false)}
            />
          </div>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: "#fff",
            borderRadius: 8,
            minHeight: 280,
            position: "relative",
          }}
        >
          {loading && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(255, 255, 255, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
            >
              <Spin size="large" style={{ color: "#22c55e" }} />
            </div>
          )}
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  )
}
