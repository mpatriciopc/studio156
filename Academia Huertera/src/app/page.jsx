'use client';

import Link from 'next/link';
import Header from '@/components/Header/Header';
import { COURSE_INFO, MODULES_DATA } from '@/lib/courseData';
import styles from './page.module.css';

export default function LandingPage() {
  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: 'estudiante@ejemplo.com',
          userId: 'demo-user-id',
          courseId: COURSE_INFO.id,
        })
      });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert('Modo Demo Mercado Pago: Redirigiendo a la plataforma del curso...');
        window.location.href = '/curso/dashboard';
      }
    } catch (err) {
      window.location.href = '/curso/dashboard';
    }
  };

  return (
    <>
      <Header />
      <main>
        {/* HERO SECTION */}
        <section className={styles.hero}>
          <div className={`container ${styles.heroGrid}`}>
            <div>
              <div className={styles.heroTag}>
                🌱 Curso Especializado • Javier Soler
              </div>
              <h1 className={styles.heroTitle}>
                Aprende a construir un <span style={{ color: 'var(--color-brand-accent)' }}>Huerto Comercial Rentable</span> en 1.000 m²
              </h1>
              <p className={styles.heroSubtitle}>
                Domina la planificación productiva, la estructura de costos hortícolas y las estrategias de comercialización directa para crear una empresa agrícola sustentable y altamente lucrativa.
              </p>
              <div className={styles.heroActions}>
                <button onClick={handleCheckout} className="btn-accent">
                  Comprar Curso Vitalicio ($59.000 CLP)
                </button>
                <Link href="#temario" className="btn-secondary">
                  Explorar 16 Capítulos
                </Link>
              </div>
            </div>

            {/* PRICING CARD */}
            <div className={styles.heroCard} id="precios">
              <div className={styles.heroCardBadge}>Acceso Inmediato</div>
              <div className={styles.cardTitle}>Inscripción Completa al Curso</div>
              <div className={styles.cardPrice}>$59.000 <span style={{ fontSize: '1rem', fontWeight: 500 }}>CLP</span></div>
              <div className={styles.cardPriceSub}>Pago único • Acceso de por vida</div>

              <ul className={styles.featuresList}>
                <li>16 Capítulos HD paso a paso</li>
                <li>4 Módulos de gestión y producción</li>
                <li>Plantillas Excel de Flujo de Caja y P&L</li>
                <li>Master Sheet de Calendario de Siembra</li>
                <li>Plan de Acción a 90 Días</li>
                <li>Garantía de actualización continua</li>
              </ul>

              <button onClick={handleCheckout} className="btn-accent" style={{ width: '100%' }}>
                Pagar con Mercado Pago 💳
              </button>
            </div>
          </div>
        </section>

        {/* TEMARIO / MODULES SECTION */}
        <section className={styles.section} id="temario">
          <div className="container">
            <div className={styles.sectionTitleGroup}>
              <span className={styles.sectionTag}>Programa Educativo</span>
              <h2 className={styles.sectionTitle}>Estructura Completa del Curso (16 Capítulos)</h2>
              <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                Organizado en 4 módulos lógicos de aprendizaje teórico-práctico con herramientas descargables.
              </p>
            </div>

            <div className={styles.modulesGrid}>
              {MODULES_DATA.map((module) => (
                <div key={module.id} className={styles.moduleCard}>
                  <div className={styles.moduleHeader}>
                    <div className={styles.moduleNumber}>{module.order}</div>
                    <h3 className={styles.moduleTitle}>{module.title}</h3>
                  </div>
                  <p className={styles.moduleDesc}>{module.description}</p>

                  <div className={styles.chapterList}>
                    {module.lessons.map((lesson) => (
                      <div key={lesson.id} className={styles.chapterItem}>
                        <span>{lesson.title}</span>
                        <span className={styles.chapterTime}>{lesson.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INSTRUCTOR SECTION */}
        <section className={`${styles.section} ${styles.sectionDark}`} id="instructor">
          <div className="container">
            <div className={styles.instructorCard}>
              <img 
                src="/images/javier_soler.png" 
                alt="Javier Soler - Instructor Academia Huertera" 
                className={styles.instructorAvatarImg}
              />
              <div>
                <span className={styles.sectionTag}>Tu Instructor</span>
                <h2 className={styles.instructorName}>Javier Soler</h2>
                <div className={styles.instructorRole}>@javierhuertero • Fundador Academia Huertera</div>
                <p className={styles.instructorBio}>
                  "Mi objetivo es desmitificar la agricultura de pequeña escala. No necesitas hectáreas infinitas para vivir de la tierra de forma rentable. Con una superficie intensiva de 1.000 m², diseño inteligente de camas permanentes y control estricto de costos, es posible construir un negocio libre, saludable y sustentable."
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className="container">
          <p>© {new Date().getFullYear()} Academia Huertera. Todos los derechos reservados. Creado por Javier Soler.</p>
        </div>
      </footer>
    </>
  );
}
