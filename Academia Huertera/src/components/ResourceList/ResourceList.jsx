import styles from './ResourceList.module.css';

export default function ResourceList({ resources = [] }) {
  if (!resources || resources.length === 0) {
    return (
      <div className={styles.card}>
        <h4 className={styles.title}>📁 Materiales Descargables</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Esta lección no incluye archivos adjuntos adicionales.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h4 className={styles.title}>📁 Materiales Descargables y Plantillas</h4>
      <div className={styles.list}>
        {resources.map((res, index) => {
          const isExcel = res.title.endsWith('.xlsx');
          return (
            <div key={index} className={styles.item}>
              <div className={styles.itemInfo}>
                <div className={styles.icon}>{isExcel ? 'XLS' : 'PDF'}</div>
                <span className={styles.itemTitle}>{res.title}</span>
              </div>
              <a 
                href={res.url} 
                download 
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Descargando recurso del curso: ${res.title}`);
                }}
                className={styles.downloadBtn}
              >
                Descargar ⬇
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
