import { useState, useEffect, useCallback, useRef } from 'react';

export interface PlaybackState {
  isPlaying: boolean;
  speed: number; // 0.25 to 4
  currentStep: number;
  totalSteps: number;
}

export interface PlaybackControls {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  setCurrentStep: (step: number) => void;
}

export function usePlayback(totalSteps: number, onStepChange?: (step: number) => void) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeedState] = useState(1);
  const [currentStep, setCurrentStepState] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setCurrentStep = useCallback((step: number) => {
    const clamped = Math.max(0, Math.min(step, totalSteps - 1));
    setCurrentStepState(clamped);
    onStepChange?.(clamped);
  }, [totalSteps, onStepChange]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    clearTimer();
  }, [clearTimer]);

  const play = useCallback(() => {
    if (currentStep >= totalSteps - 1) return;
    setIsPlaying(true);
  }, [currentStep, totalSteps]);

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  const stepForward = useCallback(() => {
    pause();
    setCurrentStep(Math.min(currentStep + 1, totalSteps - 1));
  }, [pause, currentStep, totalSteps, setCurrentStep]);

  const stepBackward = useCallback(() => {
    pause();
    setCurrentStep(Math.max(currentStep - 1, 0));
  }, [pause, currentStep, setCurrentStep]);

  const reset = useCallback(() => {
    pause();
    setCurrentStep(0);
  }, [pause, setCurrentStep]);

  const setSpeed = useCallback((s: number) => {
    setSpeedState(s);
  }, []);

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying) {
      clearTimer();
      return;
    }
    const ms = 1000 / speed;
    intervalRef.current = setInterval(() => {
      setCurrentStepState(prev => {
        const next = prev + 1;
        if (next >= totalSteps) {
          setIsPlaying(false);
          clearTimer();
          return prev;
        }
        onStepChange?.(next);
        return next;
      });
    }, ms);
    return clearTimer;
  }, [isPlaying, speed, totalSteps, clearTimer, onStepChange]);

  // Stop if we reach the end
  useEffect(() => {
    if (currentStep >= totalSteps - 1 && isPlaying) {
      pause();
    }
  }, [currentStep, totalSteps, isPlaying, pause]);

  // Reset when totalSteps changes (new input)
  useEffect(() => {
    pause();
    setCurrentStepState(0);
  }, [totalSteps]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    state: { isPlaying, speed, currentStep, totalSteps } as PlaybackState,
    controls: { play, pause, toggle, stepForward, stepBackward, reset, setSpeed, setCurrentStep } as PlaybackControls,
  };
}
