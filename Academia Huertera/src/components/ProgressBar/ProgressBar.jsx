import styles from './ProgressBar.module.css';

export default function ProgressBar({ completedCount = 0, totalCount = 16, dark = false }) {
  const percentage = Math.round((completedCount / totalCount) * 100) || 0;

  return (
    <div className={styles.container}>
      <div className={`${styles.header} ${dark ? styles.darkHeader : ''}`}>
        <span>Tu Avance</span>
        <span>{completedCount} de {totalCount} capítulos ({percentage}%)</span>
      </div>
      <div className={`${styles.track} ${dark ? styles.darkTrack : ''}`}>
        <div 
          className={styles.fill} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
}
