import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';  // <-- CHANGED TO ../
import Topbar from '../components/Topbar';    // <-- Correct

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />
      <main className="ml-64 mt-16 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;