import { useState, useEffect } from "react";
import lockUser from '../../assets/images/lock.png';

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [showBanForm, setShowBanForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [banExpiresAt, setBanExpiresAt] = useState("");

  // Thêm state cho tìm kiếm
  const [searchUserId, setSearchUserId] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const pageSize = 10;
  const sortBy = "balance";
  const sortDir = "desc";

  const token = localStorage.getItem("accessToken");

  // Fetch trạng thái isBanned cho mỗi user
  const fetchIsBanned = async (userId) => {
    try {
      const res = await fetch(`https://api.roomily.tech/api/v1/ban/isBanned/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return false;
      const result = await res.json();
      return result; // true / false
    } catch {
      return false;
    }
  };

  const fetchUsers = async (page = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `https://api.roomily.tech/api/v1/users?page=${page}&size=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`;
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Lỗi: ${response.status}`);

      const data = await response.json();
      const usersWithBan = await Promise.all(
        data.users.map(async (user) => {
          const isBanned = await fetchIsBanned(user.id);
          return { ...user, isBanned };
        })
      );

      setUsers(usersWithBan);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(data.currentPage || 0);
    } catch (err) {
      console.error("Lỗi khi fetch user:", err);
      setError("Không thể tải danh sách người dùng.");
    } finally {
      setIsLoading(false);
    }
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
      const response = await fetch(`https://api.roomily.tech/api/v1/users/${searchUserId.trim()}`, {
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
      // Fetch thêm thông tin isBanned cho user tìm được
      const isBanned = await fetchIsBanned(userData.id);
      setSearchResult({ ...userData, isBanned });
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

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const handleLockClick = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user?.isBanned) {
      alert("Người dùng này đã bị ban trước đó.");
      return;
    }
    setSelectedUserId(userId);
    setShowBanForm(true);
  };

  const handleBanSubmit = async () => {
    try {
      const response = await fetch("https://api.roomily.tech/api/v1/ban/ban", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUserId,
          reason: banReason,
          expiresAt: banExpiresAt,
        }),
      });

      if (!response.ok) throw new Error("Lỗi khi ban người dùng.");

      alert("Đã ban người dùng thành công!");
      setShowBanForm(false);
      setBanReason("");
      setBanExpiresAt("");
      fetchUsers(currentPage); // refresh lại
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi ban.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen mx-4 rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-4">Quản lý người dùng</h1>

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
                  "Tìm kiếm"
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
                    <th className="px-4 py-2 border">ID</th>
                    <th className="px-4 py-2 border">Tên đăng nhập</th>
                    <th className="px-4 py-2 border">Email</th>
                    <th className="px-4 py-2 border">Số dư</th>
                    <th className="px-4 py-2 border">Xác minh</th>
                    <th className="px-4 py-2 border">Trạng thái</th>
                    <th className="px-4 py-2 border">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`text-center ${searchResult.isBanned ? "bg-red-100 text-red-700" : ""}`}>
                    <td className="px-4 py-2 border">{searchResult.id}</td>
                    <td className="px-4 py-2 border">{searchResult.username}</td>
                    <td className="px-4 py-2 border">{searchResult.email}</td>
                    <td className="px-4 py-2 border">{searchResult.balance}</td>
                    <td className="px-4 py-2 border">
                      {searchResult.isVerified ? "✔️" : "❌"}
                    </td>
                    <td className="px-4 py-2 border">
                      {searchResult.isBanned ? "🚫" : "✅"}
                    </td>
                    <td className="px-4 py-2 border">
                      <div className="flex justify-center">
                        <img
                          src={lockUser}
                          alt="Khóa"
                          className="w-5 h-5 cursor-pointer hover:opacity-80"
                          onClick={() => handleLockClick(searchResult.id)}
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {isLoading ? (
        <div>Đang tải dữ liệu...</div>
      ) : (
        <>
        <div className="overflow-x-auto shadow-md rounded-lg bg-white">
          <table className="min-w-full table-auto border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Tên đăng nhập</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Số dư</th>
                <th className="px-4 py-2 border">Xác minh</th>
                <th className="px-4 py-2 border">Trạng thái</th>
                <th className="px-4 py-2 border">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={index}
                  className={`text-center ${user.isBanned ? "bg-red-100 text-red-700" : ""}`}
                >
                  <td className="px-4 py-2 border">{user.id}</td>
                  <td className="px-4 py-2 border">{user.username}</td>
                  <td className="px-4 py-2 border">{user.email}</td>
                  <td className="px-4 py-2 border">{user.balance}</td>
                  <td className="px-4 py-2 border">
                    {user.isVerified ? "✔️" : "❌"}
                  </td>
                  <td className="px-4 py-2 border">
                    {user.isBanned ? "🚫" : "✅"}
                  </td>
                  <td className="px-4 py-2 border">
                    <div className="flex justify-center">
                      <img
                        src={lockUser}
                        alt="Khóa"
                        className="w-5 h-5 cursor-pointer hover:opacity-80"
                        onClick={() => handleLockClick(user.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          

          {/* Pagination */}
          <div className="flex justify-center mt-6 space-x-2">
            <button
              disabled={currentPage === 0}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Trước
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => handlePageChange(idx)}
                className={`px-3 py-2 rounded ${idx === currentPage ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages - 1}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </>
      )}

      {/* Ban User Modal */}
      {showBanForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Ban người dùng</h2>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Lý do:</label>
              <input
                type="text"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Ngày hết hạn:</label>
              <input
                type="datetime-local"
                value={banExpiresAt}
                onChange={(e) => setBanExpiresAt(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBanForm(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleBanSubmit}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUser;
