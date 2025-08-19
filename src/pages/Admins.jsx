"use client";

import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message, Upload } from "antd";
import { UserOutlined, DeleteOutlined, EditOutlined, UploadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import axios from "axios";

const Admins = () => {
  const { t } = useTranslation();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  // Adminlarni API'dan olish
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://api.tom-education.uz/users");
      setAdmins(response.data.users);
    } catch (error) {
      message.error(t("fetch_admins_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Rasm yuklash
  const handleUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post("https://api.tom-education.uz/file-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200) {
        onSuccess(response.data);
        message.success(t("image_uploaded"));
        form.setFieldsValue({ profile_picture_url: response.data.Url });
      }
    } catch (error) {
      onError(error);
      message.error(t("image_upload_error"));
    }
  };

  // Yangi admin qo'shish yoki tahrirlash
  const handleSaveAdmin = async (values) => {
    try {
      if (editingAdmin) {
        // Tahrirlash
        await axios.put("https://api.tom-education.uz/users", {
          id: editingAdmin.id,
          ...values,
        });
        message.success(t("admin_updated"));
      } else {
        // Yangi admin qo'shish
        await axios.post("https://api.tom-education.uz/users/create", values);
        message.success(t("admin_created"));
      }
      fetchAdmins();
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
      setEditingAdmin(null);
    } catch (error) {
      message.error(t("save_admin_error"));
    }
  };

  // Adminni o'chirish
  const handleDeleteAdmin = async (id) => {
    Modal.confirm({
      title: t("confirm_delete"),
      onOk: async () => {
        try {
          await axios.delete(`https://api.tom-education.uz/users/${id}`);
          message.success(t("admin_deleted"));
          fetchAdmins();
        } catch (error) {
          message.error(t("delete_admin_error"));
        }
      },
    });
  };

  // Modalni ochish (yangi yoki tahrirlash uchun)
  const showModal = (admin = null) => {
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
          setIsModalVisible(false);
          form.resetFields();
          setFileList([]);
          setEditingAdmin(null);
        }}
        onOk={() => form.submit()}
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
            rules={[{ required: !editingAdmin, message: t("password_required") }]}
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