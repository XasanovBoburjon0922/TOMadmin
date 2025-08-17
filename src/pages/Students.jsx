"use client"

import { useState, useEffect } from "react"
import { Table, Button, Modal, Form, Input, message, Popconfirm, Card, Avatar, Tag, InputNumber, Upload, Image } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, TrophyOutlined, UploadOutlined } from "@ant-design/icons"
import axios from "axios"

export default function Students() {
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
        throw new Error("API dan sertifikat URL qaytarilmadi")
      }
    } catch (error) {
      console.error("Fayl yuklash xatosi:", error)
      throw new Error("Sertifikat yuklashda xatolik yuz berdi")
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
      console.error("O'quvchilarni yuklashda xatolik:", error)
      message.error("O'quvchilarni yuklashda xatolik yuz berdi")
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = ({ file }) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        message.error("Fayl hajmi 5MB dan kichik bo'lishi kerak")
        return
      }
      if (!file.type.startsWith("image/")) {
        message.error("Faqat rasm fayllarini yuklash mumkin")
        return
      }
      setFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      let certificateUrl = values.certificate_url || "";
  
      if (file) {
        try {
          certificateUrl = await uploadFile(file);
          message.success("Sertifikat muvaffaqiyatli yuklandi");
        } catch (error) {
          message.error(error.message);
          setLoading(false);
          return;
        }
      } else if (!editingStudent && !certificateUrl) {
        message.error("Yangi o'quvchi uchun sertifikat yuklash zarur");
        setLoading(false);
        return;
      }
  
      const studentData = {
        name: {
          uz: values.name_uz,
          en: values.name_en,
          ru: values.name_ru,
        },
        cefr_level: values.cefr_level,
        ielts_score: parseFloat(values.ielts_score.toFixed(1)), // Ensure float with 1 decimal place
        certificate_url: certificateUrl,
      };
      console.log("Yuborilgan studentData:", studentData);
  
      let response;
      if (editingStudent) {
        response = await fetch(`https://api.tom-education.uz/certificates/update?id=${editingStudent.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentData),
        });
      } else {
        response = await fetch("https://api.tom-education.uz/certificates/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentData),
        });
      }
  
      if (response.ok) {
        message.success(editingStudent ? "O'quvchi muvaffaqiyatli yangilandi" : "O'quvchi muvaffaqiyatli qo'shildi");
        setModalVisible(false);
        setEditingStudent(null);
        setFile(null);
        setPreviewUrl(null);
        form.resetFields();
        fetchStudents();
      } else {
        throw new Error("Server javobi muvaffaqiyatsiz");
      }
    } catch (error) {
      console.error("O'quvchini saqlashda xatolik:", error);
      message.error("O'quvchini saqlashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://api.tom-education.uz/certificates/delete?id=${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        message.success("O'quvchi muvaffaqiyatli o'chirildi")
        fetchStudents()
      } else {
        throw new Error("O'chirish muvaffaqiyatsiz")
      }
    } catch (error) {
      console.error("O'quvchini o'chirishda xatolik:", error)
      message.error("O'quvchini o'chirishda xatolik yuz berdi")
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
      title: "O'quvchi",
      dataIndex: ["name", "uz"],
      key: "name_uz",
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
      title: "CEFR Daraja",
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
      title: "IELTS Ball",
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
      title: "Sertifikat",
      dataIndex: "certificate_url",
      key: "certificate_url",
      render: (url) =>
        url ? (
          <Button
            type="link"
            onClick={() => window.open(url, "_blank")}
            style={{ color: "#22c55e", padding: 0 }}
          >
            Ko'rish
          </Button>
        ) : (
          <span style={{ color: "#9ca3af" }}>Mavjud emas</span>
        ),
    },
    {
      title: "Sana",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => (
        <span style={{ color: "#6b7280", fontSize: 12 }}>
          {date ? new Date(date).toLocaleDateString("uz-UZ") : "N/A"}
        </span>
      ),
    },
    {
      title: "Amallar",
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
            title="O'quvchini o'chirish"
            description="Haqiqatan ham bu o'quvchini o'chirmoqchimisiz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ha"
            cancelText="Yo'q"
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
          O'quvchilar
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
          Yangi o'quvchi
        </Button>
      </div>

      <Card style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ marginBottom: 16 }}>
          Jami studentlar soni: {students.length}
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
            {editingStudent ? "O'quvchini tahrirlash" : "Yangi o'quvchi qo'shish"}
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
            label="Ism (O'zbekcha)"
            rules={[{ required: true, message: "Ism (O'zbekcha) kiritish majburiy!" }]}
          >
            <Input placeholder="Ism (O'zbekcha)" style={{ borderRadius: "6px" }} />
          </Form.Item>

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

          <Form.Item
            name="cefr_level"
            label="CEFR Daraja"
            rules={[{ required: true, message: "CEFR daraja kiritish majburiy!" }]}
          >
            <Input placeholder="A1, A2, B1, B2, C1, C2" style={{ borderRadius: "6px" }} />
          </Form.Item>

          <Form.Item
            name="ielts_score"
            label="IELTS Ball"
            rules={[
              { required: true, message: "IELTS ball kiritish majburiy!" },
            ]}
          >
            <InputNumber
              placeholder="IELTS ball (masalan, 8.0, 8.5)"
              min={0}
              max={9}
              step={0.5}
              style={{ width: "100%", borderRadius: "6px" }}
            />
          </Form.Item>

          <Form.Item
            name="certificate"
            label="Sertifikat rasmni yuklash"
            rules={[{ required: !editingStudent, message: "Sertifikat rasmni yuklash zarur" }]}
          >
            <Upload
              beforeUpload={() => false}
              onChange={handleFileChange}
              accept="image/*"
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Rasm tanlash</Button>
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
                Rasmni olib tashlash
              </Button>
            )}
          </Form.Item>

          {(previewUrl || editingStudent?.certificate_url) && (
            <Form.Item label="Rasm oldindan ko'rish">
              <Image
                src={previewUrl || editingStudent?.certificate_url}
                alt="Sertifikat oldindan ko'rish"
                style={{ maxWidth: "150px", maxHeight: "150px", borderRadius: "6px", marginTop: "10px" }}
                fallback="https://via.placeholder.com/150?text=Rasm+yuklanmadi"
              />
            </Form.Item>
          )}

          {editingStudent && (
            <Form.Item name="certificate_url" label="Mavjud sertifikat URL">
              <Input placeholder="Sertifikat URL manzili" style={{ borderRadius: "6px" }} disabled />
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
              Bekor qilish
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
              {editingStudent ? "Yangilash" : "Qo'shish"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}