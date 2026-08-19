import Link from 'next/link';
import styles from './Header.module.css';

export default function Header({ user = null, isPlatform = false }) {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href={isPlatform ? "/curso/dashboard" : "/"} className={styles.logoArea}>
          <div className={styles.brandBadge}>AH</div>
          <div className={styles.brandText}>
            Academia <span>Huertera</span>
          </div>
        </Link>

        <nav className={styles.nav}>
          {!isPlatform ? (
            <>
              <Link href="#temario" className={styles.navLink}>Temario (16 Capítulos)</Link>
              <Link href="#instructor" className={styles.navLink}>El Instructor</Link>
              <Link href="#precios" className={styles.navLink}>Inscripción</Link>
              <Link href="/login" className="btn-secondary">Iniciar Sesión</Link>
              <Link href="/register" className="btn-primary">Inscribirse Ahora</Link>
            </>
          ) : (
            <div className={styles.userArea}>
              <Link href="/curso/dashboard" className={styles.navLink}>Mi Panel</Link>
              <div className={styles.userAvatar}>
                {user?.email ? user.email.charAt(0).toUpperCase() : 'AH'}
              </div>
              <Link href="/login" className="btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
                Salir
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
