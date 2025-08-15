import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, Table, Button, Form, Modal, Upload, Row, Col, Empty, Image, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, EyeOutlined } from "@ant-design/icons";
import { listGallery, createGallery, updateGallery, deleteGallery } from "../api/api";

const Gallery = () => {
  const { t, i18n } = useTranslation();
  const [galleries, setGalleries] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    setLoading(true);
    try {
      const data = await listGallery();
      // Ensure data is an array; if null or undefined, set to empty array
      setGalleries(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error(t("fetchError"));
      setGalleries([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (values.file?.file) {
        formData.append("file", values.file.file);
      }

      if (editingGallery) {
        await updateGallery(editingGallery.id, formData);
        message.success(t("save"));
      } else {
        await createGallery(formData);
        message.success(t("addImage"));
      }
      fetchGalleries();
      setIsModalOpen(false);
    } catch (error) {
      message.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (gallery) => {
    setEditingGallery(gallery);
    form.setFieldsValue({});
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteGallery(id);
      message.success(t("delete"));
      fetchGalleries();
    } catch (error) {
      message.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: t("imagePreview"),
      dataIndex: "picture_url",
      key: "picture_url",
      width: 100,
      render: (url) => (
        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
          <Image
            src={url || "/placeholder.svg"}
            width={64}
            height={64}
            className="object-cover"
            preview={{
              mask: <EyeOutlined className="text-white" />,
            }}
            fallback="/placeholder.svg" // Fallback for missing images
          />
        </div>
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
        <div className="flex space-x-2">
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
        </div>
      ),
    },
  ];

  const GridView = () => (
    <Row gutter={[24, 24]}>
      {galleries.length === 0 ? (
        <Col span={24}>
          <Empty
            description={t("noGalleryItems")}
            className="py-12"
          />
        </Col>
      ) : (
        galleries.map((item) => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
            <Card
              hoverable
              className="border-0 shadow-sm hover:shadow-lg transition-shadow duration-300"
              style={{ borderRadius: "16px" }}
              cover={
                <div className="h-48 overflow-hidden" style={{ borderRadius: "16px 16px 0 0" }}>
                  <Image
                    src={item.picture_url || "/placeholder.svg"}
                    className="w-full h-full object-cover"
                    preview={{
                      mask: <EyeOutlined className="text-white text-xl" />,
                    }}
                    fallback="/placeholder.svg" // Fallback for missing images
                  />
                </div>
              }
              actions={[
                <Button
                  key="edit"
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(item)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  {t("edit")}
                </Button>,
                <Button
                  key="delete"
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => handleDelete(item.id)}
                >
                  {t("delete")}
                </Button>,
              ]}
            >
              <Card.Meta
                description={
                  <span className="text-gray-500">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString(i18n.language, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A"}
                  </span>
                }
              />
            </Card>
          </Col>
        ))
      )}
    </Row>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t("galleryTitle")}</h1>
          <p className="text-gray-600">{t("galleryTitle")}</p>
        </div>
        <div className="flex space-x-3">
          <Button
            type={viewMode === "grid" ? "primary" : "default"}
            onClick={() => setViewMode("grid")}
            className="rounded-lg"
          >
            {t("gridView")}
          </Button>
          <Button
            type={viewMode === "table" ? "primary" : "default"}
            onClick={() => setViewMode("table")}
            className="rounded-lg"
          >
            {t("tableView")}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingGallery(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 rounded-lg shadow-sm hover:shadow-md"
          >
            {t("addImage")}
          </Button>
        </div>
      </div>

      <Card
        className="border-0 shadow-sm"
        style={{ borderRadius: "16px" }}
        bodyStyle={{ padding: "24px" }}
      >
        {viewMode === "grid" ? (
          <GridView />
        ) : (
          <Table
            columns={columns}
            dataSource={galleries}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} ${t("gallery")}`,
            }}
            locale={{
              emptyText: t("noData"), // Custom message for empty table
            }}
            className="rounded-lg"
          />
        )}
      </Card>

      <Modal
        title={
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <PlusOutlined className="text-white text-sm" />
            </div>
            <span className="text-lg font-semibold">
              {editingGallery ? t("edit") + " " + t("imageTitle") : t("addImage")}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={500}
        style={{ borderRadius: "16px" }}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical" className="mt-6">
          <Form.Item
            name="file"
            label={t("uploadImage")}
            valuePropName="file"
            rules={[{ required: !editingGallery, message: t("uploadImage") + " is required" }]}
          >
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
              <p className="ant-upload-hint text-gray-500">{t("uploadImageHint")}</p>
            </Upload.Dragger>
          </Form.Item>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg"
            >
              {t("cancel")}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 rounded-lg"
            >
              {editingGallery ? t("save") : t("addImage")}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Gallery;