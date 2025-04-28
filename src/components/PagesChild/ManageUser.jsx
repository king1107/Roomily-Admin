import { useState, useEffect } from "react";
import lockUser from '../../images/lock.png';

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
