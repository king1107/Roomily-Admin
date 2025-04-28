import { Outlet } from 'react-router-dom';
import Sidebar from './SideBar';
import Header from './Header';

const Layout = () => {
  return (
    <div className="flex bg-[#99E5FF] pb-4 pr-3 pl-6 pt-5">
      <Sidebar />
      <div className="flex-1 ml-4">
        <div className="px-4">
          <Header />
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;