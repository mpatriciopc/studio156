import Link from 'next/link';
import { MODULES_DATA } from '@/lib/courseData';
import ProgressBar from '../ProgressBar/ProgressBar';
import styles from './LessonSidebar.module.css';

export default function LessonSidebar({ currentSlug, completedLessons = [] }) {
  const totalLessons = 16;
  const completedCount = completedLessons.length;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div>
            <span className={styles.courseBadge}>Curso Profesional</span>
            <h2 className={styles.courseTitle}>Horticultura Comercial</h2>
          </div>
        </div>
        <ProgressBar completedCount={completedCount} totalCount={totalLessons} dark={true} />
      </div>

      <div className={styles.moduleList}>
        {MODULES_DATA.map((module) => (
          <div key={module.id} className={styles.moduleItem}>
            <div className={styles.moduleHeader}>
              <span>{module.title}</span>
            </div>
            <div className={styles.lessonList}>
              {module.lessons.map((lesson) => {
                const isActive = lesson.slug === currentSlug;
                const isCompleted = completedLessons.includes(lesson.slug);

                return (
                  <Link
                    key={lesson.id}
                    href={`/curso/leccion/${lesson.slug}`}
                    className={`${styles.lessonLink} ${isActive ? styles.activeLesson : ''}`}
                  >
                    <div className={`${styles.checkIcon} ${isCompleted ? styles.completedCheck : ''}`}>
                      {isCompleted ? '✓' : ''}
                    </div>
                    <div>
                      <div className={styles.lessonTitleText}>{lesson.title}</div>
                      <div className={styles.lessonDuration}>{lesson.duration}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
