import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, Row, Col, Statistic, Progress, Avatar, Button, Space } from "antd";
import {
  BookOutlined,
  BranchesOutlined,
  PictureOutlined,
  UserOutlined,
  StarOutlined,
  TeamOutlined,
  TrophyOutlined,
  RiseOutlined,
} from "@ant-design/icons";
// import { getDashboardStats } from "../api/api";

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ branches: 0, courses: 0, galleries: 0, teachers: 0 });
  const [loading, setLoading] = useState(false);

  const recentActivities = [
    { avatar: "C", action: "New course added", user: "Admin", time: "2 hours ago" },
    { avatar: "T", action: "Teacher profile updated", user: "Admin", time: "5 hours ago" },
    { avatar: "G", action: "Gallery image uploaded", user: "Admin", time: "1 day ago" },
    { avatar: "B", action: "Branch information modified", user: "Admin", time: "2 days ago" },
  ];

  // useEffect(() => {
  //   const fetchStats = async () => {
  //     setLoading(true);
  //     try {
  //       const data = await getDashboardStats();
  //       setStats(data);
  //     } catch (error) {
  //       message.error(t("fetchError"));
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchStats();
  // }, []);

  const statsCards = [
    {
      title: t("totalBranches"),
      value: stats.branches,
      icon: <BranchesOutlined />,
      color: "#667eea",
      bgColor: "#f0f2ff",
      change: "+12%",
      changeType: "increase",
    },
    {
      title: t("totalCourses"),
      value: stats.courses,
      icon: <BookOutlined />,
      color: "#f093fb",
      bgColor: "#fef7ff",
      change: "+8%",
      changeType: "increase",
    },
    {
      title: t("gallery"),
      value: stats.galleries,
      icon: <PictureOutlined />,
      color: "#4facfe",
      bgColor: "#f0faff",
      change: "+24%",
      changeType: "increase",
    },
    {
      title: t("totalTeachers"),
      value: stats.teachers,
      icon: <UserOutlined />,
      color: "#43e97b",
      bgColor: "#f0fff4",
      change: "+5%",
      changeType: "increase",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t("welcome")}</h1>
            <p className="text-blue-100 text-lg">{t("welcome")}!</p>
          </div>
          <div className="hidden md:block">
            <TrophyOutlined className="text-6xl text-white/20" />
          </div>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {statsCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300"
              style={{ borderRadius: "16px" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                  <Statistic
                    value={stat.value}
                    valueStyle={{
                      color: stat.color,
                      fontSize: "28px",
                      fontWeight: "bold",
                    }}
                    loading={loading}
                  />
                  <div className="flex items-center mt-2">
                    <RiseOutlined className="text-green-500 text-xs mr-1" />
                    <span className="text-green-500 text-xs font-medium">{stat.change}</span>
                    <span className="text-gray-400 text-xs ml-1">{t("vsLastMonth")}</span>
                  </div>
                </div>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: stat.bgColor, color: stat.color }}
                >
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <div className="flex items-center">
                <StarOutlined className="mr-2 text-yellow-500" />
                <span className="font-semibold">{t("performanceOverview")}</span>
              </div>
            }
            className="border-0 shadow-sm"
            style={{ borderRadius: "16px" }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="text-center">
                  <Progress
                    type="circle"
                    percent={85}
                    strokeColor="#667eea"
                    size={120}
                  />
                  <p className="mt-4 text-gray-600 font-medium">{t("courseCompletion")}</p>
                </div>
              </Col>
              <Col span={12}>
                <div className="text-center">
                  <Progress
                    type="circle"
                    percent={92}
                    strokeColor="#43e97b"
                    size={120}
                  />
                  <p className="mt-4 text-gray-600 font-medium">{t("studentSatisfaction")}</p>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <div className="flex items-center">
                <TeamOutlined className="mr-2 text-blue-500" />
                <span className="font-semibold">{t("recentActivity")}</span>
              </div>
            }
            className="border-0 shadow-sm"
            style={{ borderRadius: "16px" }}
          >
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Avatar
                    size={40}
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  >
                    {activity.avatar}
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 mb-1">
                      {t(`activity.${activity.action.toLowerCase().replace(/\s/g, "_")}`)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t("by")} {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <div className="flex items-center">
            <RiseOutlined className="mr-2 text-green-500" />
            <span className="font-semibold">{t("quickActions")}</span>
          </div>
        }
        className="border-0 shadow-sm"
        style={{ borderRadius: "16px" }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <div className="text-center p-4 rounded-xl bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors duration-200">
              <BookOutlined className="text-3xl text-blue-500 mb-2" />
              <p className="font-medium text-gray-800">{t("addCourse")}</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="text-center p-4 rounded-xl bg-green-50 hover:bg-green-100 cursor-pointer transition-colors duration-200">
              <UserOutlined className="text-3xl text-green-500 mb-2" />
              <p className="font-medium text-gray-800">{t("addTeacher")}</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="text-center p-4 rounded-xl bg-purple-50 hover:bg-purple-100 cursor-pointer transition-colors duration-200">
              <BranchesOutlined className="text-3xl text-purple-500 mb-2" />
              <p className="font-medium text-gray-800">{t("addBranch")}</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="text-center p-4 rounded-xl bg-orange-50 hover:bg-orange-100 cursor-pointer transition-colors duration-200">
              <PictureOutlined className="text-3xl text-orange-500 mb-2" />
              <p className="font-medium text-gray-800">{t("addImage")}</p>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;