import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  FaUsers, FaUserCheck, FaUserPlus, FaWallet, 
  FaArrowUp, FaArrowDown, FaHouseUser, FaMoneyBillWave,
  FaExchangeAlt, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [systemStats, setSystemStats] = useState(null);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [transactionsByType, setTransactionsByType] = useState([]);
  const [transactionsByStatus, setTransactionsByStatus] = useState([]);
  const [usersByStatus, setUsersByStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPagination, setUserPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false
  });
  
  // Thêm state cho phân trang giao dịch hoàn thành
  const [transactionPage, setTransactionPage] = useState(0);
  const transactionsPerPage = 5;
  
  // Thêm state cho phân trang yêu cầu rút tiền
  const [withdrawalPage, setWithdrawalPage] = useState(0);
  const withdrawalsPerPage = 5;

  // Định dạng số tiền thành VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const fetchActiveUsers = async (page = 0) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No token found!");
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get(
        `https://api.roomily.tech/api/v1/admin/users/status/ACTIVE?page=${page}`, 
        config
      );

      setUsersByStatus(response.data.users || []);
      setUserPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
        hasNext: response.data.hasNext,
        hasPrevious: response.data.hasPrevious
      });
    } catch (error) {
      console.error("Lỗi khi fetch danh sách người dùng:", error.response?.data || error.message);
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No token found!");
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const [
        dashboardRes,
        systemRes,
        pendingWithdrawalsRes,
        transactionsByTypeRes,
        transactionsByStatusRes
      ] = await Promise.all([
        axios.get("https://api.roomily.tech/api/v1/admin/dashboard", config),
        axios.get("https://api.roomily.tech/api/v1/admin/system-statistics", config),
        axios.get("https://api.roomily.tech/api/v1/admin/transactions/pending-withdrawals", config),
        axios.get("https://api.roomily.tech/api/v1/admin/transactions/type/DEPOSIT", config),
        axios.get("https://api.roomily.tech/api/v1/admin/transactions/status/COMPLETED", config)
      ]);

      setDashboardData(dashboardRes.data);
      setSystemStats(systemRes.data);
      setPendingWithdrawals(pendingWithdrawalsRes.data.content || []);
      setTransactionsByType(transactionsByTypeRes.data.content || []);
      setTransactionsByStatus(transactionsByStatusRes.data.content || []);

      // Fetch active users separately
      await fetchActiveUsers();
    } catch (error) {
      console.error("Lỗi khi fetch dữ liệu:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < userPagination.totalPages) {
      fetchActiveUsers(newPage);
    }
  };
  
  // Xử lý phân trang cho giao dịch
  const handleTransactionPageChange = (newPage) => {
    if (newPage >= 0 && newPage < Math.ceil(transactionsByStatus.length / transactionsPerPage)) {
      setTransactionPage(newPage);
    }
  };
  
  // Xử lý phân trang cho yêu cầu rút tiền
  const handleWithdrawalPageChange = (newPage) => {
    if (newPage >= 0 && newPage < Math.ceil(pendingWithdrawals.length / withdrawalsPerPage)) {
      setWithdrawalPage(newPage);
    }
  };

  // Tạo dữ liệu cho biểu đồ người dùng
  const getUserChartData = () => {
    if (!dashboardData) return [];
    
    return [
      { name: 'Người dùng hoạt động', value: dashboardData.activeUsers || 0 },
      { name: 'Người dùng mới', value: dashboardData.newUsersThisMonth || 0 }
    ];
  };
  
  // Tạo dữ liệu cho biểu đồ giao dịch
  const getTransactionChartData = () => {
    if (!dashboardData) return [];
    
    return [
      { name: 'Rút tiền', value: dashboardData.totalWithdrawalsThisMonth },
      { name: 'Nạp tiền', value: dashboardData.totalDepositsThisMonth }
    ];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <div className="ml-4 text-gray-600 text-lg">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen rounded-lg">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">
        Dashboard Quản Trị
      </h1>

      {/* Thống kê tổng quan - Dạng thẻ */}
      {dashboardData && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
          {/* Tổng số người dùng */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <FaUsers className="text-blue-500 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Tổng người dùng</p>
                <p className="text-2xl font-bold text-gray-800">{systemStats?.totalUsers || dashboardData?.totalUsers || 0}</p>
              </div>
            </div>
          </div>

          {/* Người dùng hoạt động */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <FaUserCheck className="text-green-500 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-800">{systemStats?.totalActiveUsers || dashboardData?.activeUsers || 0}</p>
              </div>
            </div>
          </div>

          {/* Người dùng mới */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <FaUserPlus className="text-purple-500 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Người dùng mới</p>
                <p className="text-2xl font-bold text-gray-800">{dashboardData.newUsersThisMonth}</p>
              </div>
            </div>
          </div>

          {/* Số dư hệ thống */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 mr-4">
                <FaWallet className="text-yellow-500 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Tổng số dư</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(dashboardData.totalSystemBalance)}
                </p>
              </div>
            </div>
          </div>

          

          {/* Tiền rút tháng này */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 mr-4">
                <FaArrowDown className="text-red-500 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Rút tiền tháng này</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(dashboardData.totalWithdrawalsThisMonth)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Tiền nạp tháng này */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <FaArrowUp className="text-green-500 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Nạp tiền tháng này</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(dashboardData.totalDepositsThisMonth)}
                </p>
              </div>
            </div>
          </div>

          {/* Phòng cho thuê */}
          {systemStats && (
            <>
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-indigo-100 mr-4">
                    <FaHouseUser className="text-indigo-500 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Tổng phòng cho thuê</p>
                    <p className="text-2xl font-bold text-gray-800">{systemStats.totalRentedRooms || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 mr-4">
                    <FaHouseUser className="text-blue-500 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Phòng đang hoạt động</p>
                    <p className="text-2xl font-bold text-gray-800">{systemStats.totalActiveRentedRooms || 0}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Giao dịch hoàn thành */}
          {systemStats && (
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-teal-100 mr-4">
                  <FaExchangeAlt className="text-teal-500 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Giao dịch hoàn thành</p>
                  <p className="text-2xl font-bold text-gray-800">{systemStats.totalCompletedTransactions || 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Biểu đồ và thống kê */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Tổng giá trị giao dịch */}
        {systemStats && dashboardData && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Giao dịch tháng này</h2>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="150%">
                <BarChart data={getTransactionChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Yêu cầu rút tiền đang chờ */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <FaMoneyBillWave className="mr-2 text-yellow-500" />
            Yêu cầu rút tiền đang chờ
          </h2>
          {pendingWithdrawals.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Người dùng
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số tiền
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingWithdrawals
                      .slice(
                        withdrawalPage * withdrawalsPerPage,
                        (withdrawalPage + 1) * withdrawalsPerPage
                      )
                      .map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.userName}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(item.amount)}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Đang chờ
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Phân trang cho yêu cầu rút tiền */}
              <div className="flex items-center justify-between mt-4 px-4">
                <div className="text-sm text-gray-700">
                  Hiển thị trang {withdrawalPage + 1} / {Math.max(1, Math.ceil(pendingWithdrawals.length / withdrawalsPerPage))} (Tổng {pendingWithdrawals.length} yêu cầu)
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleWithdrawalPageChange(withdrawalPage - 1)}
                    disabled={withdrawalPage === 0}
                    className={`p-2 rounded-md ${withdrawalPage > 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                  >
                    <FaChevronLeft />
                  </button>
                  {Array.from({ length: Math.max(1, Math.min(5, Math.ceil(pendingWithdrawals.length / withdrawalsPerPage))) }).map((_, index) => {
                    let pageToShow;
                    const totalPages = Math.max(1, Math.ceil(pendingWithdrawals.length / withdrawalsPerPage));
                    
                    if (totalPages <= 5) {
                      pageToShow = index;
                    } else {
                      const middleIndex = Math.min(
                        Math.max(withdrawalPage, 2),
                        totalPages - 3
                      );
                      pageToShow = index + Math.max(0, middleIndex - 2);
                    }
                    
                    return (
                      <button
                        key={pageToShow}
                        onClick={() => handleWithdrawalPageChange(pageToShow)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md ${
                          withdrawalPage === pageToShow
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageToShow + 1}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handleWithdrawalPageChange(withdrawalPage + 1)}
                    disabled={withdrawalPage >= Math.max(0, Math.ceil(pendingWithdrawals.length / withdrawalsPerPage) - 1)}
                    className={`p-2 rounded-md ${withdrawalPage < Math.max(0, Math.ceil(pendingWithdrawals.length / withdrawalsPerPage) - 1) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
              Không có yêu cầu rút tiền nào đang chờ xử lý
            </div>
          )}
        </div>
      </div>

      {/* Danh sách giao dịch gần đây */}
      <div className="grid grid-cols-1 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Giao dịch hoàn thành gần đây</h2>
            
            {/* Tổng giá trị giao dịch đặt ở đây */}
            {systemStats && (
              <div className="flex items-center rounded-lg bg-yellow-50 px-4 py-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span className="font-medium text-gray-700 mr-2">Tổng giá trị giao dịch:</span>
                <span className="font-bold text-gray-800">
                  {formatCurrency(systemStats.totalTransactionVolume || 0)}
                </span>
              </div>
            )}
          </div>
          
          {transactionsByStatus.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người dùng</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại giao dịch</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactionsByStatus
                      .slice(
                        transactionPage * transactionsPerPage,
                        (transactionPage + 1) * transactionsPerPage
                      )
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.id}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.userName}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(item.amount)}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.type || "N/A"}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Hoàn thành
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              
              {/* Phân trang cho giao dịch */}
              {/* Luôn hiển thị phân trang, không phụ thuộc vào số lượng giao dịch */}
                <div className="flex items-center justify-between mt-4 px-4">
                  <div className="text-sm text-gray-700">
                    Hiển thị trang {transactionPage + 1} / {Math.max(1, Math.ceil(transactionsByStatus.length / transactionsPerPage))} (Tổng {transactionsByStatus.length} giao dịch)
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleTransactionPageChange(transactionPage - 1)}
                      disabled={transactionPage === 0}
                      className={`p-2 rounded-md ${transactionPage > 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                    >
                      <FaChevronLeft />
                    </button>
                    {Array.from({ length: Math.max(1, Math.min(5, Math.ceil(transactionsByStatus.length / transactionsPerPage))) }).map((_, index) => {
                      let pageToShow;
                      const totalPages = Math.max(1, Math.ceil(transactionsByStatus.length / transactionsPerPage));
                      
                      if (totalPages <= 5) {
                        pageToShow = index;
                      } else {
                        const middleIndex = Math.min(
                          Math.max(transactionPage, 2),
                          totalPages - 3
                        );
                        pageToShow = index + Math.max(0, middleIndex - 2);
                      }
                      
                      return (
                        <button
                          key={pageToShow}
                          onClick={() => handleTransactionPageChange(pageToShow)}
                          className={`w-8 h-8 flex items-center justify-center rounded-md ${
                            transactionPage === pageToShow
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageToShow + 1}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handleTransactionPageChange(transactionPage + 1)}
                      disabled={transactionPage >= Math.max(0, Math.ceil(transactionsByStatus.length / transactionsPerPage) - 1)}
                      className={`p-2 rounded-md ${transactionPage < Math.max(0, Math.ceil(transactionsByStatus.length / transactionsPerPage) - 1) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                </div>
            </>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
              Không có giao dịch hoàn thành nào
            </div>
          )}
        </div>
      </div>

      {/* Người dùng hoạt động */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Người dùng đang hoạt động</h2>
        {usersByStatus.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usersByStatus.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.fullName || "N/A"}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Hoạt động
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 px-4">
              <div className="text-sm text-gray-700">
                Hiển thị trang {userPagination.currentPage + 1} / {userPagination.totalPages} (Tổng {userPagination.totalElements} người dùng)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(userPagination.currentPage - 1)}
                  disabled={!userPagination.hasPrevious}
                  className={`p-2 rounded-md ${userPagination.hasPrevious ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                >
                  <FaChevronLeft />
                </button>
                {Array.from({ length: Math.min(5, userPagination.totalPages) }).map((_, index) => {
                  let pageToShow;
                  if (userPagination.totalPages <= 5) {
                    pageToShow = index;
                  } else {
                    const middleIndex = Math.min(
                      Math.max(userPagination.currentPage, 2),
                      userPagination.totalPages - 3
                    );
                    pageToShow = index + Math.max(0, middleIndex - 2);
                  }
                  
                  return (
                    <button
                      key={pageToShow}
                      onClick={() => handlePageChange(pageToShow)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md ${
                        userPagination.currentPage === pageToShow
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pageToShow + 1}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(userPagination.currentPage + 1)}
                  disabled={!userPagination.hasNext}
                  className={`p-2 rounded-md ${userPagination.hasNext ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
            Không có người dùng hoạt động
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
