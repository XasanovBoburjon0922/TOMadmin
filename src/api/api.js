import axios from "axios"

const API_BASE = "https://api.tom-education.uz"

export const uploadFile = async (file) => {
  const formData = new FormData()
  formData.append("file", file)
  const response = await axios.post(`${API_BASE}/file-upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response.data.Url
}

// Branches API
export const createBranch = (data) => axios.post(`${API_BASE}/branches/create`, data)
export const getBranch = (id) => axios.get(`${API_BASE}/branches/get?id=${id}`)
export const updateBranch = (id, data) => axios.put(`${API_BASE}/branches/update?id=${id}`, data)
export const deleteBranch = (id) => axios.delete(`${API_BASE}/branches/delete?id=${id}`)
export const listBranches = () => axios.get(`${API_BASE}/branches/list`)

// Courses API
export const createCourse = (data) => axios.post(`${API_BASE}/courses/create`, data)
export const getCourse = (id) => axios.get(`${API_BASE}/courses/get?id=${id}`)
export const updateCourse = (id, data) => axios.put(`${API_BASE}/courses/update?id=${id}`, data)
export const deleteCourse = (id) => axios.delete(`${API_BASE}/courses/delete?id=${id}`)
export const listCourses = () => axios.get(`${API_BASE}/courses/list`)

// Gallery API
export const createGallery = (data) => axios.post(`${API_BASE}/gallery/create`, data)
export const getGallery = (id) => axios.get(`${API_BASE}/gallery/get?id=${id}`)
export const updateGallery = (id, data) => axios.put(`${API_BASE}/gallery/update?id=${id}`, data)
export const deleteGallery = (id) => axios.delete(`${API_BASE}/gallery/delete?id=${id}`)
export const listGallery = () => axios.get(`${API_BASE}/gallery/list`)

// Teachers API
export const createTeacher = (data) => axios.post(`${API_BASE}/teachers/create`, data)
export const getTeacher = (id) => axios.get(`${API_BASE}/teachers/get?id=${id}`)
export const updateTeacher = (id, data) => axios.put(`${API_BASE}/teachers/update?id=${id}`, data)
export const deleteTeacher = (id) => axios.delete(`${API_BASE}/teachers/delete?id=${id}`)
export const listTeachers = () => axios.get(`${API_BASE}/teachers/list`)
