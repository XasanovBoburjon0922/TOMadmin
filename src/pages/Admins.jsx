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

  const getToken = () => {
    return localStorage.getItem("token");
  };

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
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!Array.isArray(response.data.users)) {
        throw new Error("Invalid response format: users array expected");
      }
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
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleUpload = async ({ file, onSuccess, onError }) => {
    const token = getToken();
    if (!token) {
      message.error(t("no_token_error"));
      onError(new Error(t("no_token_error")));
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(`${baseURL}/file-upload`, formData, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 200 && response.data.Url) {
        form.setFieldsValue({ profile_picture_url: response.data.Url });
        onSuccess(response.data);
        message.success(t("image_uploaded"));
      } else {
        throw new Error("Invalid response: URL not found");
      }
    } catch (error) {
      console.error("Upload error:", error.response?.data || error.message);
      onError(error);
      message.error(error.response?.data?.message || t("image_upload_error"));
    }
  };

  const handleSaveAdmin = async (values) => {
    setSaving(true);
    const token = getToken();
    if (!token) {
      message.error(t("no_token_error"));
      window.location.href = "/login";
      setSaving(false);
      return;
    }
    try {
      const payload = {
        name: values.name,
        profile_picture_url: values.profile_picture_url,
      };
      if (values.password) {
        payload.password = values.password; 
      }
      if (editingAdmin) {
        await axios.put(
          `${baseURL}/users/update`,
          { id: editingAdmin.id, ...payload },
          {
            headers: {
              Authorization: `${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        message.success(t("admin_updated"));
      } else {
        await axios.post(
          `${baseURL}/users/create`,
          payload,
          {
            headers: {
              Authorization: `${token}`,
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
      setEditingAdmin(null);
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
              Authorization: `${token}`,
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

  const showModal = (admin = null) => {
    setEditingAdmin(admin);
    if (admin) {
      form.setFieldsValue({
        name: admin.name,
        password: "", 
        profile_picture_url: admin.profile_picture_url || "",
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
      } else {
        setFileList([]);
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
      render: (text) => <span className="text-gray-800 font-medium">{text || "N/A"}</span>,
    },
    {
      title: t("profile_picture"),
      dataIndex: "profile_picture_url",
      key: "profile_picture_url",
      render: (url) =>
        url ? (
          <img
            src={url}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <UserOutlined className="text-2xl text-gray-400" />
        ),
    },
    {
      title: t("created_at"),
      dataIndex: "created_at",
      key: "created_at",
      render: (text) =>
        text
          ? dayjs(text).format("YYYY-MM-DD HH:mm")
          : <span className="text-gray-500">N/A</span>,
    },
    {
      title: t("actions"),
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            className="text-green-500 hover:text-green-700"
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteAdmin(record.id)}
            className="hover:text-red-700"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
        <div>
          <h2 className="text-2xl font-bold">{t("admins_list")}</h2>
          <p className="text-green-100">{t("manage_admins")}</p>
        </div>
        <Button
          type="primary"
          icon={<UserOutlined />}
          onClick={() => showModal()}
          className="bg-white text-green-600 hover:bg-gray-100"
        >
          {t("add_admin")}
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={admins}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        className="bg-white rounded-2xl shadow-sm"
        locale={{ emptyText: t("no_admins") }}
      />
      <Modal
        title={editingAdmin ? t("edit_admin") : t("add_admin")}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setFileList([]);
          setEditingAdmin(null);
        }}
        onOk={() => form.submit()}
        okButtonProps={{
          loading: saving,
          className: "bg-green-500 hover:bg-green-600 border-0",
        }}
        cancelButtonProps={{ className: "border-gray-300" }}
      >
        <Form form={form} onFinish={handleSaveAdmin} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label={t("name")}
            rules={[{ required: true, message: t("name_required") }]}
          >
            <Input placeholder={t("name")} className="rounded-lg" />
          </Form.Item>
          <Form.Item
            name="password"
            label={t("password")}
            rules={[
              { required: !editingAdmin, message: t("password_required") },
              { min: 6, message: t("password_min_length") },
            ]}
          >
            <Input.Password placeholder={t("password")} className="rounded-lg" />
          </Form.Item>
          <Form.Item
            name="profile_picture_url"
            label={t("profile_picture_url")}
            rules={[{ required: true, message: t("image_required") }]}
          >
            <Input disabled className="rounded-lg" />
          </Form.Item>
          <Form.Item label={t("upload_image")}>
            <Upload
              customRequest={handleUpload}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              maxCount={1}
              accept="image/*"
              beforeUpload={(file) => {
                const isImage = file.type.startsWith("image/");
                if (!isImage) {
                  message.error(t("image_type_error"));
                  return Upload.LIST_IGNORE;
                }
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error(t("image_size_error"));
                  return Upload.LIST_IGNORE;
                }
                return true;
              }}
            >
              <Button icon={<UploadOutlined />} className="rounded-lg">
                {t("upload_image")}
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Admins;