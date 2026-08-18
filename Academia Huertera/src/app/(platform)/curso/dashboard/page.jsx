import Link from 'next/link';
import { MODULES_DATA, getAllLessons } from '@/lib/courseData';
import styles from './dashboard.module.css';

export default function DashboardPage({ completedLessons = ['capitulo-01-huerto-casero-vs-comercial'] }) {
  const allLessons = getAllLessons();
  const totalLessons = 16;
  const completedCount = completedLessons.length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  // Encontrar la siguiente lección pendiente
  const nextLesson = allLessons.find(l => !completedLessons.includes(l.slug)) || allLessons[0];

  return (
    <div>
      {/* BANNER DE BIENVENIDA */}
      <div className={styles.headerBanner}>
        <span className={styles.bannerBadge}>Matrícula Activa</span>
        <h1 className={styles.welcomeTitle}>¡Hola, Estudiante Huertero! 🌿</h1>
        <p className={styles.welcomeDesc}>
          Bienvenido al Curso de Horticultura Comercial Rentable de Javier Soler. Revisa tus progresos y continúa donde lo dejaste.
        </p>
      </div>

      {/* ESTADÍSTICAS DEL CURSO */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avance del Curso</span>
          <span className={styles.statValue}>{progressPercent}%</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Capítulos Completados</span>
          <span className={styles.statValue}>{completedCount} de {totalLessons}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Módulos Disponibles</span>
          <span className={styles.statValue}>4 / 4</span>
        </div>
      </div>

      {/* TARJETA CONTINUAR VIENDO */}
      <div className={styles.continueCard}>
        <div className={styles.continueInfo}>
          <span className={styles.continueLabel}>Siguiente Lección Sugerida</span>
          <h3 className={styles.continueTitle}>{nextLesson.title}</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            {nextLesson.moduleTitle} • {nextLesson.duration}
          </span>
        </div>
        <Link href={`/curso/leccion/${nextLesson.slug}`} className="btn-accent">
          Ir a la Lección ▶
        </Link>
      </div>

      {/* DETALLE POR MÓDULOS */}
      <h2 className={styles.modulesSectionTitle}>Contenido de los Módulos</h2>
      <div className={styles.modulesContainer}>
        {MODULES_DATA.map((module) => (
          <div key={module.id} className={styles.moduleBox}>
            <div className={styles.moduleBoxHeader}>
              <span className="badge badge-brand">Módulo {module.order}</span>
              <span>{module.title}</span>
            </div>
            <div className={styles.lessonsGrid}>
              {module.lessons.map((lesson) => {
                const isCompleted = completedLessons.includes(lesson.slug);
                return (
                  <Link 
                    key={lesson.id} 
                    href={`/curso/leccion/${lesson.slug}`}
                    className={styles.lessonTile}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{lesson.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{lesson.duration}</div>
                    </div>
                    <div>
                      {isCompleted ? (
                        <span className="badge badge-success">Completada ✓</span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-brand-accent)', fontWeight: 600 }}>Ver ›</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
