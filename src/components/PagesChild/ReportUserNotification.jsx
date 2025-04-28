import { useState, useEffect } from "react";
import axios from "axios";

const ReportUserNotification = () => {
    const [loading, setLoading] = useState(false);
    const [userReports, setUserReports] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserReports();
    }, []);

    const fetchUserReports = async () => {
        setLoading(true);
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
            
            const response = await axios.get("https://api.roomily.tech/api/v1/user-reports/pending", config);
            setUserReports(response.data);
            setError(null);
        } catch (err) {
            console.error("Lỗi khi tải danh sách báo cáo người dùng:", err);
            if (err.response && err.response.status === 401) {
                setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
            } else {
                setError("Không thể tải danh sách báo cáo người dùng. Vui lòng thử lại sau.");
            }
        } finally {
            setLoading(false);
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

    const getReportTypeLabel = (type) => {
        const types = {
            'SPAM': 'Spam',
            'INAPPROPRIATE_CONTENT': 'Nội dung không phù hợp',
            'FAKE_ACCOUNT': 'Tài khoản giả mạo',
            'OTHER': 'Khác'
        };
        return types[type] || type;
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen mx-4 rounded-lg mt-10">
            <h1 className="text-2xl font-bold mb-4">Quản lý báo cáo người dùng</h1>
            
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h2 className="text-xl font-semibold mb-4">Danh sách báo cáo người dùng</h2>
                
                {loading ? (
                    <p className="text-center py-4">Đang tải dữ liệu...</p>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <p>{error}</p>
                        <button 
                            onClick={fetchUserReports} 
                            className="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : userReports.length === 0 ? (
                    <p className="text-center py-4">Không có báo cáo người dùng nào</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-2 px-3 border-b text-center">ID người dùng bị báo cáo</th>
                                    <th className="py-2 px-3 border-b text-center">Loại báo cáo</th>
                                    <th className="py-2 px-3 border-b text-center">Nội dung</th>
                                    <th className="py-2 px-3 border-b text-center">Thời gian báo cáo</th>
                                    <th className="py-2 px-3 border-b text-center">Người báo cáo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userReports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50">
                                        <td className="py-2 px-3 border-b text-center">{report.reportedUserId}</td>
                                        <td className="py-2 px-3 border-b text-center">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                {getReportTypeLabel(report.type)}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 border-b text-center">{report.content}</td>
                                        <td className="py-2 px-3 border-b text-center">{formatDate(report.createdAt)}</td>
                                        <td className="py-2 px-3 border-b text-center">{report.reporterId}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportUserNotification;