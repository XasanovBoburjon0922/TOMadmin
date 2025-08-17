"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Table, Button, Modal, Form, Input, message, Popconfirm, Card, Avatar, Tag, InputNumber, Upload, Image } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, TrophyOutlined, UploadOutlined } from "@ant-design/icons"
import axios from "axios"

export default function Students() {
  const { t, i18n } = useTranslation()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
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
      console.log("Fayl yuklash javobi:", response.data)
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
    fetchStudents()
  }, [])

  useEffect(() => {
    console.log("Students massivi yangilandi:", students)
    console.log("Jami studentlar soni (state):", students.length)
  }, [students])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch("https://api.tom-education.uz/certificates/list")
      const data = await response.json()
      console.log("API javobi (certificates/list):", data)
      if (response.ok && data && Array.isArray(data.certificates)) {
        const formattedStudents = data.certificates.map(student => ({
          ...student,
          ielts_score: typeof student.ielts_score === "number" ? Number.parseFloat(student.ielts_score.toFixed(1)) : 0,
        }))
        console.log("Formatlangan studentlar:", formattedStudents)
        console.log("Formatlangan studentlar soni:", formattedStudents.length)
        setStudents(formattedStudents)
      } else {
        console.warn("API javobi kutilgan formatda emas yoki certificates mavjud emas")
        setStudents([])
      }
    } catch (error) {
      console.error(t("fetchError"), error)
      message.error(t("fetchError"))
      setStudents([])
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
    try {
      setLoading(true)
      let certificateUrl = values.certificate_url || ""

      if (file) {
        try {
          certificateUrl = await uploadFile(file)
          message.success(t("uploadSuccess"))
        } catch (error) {
          message.error(error.message)
          setLoading(false)
          return
        }
      } else if (!editingStudent && !certificateUrl) {
        message.error(t("certificateRequired"))
        setLoading(false)
        return
      }

      const studentData = {
        name: {
          uz: values.name_uz,
          en: values.name_en,
          ru: values.name_ru,
        },
        cefr_level: values.cefr_level,
        ielts_score: parseFloat(values.ielts_score.toFixed(1)),
        certificate_url: certificateUrl,
      }
      console.log("Yuborilgan studentData:", studentData)

      let response
      if (editingStudent) {
        response = await fetch(`https://api.tom-education.uz/certificates/update?id=${editingStudent.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentData),
        })
      } else {
        response = await fetch("https://api.tom-education.uz/certificates/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentData),
        })
      }

      if (response.ok) {
        message.success(t("saveStudentSuccess"))
        setModalVisible(false)
        setEditingStudent(null)
        setFile(null)
        setPreviewUrl(null)
        form.resetFields()
        fetchStudents()
      } else {
        throw new Error(t("saveStudentError"))
      }
    } catch (error) {
      console.error(t("saveStudentError"), error)
      message.error(t("saveStudentError"))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://api.tom-education.uz/certificates/delete?id=${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        message.success(t("deleteStudentSuccess"))
        fetchStudents()
      } else {
        throw new Error(t("deleteStudentError"))
      }
    } catch (error) {
      console.error(t("deleteStudentError"), error)
      message.error(t("deleteStudentError"))
    }
  }

  const openModal = (student) => {
    if (student) {
      setEditingStudent(student)
      form.setFieldsValue({
        name_uz: student.name?.uz || "",
        name_en: student.name?.en || "",
        name_ru: student.name?.ru || "",
        cefr_level: student.cefr_level || "",
        ielts_score: typeof student.ielts_score === "number" ? Number.parseFloat(student.ielts_score.toFixed(1)) : 0,
        certificate_url: student.certificate_url || "",
      })
      setFile(null)
      setPreviewUrl(student.certificate_url || null)
    } else {
      setEditingStudent(null)
      setFile(null)
      setPreviewUrl(null)
      form.resetFields()
    }
    setModalVisible(true)
  }

  const getCEFRColor = (level) => {
    const colors = {
      A1: "#f59e0b",
      A2: "#eab308",
      B1: "#22c55e",
      B2: "#16a34a",
      C1: "#059669",
      C2: "#047857",
    }
    return colors[level] || "#6b7280"
  }

  const getIELTSColor = (score) => {
    if (score >= 8.5) return "#047857"
    if (score >= 7.5) return "#059669"
    if (score >= 6.5) return "#16a34a"
    if (score >= 5.5) return "#22c55e"
    return "#f59e0b"
  }

  const columns = [
    {
      title: t("studentName"),
      dataIndex: ["name", i18n.language],
      key: "name",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            size={40}
            style={{
              background: "linear-gradient(135deg, #22c55e 0%, #059669 100%)",
              color: "white",
              fontWeight: "bold",
            }}
          >
            {text?.charAt(0)?.toUpperCase() || "N/A"}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500, color: "#374151" }}>{text || "N/A"}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{record.name?.en || "N/A"}</div>
          </div>
        </div>
      ),
    },
    {
      title: t("cefrLevel"),
      dataIndex: "cefr_level",
      key: "cefr_level",
      render: (level) => (
        <Tag
          color={getCEFRColor(level)}
          style={{
            borderRadius: 12,
            fontWeight: "bold",
            fontSize: 12,
            padding: "4px 12px",
          }}
        >
          {level || "N/A"}
        </Tag>
      ),
    },
    {
      title: t("ieltsScore"),
      dataIndex: "ielts_score",
      key: "ielts_score",
      render: (score) => {
        const numScore = Number.parseFloat(score)
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TrophyOutlined style={{ color: getIELTSColor(numScore) }} />
            <Tag
              color={getIELTSColor(numScore)}
              style={{
                borderRadius: 12,
                fontWeight: "bold",
                fontSize: 12,
                padding: "4px 12px",
              }}
            >
              {score ? score.toFixed(1) : "N/A"}
            </Tag>
          </div>
        )
      },
    },
    {
      title: t("certificate"),
      dataIndex: "certificate_url",
      key: "certificate_url",
      render: (url) =>
        url ? (
          <Button
            type="link"
            onClick={() => window.open(url, "_blank")}
            style={{ color: "#22c55e", padding: 0 }}
          >
            {t("viewCertificate")}
          </Button>
        ) : (
          <span style={{ color: "#9ca3af" }}>{t("noCertificate")}</span>
        ),
    },
    {
      title: t("createdDate"),
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => (
        <span style={{ color: "#6b7280", fontSize: 12 }}>
          {date ? new Date(date).toLocaleDateString(i18n.language) : "N/A"}
        </span>
      ),
    },
    {
      title: t("actions"),
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
            style={{
              background: "#22c55e",
              borderColor: "#22c55e",
            }}
          />
          <Popconfirm
            title={t("deleteStudent")}
            description={t("deleteStudentConfirm")}
            onConfirm={() => handleDelete(record.id)}
            okText={t("okText")}
            cancelText={t("cancelText")}
            okButtonProps={{ style: { background: "#dc2626", borderColor: "#dc2626" } }}
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#16a34a",
            fontSize: 28,
            fontWeight: "bold",
          }}
        >
          {t("studentsHeader")}
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
          style={{
            background: "#22c55e",
            borderColor: "#22c55e",
            borderRadius: 8,
          }}
        >
          {t("addStudentButton")}
        </Button>
      </div>

      <Card style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ marginBottom: 16 }}>
          {t("totalStudentsLabel")}: {students.length}
        </div>
        <Table
          columns={columns}
          dataSource={students}
          loading={loading}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title={
          <span style={{ color: "#16a34a", fontSize: 18, fontWeight: "bold" }}>
            {editingStudent ? t("editStudent") : t("addStudentButton")}
          </span>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setEditingStudent(null)
          setFile(null)
          setPreviewUrl(null)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 20 }}>
          <Form.Item
            name="name_uz"
            label={t("nameUzLabel")}
            rules={[{ required: true, message: t("nameUzRequired") }]}
          >
            <Input placeholder={t("nameUzLabel")} style={{ borderRadius: "6px" }} />
          </Form.Item>

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

          <Form.Item
            name="cefr_level"
            label={t("cefrLevelLabel")}
            rules={[{ required: true, message: t("cefrLevelRequired") }]}
          >
            <Input placeholder="A1, A2, B1, B2, C1, C2" style={{ borderRadius: "6px" }} />
          </Form.Item>

          <Form.Item
            name="ielts_score"
            label={t("ieltsScoreLabel")}
            rules={[{ required: true, message: t("ieltsScoreRequired") }]}
          >
            <InputNumber
              placeholder={t("ieltsScoreLabel")}
              min={0}
              max={9}
              step={0.5}
              style={{ width: "100%", borderRadius: "6px" }}
            />
          </Form.Item>

          <Form.Item
            name="certificate"
            label={t("certificateUploadLabel")}
            rules={[{ required: !editingStudent, message: t("certificateRequired") }]}
          >
            <Upload
              beforeUpload={() => false}
              onChange={handleFileChange}
              accept="image/*"
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>{t("certificateUploadLabel")}</Button>
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

          {(previewUrl || editingStudent?.certificate_url) && (
            <Form.Item label={t("imagePreview")}>
              <Image
                src={previewUrl || editingStudent?.certificate_url}
                alt={t("imagePreview")}
                style={{ maxWidth: "150px", maxHeight: "150px", borderRadius: "6px", marginTop: "10px" }}
                fallback="https://via.placeholder.com/150?text=Rasm+yuklanmadi"
              />
            </Form.Item>
          )}

          {editingStudent && (
            <Form.Item name="certificate_url" label={t("certificateUrlLabel")}>
              <Input placeholder={t("certificateUrlLabel")} style={{ borderRadius: "6px" }} disabled />
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button
              onClick={() => {
                setModalVisible(false)
                setEditingStudent(null)
                setFile(null)
                setPreviewUrl(null)
                form.resetFields()
              }}
              style={{ marginRight: 8, borderRadius: "6px" }}
            >
              {t("cancel")}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                background: "#22c55e",
                borderColor: "#22c55e",
                borderRadius: "6px",
              }}
            >
              {editingStudent ? t("save") : t("addStudentButton")}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}