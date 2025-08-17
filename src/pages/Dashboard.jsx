"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Card, Row, Col, Statistic, Progress, Avatar } from "antd"
import {
  BookOutlined,
  BranchesOutlined,
  PictureOutlined,
  UserOutlined,
  StarOutlined,
  TeamOutlined,
  TrophyOutlined,
  RiseOutlined,
  FileTextOutlined,
} from "@ant-design/icons"

const Dashboard = () => {
  const { t } = useTranslation()
  const [stats, setStats] = useState({
    branches: 0,
    courses: 0,
    galleries: 0,
    teachers: 0,
    students: 0,
    applications: 0,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    setLoading(true)
    try {
      const [branchesRes, coursesRes, galleriesRes, teachersRes, studentsRes, applicationsRes] = await Promise.all([
        fetch("https://api.tom-education.uz/branches/list"),
        fetch("https://api.tom-education.uz/courses/list"),
        fetch("https://api.tom-education.uz/gallery/list"),
        fetch("https://api.tom-education.uz/teachers/list"),
        fetch("https://api.tom-education.uz/certificates/list"),
        fetch("https://api.tom-education.uz/course_applications/list"),
      ])

      const [branches, courses, galleries, teachers, students, applications] = await Promise.all([
        branchesRes.json(),
        coursesRes.json(),
        galleriesRes.json(),
        teachersRes.json(),
        studentsRes.json(),
        applicationsRes.json(),
      ])

      setStats({
        branches: branches.total_count || branches.branches?.length || 0,
        courses: courses.total_count || courses.courses?.length || 0,
        galleries: galleries.total_count || galleries.galleries?.length || 0,
        teachers: teachers.total_count || teachers.teacher?.length || 0,
        students: students.total_count || students.certificates?.length || 0,
        applications: applications.total_count || applications.applications?.length || 0,
      })
    } catch (error) {
      console.error("Dashboard ma'lumotlarini yuklashda xatolik:", error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: t("totalBranches"),
      value: stats.branches,
      icon: <BranchesOutlined />,
      color: "#22c55e",
      bgColor: "#f0fdf4",
      change: "+12%",
      changeType: "increase",
    },
    {
      title: t("totalCourses"),
      value: stats.courses,
      icon: <BookOutlined />,
      color: "#16a34a",
      bgColor: "#f0fdf4",
      change: "+8%",
      changeType: "increase",
    },
    {
      title: "Kurs Arizalari",
      value: stats.applications,
      icon: <FileTextOutlined />,
      color: "#059669",
      bgColor: "#f0fdf4",
      change: "+15%",
      changeType: "increase",
    },
    {
      title: t("gallery"),
      value: stats.galleries,
      icon: <PictureOutlined />,
      color: "#15803d",
      bgColor: "#f0fdf4",
      change: "+24%",
      changeType: "increase",
    },
    {
      title: t("totalTeachers"),
      value: stats.teachers,
      icon: <UserOutlined />,
      color: "#059669",
      bgColor: "#f0fdf4",
      change: "+5%",
      changeType: "increase",
    },
    {
      title: t("totalStudents"),
      value: stats.students,
      icon: <UserOutlined />,
      color: "#059669",
      bgColor: "#f0fdf4",
      change: "+10%",
      changeType: "increase",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t("welcome")}</h1>
            <p className="text-green-100 text-lg">{t("welcome")}!</p>
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
            <div className="text-center p-4 rounded-xl bg-green-50 hover:bg-green-100 cursor-pointer transition-colors duration-200">
              <BookOutlined className="text-3xl text-green-500 mb-2" />
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
            <div className="text-center p-4 rounded-xl bg-green-50 hover:bg-green-100 cursor-pointer transition-colors duration-200">
              <BranchesOutlined className="text-3xl text-green-500 mb-2" />
              <p className="font-medium text-gray-800">{t("addBranch")}</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="text-center p-4 rounded-xl bg-green-50 hover:bg-green-100 cursor-pointer transition-colors duration-200">
              <PictureOutlined className="text-3xl text-green-500 mb-2" />
              <p className="font-medium text-gray-800">{t("addImage")}</p>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default Dashboard
