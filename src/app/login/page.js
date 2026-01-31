'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) return;

        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:3000/api/admin/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('admin_token', data.token); // Store token
                router.push('/dashboard');
            } else {
                alert(data.error || 'Falha no login');
            }
        } catch (err) {
            alert('Erro de conexão');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* 
        Layout Swap: Image Section FIRST (Left), Form Section SECOND (Right).
      */}

            {/* LEFT SIDE: Image / Branding Visual */}
            <div className={styles.imageSection}>
                <div className={styles.imageOverlay} />
                <div className={styles.testimonial}>
                    <p className={styles.quote}>"A precisão que transforma análise em resultado."</p>
                    <div className={styles.author}>— Fábrica de Super Odds</div>
                </div>
            </div>

            {/* RIGHT SIDE: Form */}
            <div className={styles.formSection}>
                <motion.div
                    className={styles.contentWrapper}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className={styles.header}>
                        <div className={styles.brand}>
                            Fábrica de <span className={styles.brandAccent}>Super Odds</span>
                        </div>
                        <h2 className={styles.portalTitle}>Bem-vindo de volta</h2>
                        <p className={styles.instruction}>Acesse sua conta para gerenciar alunos.</p>
                    </div>

                    <form onSubmit={handleLogin} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email Corporativo</label>
                            <input
                                type="email"
                                className={styles.premiumInput}
                                placeholder="nome@empresa.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Senha</label>
                            <input
                                type="password"
                                className={styles.premiumInput}
                                placeholder="******"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <button type="submit" className={styles.premiumBtn} disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className={styles.spinner} size={18} />
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    Entrar
                                    <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        &copy; {new Date().getFullYear()} Fábrica de Super Odds
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
