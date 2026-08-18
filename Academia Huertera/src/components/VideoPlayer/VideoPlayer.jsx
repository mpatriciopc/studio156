'use client';

import { useState } from 'react';
import styles from './VideoPlayer.module.css';

export default function VideoPlayer({ lesson, isCompleted = false, onToggleComplete }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className={styles.playerContainer}>
      <div className={styles.videoRatio}>
        {!isPlaying ? (
          <div className={styles.videoContent}>
            <button 
              className={styles.playButton}
              onClick={() => setIsPlaying(true)}
              title="Reproducir Video"
            >
              ▶
            </button>
            <h3 className={styles.videoTitle}>{lesson.title}</h3>
            <span className={styles.watermark}>Academia Huertera • Javier Soler</span>
          </div>
        ) : (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1`}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          />
        )}
      </div>

      <div className={styles.controlsBar}>
        <div className={styles.statusInfo}>
          <span>⏱ Duración: <strong>{lesson.duration}</strong></span>
        </div>

        <button
          onClick={onToggleComplete}
          className={`${styles.completeBtn} ${isCompleted ? styles.completedState : styles.incompleteState}`}
        >
          {isCompleted ? '✓ Lección Completada' : 'Marcar como Completada'}
        </button>
      </div>
    </div>
  );
}
