'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header/Header';
import LessonSidebar from '@/components/LessonSidebar/LessonSidebar';
import styles from './layout.module.css';

export default function PlatformLayout({ children }) {
  const pathname = usePathname();
  const currentSlug = pathname.startsWith('/curso/leccion/') 
    ? pathname.replace('/curso/leccion/', '') 
    : null;

  // Manejo de estado de lecciones completadas (persistente localmente en la app)
  const [completedLessons, setCompletedLessons] = useState([
    'capitulo-01-huerto-casero-vs-comercial'
  ]);

  const toggleLessonCompleted = (slug) => {
    setCompletedLessons((prev) => 
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  return (
    <div className={styles.wrapper}>
      <Header isPlatform={true} user={{ email: 'estudiante@academiahuertera.cl' }} />
      <div className={styles.bodyLayout}>
        <LessonSidebar currentSlug={currentSlug} completedLessons={completedLessons} />
        <main className={styles.mainContent}>
          {React.isValidElement(children)
            ? React.cloneElement(children, { completedLessons, toggleLessonCompleted })
            : children}
        </main>
      </div>
    </div>
  );
}
