'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import styles from './register.module.css';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });
      router.push('/curso/dashboard');
    } catch (err) {
      router.push('/curso/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            Academia Huertera
          </Link>
          <h1 className={styles.title}>Crear Cuenta</h1>
          <p className={styles.subtitle}>Regístrate para comenzar el curso de Horticultura Comercial</p>
        </div>

        <form onSubmit={handleRegister} className={styles.form}>
          <div className={styles.group}>
            <label className={styles.label}>Nombre Completo</label>
            <input 
              type="text" 
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Juan Pérez" 
              className={styles.input} 
            />
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Correo Electrónico</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com" 
              className={styles.input} 
            />
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className={styles.input} 
            />
          </div>

          <button type="submit" disabled={loading} className="btn-accent" style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Registrando...' : 'Crear Cuenta e Inscribirme'}
          </button>
        </form>

        <div className={styles.footerText}>
          ¿Ya posees una cuenta? <Link href="/login" className={styles.link}>Iniciar Sesión</Link>
        </div>
      </div>
    </div>
  );
}
