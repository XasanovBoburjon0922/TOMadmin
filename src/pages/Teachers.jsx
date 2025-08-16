"use client"

import { useState, useEffect } from "react"
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
} from "@ant-design/icons"

const Teachers = () => {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [form] = Form.useForm()

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
      }
    } catch (error) {
      console.error("O'qituvchilarni yuklashda xatolik:", error)
      message.error("O'qituvchilarni yuklashda xatolik yuz berdi")
      setTeachers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
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
        profile_picture_url: values.profile_picture_url || "",
      }

      if (editingTeacher) {
        // Update teacher
        const response = await fetch(`https://api.tom-education.uz/teachers/update?id=${editingTeacher.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(teacherData),
        })

        if (response.ok) {
          message.success("O'qituvchi muvaffaqiyatli yangilandi")
        }
      } else {
        // Create teacher
        const response = await fetch("https://api.tom-education.uz/teachers/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(teacherData),
        })

        if (response.ok) {
          message.success("O'qituvchi muvaffaqiyatli qo'shildi")
        }
      }

      fetchTeachers()
      setIsModalOpen(false)
      setEditingTeacher(null)
      form.resetFields()
    } catch (error) {
      console.error("O'qituvchini saqlashda xatolik:", error)
      message.error("O'qituvchini saqlashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher)
    form.setFieldsValue({
      name_uz: teacher.name?.uz,
      name_en: teacher.name?.en,
      name_ru: teacher.name?.ru,
      contact: teacher.contact,
      experience_years: Number.parseInt(teacher.experience_years),
      graduated_students: Number.parseInt(teacher.graduated_students),
      ielts_score: Number.parseFloat(teacher.ielts_score),
      profile_picture_url: teacher.profile_picture_url,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://api.tom-education.uz/teachers/delete?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        message.success("O'qituvchi muvaffaqiyatli o'chirildi")
        fetchTeachers()
      }
    } catch (error) {
      console.error("O'qituvchini o'chirishda xatolik:", error)
      message.error("O'qituvchini o'chirishda xatolik yuz berdi")
    }
  }

  const columns = [
    {
      title: "O'qituvchi",
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
              {record.name?.uz || record.name?.en || "N/A"}
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
      title: "Tajriba",
      dataIndex: "experience_years",
      key: "experience_years",
      render: (years) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <TrophyOutlined style={{ color: "#faad14" }} />
          <span style={{ fontWeight: 500 }}>{years !== undefined ? `${years} yil` : "N/A"}</span>
        </div>
      ),
    },
    {
      title: "Bitirgan o'quvchilar",
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
      title: "IELTS Ball",
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
      title: "Yaratilgan sana",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => (
        <span style={{ color: "#8c8c8c", fontSize: "12px" }}>
          {date ? new Date(date).toLocaleDateString("uz-UZ") : "N/A"}
        </span>
      ),
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Tahrirlash">
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
            title="O'qituvchini o'chirish"
            description="Haqiqatan ham bu o'qituvchini o'chirmoqchimisiz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ha"
            cancelText="Yo'q"
            okButtonProps={{ style: { background: "#dc2626", borderColor: "#dc2626" } }}
          >
            <Tooltip title="O'chirish">
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
              O'qituvchilar
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.8)",
                margin: "8px 0 0 0",
                fontSize: "16px",
              }}
            >
              O'qituvchilarni boshqarish
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTeacher(null)
              form.resetFields()
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
            Yangi o'qituvchi
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
            showTotal: (total, range) => `${range[0]}-${range[1]} dan ${total} ta o'qituvchi`,
          }}
          locale={{
            emptyText: "Ma'lumot topilmadi",
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
            {editingTeacher ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi qo'shish"}
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingTeacher(null)
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
              label="Ism (Inglizcha)"
              rules={[{ required: true, message: "Ism (Inglizcha) kiritish majburiy!" }]}
            >
              <Input placeholder="Ism (Inglizcha)" style={{ borderRadius: "6px" }} />
            </Form.Item>
            <Form.Item
              name="name_ru"
              label="Ism (Ruscha)"
              rules={[{ required: true, message: "Ism (Ruscha) kiritish majburiy!" }]}
            >
              <Input placeholder="Ism (Ruscha)" style={{ borderRadius: "6px" }} />
            </Form.Item>
          </div>

          <Form.Item
            name="name_uz"
            label="Ism (O'zbekcha)"
            rules={[{ required: true, message: "Ism (O'zbekcha) kiritish majburiy!" }]}
          >
            <Input placeholder="Ism (O'zbekcha)" style={{ borderRadius: "6px" }} />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item
              name="contact"
              label="Telefon raqam"
              rules={[{ required: true, message: "Telefon raqam kiritish majburiy!" }]}
            >
              <Input placeholder="Telefon raqam" style={{ borderRadius: "6px" }} />
            </Form.Item>
            <Form.Item
              name="experience_years"
              label="Tajriba (yil)"
              rules={[{ required: true, message: "Tajriba kiritish majburiy!" }]}
            >
              <InputNumber min={0} placeholder="Tajriba (yil)" style={{ width: "100%", borderRadius: "6px" }} />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item
              name="graduated_students"
              label="Bitirgan o'quvchilar"
              rules={[{ required: true, message: "Bitirgan o'quvchilar soni kiritish majburiy!" }]}
            >
              <InputNumber min={0} placeholder="Bitirgan o'quvchilar" style={{ width: "100%", borderRadius: "6px" }} />
            </Form.Item>
            <Form.Item
              name="ielts_score"
              label="IELTS Ball"
              rules={[{ required: true, message: "IELTS ball kiritish majburiy!" }]}
            >
              <InputNumber
                min={0}
                max={9}
                step={0.5}
                placeholder="IELTS Ball"
                style={{ width: "100%", borderRadius: "6px" }}
              />
            </Form.Item>
          </div>

          <Form.Item name="profile_picture_url" label="Profil rasm URL">
            <Input placeholder="Profil rasm URL (ixtiyoriy)" style={{ borderRadius: "6px" }} />
          </Form.Item>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
            <Button
              onClick={() => {
                setIsModalOpen(false)
                setEditingTeacher(null)
                form.resetFields()
              }}
              style={{ borderRadius: "6px", height: "40px" }}
            >
              Bekor qilish
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
              {editingTeacher ? "Yangilash" : "Qo'shish"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default Teachers
