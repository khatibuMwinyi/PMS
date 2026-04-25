import React from 'react';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="grid grid-cols-12 gap-4 p-4">
      {/* Sidebar placeholder */}
      <aside className="col-span-3 bg-gray-100 p-2">Sidebar</aside>
      {/* Main content */}
      <main className="col-span-9" data-testid="dashboard-main">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
