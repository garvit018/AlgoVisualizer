import { useEffect } from 'react';
import type { PlaybackControls } from './usePlayback';

/**
 * Attaches keyboard shortcuts to playback controls.
 * Space = play/pause, ArrowRight = step forward, ArrowLeft = step backward, R = reset
 */
export function useKeyboardShortcuts(controls: PlaybackControls, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          controls.toggle();
          break;
        case 'ArrowRight':
          e.preventDefault();
          controls.stepForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          controls.stepBackward();
          break;
        case 'r':
        case 'R':
          controls.reset();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [controls, enabled]);
}
