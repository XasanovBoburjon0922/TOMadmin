"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Card, Table, Button, Form, Input, Modal, Space, Avatar, Tooltip, message, Popconfirm, Upload, Image } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined, UploadOutlined } from "@ant-design/icons"
import axios from "axios"

const Branches = () => {
  const { t, i18n } = useTranslation()
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
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
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    setLoading(true)
    try {
      const response = await fetch("https://api.tom-education.uz/branches/list")
      const data = await response.json()
      if (data.branches) {
        setBranches(data.branches)
      } else {
        setBranches([])
      }
    } catch (error) {
      console.error(t("fetchError"), error)
      message.error(t("fetchError"))
      setBranches([])
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
      let imgUrl = values.img_url || ""

      if (file) {
        try {
          imgUrl = await uploadFile(file)
          message.success(t("uploadSuccess"))
        } catch (error) {
          message.error(error.message)
          setLoading(false)
          return
        }
      } else if (!editingBranch && !imgUrl) {
        message.error(t("imageRequired"))
        setLoading(false)
        return
      }

      const branchData = {
        name: {
          uz: values.name_uz,
          en: values.name_en,
          ru: values.name_ru,
        },
        contact: values.contact,
        google_url: values.google_url,
        yandex_url: values.yandex_url,
        img_url: imgUrl,
      }

      let response
      if (editingBranch) {
        response = await fetch(`https://api.tom-education.uz/branches/update?id=${editingBranch.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(branchData),
        })
      } else {
        response = await fetch("https://api.tom-education.uz/branches/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(branchData),
        })
      }

      if (response.ok) {
        message.success(t("saveSuccess"))
        fetchBranches()
        setIsModalOpen(false)
        setEditingBranch(null)
        setFile(null)
        setPreviewUrl(null)
        form.resetFields()
      } else {
        throw new Error(t("saveError"))
      }
    } catch (error) {
      console.error(t("saveError"), error)
      message.error(t("saveError"))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (branch) => {
    setEditingBranch(branch)
    form.setFieldsValue({
      name_uz: branch.name?.uz || "",
      name_en: branch.name?.en || "",
      name_ru: branch.name?.ru || "",
      contact: branch.contact || "",
      google_url: branch.google_url || "",
      yandex_url: branch.yandex_url || "",
      img_url: branch.img_url || "",
    })
    setFile(null)
    setPreviewUrl(branch.img_url || null)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://api.tom-education.uz/branches/delete?id=${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        message.success(t("deleteSuccess"))
        fetchBranches()
      } else {
        throw new Error(t("deleteError"))
      }
    } catch (error) {
      console.error(t("deleteError"), error)
      message.error(t("deleteError"))
    }
  }

  const columns = [
    {
      title: t("branchName"),
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
              {record.name?.[i18n.language] || record.name?.en || "N/A"}
            </div>
            <div style={{ fontSize: "12px", color: "#8c8c8c", display: "flex", alignItems: "center", gap: "4px" }}>
              <EnvironmentOutlined />
              {t("branchAddress")}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("contactLabel"),
      dataIndex: "contact",
      key: "contact",
      render: (contact) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontWeight: 500 }}>{contact}</span>
        </div>
      ),
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
            title={t("deleteBranch")}
            description={t("deleteConfirm")}
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
              {t("branchHeader")}
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.8)",
                margin: "8px 0 0 0",
                fontSize: "16px",
              }}
            >
              {t("branchSubtitle")}
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingBranch(null)
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
            {t("addBranchButton")}
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
          }}
          locale={{
            emptyText: t("noBranches"),
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
            {editingBranch ? t("editBranch") : t("addBranchButton")}
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
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
              name="name_uz"
              label={t("branchNameUz")}
              rules={[{ required: true, message: t("nameUzRequired") }]}
            >
              <Input placeholder={t("branchNameUz")} style={{ borderRadius: "6px" }} />
            </Form.Item>
            <Form.Item
              name="name_en"
              label={t("branchNameEn")}
              rules={[{ required: true, message: t("nameEnRequired") }]}
            >
              <Input placeholder={t("branchNameEn")} style={{ borderRadius: "6px" }} />
            </Form.Item>
          </div>

          <Form.Item
            name="name_ru"
            label={t("branchNameRu")}
            rules={[{ required: true, message: t("nameRuRequired") }]}
          >
            <Input placeholder={t("branchNameRu")} style={{ borderRadius: "6px" }} />
          </Form.Item>

          <Form.Item
            name="contact"
            label={t("contactLabel")}
            rules={[{ required: true, message: t("contactRequired") }]}
          >
            <Input placeholder={t("contactLabel")} style={{ borderRadius: "6px" }} />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item
              name="google_url"
              label={t("googleUrl")}
              rules={[{ required: true, message: t("googleUrlRequired") }]}
            >
              <Input placeholder="https://maps.google.com/..." style={{ borderRadius: "6px" }} />
            </Form.Item>
            <Form.Item
              name="yandex_url"
              label={t("yandexUrl")}
              rules={[{ required: true, message: t("yandexUrlRequired") }]}
            >
              <Input placeholder="https://yandex.com/maps/..." style={{ borderRadius: "6px" }} />
            </Form.Item>
          </div>

          <Form.Item
            name="image"
            label={t("uploadImageLabel")}
            rules={[{ required: !editingBranch, message: t("imageRequired") }]}
          >
            <Upload
              beforeUpload={() => false}
              onChange={handleFileChange}
              accept="image/*"
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>{t("uploadImageLabel")}</Button>
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

          {(previewUrl || editingBranch?.img_url) && (
            <Form.Item label={t("imagePreview")}>
              <Image
                src={previewUrl || editingBranch?.img_url}
                alt={t("imagePreview")}
                style={{ maxWidth: "150px", maxHeight: "150px", borderRadius: "6px", marginTop: "10px" }}
                fallback="https://via.placeholder.com/150?text=Rasm+yuklanmadi"
              />
            </Form.Item>
          )}

          {editingBranch && (
            <Form.Item name="img_url" label={t("existingImageUrl")}>
              <Input placeholder={t("existingImageUrl")} style={{ borderRadius: "6px" }} disabled />
            </Form.Item>
          )}

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
            <Button
              onClick={() => {
                setIsModalOpen(false)
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
              {editingBranch ? t("save") : t("addBranchButton")}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default Branches