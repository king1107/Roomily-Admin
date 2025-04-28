import { Link } from 'react-router-dom';
import logo from "../images/logo.png";
import dashboard from "../images/dashboard2.png";
import house from "../images/house.png";
import user from "../images/user1.png";
import reportedUser from "../images/reported_users.png";
import withdraw from "../images/cash_withdraw.png";
import reportNoti from "../images/report_art.png"

const Sidebar = () => {
  return (
    <div className="w-60 h-screen bg-white shadow-md p-4 rounded-2xl ">
      <div className="flex flex-col items-center -mt-5">
        <img src={logo} alt="Roomily" className="w-36 h-36 object-cover" />
        <h2 className="text-xl font-bold items-center justify-center -mt-6">Roomily Admin</h2>
      </div>
      <nav className="mt-14">
        <ul>
        <Link to="/admin/dashboard">
            <div className="relative flex items-center p-2 rounded-md overflow-hidden cursor-pointer group mb-5">
              {/* Background Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#FBFBFB] to-[#99E5FF] w-0 group-hover:w-full transition-all duration-300 ease-in rounded-r-md"></div>
              {/* Content */}
              <img src={dashboard} alt="Dashboard" className="w-8 h-8 ml-2 object-cover z-10" />
              <li className="ml-2 z-10 text-black group-hover:text-black transition-colors duration-300">
                Dashboard
              </li>
            </div>
          </Link>
          <Link to="/admin/manage-room">
            <div className="relative flex items-center p-2 rounded-md overflow-hidden cursor-pointer group mb-5">
              {/* Background Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#FBFBFB] to-[#99E5FF] w-0 group-hover:w-full transition-all duration-300 ease-in rounded-r-md"></div>
              {/* Content */}
              <img src={house} alt="Quản lý phòng" className="w-8 h-8 ml-2 object-cover z-10" />
              <li className="ml-2 z-10 text-black group-hover:text-black transition-colors duration-300">
                Quản lý phòng
              </li>
            </div>
          </Link>
          <Link to="/admin/reportUser-notification">
            <div className="relative flex items-center p-2 rounded-md overflow-hidden cursor-pointer group mb-5">
              {/* Background Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#FBFBFB] to-[#99E5FF] w-0 group-hover:w-full transition-all duration-300 ease-in rounded-r-md"></div>
              {/* Content */}
              <img src={reportNoti} alt="Báo cáo người dùng" className="w-8 h-8 ml-2 object-cover z-10" />
              <li className="ml-2 z-10 text-black group-hover:text-black transition-colors duration-300">
                Báo cáo người dùng
              </li>
            </div>
          </Link>
          <Link to="/admin/manage-user">
            <div className="relative flex items-center p-2 rounded-md overflow-hidden cursor-pointer group mb-5">
              {/* Background Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#FBFBFB] to-[#99E5FF] w-0 group-hover:w-full transition-all duration-300 ease-in rounded-r-md"></div>
              {/* Content */}
              <img src={user} alt="Người dùng" className="w-8 h-8 ml-2 object-cover z-10" />
              <li className="ml-2 z-10 text-black group-hover:text-black transition-colors duration-300">
                Người dùng
              </li>
            </div>
          </Link>
          <Link to="/admin/manage-reportedUser">
            <div className="relative flex items-center p-2 rounded-md overflow-hidden cursor-pointer group mb-5">
              {/* Background Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#FBFBFB] to-[#99E5FF] w-0 group-hover:w-full transition-all duration-300 ease-in rounded-r-md"></div>
              {/* Content */}
              <img src={reportedUser} alt="Quản lý người dùng bị ban" className="w-8 h-8 ml-2 object-cover z-10" />
              <li className="ml-2 z-10 text-black group-hover:text-black transition-colors duration-300">
                Quản lý người dùng bị ban
              </li>
            </div>
          </Link>
          <Link to="/admin/manage-withdraw">
            <div className="relative flex items-center p-2 rounded-md overflow-hidden cursor-pointer group mb-5">
              {/* Background Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#FBFBFB] to-[#99E5FF] w-0 group-hover:w-full transition-all duration-300 ease-in rounded-r-md"></div>
              {/* Content */}
              <img src={withdraw} alt="Quản lý yêu cầu rút tiền" className="w-8 h-8 ml-2 object-cover z-10" />
              <li className="ml-2 z-10 text-black group-hover:text-black transition-colors duration-300">
                Quản lý yêu cầu rút tiền
              </li>
            </div>
          </Link>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;