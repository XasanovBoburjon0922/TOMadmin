"use client";

import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message, Upload } from "antd";
import { UserOutlined, DeleteOutlined, EditOutlined, UploadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import axios from "axios";
import dayjs from "dayjs";

const Admins = () => {
  const { t } = useTranslation();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  const baseURL = "https://api.tom-education.uz";

  // Get token from localStorage
  const getToken = () => {
    const token = localStorage.getItem("token");
    console.log("Token:", token);
    return token;
  };

  // Fetch admins
  const fetchAdmins = async () => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      message.error(t("no_token_error"));
      window.location.href = "/login";
      return;
    }
    try {
      const response = await axios.get(`${baseURL}/users/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Fetch admins response:", response.data);
      setAdmins(response.data.users);
    } catch (error) {
      console.error("Fetch admins error:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        message.error(t("unauthorized_error"));
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        message.error(error.response?.data?.message || t("fetch_admins_error"));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Handle file upload
  const handleUpload = async ({ file, onSuccess, onError }) => {
    const token = getToken();
    if (!token) {
      message.error(t("no_token_error"));
      onError(new Error("No token"));
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(`${baseURL}/file-upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Upload response:", response.data);
      if (response.status === 200) {
        const imageUrl = response.data.Url || response.data.url || response.data.data?.url;
        if (!imageUrl) {
          throw new Error("No URL in response");
        }
        form.setFieldsValue({ profile_picture_url: imageUrl });
        onSuccess(response.data);
        message.success(t("image_uploaded"));
      }
    } catch (error) {
      console.error("Upload error:", error.response?.data || error.message);
      onError(error);
      message.error(error.response?.data?.message || t("image_upload_error"));
    }
  };

  // Save or update admin
  const handleSaveAdmin = async (values) => {
    setSaving(true);
    const token = getToken();
    if (!token) {
      message.error(t("no_token_error"));
      window.location.href = "/login";
      setSaving(false);
      return;
    }
    console.log("Submitting values:", values);
    console.log("Editing admin:", editingAdmin); // Debug editingAdmin state
    try {
      if (editingAdmin) {
        console.log("Performing update operation");
        await axios.put(
          `${baseURL}/users/update`,
          { id: editingAdmin.id, ...values },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        message.success(t("admin_updated"));
      } else {
        console.log("Performing create operation");
        await axios.post(
          `${baseURL}/users/create`,
          values,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        message.success(t("admin_created"));
      }
      fetchAdmins();
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
      setEditingAdmin(null); // Ensure editingAdmin is cleared
    } catch (error) {
      console.error("Save admin error:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        message.error(t("unauthorized_error"));
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        message.error(error.response?.data?.message || t("save_admin_error"));
      }
    } finally {
      setSaving(false);
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (id) => {
    const token = getToken();
    if (!token) {
      message.error(t("no_token_error"));
      window.location.href = "/login";
      return;
    }
    Modal.confirm({
      title: t("confirm_delete"),
      onOk: async () => {
        try {
          await axios.delete(`${baseURL}/users/delete/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          message.success(t("admin_deleted"));
          fetchAdmins();
        } catch (error) {
          console.error("Delete admin error:", error.response?.data || error.message);
          if (error.response?.status === 401) {
            message.error(t("unauthorized_error"));
            localStorage.removeItem("token");
            window.location.href = "/login";
          } else {
            message.error(error.response?.data?.message || t("delete_admin_error"));
          }
        }
      },
    });
  };

  // Open modal for adding/editing admin
  const showModal = (admin = null) => {
    console.log("Opening modal with admin:", admin); // Debug admin value
    setEditingAdmin(admin);
    if (admin) {
      form.setFieldsValue({
        name: admin.name,
        password: "",
        profile_picture_url: admin.profile_picture_url,
      });
      if (admin.profile_picture_url) {
        setFileList([
          {
            uid: "-1",
            name: "profile_image",
            status: "done",
            url: admin.profile_picture_url,
          },
        ]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: t("name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("created_at"),
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => dayjs(text).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: t("actions"),
      key: "actions",
      render: (_, record) => (
        <div>
          <Button
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            style={{ marginRight: 8 }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteAdmin(record.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <h2>{t("admins_list")}</h2>
        <Button type="primary" onClick={() => showModal()}>
          {t("add_admin")}
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={admins}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editingAdmin ? t("edit_admin") : t("add_admin")}
        open={isModalVisible}
        onCancel={() => {
          console.log("Closing modal, resetting state"); // Debug modal close
          setIsModalVisible(false);
          form.resetFields();
          setFileList([]);
          setEditingAdmin(null); // Ensure editingAdmin is cleared
        }}
        onOk={() => form.submit()}
        okButtonProps={{ loading: saving }}
      >
        <Form form={form} onFinish={handleSaveAdmin} layout="vertical">
          <Form.Item
            name="name"
            label={t("name")}
            rules={[{ required: true, message: t("name_required") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label={t("password")}
            rules={[
              { required: !editingAdmin, message: t("password_required") },
              { min: 1, message: t("password_min_length") }, // Adjusted to reasonable minimum
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="profile_picture_url"
            label={t("profile_picture_url")}
            rules={[{ required: true, message: t("image_required") }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item label={t("upload_image")}>
            <Upload
              customRequest={handleUpload}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              maxCount={1}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>{t("upload_image")}</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Admins;