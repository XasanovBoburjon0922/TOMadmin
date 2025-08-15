import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, Table, Button, Form, Input, Modal, Upload, Space, Avatar, Tooltip, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { listBranches, createBranch, updateBranch, deleteBranch } from "../api/api";

const Branches = () => {
  const { t, i18n } = useTranslation();
  const [branches, setBranches] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const data = await listBranches();
      // Ensure data is an array; if null or undefined, set to empty array
      setBranches(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error(t("fetchError"));
      setBranches([]); // Set to empty array on error
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
      formData.append("google_url", values.google_url);
      formData.append("yandex_url", values.yandex_url);
      if (values.file?.file) {
        formData.append("file", values.file.file);
      }

      if (editingBranch) {
        await updateBranch(editingBranch.id, formData);
        message.success(t("save"));
      } else {
        await createBranch(formData);
        message.success(t("addBranch"));
      }
      fetchBranches();
      setIsModalOpen(false);
    } catch (error) {
      message.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    form.setFieldsValue({
      name: branch.name,
      contact: branch.contact,
      google_url: branch.google_url,
      yandex_url: branch.yandex_url,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteBranch(id);
      message.success(t("delete"));
      fetchBranches();
    } catch (error) {
      message.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

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
              background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)",
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
      title: t("branchPhone"),
      dataIndex: "contact",
      key: "contact",
      render: (contact) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontWeight: 500 }}>{contact}</span>
        </div>
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
          background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)",
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
              {t("branchesTitle")}
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.8)",
                margin: "8px 0 0 0",
                fontSize: "16px",
              }}
            >
              {t("branchesTitle")}
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingBranch(null);
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
            {t("addBranch")}
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
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} ${t("branches")}`,
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
            {editingBranch ? t("edit") + " " + t("branchName") : t("addBranch")}
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
              name={["name", "en"]}
              label={t("branchName") + " (English)"}
              rules={[{ required: true, message: t("branchName") + " (English) is required" }]}
            >
              <Input placeholder={t("branchName") + " (English)"} style={{ borderRadius: "6px" }} />
            </Form.Item>
            <Form.Item
              name={["name", "ru"]}
              label={t("branchName") + " (Russian)"}
              rules={[{ required: true, message: t("branchName") + " (Russian) is required" }]}
            >
              <Input placeholder={t("branchName") + " (Russian)"} style={{ borderRadius: "6px" }} />
            </Form.Item>
          </div>

          <Form.Item
            name={["name", "uz"]}
            label={t("branchName") + " (Uzbek)"}
            rules={[{ required: true, message: t("branchName") + " (Uzbek) is required" }]}
          >
            <Input placeholder={t("branchName") + " (Uzbek)"} style={{ borderRadius: "6px" }} />
          </Form.Item>

          <Form.Item
            name="contact"
            label={t("branchPhone")}
            rules={[{ required: true, message: t("branchPhone") + " is required" }]}
          >
            <Input placeholder={t("branchPhone")} style={{ borderRadius: "6px" }} />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item
              name="google_url"
              label="Google Maps URL"
              rules={[{ required: true, message: "Google Maps URL is required" }]}
            >
              <Input placeholder="https://maps.google.com/..." style={{ borderRadius: "6px" }} />
            </Form.Item>
            <Form.Item
              name="yandex_url"
              label="Yandex Maps URL"
              rules={[{ required: true, message: "Yandex Maps URL is required" }]}
            >
              <Input placeholder="https://yandex.com/maps/..." style={{ borderRadius: "6px" }} />
            </Form.Item>
          </div>

          <Form.Item name="file" label={t("uploadImage")} valuePropName="file">
            <Upload name="file" listType="picture-card" maxCount={1} style={{ width: "100%" }}>
              <div style={{ textAlign: "center", padding: "20px" }}>
                <UploadOutlined style={{ fontSize: "24px", color: "#1890ff", marginBottom: "8px" }} />
                <div>{t("uploadImage")}</div>
              </div>
            </Upload>
          </Form.Item>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
            <Button onClick={() => setIsModalOpen(false)} style={{ borderRadius: "6px", height: "40px" }}>
              {t("cancel")}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                borderRadius: "6px",
                height: "40px",
                background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)",
                border: "none",
              }}
            >
              {editingBranch ? t("save") : t("addBranch")}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Branches;