import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">

      <Sidebar />

      <div className="ml-64">
        <Topbar />

        <main className="pt-16 p-6">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default MainLayout;