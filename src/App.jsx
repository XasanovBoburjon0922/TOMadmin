"use client";

import { useState, useContext } from "react";
import { Layout, Menu, Spin } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  BankOutlined,
  BookOutlined,
  PictureOutlined,
  UserOutlined,
  LogoutOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import Dashboard from "./pages/Dashboard";
import Teachers from "./pages/Teachers";
import Branches from "./pages/Branches";
import Courses from "./pages/Courses";
import Gallery from "./pages/Gallery";
import Students from "./pages/Students";
import CourseApplications from "./pages/Application";
import Login from "./pages/Login";
import LanguageSwitcher from "./components/LanguageSwitcher";
import Admins from "./pages/Admins";
import { useAuth } from "./context/AuthContext";

const { Header, Sider, Content } = Layout;

export default function App() {
  const { t } = useTranslation();
  const { isAuthenticated, logout, isLoading } = useAuth(); // Use AuthContext
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("1");

  const menuItems = [
    { key: "1", icon: <DashboardOutlined />, label: t("dashboard") },
    { key: "2", icon: <TeamOutlined />, label: t("teachers") },
    { key: "3", icon: <BankOutlined />, label: t("branches") },
    { key: "4", icon: <BookOutlined />, label: t("courses") },
    { key: "5", icon: <PictureOutlined />, label: t("gallery") },
    { key: "6", icon: <UserOutlined />, label: t("totalStudents") },
    { key: "7", icon: <FileTextOutlined />, label: t("courseApplications") },
    { key: "8", icon: <UserOutlined />, label: t("admins_list") },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case "1":
        return <Dashboard />;
      case "2":
        return <Teachers />;
      case "3":
        return <Branches />;
      case "4":
        return <Courses />;
      case "5":
        return <Gallery />;
      case "6":
        return <Students />;
      case "7":
        return <CourseApplications />;
      case "8":
        return <Admins />;
      default:
        return <Dashboard />;
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" style={{ color: "#22c55e" }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
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
            <LanguageSwitcher />
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
              <span style={{ color: "#374151" }}>{t("admin")}</span>
            </div>
            <LogoutOutlined
              style={{
                color: "#6b7280",
                cursor: "pointer",
                fontSize: 16,
              }}
              onClick={logout}
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
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}