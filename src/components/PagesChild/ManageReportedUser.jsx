import React, { useEffect, useState } from "react";
import unlockUser from "../../assets/images/unlocked.png";

const ManageReportedUser = () => {
  const [bannedUsers, setBannedUsers] = useState([]);
  const [error, setError] = useState("");
  const [showUnbanForm, setShowUnbanForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [showBanHistory, setShowBanHistory] = useState(false);
  const [banHistory, setBanHistory] = useState([]);
  const [selectedHistoryUserId, setSelectedHistoryUserId] = useState(null);
  const [currentHistoryPage, setCurrentHistoryPage] = useState(0);
  const [totalHistoryPages, setTotalHistoryPages] = useState(1);
  const historyItemsPerPage = 5;

  // Lấy danh sách user bị ban
  const fetchBannedUsers = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch("https://api.roomily.tech/api/v1/ban/active", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Lỗi: ${response.status}`);

      const data = await response.json();
      setBannedUsers(data);
    } catch (err) {
      setError("Không thể tải danh sách người dùng bị ban.");
      console.error("Lỗi khi fetch danh sách ban:", err);
    }
  };

  useEffect(() => {
    fetchBannedUsers();
  }, []);

  const handleUnlockClick = (userId) => {
    setSelectedUserId(userId);
    setShowUnbanForm(true);
  };

  const handleConfirmUnban = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`https://api.roomily.tech/api/v1/ban/unban/${selectedUserId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Lỗi: ${response.status}`);

      alert("Unban người dùng thành công!");
      setBannedUsers(bannedUsers.filter((user) => user.userId !== selectedUserId));
      setShowUnbanForm(false);
      setSelectedUserId(null);
    } catch (err) {
      console.error("Lỗi khi unban người dùng:", err);
      alert("Có lỗi xảy ra khi unban người dùng.");
    }
  };

  // Gọi API để lấy lịch sử ban
  const fetchBanHistory = async (userId) => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(
        `https://api.roomily.tech/api/v1/ban/history/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Không thể tải lịch sử ban.");

      const data = await response.json();
      setBanHistory(data); // Dữ liệu là mảng
      setSelectedHistoryUserId(userId);
      setShowBanHistory(true);
      setCurrentHistoryPage(0); // Reset về trang đầu tiên
      setTotalHistoryPages(Math.ceil(data.length / historyItemsPerPage));
    } catch (err) {
      console.error("Lỗi khi lấy lịch sử ban:", err);
      alert("Không thể tải lịch sử ban người dùng.");
    }
  };

  // Tính toán các mục hiển thị trên trang hiện tại
  const getCurrentHistoryItems = () => {
    const startIndex = currentHistoryPage * historyItemsPerPage;
    const endIndex = startIndex + historyItemsPerPage;
    return banHistory.slice(startIndex, endIndex);
  };

  // Xử lý chuyển trang
  const handleHistoryPageChange = (page) => {
    if (page >= 0 && page < totalHistoryPages) {
      setCurrentHistoryPage(page);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen mx-4 rounded-lg mt-10 relative">
      <h2 className="text-2xl font-semibold mb-4">Người dùng bị ban</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="overflow-x-auto shadow-md rounded-lg bg-white">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-3 py-2 border">User ID</th>
              <th className="px-3 py-2 border">Tên đăng nhập</th>
              <th className="px-3 py-2 border">Role</th>
              <th className="px-3 py-2 border">Lý do</th>
              <th className="px-3 py-2 border">Ngày hết hạn</th>
              <th className="px-3 py-2 border">Lịch sử ban</th>
              <th className="px-3 py-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {bannedUsers.map((user) => (
              <tr key={user.id} className="text-center">
                <td className="px-3 py-2 border">{user.userId}</td>
                <td className="px-3 py-2 border">{user.username}</td>
                <td className="px-3 py-2 border">{user.role}</td>
                <td className="px-3 py-2 border">{user.reason}</td>
                <td className="px-3 py-2 border">
                  {new Date(user.expiresAt).toLocaleString()}
                </td>
                <td
                  className="px-4 py-2 border underline text-red-500 hover:text-red-600 cursor-pointer"
                  onClick={() => fetchBanHistory(user.userId)}
                >
                  Xem lịch sử ban
                </td>
                <td className="px-4 py-2 border">
                  <div className="flex justify-center">
                    <img
                      src={unlockUser}
                      alt="Mở khóa"
                      className="w-5 h-5 cursor-pointer hover:opacity-80"
                      onClick={() => handleUnlockClick(user.userId)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form xác nhận unban */}
      {showUnbanForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Xác nhận unban</h2>
            <p className="mb-4">
              Bạn có chắc chắn muốn mở khóa người dùng có ID:{" "}
              <strong>{selectedUserId}</strong> không?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowUnbanForm(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmUnban}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup lịch sử ban */}
      {showBanHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[700px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Lịch sử ban</h2>
            <table className="min-w-full table-auto border border-gray-300 mb-4">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 border">Thời gian ban</th>
                  <th className="px-3 py-2 border">Thời gian hết hạn ban</th>
                  <th className="px-3 py-2 border">Lý do</th>
                </tr>
              </thead>
              <tbody>
                {banHistory.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-2">Không có dữ liệu</td>
                  </tr>
                ) : (
                  getCurrentHistoryItems().map((entry) => (
                    <tr key={entry.id}>
                      <td className="border px-3 py-1">{new Date(entry.bannedAt).toLocaleString()}</td>
                      <td className="border px-3 py-1">{new Date(entry.expiresAt).toLocaleString()}</td>
                      <td className="border px-3 py-1">{entry.reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Phân trang cho lịch sử ban */}
            {banHistory.length > 0 && (
              <div className="flex justify-center mb-4 space-x-2">
                <button
                  disabled={currentHistoryPage === 0}
                  onClick={() => handleHistoryPageChange(currentHistoryPage - 1)}
                  className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                  Trước
                </button>
                {[...Array(totalHistoryPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleHistoryPageChange(idx)}
                    className={`px-3 py-1 rounded ${
                      idx === currentHistoryPage ? "bg-blue-600 text-white" : "bg-gray-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  disabled={currentHistoryPage === totalHistoryPages - 1}
                  onClick={() => handleHistoryPageChange(currentHistoryPage + 1)}
                  className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowBanHistory(false);
                  setBanHistory([]);
                  setSelectedHistoryUserId(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReportedUser;
