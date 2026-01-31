import Sidebar from '@/components/layout/Sidebar/Sidebar';

export default function DashboardLayout({ children }) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            <Sidebar />
            <main className="dashboard-main">
                <div className="dashboard-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
