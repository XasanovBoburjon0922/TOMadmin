"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  Modal,
  Space,
  Avatar,
  Tooltip,
  Tag,
  message,
  InputNumber,
  Popconfirm,
  Upload,
  Image,
} from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  TrophyOutlined,
  BookOutlined,
  StarOutlined,
  UploadOutlined,
} from "@ant-design/icons"
import axios from "axios"

const Teachers = () => {
  const { t, i18n } = useTranslation()
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [form] = Form.useForm()
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  // Fayl yuklash funksiyasi
  const uploadFile = async (file) => {
    const formData = new FormData()
    formData.append("file", file)
    try {
      const response = await axios.post("https://api.tom-education.uz/file-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      if (response.status === 200 && response.data.Url) {
        return response.data.Url
      } else {
        throw new Error(t("uploadError"))
      }
    } catch (error) {
      console.error(t("uploadError"), error)
      throw new Error(t("uploadError"))
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    setLoading(true)
    try {
      const response = await fetch("https://api.tom-education.uz/teachers/list")
      const data = await response.json()
      if (data.teacher) {
        setTeachers(data.teacher)
      } else {
        setTeachers([])
      }
    } catch (error) {
      console.error(t("fetchError"), error)
      message.error(t("fetchError"))
      setTeachers([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = ({ file }) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        message.error(t("imageSizeError"))
        return
      }
      if (!file.type.startsWith("image/")) {
        message.error(t("imageTypeError"))
        return
      }
      setFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      let profilePictureUrl = values.profile_picture_url || ""

      if (file) {
        try {
          profilePictureUrl = await uploadFile(file)
          message.success(t("uploadSuccess"))
        } catch (error) {
          message.error(error.message)
          setLoading(false)
          return
        }
      } else if (!editingTeacher && !profilePictureUrl) {
        message.error(t("profilePictureRequired"))
        setLoading(false)
        return
      }

      const teacherData = {
        name: {
          uz: values.name_uz,
          en: values.name_en,
          ru: values.name_ru,
        },
        contact: values.contact,
        experience_years: values.experience_years.toString(),
        graduated_students: values.graduated_students.toString(),
        ielts_score: values.ielts_score.toString(),
        profile_picture_url: profilePictureUrl,
      }

      let response
      if (editingTeacher) {
        response = await fetch(`https://api.tom-education.uz/teachers/update?id=${editingTeacher.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(teacherData),
        })
      } else {
        response = await fetch("https://api.tom-education.uz/teachers/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(teacherData),
        })
      }

      if (response.ok) {
        message.success(t("saveTeacherSuccess"))
        fetchTeachers()
        setIsModalOpen(false)
        setEditingTeacher(null)
        setFile(null)
        setPreviewUrl(null)
        form.resetFields()
      } else {
        throw new Error(t("saveTeacherError"))
      }
    } catch (error) {
      console.error(t("saveTeacherError"), error)
      message.error(t("saveTeacherError"))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher)
    form.setFieldsValue({
      name_uz: teacher.name?.uz || "",
      name_en: teacher.name?.en || "",
      name_ru: teacher.name?.ru || "",
      contact: teacher.contact || "",
      experience_years: Number.parseInt(teacher.experience_years) || 0,
      graduated_students: Number.parseInt(teacher.graduated_students) || 0,
      ielts_score: Number.parseFloat(teacher.ielts_score) || 0,
      profile_picture_url: teacher.profile_picture_url || "",
    })
    setFile(null)
    setPreviewUrl(teacher.profile_picture_url || null)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://api.tom-education.uz/teachers/delete?id=${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        message.success(t("deleteTeacherSuccess"))
        fetchTeachers()
      } else {
        throw new Error(t("deleteTeacherError"))
      }
    } catch (error) {
      console.error(t("deleteTeacherError"), error)
      message.error(t("deleteTeacherError"))
    }
  }

  const columns = [
    {
      title: t("teacherNameLabel"),
      key: "teacher",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            size={48}
            src={record.profile_picture_url}
            icon={<UserOutlined />}
            style={{
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              border: "2px solid #f0f0f0",
            }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: "14px", color: "#262626" }}>
              {record.name?.[i18n.language] || record.name?.en || "N/A"}
            </div>
            <div style={{ fontSize: "12px", color: "#8c8c8c", display: "flex", alignItems: "center", gap: "4px" }}>
              <PhoneOutlined />
              {record.contact || "N/A"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("experienceYears"),
      dataIndex: "experience_years",
      key: "experience_years",
      render: (years) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <TrophyOutlined style={{ color: "#faad14" }} />
          <span style={{ fontWeight: 500 }}>{years !== undefined ? `${years} ${t("years")}` : "N/A"}</span>
        </div>
      ),
    },
    {
      title: t("graduatedStudentsLabel"),
      dataIndex: "graduated_students",
      key: "graduated_students",
      render: (students) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <BookOutlined style={{ color: "#52c41a" }} />
          <span style={{ fontWeight: 500 }}>{students !== undefined ? students : "N/A"}</span>
        </div>
      ),
    },
    {
      title: t("ieltsScore"),
      dataIndex: "ielts_score",
      key: "ielts_score",
      render: (score) => {
        const numScore = Number.parseFloat(score)
        return (
          <Tag
            color={numScore >= 8 ? "green" : numScore >= 7 ? "blue" : numScore >= 6 ? "orange" : "red"}
            style={{
              fontWeight: 600,
              fontSize: "12px",
              padding: "4px 8px",
              borderRadius: "6px",
            }}
          >
            <StarOutlined /> {score !== undefined ? score : "N/A"}
          </Tag>
        )
      },
    },
    {
      title: t("createdDate"),
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => (
        <span style={{ color: "#8c8c8c", fontSize: "12px" }}>
          {date ? new Date(date).toLocaleDateString(i18n.language) : "N/A"}
        </span>
      ),
    },
    {
      title: t("actions"),
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title={t("edit")}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{
                color: "#22c55e",
                border: "1px solid #d9d9d9",
                borderRadius: "6px",
              }}
            />
          </Tooltip>
          <Popconfirm
            title={t("deleteTeacher")}
            description={t("deleteTeacherConfirm")}
            onConfirm={() => handleDelete(record.id)}
            okText={t("okText")}
            cancelText={t("cancelText")}
            okButtonProps={{ style: { background: "#dc2626", borderColor: "#dc2626" } }}
          >
            <Tooltip title={t("delete")}>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                style={{
                  border: "1px solid #d9d9d9",
                  borderRadius: "6px",
                }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <Card
        style={{
          marginBottom: "24px",
          background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
          border: "none",
          borderRadius: "12px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1
              style={{
                color: "white",
                margin: 0,
                fontSize: "28px",
                fontWeight: 700,
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {t("teachersHeader")}
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.8)",
                margin: "8px 0 0 0",
                fontSize: "16px",
              }}
            >
              {t("teachersSubtitle")}
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTeacher(null)
              form.resetFields()
              setFile(null)
              setPreviewUrl(null)
              setIsModalOpen(true)
            }}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "8px",
              height: "48px",
              fontSize: "16px",
              fontWeight: 600,
              backdropFilter: "blur(10px)",
            }}
          >
            {t("addTeacherButton")}
          </Button>
        </div>
      </Card>

      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          border: "1px solid #f0f0f0",
        }}
      >
        <Table
          columns={columns}
          dataSource={teachers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => t("paginationTeachersTotal", { range0: range[0], range1: range[1], total }),
          }}
          locale={{
            emptyText: t("noTeachers"),
          }}
          style={{
            background: "white",
          }}
          rowClassName={() => "hover:bg-gray-50"}
        />
      </Card>

      <Modal
        title={
          <div
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "#262626",
              padding: "8px 0",
            }}
          >
            {editingTeacher ? t("editTeacher") : t("addTeacherButton")}
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingTeacher(null)
          setFile(null)
          setPreviewUrl(null)
          form.resetFields()
        }}
        footer={null}
        width={600}
        style={{ top: 20 }}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical" style={{ marginTop: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item
              name="name_en"
              label={t("nameEnLabel")}
              rules={[{ required: true, message: t("nameEnRequired") }]}
            >
              <Input placeholder={t("nameEnLabel")} style={{ borderRadius: "6px" }} />
            </Form.Item>
            <Form.Item
              name="name_ru"
              label={t("nameRuLabel")}
              rules={[{ required: true, message: t("nameRuRequired") }]}
            >
              <Input placeholder={t("nameRuLabel")} style={{ borderRadius: "6px" }} />
            </Form.Item>
          </div>

          <Form.Item
            name="name_uz"
            label={t("nameUzLabel")}
            rules={[{ required: true, message: t("nameUzRequired") }]}
          >
            <Input placeholder={t("nameUzLabel")} style={{ borderRadius: "6px" }} />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item
              name="contact"
              label={t("contactLabel")}
              rules={[{ required: true, message: t("contactRequired") }]}
            >
              <Input placeholder={t("contactLabel")} style={{ borderRadius: "6px" }} />
            </Form.Item>
            <Form.Item
              name="experience_years"
              label={t("experienceYears")}
              rules={[{ required: true, message: t("experienceYearsRequired") }]}
            >
              <InputNumber min={0} placeholder={t("experienceYears")} style={{ width: "100%", borderRadius: "6px" }} />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item
              name="graduated_students"
              label={t("graduatedStudentsLabel")}
              rules={[{ required: true, message: t("graduatedStudentsRequired") }]}
            >
              <InputNumber min={0} placeholder={t("graduatedStudentsLabel")} style={{ width: "100%", borderRadius: "6px" }} />
            </Form.Item>
            <Form.Item
              name="ielts_score"
              label={t("ieltsScoreLabel")}
              rules={[{ required: true, message: t("ieltsScoreRequired") }]}
            >
              <InputNumber
                min={0}
                max={9}
                step={0.5}
                placeholder={t("ieltsScoreLabel")}
                style={{ width: "100%", borderRadius: "6px" }}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="image"
            label={t("profilePictureLabel")}
            rules={[{ required: !editingTeacher, message: t("profilePictureRequired") }]}
          >
            <Upload
              beforeUpload={() => false}
              onChange={handleFileChange}
              accept="image/*"
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>{t("profilePictureLabel")}</Button>
              {file && <span style={{ marginLeft: "10px" }}>{file.name}</span>}
            </Upload>
            {file && (
              <Button
                style={{ marginLeft: "10px", marginTop: "10px" }}
                onClick={() => {
                  setFile(null)
                  setPreviewUrl(null)
                }}
              >
                {t("removeImage")}
              </Button>
            )}
          </Form.Item>

          {(previewUrl || editingTeacher?.profile_picture_url) && (
            <Form.Item label={t("imagePreview")}>
              <Image
                src={previewUrl || editingTeacher?.profile_picture_url}
                alt={t("imagePreview")}
                style={{ maxWidth: "150px", maxHeight: "150px", borderRadius: "6px", marginTop: "10px" }}
                fallback="https://via.placeholder.com/150?text=Rasm+yuklanmadi"
              />
            </Form.Item>
          )}

          {editingTeacher && (
            <Form.Item name="profile_picture_url" label={t("profilePictureUrlLabel")}>
              <Input placeholder={t("profilePictureUrlLabel")} style={{ borderRadius: "6px" }} disabled />
            </Form.Item>
          )}

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
            <Button
              onClick={() => {
                setIsModalOpen(false)
                setEditingTeacher(null)
                setFile(null)
                setPreviewUrl(null)
                form.resetFields()
              }}
              style={{ borderRadius: "6px", height: "40px" }}
            >
              {t("cancel")}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                borderRadius: "6px",
                height: "40px",
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                border: "none",
              }}
            >
              {editingTeacher ? t("save") : t("addTeacherButton")}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default Teachers