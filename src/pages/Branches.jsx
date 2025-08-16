"use client"

import { useState, useEffect } from "react"
import { Card, Table, Button, Form, Input, Modal, Space, Avatar, Tooltip, message, Popconfirm } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined } from "@ant-design/icons"

const Branches = () => {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    setLoading(true)
    try {
      const response = await fetch("https://api.tom-education.uz/branches/list")
      const data = await response.json()

      if (data.branches) {
        setBranches(data.branches)
      }
    } catch (error) {
      console.error("Filiallarni yuklashda xatolik:", error)
      message.error("Filiallarni yuklashda xatolik yuz berdi")
      setBranches([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      const branchData = {
        name: {
          uz: values.name_uz,
          en: values.name_en,
          ru: values.name_ru,
        },
        contact: values.contact,
        google_url: values.google_url,
        yandex_url: values.yandex_url,
        img_url: values.img_url || "",
      }

      if (editingBranch) {
        // Update branch
        const response = await fetch(`https://api.tom-education.uz/branches/update?id=${editingBranch.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(branchData),
        })

        if (response.ok) {
          message.success("Filial muvaffaqiyatli yangilandi")
        }
      } else {
        // Create branch
        const response = await fetch("https://api.tom-education.uz/branches/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(branchData),
        })

        if (response.ok) {
          message.success("Filial muvaffaqiyatli qo'shildi")
        }
      }

      fetchBranches()
      setIsModalOpen(false)
      setEditingBranch(null)
      form.resetFields()
    } catch (error) {
      console.error("Filialni saqlashda xatolik:", error)
      message.error("Filialni saqlashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (branch) => {
    setEditingBranch(branch)
    form.setFieldsValue({
      name_uz: branch.name?.uz,
      name_en: branch.name?.en,
      name_ru: branch.name?.ru,
      contact: branch.contact,
      google_url: branch.google_url,
      yandex_url: branch.yandex_url,
      img_url: branch.img_url,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://api.tom-education.uz/branches/delete?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        message.success("Filial muvaffaqiyatli o'chirildi")
        fetchBranches()
      }
    } catch (error) {
      console.error("Filialni o'chirishda xatolik:", error)
      message.error("Filialni o'chirishda xatolik yuz berdi")
    }
  }

  const columns = [
    {
      title: "Filial nomi",
      key: "branch",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            size={48}
            src={record.img_url}
            icon={<EnvironmentOutlined />}
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
              <EnvironmentOutlined />
              Filial manzili
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Telefon raqam",
      dataIndex: "contact",
      key: "contact",
      render: (contact) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontWeight: 500 }}>{contact}</span>
        </div>
      ),
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
            title="Filialni o'chirish"
            description="Haqiqatan ham bu filialni o'chirmoqchimisiz?"
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
              Filiallar
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.8)",
                margin: "8px 0 0 0",
                fontSize: "16px",
              }}
            >
              Filiallar
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingBranch(null)
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
            Filial qo'shish
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
          dataSource={branches}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} Filiallar`,
          }}
          locale={{
            emptyText: "Ma'lumotlar yo'q", // Custom message for empty table
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
            {editingBranch ? "Tahrirlash" + " Filial nomi" : "Filial qo'shish"}
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
        style={{ top: 20 }}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical" style={{ marginTop: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item
              name="name_uz"
              label="Filial nomi (O'zbek)"
              rules={[{ required: true, message: "Filial nomi (O'zbek) zarur" }]}
            >
              <Input placeholder="Filial nomi (O'zbek)" style={{ borderRadius: "6px" }} />
            </Form.Item>
            <Form.Item
              name="name_en"
              label="Filial nomi (English)"
              rules={[{ required: true, message: "Filial nomi (English) zarur" }]}
            >
              <Input placeholder="Filial nomi (English)" style={{ borderRadius: "6px" }} />
            </Form.Item>
          </div>

          <Form.Item
            name="name_ru"
            label="Filial nomi (Russian)"
            rules={[{ required: true, message: "Filial nomi (Russian) zarur" }]}
          >
            <Input placeholder="Filial nomi (Russian)" style={{ borderRadius: "6px" }} />
          </Form.Item>

          <Form.Item name="contact" label="Telefon raqam" rules={[{ required: true, message: "Telefon raqam zarur" }]}>
            <Input placeholder="Telefon raqam" style={{ borderRadius: "6px" }} />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item
              name="google_url"
              label="Google Maps URL"
              rules={[{ required: true, message: "Google Maps URL zarur" }]}
            >
              <Input placeholder="https://maps.google.com/..." style={{ borderRadius: "6px" }} />
            </Form.Item>
            <Form.Item
              name="yandex_url"
              label="Yandex Maps URL"
              rules={[{ required: true, message: "Yandex Maps URL zarur" }]}
            >
              <Input placeholder="https://yandex.com/maps/..." style={{ borderRadius: "6px" }} />
            </Form.Item>
          </div>

          <Form.Item name="img_url" label="Rasmni yuklash">
            <Input placeholder="Rasm URL manzili" style={{ borderRadius: "6px" }} />
          </Form.Item>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
            <Button onClick={() => setIsModalOpen(false)} style={{ borderRadius: "6px", height: "40px" }}>
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
              {editingBranch ? "Saqlash" : "Qo'shish"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default Branches
