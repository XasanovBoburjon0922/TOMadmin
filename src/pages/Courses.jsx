import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, Table, Button, Form, Modal, Input, Select, Tag, InputNumber, Upload, Space, Typography, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, FilterOutlined, BookOutlined } from "@ant-design/icons";
import { listCourses, createCourse, updateCourse, deleteCourse } from "../api/api";

const { Title } = Typography;

const Courses = () => {
  const { t, i18n } = useTranslation();
  const [courses, setCourses] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCourses();
  }, [filterType]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await listCourses(filterType ? { type: filterType } : {});
      // Ensure data is an array; if null or undefined, set to empty array
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error(t("fetchError"));
      setCourses([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", JSON.stringify(values.name));
      formData.append("branch_description", JSON.stringify(values.branch_description));
      formData.append("duration", JSON.stringify(values.duration));
      formData.append("description", values.description);
      formData.append("price", values.price);
      formData.append("type", values.type);
      if (values.file?.file) {
        formData.append("file", values.file.file);
      }

      if (editingCourse) {
        await updateCourse(editingCourse.id, formData);
        message.success(t("save"));
      } else {
        await createCourse(formData);
        message.success(t("addCourse"));
      }
      fetchCourses();
      setIsModalOpen(false);
    } catch (error) {
      message.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    form.setFieldsValue({
      name: course.name,
      branch_description: course.branch_description,
      duration: course.duration,
      description: course.description,
      price: course.price,
      type: course.type,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteCourse(id);
      message.success(t("delete"));
      fetchCourses();
    } catch (error) {
      message.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "type1":
        return "blue";
      case "type2":
        return "green";
      default:
        return "default";
    }
  };

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
          {t(`type${type === "type1" ? "1" : "2"}`)}
        </Tag>
      ),
    },
    {
      title: t("coursePrice"),
      dataIndex: "price",
      key: "price",
      render: (price) => <span className="font-semibold text-green-600">${price?.toLocaleString() || "0"}</span>,
    },
    {
      title: t("courseDuration"),
      dataIndex: ["duration", i18n.language],
      key: "duration",
      render: (duration, record) => <span className="text-gray-600">{duration || record.duration?.en || "N/A"}</span>,
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
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t("coursesTitle")}</h1>
          <p className="text-gray-600">{t("coursesTitle")}</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-传入sm:space-x-3">
          <Select
            placeholder={t("filterByType")}
            allowClear
            onChange={(value) => setFilterType(value)}
            className="w-full sm:w-48"
            suffixIcon={<FilterOutlined />}
          >
            <Select.Option value="type1">{t("type1")}</Select.Option>
            <Select.Option value="type2">{t("type2")}</Select.Option>
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCourse(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 rounded-lg shadow-sm hover:shadow-md"
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
            emptyText: t("noData"), // Custom message for empty table
          }}
          className="rounded-lg"
        />
      </Card>

      <Modal
        title={
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOutlined className="text-white text-sm" />
            </div>
            <span className="text-lg font-semibold">{editingCourse ? t("edit") + " " + t("courseName") : t("addCourse")}</span>
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
                <Input.TextArea rows={4} placeholder={t("courseDescription")} className="rounded-lg" />
              </Form.Item>
              <div className="space-y-4">
                <Form.Item
                  name="price"
                  label={t("coursePrice")}
                  rules={[{ required: true, message: t("coursePrice") + " is required" }]}
                >
                  <InputNumber min={0} className="w-full rounded-lg" placeholder={t("coursePrice")} />
                </Form.Item>
                <Form.Item
                  name="type"
                  label={t("courseType")}
                  rules={[{ required: true, message: t("courseType") + " is required" }]}
                >
                  <Select placeholder={t("courseType")} className="rounded-lg">
                    <Select.Option value="type1">{t("type1")}</Select.Option>
                    <Select.Option value="type2">{t("type2")}</Select.Option>
                  </Select>
                </Form.Item>
              </div>
            </div>
          </Card>

          <Card className="mb-6 border border-gray-200" style={{ borderRadius: "12px" }}>
            <Title level={5} className="text-gray-700 mb-4">
              {t("uploadImage")}
            </Title>
            <Form.Item name="file" label={t("uploadImage")} valuePropName="file">
              <Upload.Dragger
                name="file"
                listType="picture"
                maxCount={1}
                className="rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400"
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined className="text-4xl text-gray-400" />
                </p>
                <p className="ant-upload-text text-lg font-medium">{t("uploadImage")}</p>
                <p className="ant-upload-hint text-gray-500">
                  {t("uploadImageHint")}
                </p>
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
              className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 rounded-lg"
              size="large"
            >
              {editingCourse ? t("save") : t("addCourse")}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Courses;