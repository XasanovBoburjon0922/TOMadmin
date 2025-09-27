import axios from "axios";

const API_BASE = "https://api.tom-education.uz";

const getToken = () => localStorage.getItem("token");

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `${token}`;
  }
  return config;
});

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/file-upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (!response.data.Url) {
    throw new Error("Invalid response: URL not found");
  }
  return response.data.Url;
};

export const createBranch = (data) =>
  api.post("/branches/create", data);
export const getBranch = (id) =>
  api.get(`/branches/get?id=${id}`);
export const updateBranch = (id, data) =>
  api.put(`/branches/update?id=${id}`, data);
export const deleteBranch = (id) =>
  api.delete(`/branches/delete?id=${id}`);
export const listBranches = () =>
  api.get("/branches/list");

// Courses API
export const createCourse = (data) =>
  api.post("/courses/create", data);
export const getCourse = (id) =>
  api.get(`/courses/get?id=${id}`);
export const updateCourse = (id, data) =>
  api.put(`/courses/update?id=${id}`, data);
export const deleteCourse = (id) =>
  api.delete(`/courses/delete?id=${id}`);
export const listCourses = () =>
  api.get("/courses/list");

// Gallery API
export const createGallery = (data) =>
  api.post("/gallery/create", data);
export const getGallery = (id) =>
  api.get(`/gallery/get?id=${id}`);
export const updateGallery = (id, data) =>
  api.put(`/gallery/update?id=${id}`, data);
export const deleteGallery = (id) =>
  api.delete(`/gallery/delete?id=${id}`);
export const listGallery = () =>
  api.get("/gallery/list");

// Teachers API
export const createTeacher = (data) =>
  api.post("/teachers/create", data);
export const getTeacher = (id) =>
  api.get(`/teachers/get?id=${id}`);
export const updateTeacher = (id, data) =>
  api.put(`/teachers/update?id=${id}`, data);
export const deleteTeacher = (id) =>
  api.delete(`/teachers/delete?id=${id}`);
export const listTeachers = () =>
  api.get("/teachers/list");

// Course Applications API
export const createCourseApplication = (data) =>
  api.post("/course_applications/create", data);
export const getCourseApplication = (id) =>
  api.get(`/course_applications/get/${id}`);
export const updateCourseApplication = (data) =>
  api.put("/course_applications/update", data);
export const deleteCourseApplication = (id) =>
  api.delete(`/course_applications/delete/${id}`);
export const listCourseApplications = (offset = 0, limit = 10) =>
  api.get(`/course_applications/list?offset=${offset}&limit=${limit}`);

// Admins API
export const createAdmin = (data) =>
  api.post("/users/create", data);
export const getAdmin = (id) =>
  api.get(`/users/get/${id}`);
export const updateAdmin = (data) =>
  api.put("/users/update", data);
export const deleteAdmin = (id) =>
  api.delete(`/users/delete/${id}`);
export const listAdmins = () =>
  api.get("/users/list");