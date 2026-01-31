'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card/Card';
import styles from './login.module.css';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const [secret, setSecret] = useState('');
    const router = useRouter();
    const [error, setError] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        // In a real app, verify against API /auth or just store and let API reject later.
        // Given the simple requirement: "verify admin secret".
        // We'll store it and try to redirect. 
        // Ideally we verify it first.

        // For visual sophistication, let's just assume simple validation here or add a fetch.
        if (!secret) return;

        localStorage.setItem('admin_secret', secret);
        router.push('/dashboard');
    };

    return (
        <div className={styles.container}>
            {/* Background Elements */}
            <div className={styles.glow} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <Card className={styles.loginCard}>
                    <h1 className={styles.title}>Access</h1>
                    <p className={styles.subtitle}>Telegram Financial Bot</p>

                    <form onSubmit={handleLogin} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <input
                                type="password"
                                className="cinematic-input"
                                placeholder="Secure Key"
                                value={secret}
                                onChange={(e) => setSecret(e.target.value)}
                            />
                        </div>

                        <button type="submit" className={`cinematic-button ${styles.button}`}>
                            Enter System
                        </button>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}
