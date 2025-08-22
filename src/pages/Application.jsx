"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"

const CourseApplications = () => {
  const { t } = useTranslation()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    course_id: "",
    full_name: "",
    phone: "",
  })
  const [addForm, setAddForm] = useState({
    course_id: "",
    full_name: "",
    phone: "",
  })
  const [showAddForm, setShowAddForm] = useState(false)
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const pageSizeOptions = [5, 10, 20, 50]

  useEffect(() => {
    fetchApplications()
  }, [currentPage, pageSize])

  const getToken = () => {
    return localStorage.getItem("token")
  }

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const offset = (currentPage - 1) * pageSize
      const response = await fetch(
        `https://api.tom-education.uz/course_applications/list?offset=${offset}&limit=${pageSize}`,
        {
          headers: {
            "accept": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch applications")
      }

      const data = await response.json()
      setApplications(data.applications || [])
      setTotalCount(data.total_count || 0)
    } catch (error) {
      console.error(t("fetchError"), error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (application) => {
    setEditingId(application.id)
    setEditForm({
      course_id: application.course_id,
      full_name: application.full_name,
      phone: application.phone,
    })
  }

  const handleUpdate = async (id) => {
    try {
      const token = getToken()
      const response = await fetch("https://api.tom-education.uz/course_applications/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          id,
          ...editForm,
        }),
      })

      if (response.ok) {
        await fetchApplications()
        setEditingId(null)
        setEditForm({ course_id: "", full_name: "", phone: "" })
      } else {
        throw new Error("Failed to update application")
      }
    } catch (error) {
      console.error(t("fetchError"), error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm(t("deleteConfirm", "Ushbu arizani o'chirishni xohlaysizmi?"))) {
      try {
        const token = getToken()
        const response = await fetch(`https://api.tom-education.uz/course_applications/delete/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        })

        if (response.ok) {
          await fetchApplications()
          if (applications.length <= (currentPage - 1) * pageSize + 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1)
          }
        } else {
          throw new Error("Failed to delete application")
        }
      } catch (error) {
        console.error(t("fetchError"), error)
      }
    }
  }

  const handleAdd = async () => {
    try {
      const token = getToken()
      const response = await fetch("https://api.tom-education.uz/course_applications/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `${token}` : "",
        },
        body: JSON.stringify(addForm),
      })

      if (response.ok) {
        await fetchApplications()
        setAddForm({ course_id: "", full_name: "", phone: "" })
        setShowAddForm(false)
        alert(t("applicationSuccess"))
        setCurrentPage(Math.ceil((totalCount + 1) / pageSize))
      } else {
        alert(t("applicationError"))
      }
    } catch (error) {
      console.error(t("applicationError"), error)
      alert(t("applicationError"))
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ course_id: "", full_name: "", phone: "" })
  }

  const cancelAdd = () => {
    setShowAddForm(false)
    setAddForm({ course_id: "", full_name: "", phone: "" })
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value))
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t("courseApplications")}</h1>
            <p className="text-green-100 text-lg">{t("manageApplications", "Barcha kurs arizalarini boshqaring")}</p>
          </div>
          <div className="hidden md:block">
            <svg className="w-16 h-16 text-white/20" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border-0">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("addApplicationTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t("applicantName")}</label>
              <input
                type="text"
                value={addForm.full_name}
                onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t("applicantPhone")}</label>
              <input
                type="text"
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t("selectCourse")}</label>
              <select
                value={addForm.course_id}
                onChange={(e) => setAddForm({ ...addForm, course_id: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">{t("selectCourse")}</option>
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name?.[i18n.language] || course.name.en}
                    </option>
                  ))
                ) : (
                  <option disabled>{t("noCoursesAvailable")}</option>
                )}
              </select>
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleAdd}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200"
            >
              {t("add")}
            </button>
            <button
              onClick={cancelAdd}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{t("overview", "Umumiy ma'lumotlar")}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">{t("totalApplications", "Jami arizalar")}</p>
                <p className="text-2xl font-bold text-green-600">{totalCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">{t("todayApplications", "Bugungi arizalar")}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {
                    applications.filter((app) => {
                      const today = new Date().toDateString()
                      const appDate = new Date(app.created_at).toDateString()
                      return today === appDate
                    }).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-2xl shadow-sm border-0 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">{t("applicationsList", "Arizalar ro'yxati")}</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("applicantName")}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("applicantPhone")}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("createdDate")}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {application.picture_url ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={application.picture_url || "/placeholder.svg"}
                            alt={application.full_name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {application.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {editingId === application.id ? (
                          <input
                            type="text"
                            value={editForm.full_name}
                            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">{application.full_name}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === application.id ? (
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{application.phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(application.created_at).toLocaleDateString("uz-UZ")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingId === application.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdate(application.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs transition-colors duration-200"
                        >
                          {t("save")}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-xs transition-colors duration-200"
                        >
                          {t("cancel")}
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(application)}
                          className="text-green-600 hover:text-green-900 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(application.id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t("noApplications", "Arizalar topilmadi")}</h3>
            <p className="mt-1 text-sm text-gray-500">{t("noApplicationsMessage", "Hozircha hech qanday ariza yo'q.")}</p>
          </div>
        ) : (
          <div className="flex justify-between items-center p-6">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">{t("itemsPerPage")}</label>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
              >
                {t("previous")}
              </button>
              <span className="text-sm text-gray-600">
                {t("page")} {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
              >
                {t("next")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseApplications