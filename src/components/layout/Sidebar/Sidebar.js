'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './Sidebar.module.css';
import {
    LayoutDashboard,
    Users,
    userCheck,
    UserX,
    Clock,
    LogOut,
    Menu,
    ShieldAlert
} from 'lucide-react';
import { useState } from 'react';

// Enhanced Navigation
const navItems = [
    { name: 'Visão Geral', path: '/dashboard', icon: LayoutDashboard, param: null },
    { name: 'Solicitações', path: '/dashboard', icon: Clock, param: 'pending' },
    { name: 'Ativos', path: '/dashboard', icon: Users, param: 'active' },
    { name: 'Bloqueados', path: '/dashboard', icon: UserX, param: 'blocked' },
];

export default function Sidebar() {
    const searchParams = useSearchParams();
    const currentView = searchParams.get('view');
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                className={`${styles.mobileToggle} only-mobile`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Menu"
            >
                <Menu />
            </button>

            {isOpen && (
                <div
                    className={`${styles.overlay} only-mobile`}
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.header}>
                    <div className={styles.brandGroup}>
                        <div className={styles.brandIcon}>
                            <ShieldAlert size={20} color="white" />
                        </div>
                        <div className={styles.logo}>
                            Fábrica<span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>Admin</span>
                        </div>
                    </div>
                </div>

                <div className={styles.sectionLabel}>GERENCIAMENTO</div>

                <nav className={styles.nav}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        // Active logic: if param is null (Visão Geral), check if view is missing. Else match param.
                        const isActive = item.param
                            ? currentView === item.param
                            : !currentView;

                        const href = item.param
                            ? `${item.path}?view=${item.param}`
                            : item.path;

                        return (
                            <Link
                                key={item.name}
                                href={href}
                                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                                onClick={() => setIsOpen(false)}
                            >
                                <Icon size={18} strokeWidth={2} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className={styles.footer}>
                    <div className={styles.userProfile}>
                        <div className={styles.userAvatar}>A</div>
                        <div className={styles.userInfo}>
                            <div className={styles.userName}>Admin User</div>
                            <div className={styles.userRole}>Super Admin</div>
                        </div>
                    </div>
                    <button className={styles.logoutBtn} onClick={() => {
                        localStorage.removeItem('admin_token');
                        window.location.href = '/login';
                    }}>
                        <LogOut size={16} />
                    </button>
                </div>
            </aside>
        </>
    );
}
