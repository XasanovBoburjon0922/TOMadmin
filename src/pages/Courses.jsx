
"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import {
  Card,
  Table,
  Button,
  Form,
  Modal,
  Input,
  Tag,
  InputNumber,
  Upload,
  Space,
  Typography,
  message,
} from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  BookOutlined,
} from "@ant-design/icons"
import { listCourses, createCourse, updateCourse, deleteCourse } from "../api/api"

const { Title } = Typography

// API function for file upload with enhanced error handling
const uploadFile = async (file) => {
  const formData = new FormData()
  formData.append("file", file)
  try {
    const response = await fetch("https://api.tom-education.uz/file-upload", {
      method: "POST",
      body: formData,
    })
    const data = await response.json()
    if (response.status === 200) {
      if (!data.Url) {
        throw new Error("Response missing 'Url' field")
      }
      return data.Url
    } else {
      throw new Error(`File upload failed with status ${response.status}: ${JSON.stringify(data)}`)
    }
  } catch (error) {
    console.error("Upload File Error:", {
      message: error.message,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })
    return "" // Fallback to empty string if upload fails
  }
}

const Courses = () => {
  const { t, i18n } = useTranslation()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const response = await listCourses()
      const data = response?.data?.courses || []
      setCourses(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Fetch Error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      })
      message.error(t("fetchError") + `: ${error.message}`)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    const descriptionArray = values.description.split("\n").filter(line => line.trim() !== "")

    try {
      let response
      let payload

      // Try multipart/form-data first
      const formData = new FormData()
      formData.append("name", JSON.stringify(values.name))
      formData.append("branch_description", JSON.stringify(values.branch_description))
      formData.append("duration", JSON.stringify(values.duration))
      formData.append("description", JSON.stringify(descriptionArray))
      // Send price as a number directly
      formData.append("price", parseFloat(values.price))
      formData.append("type", values.type || "")

      let pictureUrl = editingCourse?.picture_url || ""
      if (values.file?.[0]?.originFileObj) {
        pictureUrl = await uploadFile(values.file[0].originFileObj)
      }
      formData.append("picture_url", pictureUrl)

      if (editingCourse) {
        response = await updateCourse(editingCourse.id, formData)
      } else {
        response = await createCourse(formData)
      }

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      message.success(editingCourse ? t("save") : t("addCourse"))
      fetchCourses()
      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      console.error("Submit Error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        payload: {
          name: values.name,
          branch_description: values.branch_description,
          duration: values.duration,
          description: descriptionArray,
          price: parseFloat(values.price),
          type: values.type || "",
          picture_url: values.file?.[0]?.originFileObj ? "file uploaded" : editingCourse?.picture_url || "",
        },
      })
      message.error(t("fetchError") + `: ${error.message}`)

      // If multipart fails with 400, try JSON payload
      if (error.response?.status === 400) {
        try {
          const jsonPayload = {
            name: values.name,
            branch_description: values.branch_description,
            duration: values.duration,
            description: descriptionArray,
            price: parseFloat(values.price),
            type: values.type || "",
            picture_url: pictureUrl,
          }
          const jsonResponse = await fetch(editingCourse ? `/courses/${editingCourse.id}` : "/courses", {
            method: editingCourse ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json",
              // Add Authorization if needed: "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(jsonPayload),
          })
          if (!jsonResponse.ok) throw new Error(`JSON request failed with status ${jsonResponse.status}`)
          message.success(editingCourse ? t("save") : t("addCourse"))
          fetchCourses()
          setIsModalOpen(false)
          form.resetFields()
        } catch (jsonError) {
          console.error("JSON Submit Error:", {
            message: jsonError.message,
            status: jsonError.response?.status,
            data: jsonError.response?.data,
            payload: jsonPayload,
          })
          message.error(t("fetchError") + `: ${jsonError.message}`)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (course) => {
    setEditingCourse(course)
    form.setFieldsValue({
      name: course.name,
      branch_description: course.branch_description,
      duration: course.duration,
      description: course.description.join("\n"),
      price: course.price,
      type: course.type,
      file: course.picture_url ? [{ url: course.picture_url, status: "done" }] : [],
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    setLoading(true)
    try {
      await deleteCourse(id)
      message.success(t("delete"))
      fetchCourses()
    } catch (error) {
      console.error("Delete Error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      })
      message.error(t("fetchError") + `: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type) => {
    const typeColors = {
      gramatika: "green",
      ielts: "blue",
    }
    return typeColors[type?.toLowerCase()] || "default"
  }

  const columns = [
    {
      title: t("courseName"),
      dataIndex: ["name", i18n.language],
      key: "name",
      render: (text, record) => (
        <div>
          <div className="font-medium text-gray-800">{text || record.name?.en || "N/A"}</div>
          <div className="text-sm text-gray-500">{record.name?.en || "N/A"}</div>
        </div>
      ),
    },
    {
      title: t("courseType"),
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={getTypeColor(type)} className="rounded-full px-3 py-1">
          {type || "N/A"}
        </Tag>
      ),
    },
    {
      title: t("coursePrice"),
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <span className="font-semibold text-green-600">
          {price?.toLocaleString() || "0"} so'm
        </span>
      ),
    },
    {
      title: t("courseDuration"),
      dataIndex: ["duration", i18n.language],
      key: "duration",
      render: (duration, record) => (
        <span className="text-gray-600">{duration || record.duration?.en || "N/A"}</span>
      ),
    },
    {
      title: t("courseImage"),
      dataIndex: "picture_url",
      key: "picture_url",
      render: (url) => (
        url ? (
          <img src={url} alt="Course" className="w-16 h-16 object-cover rounded" />
        ) : (
          <span className="text-gray-600">N/A</span>
        )
      ),
    },
    {
      title: t("createdDate"),
      dataIndex: "created_at",
      key: "created_at",
      render: (date) =>
        date
          ? new Date(date).toLocaleDateString(i18n.language, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "N/A",
    },
    {
      title: t("actions"),
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="text-green-500 hover:text-green-700 hover:bg-green-50"
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.id)}
            className="hover:bg-red-50"
          />
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t("coursesTitle")}</h1>
          <p className="text-gray-600">{t("coursesTitle")}</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCourse(null)
              form.resetFields()
              setIsModalOpen(true)
            }}
            className="bg-gradient-to-r from-green-500 to-green-600 border-0 rounded-lg shadow-sm hover:shadow-md"
          >
            {t("addCourse")}
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm" style={{ borderRadius: "16px" }} bodyStyle={{ padding: "24px" }}>
        <Table
          columns={columns}
          dataSource={courses}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} ${t("courses")}`,
          }}
          locale={{
            emptyText: t("noData"),
          }}
          className="rounded-lg"
        />
      </Card>

      <Modal
        title={
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <BookOutlined className="text-white text-sm" />
            </div>
            <span className="text-lg font-semibold">
              {editingCourse ? t("edit") + " " + t("courseName") : t("addCourse")}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={900}
        style={{ borderRadius: "16px" }}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical" className="mt-6">
          <Card className="mb-6 border border-gray-200" style={{ borderRadius: "12px" }}>
            <Title level={5} className="text-gray-700 mb-4">
              {t("courseName")}
            </Title>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name={["name", "en"]}
                label={t("courseName") + " (English)"}
                rules={[{ required: true, message: t("courseName") + " (English) is required" }]}
              >
                <Input placeholder={t("courseName") + " (English)"} className="rounded-lg" />
              </Form.Item>
              <Form.Item
                name={["name", "ru"]}
                label={t("courseName") + " (Russian)"}
                rules={[{ required: true, message: t("courseName") + " (Russian) is required" }]}
              >
                <Input placeholder={t("courseName") + " (Russian)"} className="rounded-lg" />
              </Form.Item>
              <Form.Item
                name={["name", "uz"]}
                label={t("courseName") + " (Uzbek)"}
                rules={[{ required: true, message: t("courseName") + " (Uzbek) is required" }]}
              >
                <Input placeholder={t("courseName") + " (Uzbek)"} className="rounded-lg" />
              </Form.Item>
            </div>
          </Card>

          <Card className="mb-6 border border-gray-200" style={{ borderRadius: "12px" }}>
            <Title level={5} className="text-gray-700 mb-4">
              {t("branchDescription")}
            </Title>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name={["branch_description", "en"]}
                label={t("branchDescription") + " (English)"}
                rules={[{ required: true, message: t("branchDescription") + " (English) is required" }]}
              >
                <Input placeholder={t("branchDescription") + " (English)"} className="rounded-lg" />
              </Form.Item>
              <Form.Item
                name={["branch_description", "ru"]}
                label={t("branchDescription") + " (Russian)"}
                rules={[{ required: true, message: t("branchDescription") + " (Russian) is required" }]}
              >
                <Input placeholder={t("branchDescription") + " (Russian)"} className="rounded-lg" />
              </Form.Item>
              <Form.Item
                name={["branch_description", "uz"]}
                label={t("branchDescription") + " (Uzbek)"}
                rules={[{ required: true, message: t("branchDescription") + " (Uzbek) is required" }]}
              >
                <Input placeholder={t("branchDescription") + " (Uzbek)"} className="rounded-lg" />
              </Form.Item>
            </div>
          </Card>

          <Card className="mb-6 border border-gray-200" style={{ borderRadius: "12px" }}>
            <Title level={5} className="text-gray-700 mb-4">
              {t("courseDuration")}
            </Title>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name={["duration", "en"]}
                label={t("courseDuration") + " (English)"}
                rules={[{ required: true, message: t("courseDuration") + " (English) is required" }]}
              >
                <Input placeholder={t("courseDuration") + " (e.g., 3 months)"} className="rounded-lg" />
              </Form.Item>
              <Form.Item
                name={["duration", "ru"]}
                label={t("courseDuration") + " (Russian)"}
                rules={[{ required: true, message: t("courseDuration") + " (Russian) is required" }]}
              >
                <Input placeholder={t("courseDuration") + " (e.g., 3 месяца)"} className="rounded-lg" />
              </Form.Item>
              <Form.Item
                name={["duration", "uz"]}
                label={t("courseDuration") + " (Uzbek)"}
                rules={[{ required: true, message: t("courseDuration") + " (Uzbek) is required" }]}
              >
                <Input placeholder={t("courseDuration") + " (e.g., 3 oy)"} className="rounded-lg" />
              </Form.Item>
            </div>
          </Card>

          <Card className="mb-6 border border-gray-200" style={{ borderRadius: "12px" }}>
            <Title level={5} className="text-gray-700 mb-4">
              {t("courseDetails")}
            </Title>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="description"
                label={t("courseDescription")}
                rules={[{ required: true, message: t("courseDescription") + " is required" }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder={t("courseDescription") + " (enter each point on a new line)"}
                  className="rounded-lg"
                />
              </Form.Item>
              <div className="space-y-4">
                <Form.Item
                  name="price"
                  label={t("coursePrice")}
                  rules={[
                    { required: true, message: t("coursePrice") + " is required" },
                    { type: "number", min: 0, message: t("coursePrice") + " must be non-negative" },
                  ]}
                >
                  <InputNumber min={0} className="w-full rounded-lg" placeholder={t("coursePrice")} />
                </Form.Item>
                <Form.Item
                  name="type"
                  label={t("courseType")}
                  rules={[{ required: false, message: t("courseType") + " is optional" }]}
                >
                  <Input placeholder={t("courseType") + " (e.g., gramatika, ielts)"} className="rounded-lg" />
                </Form.Item>
              </div>
            </div>
          </Card>

          <Card className="mb-6 border border-gray-200" style={{ borderRadius: "12px" }}>
            <Title level={5} className="text-gray-700 mb-4">
              {t("uploadImage")}
            </Title>
            <Form.Item
              name="file"
              label={t("uploadImage")}
              valuePropName="fileList"
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
              rules={[
                {
                  validator: (_, fileList) => {
                    if (fileList && fileList.length > 0) {
                      const file = fileList[0].originFileObj
                      const isImage = file.type.startsWith("image/")
                      const isLt2M = file.size / 1024 / 1024 < 2 // 2MB limit
                      if (!isImage) {
                        return Promise.reject(new Error(t("uploadImageError")))
                      }
                      if (!isLt2M) {
                        return Promise.reject(new Error(t("fileTooLarge")))
                      }
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <Upload.Dragger
                name="file"
                listType="picture"
                maxCount={1}
                className="rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400"
                beforeUpload={() => false}
                accept="image/*"
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined className="text-4xl text-gray-400" />
                </p>
                <p className="ant-upload-text text-lg font-medium">{t("uploadImage")}</p>
                <p className="ant-upload-hint text-gray-500">{t("uploadImageHint")}</p>
              </Upload.Dragger>
            </Form.Item>
          </Card>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button onClick={() => setIsModalOpen(false)} className="rounded-lg" size="large">
              {t("cancel")}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-gradient-to-r from-green-500 to-green-600 border-0 rounded-lg"
              size="large"
            >
              {editingCourse ? t("save") : t("addCourse")}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default Courses