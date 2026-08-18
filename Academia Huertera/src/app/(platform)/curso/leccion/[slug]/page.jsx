'use client';

import Link from 'next/link';
import { getLessonBySlug, getAllLessons } from '@/lib/courseData';
import VideoPlayer from '@/components/VideoPlayer/VideoPlayer';
import ResourceList from '@/components/ResourceList/ResourceList';
import styles from './leccion.module.css';

export default function LessonPage({ params, completedLessons = [], toggleLessonCompleted }) {
  const { slug } = params;
  const lesson = getLessonBySlug(slug);
  const allLessons = getAllLessons();

  const currentIndex = allLessons.findIndex(l => l.slug === lesson.slug);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const isCompleted = completedLessons.includes(lesson.slug);

  const handleToggle = () => {
    if (toggleLessonCompleted) {
      toggleLessonCompleted(lesson.slug);
    }
  };

  return (
    <div className={styles.container}>
      {/* BARRA SUPERIOR DE NAVEGACIÓN */}
      <div className={styles.navigationBar}>
        <Link href="/curso/dashboard" className={styles.backLink}>
          ← Volver al Dashboard
        </Link>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
          Capítulo {currentIndex + 1} de {allLessons.length}
        </span>
      </div>

      {/* TITULO Y MÓDULO */}
      <div className={styles.headerInfo}>
        <span className={styles.moduleTag}>{lesson.moduleTitle}</span>
        <h1 className={styles.title}>{lesson.title}</h1>
      </div>

      {/* REPRODUCTOR DE VIDEO */}
      <VideoPlayer 
        lesson={lesson} 
        isCompleted={isCompleted} 
        onToggleComplete={handleToggle} 
      />

      {/* DESCRIPCIÓN Y OBJETIVOS */}
      <div className={styles.descriptionBox}>
        <h4>Descripción del Capítulo</h4>
        <p>{lesson.description}</p>
      </div>

      {/* ARCHIVOS Y RECURSOS DESCARGABLES */}
      <ResourceList resources={lesson.resources} />

      {/* NAVEGACIÓN ANTERIOR / SIGUIENTE */}
      <div className={styles.navButtons}>
        {prevLesson ? (
          <Link href={`/curso/leccion/${prevLesson.slug}`} className="btn-secondary">
            ← Anterior: {prevLesson.title.split(':')[0]}
          </Link>
        ) : <div />}

        {nextLesson ? (
          <Link href={`/curso/leccion/${nextLesson.slug}`} className="btn-primary">
            Siguiente: {nextLesson.title.split(':')[0]} →
          </Link>
        ) : (
          <Link href="/curso/dashboard" className="btn-accent">
            ¡Felicitaciones! Volver al Dashboard 🎉
          </Link>
        )}
      </div>
    </div>
  );
}
