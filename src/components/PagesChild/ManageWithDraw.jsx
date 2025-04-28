import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaQrcode, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdContentCopy } from "react-icons/md";

const ManageWithDraw = () => {
  const navigate = useNavigate();
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bankInfo, setBankInfo] = useState({});
  const [showQrModal, setShowQrModal] = useState(false);
  const [currentQrData, setCurrentQrData] = useState(null);
  
  // Thêm state cho modal từ chối
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  
  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const token = localStorage.getItem("accessToken");

  const getVietnameseStatus = (status) => {
    switch (status) {
      case "PENDING":
        return "Đang chờ duyệt";
      case "APPROVED":
        return "Đã chấp nhận";
      case "REJECTED":
        return "Đã từ chối";
      default:
        return status;
    }
  };

  const fetchPendingWithdrawals = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://api.roomily.tech/api/v1/transactions/type/WITHDRAWAL/status/PENDING",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi khi lấy danh sách yêu cầu rút tiền");
      }

      const data = await response.json();
      
      // Lấy danh sách yêu cầu
      const requests = data.content || [];
      setWithdrawRequests(requests);
      
      // Lấy thông tin ngân hàng cho mỗi yêu cầu
      const bankInfoPromises = requests.map(request => 
        fetchBankInfo(request.userId)
      );
      
      const bankInfoResults = await Promise.all(bankInfoPromises);
      
      // Tạo object map userId -> bankInfo
      const bankInfoMap = {};
      bankInfoResults.forEach(info => {
        if (info) {
          bankInfoMap[info.userId] = info;
        }
      });
      
      setBankInfo(bankInfoMap);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchBankInfo = async (userId) => {
    try {
      const response = await fetch(
        `https://api.roomily.tech/api/wallet/withdraw-info/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) {
        console.error(`Không thể lấy thông tin ngân hàng cho người dùng ${userId}`);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin ngân hàng:`, error);
      return null;
    }
  };

  useEffect(() => {
    fetchPendingWithdrawals();
  }, []);
  
  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < Math.ceil(withdrawRequests.length / itemsPerPage)) {
      setCurrentPage(newPage);
    }
  };

  const handleAccept = async (id) => {
    try {
      const response = await fetch(
        `https://api.roomily.tech/api/wallet/confirm-withdraw/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Không thể chấp nhận yêu cầu.");

      alert("Đã chấp nhận yêu cầu rút tiền.");
      // Đóng modal QR nếu đang mở
      setShowQrModal(false);
      fetchPendingWithdrawals(); // refresh lại list
    } catch (error) {
      console.error("Lỗi khi chấp nhận:", error);
      alert("Đã xảy ra lỗi khi chấp nhận yêu cầu.");
    }
  };

  const handleReject = async (id) => {
    try {
      console.log(`Đang gửi yêu cầu từ chối cho giao dịch ID: ${id}`);
      
      // Kiểm tra trước xem id có hợp lệ không
      if (!id) {
        alert("ID giao dịch không hợp lệ");
        return;
      }
      
      if (!rejectReason.trim()) {
        alert("Vui lòng nhập lý do từ chối");
        return;
      }
      
      const url = `https://api.roomily.tech/api/wallet/cancel-withdraw/${id}`;
      console.log(`URL yêu cầu: ${url}`);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        // Gửi lý do từ chối trong body
        body: JSON.stringify({
          reason: rejectReason
        })
      });

      // Log phản hồi chi tiết
      let responseText;
      try {
        responseText = await response.text();
        console.log(`Mã phản hồi: ${response.status}`);
        console.log(`Phản hồi: ${responseText}`);
      } catch (error) {
        console.log(`Lỗi khi đọc phản hồi: ${error}`);
      }

      if (!response.ok) {
        const errorMsg = responseText 
          ? `Không thể từ chối yêu cầu: ${responseText}` 
          : `Không thể từ chối yêu cầu. Mã lỗi: ${response.status}`;
        throw new Error(errorMsg);
      }

      alert("Đã từ chối yêu cầu rút tiền.");
      // Đóng modal từ chối
      setShowRejectModal(false);
      setRejectReason("");
      setRejectingId(null);
      fetchPendingWithdrawals(); // refresh lại list
    } catch (error) {
      console.error("Lỗi khi từ chối:", error);
      alert(`Đã xảy ra lỗi khi từ chối yêu cầu. Vui lòng kiểm tra console để biết thêm chi tiết.`);
    }
  };
  
  // Hàm hiển thị modal từ chối
  const openRejectModal = (id) => {
    setRejectingId(id);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleShowQR = (request) => {
    const userBankInfo = bankInfo[request.userId];
    if (!userBankInfo) {
      alert("Không tìm thấy thông tin ngân hàng của người dùng này.");
      return;
    }
    
    // Tạo dữ liệu QR
    const qrData = {
      bankId: userBankInfo.bankName,
      accountNo: userBankInfo.accountNumber,
      accountName: userBankInfo.accountName || "",
      amount: request.amount,
      requestId: request.id,
    };
    
    setCurrentQrData(qrData);
    setShowQrModal(true);
  };
  
  const generateQrImageUrl = (bankInfo, amount) => {
    if (!bankInfo || !bankInfo.bankName || !bankInfo.accountNumber) {
      return null;
    }
    
    // URL encode các tham số
    const encodedAccountName = encodeURIComponent(bankInfo.accountName || "");
    
    // Tạo URL QR (không có phần nội dung)
    return `https://img.vietqr.io/image/${bankInfo.bankName}-${bankInfo.accountNumber}-compact2.png?amount=${amount}&accountName=${encodedAccountName}`;
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert("Đã sao chép vào clipboard!");
      })
      .catch((err) => {
        console.error('Lỗi khi sao chép: ', err);
      });
  };
  
  // Lấy dữ liệu phân trang
  const paginatedData = withdrawRequests.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen mx-4 rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-4">Yêu cầu rút tiền đang chờ duyệt</h1>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Mã giao dịch</th>
              <th className="p-2 border">Số tiền</th>
              <th className="p-2 border">Trạng thái</th>
              <th className="p-2 border">Ngày yêu cầu</th>
              <th className="p-2 border">Tên đăng nhập</th>
              <th className="p-2 border">User ID</th>
              <th className="p-2 border">Thanh toán</th>
              <th className="p-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center p-4">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : withdrawRequests.length > 0 ? (
              paginatedData.map((item) => (
                <tr key={item.id} className="text-center border-b">
                  <td className="p-1 border">{item.id}</td>
                  <td className="p-1 border">
                    {Number(item.amount).toLocaleString()} đ
                  </td>
                  <td className="p-1 border">{getVietnameseStatus(item.status)}</td>
                  <td className="p-1 border">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td className="p-1 border">{item.userName}</td>
                  <td className="p-1 border">{item.userId}</td>
                  <td className="p-1 border">
                    {bankInfo[item.userId] ? (
                      <button 
                        onClick={() => handleShowQR(item)}
                        className="bg-blue-500 text-white px-2 py-1 rounded-md flex items-center justify-center mx-auto"
                      >
                        <FaQrcode className="mr-1" /> Mã QR
                      </button>
                    ) : (
                      <span className="text-gray-500">Không có thông tin</span>
                    )}
                  </td>
                  <td className="p-3 border">
                    <div className="flex justify-center">
                      <FaTimesCircle
                        className="text-red-500 cursor-pointer text-xl hover:scale-125 transition"
                        title="Từ chối"
                        onClick={() => openRejectModal(item.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-4">
                  Không có yêu cầu nào đang chờ duyệt.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Phân trang */}
        {withdrawRequests.length > 0 && (
          <div className="flex items-center justify-between mt-4 px-4 py-2">
            <div className="text-sm text-gray-700">
              Hiển thị trang {currentPage + 1} / {Math.max(1, Math.ceil(withdrawRequests.length / itemsPerPage))} (Tổng {withdrawRequests.length} yêu cầu)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className={`p-2 rounded-md ${currentPage > 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
              >
                <FaChevronLeft />
              </button>
              {Array.from({ length: Math.max(1, Math.min(5, Math.ceil(withdrawRequests.length / itemsPerPage))) }).map((_, index) => {
                let pageToShow;
                const totalPages = Math.max(1, Math.ceil(withdrawRequests.length / itemsPerPage));
                
                if (totalPages <= 5) {
                  pageToShow = index;
                } else {
                  const middleIndex = Math.min(
                    Math.max(currentPage, 2),
                    totalPages - 3
                  );
                  pageToShow = index + Math.max(0, middleIndex - 2);
                }
                
                return (
                  <button
                    key={pageToShow}
                    onClick={() => handlePageChange(pageToShow)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      currentPage === pageToShow
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pageToShow + 1}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= Math.max(0, Math.ceil(withdrawRequests.length / itemsPerPage) - 1)}
                className={`p-2 rounded-md ${currentPage < Math.max(0, Math.ceil(withdrawRequests.length / itemsPerPage) - 1) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal hiển thị mã QR */}
      {showQrModal && currentQrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-center">Mã QR Thanh Toán</h2>
            <div className="flex flex-col items-center">
              <img 
                src={generateQrImageUrl(
                  { bankName: currentQrData.bankId, accountNumber: currentQrData.accountNo, accountName: currentQrData.accountName },
                  currentQrData.amount
                )} 
                alt="Mã QR chuyển khoản" 
                className="w-64 h-64 object-contain mb-4"
              />
              
              <div className="w-full space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Ngân hàng:</span>
                  <div className="flex items-center">
                    <span>{currentQrData.bankId}</span>
                    <button onClick={() => copyToClipboard(currentQrData.bankId)} className="ml-2 text-blue-500">
                      <MdContentCopy />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Số tài khoản:</span>
                  <div className="flex items-center">
                    <span>{currentQrData.accountNo}</span>
                    <button onClick={() => copyToClipboard(currentQrData.accountNo)} className="ml-2 text-blue-500">
                      <MdContentCopy />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Tên tài khoản:</span>
                  <div className="flex items-center">
                    <span>{currentQrData.accountName}</span>
                    <button onClick={() => copyToClipboard(currentQrData.accountName)} className="ml-2 text-blue-500">
                      <MdContentCopy />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Số tiền:</span>
                  <div className="flex items-center">
                    <span>{Number(currentQrData.amount).toLocaleString()} đ</span>
                    <button onClick={() => copyToClipboard(currentQrData.amount.toString())} className="ml-2 text-blue-500">
                      <MdContentCopy />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => handleAccept(currentQrData.requestId)}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Xác nhận đã chuyển
                </button>
                <button 
                  onClick={() => setShowQrModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal từ chối yêu cầu */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-center">Từ chối yêu cầu rút tiền</h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Lý do từ chối
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Nhập lý do từ chối"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowRejectModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Hủy
              </button>
              <button 
                onClick={() => handleReject(rejectingId)}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                disabled={!rejectReason.trim()}
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageWithDraw;
