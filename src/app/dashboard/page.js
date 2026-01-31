'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; // Read URL
import Skeleton from '@/components/Skeleton/Skeleton';
import styles from './dashboard.module.css';
import { motion } from 'framer-motion';
import { Plus, Trash2, ShieldOff, User, Calendar, FolderOpen, Clock, AlertTriangle, FileText } from 'lucide-react';
import BarChart from '@/components/Chart/BarChart';

function DashboardContent() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false); // Input Form Modal
    const [confirmModal, setConfirmModal] = useState({ open: false, type: '', data: null }); // Confirmation Action Modal
    const [feedbackModal, setFeedbackModal] = useState({ open: false, type: 'success', message: '' }); // Success/Error Feedback

    const [newUser, setNewUser] = useState({ id: '', start: '', end: '' });
    // Init with Zeros to satisfy "Make it appear even if zeroed"
    const [analytics, setAnalytics] = useState({
        users: { total: 0, active: 0, blocked: 0, pending: 0 },
        financials: { totalVolume: 0 }
    });

    // URL-based filtering for Sidebar sync
    const searchParams = useSearchParams();
    const currentView = searchParams.get('view') || 'all'; // Default to show everything if dashboard clicked

    useEffect(() => {
        fetchData();
    }, []); // Initial load

    const getHeaders = () => {
        if (typeof window === 'undefined') return {};
        const token = localStorage.getItem('admin_token');
        return {
            'Content-Type': 'application/json',
            'x-admin-token': token
        };
    };

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchUsers(), fetchAnalytics()]);
        setLoading(false);
    };

    const API_URL = 'https://geral-fabricadesuperodssapi.r954jc.easypanel.host';

    const fetchAnalytics = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/users/analytics`, { headers: getHeaders() });
            if (res.ok) setAnalytics(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/users`, {
                headers: getHeaders()
            });
            if (res.ok) {
                setUsers(await res.json());
            } else {
                // If 401, redirect
                if (res.status === 401) window.location.href = '/login';
            }
        } catch (error) {
            console.error(error);
        }
    };


    // 1. Trigger Confirmation for Create
    const handlePreAllow = (e) => {
        e.preventDefault();
        setShowModal(false); // Close form
        setConfirmModal({
            open: true,
            type: 'allow',
            data: newUser,
            title: 'Confirmar Autorização',
            desc: `O usuário ${newUser.id} será autorizado e receberá uma notificação automática via Telegram. Deseja continuar?`,
            loading: false
        });
    };

    // 2. Trigger Confirmation for Actions
    const handlePreAction = (type, id) => {
        const isRevoke = type === 'revoke';
        setConfirmModal({
            open: true,
            type: type,
            data: id,
            title: isRevoke ? 'Desativar Acesso' : 'Excluir Usuário',
            desc: isRevoke
                ? 'Tem certeza que deseja desativar o acesso deste usuário? Ele não receberá mais notificações.'
                : 'Tem certeza que deseja excluir este usuário permanentemente? Esta ação não pode ser desfeita.',
            loading: false
        });
    };

    // 3. Execute Action
    const confirmAction = async () => {
        const { type, data } = confirmModal;
        setConfirmModal({ ...confirmModal, loading: true });

        try {
            if (type === 'allow') {
                const now = new Date();
                const next30 = new Date();
                next30.setDate(now.getDate() + 30);

                const res = await fetch('http://localhost:3000/api/admin/users/allow', {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify({
                        id_telegramOrUsername: data.id,
                        startDate: now.toISOString().split('T')[0],
                        endDate: next30.toISOString().split('T')[0]
                    })
                });
                if (!res.ok) throw new Error('Falha ao autorizar');
                setFeedbackModal({ open: true, type: 'success', message: `Usuário ${data.id} autorizado e notificado!` });
                setNewUser({ id: '' });
            }
            else if (type === 'revoke') {
                await fetch('http://localhost:3000/api/admin/users/revoke', {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify({ id_telegramOrUsername: data })
                });
                setFeedbackModal({ open: true, type: 'success', message: 'Acesso desativado com sucesso.' });
            }
            else if (type === 'remove') {
                await fetch('http://localhost:3000/api/admin/users/remove', {
                    method: 'DELETE',
                    headers: getHeaders(),
                    body: JSON.stringify({ id_telegram: data })
                });
                setFeedbackModal({ open: true, type: 'success', message: 'Usuário excluído com sucesso.' });
            }

            // Refresh Data
            await fetchData();

        } catch (error) {
            setFeedbackModal({ open: true, type: 'error', message: error.message || 'Ocorreu um erro' });
        } finally {
            setConfirmModal({ open: false, type: '', data: null, title: '', desc: '', loading: false });
        }
    };

    // Filter Logic based on URL 'currentView'
    const filteredUsers = users.filter(u => {
        if (currentView === 'active') return u.allowed;
        if (currentView === 'blocked') return !u.allowed;
        if (currentView === 'pending') return !u.allowed && u.last_interaction;
        return true; // 'all' or default
    });

    // Dynamic Title
    const getTitle = () => {
        if (currentView === 'pending') return 'Solicitações Pendentes';
        if (currentView === 'active') return 'Alunos Ativos';
        if (currentView === 'blocked') return 'Usuários Bloqueados';
        return 'Visão Geral';
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.container}
        >
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>{getTitle()}</h1>
                    <p className={styles.subtitle}>
                        {currentView === 'all'
                            ? 'Monitoramento de todos os alunos e permissões.'
                            : `Listando ${filteredUsers.length} registros nesta categoria.`}
                    </p>
                </div>
                <button className="senior-btn" onClick={() => setShowModal(true)}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Autorizar Aluno
                </button>
            </header>

            {/* Analytics Cards - Only show on 'Overview' (all) to clean up specific views? 
          User asked for analytics, maybe keep them always or just summary? 
          Let's keep them on 'all' mostly, or simple summary. 
      */}
            {currentView === 'all' && (
                <section className={styles.overviewSection}>
                    {/* Stats Cards (Simplified) */}
                    <div className={styles.statsGrid}>
                        {loading ? (
                            <>
                                <Skeleton height="100px" className={styles.statCard} />
                                <Skeleton height="100px" className={styles.statCard} />
                                <Skeleton height="100px" className={styles.statCard} />
                            </>
                        ) : (
                            <>
                                <div className={styles.statCard}>
                                    <div className={styles.statLabel}>Total Alunos</div>
                                    <div className={styles.statValue}>{analytics.users.total}</div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statLabel}>Ativos</div>
                                    <div className={styles.statValue} style={{ color: 'var(--success)' }}>{analytics.users.active}</div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statLabel}>Solicitações</div>
                                    <div className={styles.statValue} style={{ color: 'orange' }}>{analytics.users.pending}</div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Charts Row (Simplified - No Financials) */}
                    {!loading && (
                        <div className={styles.chartsGrid}>
                            <BarChart
                                title="Atividade de Acesso"
                                subTitle="Distribuição de alunos"
                                data={[
                                    { label: 'Ativos', value: analytics.users.active },
                                    { label: 'Bloqueados', value: analytics.users.blocked },
                                    { label: 'Solicitações', value: analytics.users.pending },
                                    { label: 'Total', value: analytics.users.total }
                                ]}
                            />
                            {/* Clean visual spacer or another relevant chart could go here. For now, 1 chart is fine. */}
                        </div>
                    )}
                </section>
            )}

            {/* User Data Grid / Cards */}
            <div className={styles.listContainer}>
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className={styles.skeletonRow}>
                            <Skeleton variant="circle" width="40px" height="40px" />
                            <div style={{ flex: 1, marginLeft: '16px' }}>
                                <Skeleton variant="text" width="40%" height="20px" />
                                <Skeleton variant="text" width="20%" height="16px" style={{ marginTop: '8px' }} />
                            </div>
                        </div>
                    ))
                ) : filteredUsers.length === 0 ? (
                    // Empty State
                    <div className={styles.emptyState}>
                        <FolderOpen size={48} color="var(--border-strong)" />
                        <p>Nenhum usuário encontrado nesta categoria.</p>
                    </div>
                ) : (
                    <>
                        <div className={`${styles.tableHeader} hide-mobile`}>
                            <span>Aluno</span>
                            <span>Status</span>
                            <span>Ultima Atividade</span>
                            <span style={{ textAlign: 'right' }}>Ações</span>
                        </div>

                        <div className={styles.grid}>
                            {filteredUsers.map((user) => {
                                // Calculate Time Active
                                const startDate = user.start_date ? new Date(user.start_date) : null;
                                const daysActive = startDate
                                    ? Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24))
                                    : 0;
                                const isOver30 = daysActive >= 30;

                                return (
                                    <div key={user.id_telegram} className={styles.userCard}>
                                        <div className={styles.userInfo}>
                                            <div className={styles.avatar}>
                                                <User size={20} color="#555" />
                                            </div>
                                            <div>
                                                <div className={styles.userName}>{user.username ? `@${user.username}` : 'Sem Alias'}</div>
                                                <div className={styles.userId}>{user.id_telegram}</div>
                                            </div>
                                        </div>

                                        <div className={styles.metaInfo}>
                                            <span className={user.allowed ? styles.statusActive : styles.statusInactive}>
                                                {user.allowed ? 'Ativo' : 'Bloqueado'}
                                            </span>

                                            {/* 30 Day Warning / Usage Time */}
                                            {user.allowed && (
                                                <div className={styles.usageContainer} title={isOver30 ? "Usuário ativo há mais de 30 dias" : "Tempo de uso"}>
                                                    {isOver30 && <AlertTriangle size={16} color="var(--accent)" style={{ marginRight: 4 }} />}
                                                    <Clock size={14} className={styles.iconMuted} />
                                                    <span className={isOver30 ? styles.textWarning : styles.textMuted}>
                                                        {daysActive} dias
                                                    </span>
                                                </div>
                                            )}

                                            <div className={styles.dateInfo} title="Última atividade">
                                                <Calendar size={14} style={{ marginRight: '4px' }} />
                                                {user.last_interaction ? new Date(user.last_interaction).toLocaleDateString() : '-'}
                                            </div>
                                        </div>

                                        <div className={styles.actions}>
                                            <button className={styles.iconBtn} onClick={() => setFeedbackModal({ open: true, type: 'info', message: 'Funcionalidade de histórico em breve!' })} title="Ver Histórico">
                                                <FileText size={18} />
                                            </button>
                                            {user.allowed && (
                                                <button className={styles.iconBtn} onClick={() => handlePreAction('revoke', user.id_telegram)} title="Revogar/Bloquear">
                                                    <ShieldOff size={18} />
                                                </button>
                                            )}
                                            <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => handlePreAction('remove', user.id_telegram)} title="Remover">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {showModal && (
                <div className={styles.modalOverlay}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={styles.modal}
                    >
                        <h2>Autorizar Acesso</h2>
                        <form onSubmit={handlePreAllow}>
                            <div className={styles.formGroup}>
                                <label>ID Telegram ou @Username</label>
                                <input
                                    className="senior-input"
                                    placeholder="@exemplo"
                                    value={newUser.id}
                                    onChange={e => setNewUser({ ...newUser, id: e.target.value })}
                                    required
                                />
                            </div>
                            <p className={styles.modalHint}>
                                O usuário terá acesso liberado imediatamente por <strong>30 dias</strong> padrão.
                            </p>
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowModal(false)} className={styles.btnSecondary}>Cancelar</button>
                                <button type="submit" className={styles.btnPrimary}>Continuar</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.open && (
                <div className={styles.modalOverlay} style={{ zIndex: 110 }}>
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className={styles.modal}>
                        <h2>{confirmModal.title}</h2>
                        <p className={styles.modalBody}>{confirmModal.desc}</p>
                        <div className={styles.modalActions}>
                            <button onClick={() => setConfirmModal({ ...confirmModal, open: false })} className={styles.btnSecondary}>Cancelar</button>
                            <button
                                onClick={confirmAction}
                                className={`${styles.btn} ${confirmModal.type === 'remove' ? styles.btnDanger : styles.btnPrimary}`}
                                disabled={confirmModal.loading}
                            >
                                {confirmModal.loading ? 'Processando...' : 'Confirmar'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Feedback Modal */}
            {feedbackModal.open && (
                <div className={styles.modalOverlay} style={{ zIndex: 120 }}>
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className={styles.modal} style={{ textAlign: 'center' }}>
                        <div style={{ margin: '0 auto 16px', color: feedbackModal.type === 'error' ? 'var(--error)' : 'var(--success)' }}>
                            {feedbackModal.type === 'error' ? <AlertTriangle size={48} /> : <div style={{ fontSize: '3rem' }}>🎉</div>}
                        </div>
                        <h2>{feedbackModal.type === 'error' ? 'Erro' : 'Sucesso!'}</h2>
                        <p className={styles.modalBody}>{feedbackModal.message}</p>
                        <div className={styles.modalActions} style={{ justifyContent: 'center' }}>
                            <button onClick={() => setFeedbackModal({ ...feedbackModal, open: false })} className={styles.btnPrimary}>OK</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className={styles.container}>
                <div className={styles.header}>
                    <Skeleton width="200px" height="40px" />
                </div>
                <div className={styles.statsGrid}>
                    <Skeleton height="100px" className={styles.statCard} />
                    <Skeleton height="100px" className={styles.statCard} />
                    <Skeleton height="100px" className={styles.statCard} />
                </div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
