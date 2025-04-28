import { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";

const ManageRoom = () => {
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [reportedRooms, setReportedRooms] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReportedRooms();
  }, []);

  const fetchReportedRooms = async () => {
    setLoading(true);
    setSuccessMessage(null);
    try {
      // Lấy access token từ localStorage
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setError("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      // Thêm token vào header
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const response = await axios.get("https://api.roomily.tech/api/v1/room-reports/status/PENDING", config);
      setReportedRooms(response.data);
      setError(null);
    } catch (err) {
      console.error("Lỗi khi tải danh sách phòng bị báo cáo:", err);
      if (err.response && err.response.status === 401) {
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      } else {
        setError("Không thể tải danh sách phòng bị báo cáo. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (report) => {
    setSelectedReport(report);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedReport(null);
  };

  const processReport = async (reportId, isValid) => {
    setProcessingId(reportId);
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setError("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      await axios.post(
        `https://api.roomily.tech/api/v1/room-reports/process/${reportId}/${isValid}`, 
        {}, // Empty body
        config
      );

      // Cập nhật danh sách sau khi xử lý báo cáo
      setReportedRooms(reportedRooms.filter(report => report.id !== reportId));
      setSuccessMessage(
        isValid 
          ? "Đã xác nhận báo cáo và xử lý phòng thành công" 
          : "Đã từ chối báo cáo thành công"
      );
      
      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      closeModal();

    } catch (err) {
      console.error("Lỗi khi xử lý báo cáo:", err);
      if (err.response && err.response.status === 401) {
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      } else {
        setError(`Không thể xử lý báo cáo. ${err.response?.data?.message || 'Vui lòng thử lại sau.'}`);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen mx-4 rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-4">Quản lý phòng</h1>
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Danh sách phòng bị báo cáo</h2>
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p>{successMessage}</p>
          </div>
        )}
        
        {loading ? (
          <p className="text-center py-4">Đang tải dữ liệu...</p>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button 
              onClick={fetchReportedRooms} 
              className="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Thử lại
            </button>
          </div>
        ) : reportedRooms.length === 0 ? (
          <p className="text-center py-4">Không có phòng nào bị báo cáo</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-2 border-b text-center">ID phòng</th>
                  <th className="py-2 px-2 border-b text-center">Lý do báo cáo</th>
                  <th className="py-2 px-2 border-b text-center">Trạng thái</th>
                  <th className="py-2 px-2 border-b text-center">Thời gian báo cáo</th>
                  <th className="py-2 px-2 border-b text-center">Người báo cáo</th>
                  <th className="py-2 px-2 border-b text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {reportedRooms.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="py-2 px-2 border-b text-center">{report.roomId}</td>
                    <td className="py-2 px-2 border-b text-center">{report.reason}</td>
                    <td className="py-2 px-2 border-b text-center">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        {report.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 border-b text-center">{formatDate(report.createdAt)}</td>
                    <td className="py-2 px-2 border-b text-center">{report.reporterId}</td>
                    <td className="py-2 px-2 border-b text-center">
                      <button 
                        onClick={() => openConfirmModal(report)} 
                        className="mr-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm"
                        disabled={processingId === report.id}
                      >
                        {processingId === report.id ? "Đang xử lý..." : "Xử lý"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal xác nhận */}
      {modalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Xử lý báo cáo phòng</h3>
            <p className="mb-4">
              <strong>Lý do báo cáo:</strong> {selectedReport.reason}
            </p>
            <p className="mb-4">
              <strong>ID phòng:</strong> {selectedReport.roomId}
            </p>
            <p className="mb-6">
              Bạn có muốn ban/xóa phòng này không?
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={closeModal} 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                disabled={processingId}
              >
                Hủy
              </button>
              <button 
                onClick={() => processReport(selectedReport.id, false)} 
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                disabled={processingId}
              >
                {processingId === selectedReport.id ? "Đang xử lý..." : "Từ chối báo cáo"}
              </button>
              <button 
                onClick={() => processReport(selectedReport.id, true)} 
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                disabled={processingId}
              >
                {processingId === selectedReport.id ? "Đang xử lý..." : "Xác nhận và ban phòng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRoom;