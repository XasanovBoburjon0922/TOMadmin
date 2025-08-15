import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, Table, Button, Form, Input, Modal, Upload, Space, Avatar, Tooltip, Tag, message, InputNumber } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, UserOutlined, PhoneOutlined, TrophyOutlined, BookOutlined, StarOutlined } from "@ant-design/icons";
import { listTeachers, createTeacher, updateTeacher, deleteTeacher } from "../api/api";

const Teachers = () => {
  const { t, i18n } = useTranslation();
  const [teachers, setTeachers] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const data = await listTeachers();
      // Ensure data is an array; if null or undefined, set to empty array
      setTeachers(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error(t("fetchError"));
      setTeachers([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", JSON.stringify(values.name));
      formData.append("contact", values.contact);
      formData.append("experience_years", values.experience_years);
      formData.append("graduated_students", values.graduated_students);
      formData.append("ielts_score", values.ielts_score);
      if (values.file?.file) {
        formData.append("file", values.file.file);
      }

      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, formData);
        message.success(t("save"));
      } else {
        await createTeacher(formData);
        message.success(t("addTeacher"));
      }
      fetchTeachers();
      setIsModalOpen(false);
    } catch (error) {
      message.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    form.setFieldsValue({
      name: teacher.name,
      contact: teacher.contact,
      experience_years: teacher.experience_years,
      graduated_students: teacher.graduated_students,
      ielts_score: teacher.ielts_score,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteTeacher(id);
      message.success(t("delete"));
      fetchTeachers();
    } catch (error) {
      message.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: t("teacherName"),
      key: "teacher",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            size={48}
            src={record.profile_picture_url}
            icon={<UserOutlined />}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
      title: t("teacherExperience"),
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
      title: t("graduatedStudents"),
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
      render: (score) => (
        <Tag
          color={score >= 8 ? "green" : score >= 7 ? "blue" : score >= 6 ? "orange" : "red"}
          style={{
            fontWeight: 600,
            fontSize: "12px",
            padding: "4px 8px",
            borderRadius: "6px",
          }}
        >
          <StarOutlined /> {score !== undefined ? score : "N/A"}
        </Tag>
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
                color: "#1890ff",
                border: "1px solid #d9d9d9",
                borderRadius: "6px",
              }}
            />
          </Tooltip>
          <Tooltip title={t("delete")}>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: "6px",
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <Card
        style={{
          marginBottom: "24px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
              {t("teachersTitle")}
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.8)",
                margin: "8px 0 0 0",
                fontSize: "16px",
              }}
            >
              {t("teachersTitle")}
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTeacher(null);
              form.resetFields();
              setIsModalOpen(true);
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
            {t("addTeacher")}
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
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} ${t("teachers")}`,
          }}
          locale={{
            emptyText: t("noData"), // Custom message for empty table
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
            {editingTeacher ? t("edit") + " " + t("teacherName") : t("addTeacher")}
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          style={{ marginTop: "24px" }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item
              name={["name", "en"]}
              label={t("teacherName") + " (English)"}
              rules={[{ required: true, message: t("teacherName") + " (English) is required" }]}
            >
              <Input placeholder={t("teacherName") + " (English)"} style={{ borderRadius: "6px" }} />
            </Form.Item>
            <Form.Item
              name={["name", "ru"]}
              label={t("teacherName") + " (Russian)"}
              rules={[{ required: true, message: t("teacherName") + " (Russian) is required" }]}
            >
              <Input placeholder={t("teacherName") + " (Russian)"} style={{ borderRadius: "6px" }} />
            </Form.Item>
          </div>

          <Form.Item
            name={["name", "uz"]}
            label={t("teacherName") + " (Uzbek)"}
            rules={[{ required: true, message: t("teacherName") + " (Uzbek) is required" }]}
          >
            <Input placeholder={t("teacherName") + " (Uzbek)"} style={{ borderRadius: "6px" }} />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item
              name="contact"
              label={t("teacherPhone")}
              rules={[{ required: true, message: t("teacherPhone") + " is required" }]}
            >
              <Input placeholder={t("teacherPhone")} style={{ borderRadius: "6px" }} />
            </Form.Item>
            <Form.Item
              name="experience_years"
              label={t("teacherExperience")}
              rules={[{ required: true, message: t("teacherExperience") + " is required" }]}
            >
              <InputNumber
                min={0}
                placeholder={t("teacherExperience")}
                style={{ width: "100%", borderRadius: "6px" }}
              />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item
              name="graduated_students"
              label={t("graduatedStudents")}
              rules={[{ required: true, message: t("graduatedStudents") + " is required" }]}
            >
              <InputNumber
                min={0}
                placeholder={t("graduatedStudents")}
                style={{ width: "100%", borderRadius: "6px" }}
              />
            </Form.Item>
            <Form.Item
              name="ielts_score"
              label={t("ieltsScore")}
              rules={[{ required: true, message: t("ieltsScore") + " is required" }]}
            >
              <InputNumber
                min={0}
                max={9}
                step={0.5}
                placeholder={t("ieltsScore")}
                style={{ width: "100%", borderRadius: "6px" }}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="file"
            label={t("uploadImage")}
            valuePropName="file"
            rules={[{ required: !editingTeacher, message: t("uploadImage") + " is required" }]}
          >
            <Upload
              name="file"
              listType="picture-card"
              maxCount={1}
              style={{ width: "100%" }}
            >
              <div style={{ textAlign: "center", padding: "20px" }}>
                <UploadOutlined style={{ fontSize: "24px", color: "#1890ff", marginBottom: "8px" }} />
                <div>{t("uploadImage")}</div>
              </div>
            </Upload>
          </Form.Item>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
            <Button
              onClick={() => setIsModalOpen(false)}
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
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
              }}
            >
              {editingTeacher ? t("save") : t("addTeacher")}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Teachers;