import React from 'react';
import type { PlaybackState, PlaybackControls } from '../../hooks/usePlayback';

interface ControlPanelProps {
  state: PlaybackState;
  controls: PlaybackControls;
  onRandomize?: () => void;
  onCustomInput?: () => void;
  sizeSlider?: { value: number; min: number; max: number; onChange: (v: number) => void };
}

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21"/>
  </svg>
);

const PauseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" rx="1"/>
    <rect x="14" y="4" width="4" height="16" rx="1"/>
  </svg>
);

const StepBackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="19,3 7,12 19,21"/>
    <rect x="5" y="3" width="2" height="18" rx="1"/>
  </svg>
);

const StepFwdIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 17,12 5,21"/>
    <rect x="17" y="3" width="2" height="18" rx="1"/>
  </svg>
);

const ResetIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-5.49"/>
  </svg>
);

const RandomIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
    <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
    <line x1="4" y1="4" x2="9" y2="9"/>
  </svg>
);

const SPEED_OPTIONS = [0.25, 0.5, 1, 2, 4];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  state, controls, onRandomize,
}) => {
  const { isPlaying, speed, currentStep, totalSteps } = state;
  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  return (
    <div
      className="flex flex-col gap-2 p-3 shrink-0"
      style={{ background: '#0f172a', borderTop: '1px solid #1e293b' }}
    >
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-slate-500 w-12 text-right shrink-0">
          {currentStep + 1}/{totalSteps}
        </span>
        <div
          className="flex-1 h-1 rounded-full cursor-pointer relative"
          style={{ background: '#1e293b' }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            controls.setCurrentStep(Math.round(ratio * (totalSteps - 1)));
          }}
          role="slider"
          aria-valuenow={currentStep}
          aria-valuemin={0}
          aria-valuemax={totalSteps - 1}
          aria-label="Step progress"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') controls.stepForward();
            if (e.key === 'ArrowLeft') controls.stepBackward();
          }}
        >
          <div
            className="h-1 rounded-full transition-all duration-75"
            style={{ width: `${progress}%`, background: '#6366f1' }}
          />
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Playback buttons */}
        <div className="flex items-center gap-1">
          <button
            id="btn-step-back"
            onClick={controls.stepBackward}
            disabled={currentStep === 0}
            aria-label="Step backward"
            className="btn-control"
            style={btnStyle(false)}
          >
            <StepBackIcon />
          </button>

          <button
            id="btn-play-pause"
            onClick={controls.toggle}
            disabled={totalSteps <= 1}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="btn-control"
            style={{ ...btnStyle(false), background: '#4f46e5', color: 'white', minWidth: 36 }}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            id="btn-step-fwd"
            onClick={controls.stepForward}
            disabled={currentStep >= totalSteps - 1}
            aria-label="Step forward"
            className="btn-control"
            style={btnStyle(false)}
          >
            <StepFwdIcon />
          </button>

          <button
            id="btn-reset"
            onClick={controls.reset}
            aria-label="Reset"
            className="btn-control"
            style={btnStyle(false)}
          >
            <ResetIcon />
          </button>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-1 ml-2 border-l border-slate-800 pl-2">
          <span className="text-xs text-slate-500 font-mono mr-1">Speed:</span>
          {SPEED_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => controls.setSpeed(s)}
              aria-label={`Speed ${s}x`}
              className="text-xs font-mono rounded px-1.5 py-0.5 transition-colors"
              style={{
                background: speed === s ? '#4f46e5' : '#1e293b',
                color: speed === s ? 'white' : '#64748b',
                border: '1px solid',
                borderColor: speed === s ? '#4f46e5' : '#334155',
              }}
            >
              {s}x
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Optional Random Input for Graph Page specifically where input bar isn't used */}
        <div className="flex items-center gap-1.5">
          {onRandomize && (
            <button
              id="btn-randomize"
              onClick={onRandomize}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors"
              style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}
            >
              <RandomIcon />
              Random
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

function btnStyle(_active: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 6,
    background: '#1e293b',
    color: '#94a3b8',
    border: '1px solid #334155',
    cursor: 'pointer',
  };
}
