import { useState, useEffect, useCallback } from "react";
import { FaCheck, FaTimes, FaEye, FaUser, FaIdCard } from "react-icons/fa";

const ImageModal = ({ src, alt, onClose }) => {
  const handleImageError = (e) => {
    e.target.src = "https://via.placeholder.com/400x300/cccccc/666666?text=Không+thể+tải+ảnh";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative max-w-4xl max-h-4xl p-4" onClick={(e) => e.stopPropagation()}>
        <img 
          src={src} 
          alt={alt} 
          className="max-w-full max-h-full object-contain rounded"
          onError={handleImageError}
        />
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 text-white text-2xl hover:text-gray-300 bg-red-500 hover:bg-red-600 rounded-full w-10 h-10 flex items-center justify-center"
        >
          ×
        </button>
      </div>
      <div className="absolute inset-0" onClick={onClose}></div>
    </div>
  );
};

const UserVerification = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchUserId, setSearchUserId] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const pageSize = 10;
  const token = localStorage.getItem("accessToken");

  const statusOptions = [
    { value: "ALL", label: "Tất cả" },
    { value: "PENDING", label: "Chờ xác minh" },
    { value: "APPROVED", label: "Đã phê duyệt" },
    { value: "REJECTED", label: "Đã từ chối" }
  ];

  // Fetch danh sách người dùng theo trạng thái
  const fetchUsersByStatus = async (status, page = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      // API để lấy danh sách người dùng theo trạng thái
      let url;
      if (status === "ALL") {
        url = `https://api.roomily.tech/api/v1/user-verification/admin/all?page=${page}&size=${pageSize}`;
      } else {
        url = `https://api.roomily.tech/api/v1/user-verification/admin/status/${status}?page=${page}&size=${pageSize}`;
      }
      
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Lỗi: ${response.status}`);

      const data = await response.json();
      setPendingUsers(data || []);
      setTotalPages(1); // Tạm thời set 1 page, có thể cập nhật sau khi có pagination
      setCurrentPage(0);
    } catch (err) {
      console.error("Lỗi khi fetch users by status:", err);
      setError("Không thể tải danh sách người dùng.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersByStatus(selectedStatus, currentPage);
  }, [currentPage, selectedStatus]);

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(0); // Reset về trang đầu khi đổi trạng thái
    setSearchResult(null); // Xóa kết quả tìm kiếm khi đổi trạng thái
    setSearchUserId("");
    setSearchError(null);
  };

  // Tìm kiếm user theo userId
  const handleSearchUser = async () => {
    if (!searchUserId.trim()) {
      setSearchError("Vui lòng nhập User ID để tìm kiếm");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const response = await fetch(`https://api.roomily.tech/api/v1/user-verification/user/${searchUserId.trim()}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Không tìm thấy user với ID này");
        }
        throw new Error(`Lỗi: ${response.status}`);
      }

      const userData = await response.json();
      setSearchResult(userData);
    } catch (err) {
      console.error("Lỗi khi tìm kiếm user:", err);
      setSearchError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchUserId("");
    setSearchResult(null);
    setSearchError(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchUser();
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleVerifyUser = async (userId, isApproved) => {
    try {
      console.log("Gửi request xác minh:", { userId, isApproved });
      
      const response = await fetch(`https://api.roomily.tech/api/v1/user-verification/admin/${userId}/process?isApprove=${isApproved}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);
      
      let responseData;
      try {
        responseData = await response.json();
        console.log("Response data:", responseData);
      } catch (parseError) {
        console.log("Không thể parse JSON response, có thể là text response");
        responseData = null;
      }
      
      if (!response.ok) {
        console.error("API call failed:", response.status, responseData);
        throw new Error(`Lỗi ${response.status}: ${responseData?.message || "Lỗi khi xác minh người dùng"}`);
      }

      console.log("API call thành công, cập nhật state...");
      
      // Cập nhật trạng thái user trong danh sách
      const newStatus = isApproved ? "APPROVED" : "REJECTED";
      console.log("Cập nhật trạng thái:", { userId, newStatus });
      
      // Nếu đang lọc theo trạng thái cụ thể và trạng thái mới khác với filter hiện tại, xóa user khỏi danh sách
      if (selectedStatus !== "ALL" && newStatus !== selectedStatus) {
        setPendingUsers(prevUsers => {
          return prevUsers.filter(user => user.userId !== userId);
        });
      } else {
        // Nếu đang xem tất cả hoặc trạng thái mới trùng với filter, cập nhật user
        setPendingUsers(prevUsers => {
          const updatedUsers = prevUsers.map(user => {
            if (user.userId === userId) {
              console.log("Tìm thấy user để cập nhật:", user);
              return { ...user, verificationStatus: newStatus };
            }
            return user;
          });
          console.log("Users sau khi cập nhật:", updatedUsers);
          return updatedUsers;
        });
      }

      // Cập nhật selectedUser nếu đang xem chi tiết
      if (selectedUser && selectedUser.userId === userId) {
        console.log("Cập nhật selectedUser:", selectedUser);
        setSelectedUser(prev => ({ ...prev, verificationStatus: newStatus }));
      }

      alert(isApproved ? "Đã phê duyệt người dùng thành công!" : "Đã từ chối xác minh người dùng!");
      setShowModal(false);
    } catch (err) {
      console.error("Chi tiết lỗi:", err);
      alert(`Có lỗi xảy ra: ${err.message}`);
    }
  };

  const [imageModal, setImageModal] = useState({ show: false, src: "", alt: "" });

  const showImageModal = useCallback((src, alt) => {
    setImageModal({ show: true, src, alt });
  }, []);

  const handleImageError = useCallback((e) => {
    e.target.src = "https://via.placeholder.com/400x300/cccccc/666666?text=Không+thể+tải+ảnh";
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen mx-4 rounded-lg mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Xác minh người dùng</h1>
        
        {/* Dropdown lọc theo trạng thái */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</label>
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm theo User ID:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập User ID để tìm kiếm..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSearching}
              />
              <button
                onClick={handleSearchUser}
                disabled={isSearching}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang tìm...
                  </>
                ) : (
                  <>
                    <FaEye />
                    Tìm kiếm
                  </>
                )}
              </button>
              {(searchUserId || searchResult) && (
                <button
                  onClick={handleClearSearch}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hiển thị lỗi tìm kiếm */}
        {searchError && (
          <div className="mt-3 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {searchError}
          </div>
        )}

        {/* Hiển thị kết quả tìm kiếm */}
        {searchResult && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-3">Kết quả tìm kiếm:</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2 border text-left">User ID</th>
                    <th className="px-4 py-2 border text-left">Ngày gửi</th>
                    <th className="px-4 py-2 border text-left">Trạng thái</th>
                    <th className="px-4 py-2 border text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{searchResult.userId}</td>
                    <td className="px-4 py-2 border">
                      {searchResult.createdAt ? new Date(searchResult.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-4 py-2 border">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        !searchResult.verificationStatus || searchResult.verificationStatus === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800' 
                          : searchResult.verificationStatus === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {!searchResult.verificationStatus || searchResult.verificationStatus === 'PENDING' ? 'Chờ xác minh' 
                         : searchResult.verificationStatus === 'APPROVED' ? 'Đã phê duyệt'
                         : 'Đã từ chối'}
                      </span>
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => handleViewDetails(searchResult)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 mx-auto"
                      >
                        <FaEye /> Xem chi tiết
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto shadow-md rounded-lg bg-white">
            <table className="min-w-full table-auto border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 border text-left">User ID</th>
                  <th className="px-4 py-2 border text-left">Ngày gửi</th>
                  <th className="px-4 py-2 border text-left">Trạng thái</th>
                  <th className="px-4 py-2 border text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      {selectedStatus === 'ALL' ? 'Không có dữ liệu người dùng' :
                       selectedStatus === 'PENDING' ? 'Không có người dùng nào chờ xác minh' :
                       selectedStatus === 'APPROVED' ? 'Không có người dùng nào đã được phê duyệt' :
                       'Không có người dùng nào bị từ chối'}
                    </td>
                  </tr>
                ) : (
                  pendingUsers.map((verification, index) => (
                    <tr key={verification.userId || index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{verification.userId}</td>
                      <td className="px-4 py-2 border">
                        {verification.createdAt ? new Date(verification.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                      </td>
                      <td className="px-4 py-2 border">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          !verification.verificationStatus || verification.verificationStatus === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800' 
                            : verification.verificationStatus === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {!verification.verificationStatus || verification.verificationStatus === 'PENDING' ? 'Chờ xác minh' 
                           : verification.verificationStatus === 'APPROVED' ? 'Đã phê duyệt'
                           : 'Đã từ chối'}
                        </span>
                      </td>
                      <td className="px-4 py-2 border text-center">
                        <button
                          onClick={() => handleViewDetails(verification)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 mx-auto"
                        >
                          <FaEye /> Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              <button
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 hover:bg-gray-400"
              >
                Trước
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePageChange(idx)}
                  className={`px-3 py-2 rounded ${
                    idx === currentPage ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 hover:bg-gray-400"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal xem chi tiết */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Xác minh người dùng: {selectedUser.userId}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Thông tin cá nhân - Thu gọn */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-700">
                  <FaUser className="text-blue-600" />
                  Thông tin cá nhân
                </h3>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-sm text-gray-600">User ID</p>
                    <p className="font-semibold text-gray-800">{selectedUser.userId}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Ngày gửi yêu cầu</p>
                    <p className="font-semibold text-gray-800">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Trạng thái xác minh</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      !selectedUser.verificationStatus || selectedUser.verificationStatus === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                        : selectedUser.verificationStatus === 'APPROVED'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {!selectedUser.verificationStatus || selectedUser.verificationStatus === 'PENDING' ? 'Chờ xác minh' 
                       : selectedUser.verificationStatus === 'APPROVED' ? 'Đã phê duyệt'
                       : 'Đã từ chối'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hình ảnh khuôn mặt - Di chuyển lên */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-700">
                  <FaUser className="text-purple-600" />
                  Hình ảnh khuôn mặt
                </h3>
                {selectedUser.selfieImageUrl ? (
                  <div className="bg-white p-2 rounded-lg">
                    <img
                      src={selectedUser.selfieImageUrl}
                      alt="Khuôn mặt người dùng"
                      className="w-full h-64 object-cover rounded-lg border-2 border-purple-200 cursor-pointer hover:opacity-80 transition-all duration-300 hover:scale-105"
                      onClick={() => showImageModal(selectedUser.selfieImageUrl, "Khuôn mặt người dùng")}
                      onError={handleImageError}
                    />
                    <p className="text-center text-sm text-gray-600 mt-2">Nhấp để xem phóng to</p>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-lg">
                    <div className="w-full h-64 bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <FaUser className="text-gray-400 text-4xl mb-2 mx-auto" />
                        <p className="text-gray-500">Chưa có hình ảnh khuôn mặt</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hình ảnh căn cước - Mở rộng */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-700">
                  <FaIdCard className="text-green-600" />
                  Hình ảnh căn cước công dân
                </h3>
                <div className="space-y-4">
                  {selectedUser.frontImageUrl ? (
                    <div className="bg-white p-2 rounded-lg">
                      <p className="text-sm font-medium mb-2 text-gray-700">Mặt trước:</p>
                      <img
                        src={selectedUser.frontImageUrl}
                        alt="Căn cước mặt trước"
                        className="w-full h-40 object-cover rounded-lg border-2 border-green-200 cursor-pointer hover:opacity-80 transition-all duration-300 hover:scale-105"
                        onClick={() => showImageModal(selectedUser.frontImageUrl, "Căn cước mặt trước")}
                        onError={handleImageError}
                      />
                    </div>
                  ) : (
                    <div className="bg-white p-2 rounded-lg">
                      <p className="text-sm font-medium mb-2 text-gray-700">Mặt trước:</p>
                      <div className="w-full h-40 bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-center">
                          <FaIdCard className="text-gray-400 text-3xl mb-1 mx-auto" />
                          <p className="text-gray-500 text-sm">Chưa có ảnh mặt trước</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedUser.backImageUrl ? (
                    <div className="bg-white p-2 rounded-lg">
                      <p className="text-sm font-medium mb-2 text-gray-700">Mặt sau:</p>
                      <img
                        src={selectedUser.backImageUrl}
                        alt="Căn cước mặt sau"
                        className="w-full h-40 object-cover rounded-lg border-2 border-green-200 cursor-pointer hover:opacity-80 transition-all duration-300 hover:scale-105"
                        onClick={() => showImageModal(selectedUser.backImageUrl, "Căn cước mặt sau")}
                        onError={handleImageError}
                      />
                    </div>
                  ) : (
                    <div className="bg-white p-2 rounded-lg">
                      <p className="text-sm font-medium mb-2 text-gray-700">Mặt sau:</p>
                      <div className="w-full h-40 bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-center">
                          <FaIdCard className="text-gray-400 text-3xl mb-1 mx-auto" />
                          <p className="text-gray-500 text-sm">Chưa có ảnh mặt sau</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-center text-sm text-gray-600 mt-3">Nhấp vào ảnh để xem phóng to</p>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Đóng
              </button>
              {(!selectedUser.verificationStatus || selectedUser.verificationStatus === 'PENDING') && (
                <>
                  <button
                    onClick={() => handleVerifyUser(selectedUser.userId, false)}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 transition-colors font-medium shadow-md hover:shadow-lg"
                  >
                    <FaTimes /> Từ chối
                  </button>
                  <button
                    onClick={() => handleVerifyUser(selectedUser.userId, true)}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 transition-colors font-medium shadow-md hover:shadow-lg"
                  >
                    <FaCheck /> Phê duyệt
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal xem ảnh phóng to */}
      {imageModal.show && (
        <ImageModal
          src={imageModal.src}
          alt={imageModal.alt}
          onClose={() => setImageModal({ show: false, src: "", alt: "" })}
        />
      )}
    </div>
  );
};

export default UserVerification; 