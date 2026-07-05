import React from 'react';

interface CodePanelProps {
  lines: string[];
  activeLine: number;
  title?: string;
}

export const CodePanel: React.FC<CodePanelProps> = ({ lines, activeLine, title = 'Pseudocode' }) => {
  return (
    <div
      className="flex flex-col rounded-lg overflow-hidden"
      style={{ border: '1px solid #1e293b', background: '#0a0f1e' }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-slate-800"
        style={{ background: '#0f172a' }}
      >
        <span className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
        <span className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />
        <span className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
        <span className="ml-2 text-xs text-slate-500 font-mono">{title}</span>
      </div>
      <div className="p-3 overflow-auto max-h-64">
        {lines.map((line, i) => (
          <div
            key={i}
            className="flex items-start gap-3 py-0.5 rounded px-1 transition-colors duration-100"
            style={{
              background: i === activeLine ? 'rgba(99,102,241,0.15)' : 'transparent',
              borderLeft: i === activeLine ? '2px solid #6366f1' : '2px solid transparent',
            }}
          >
            <span
              className="text-xs font-mono shrink-0 w-4 text-right"
              style={{ color: i === activeLine ? '#6366f1' : '#334155', userSelect: 'none' }}
            >
              {i + 1}
            </span>
            <span
              className="text-xs font-mono whitespace-pre"
              style={{ color: i === activeLine ? '#e2e8f0' : '#64748b' }}
            >
              {line}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface StepDescriptionProps {
  description: string;
  stepIndex: number;
  totalSteps: number;
}

export const StepDescription: React.FC<StepDescriptionProps> = ({
  description, stepIndex, totalSteps,
}) => {
  return (
    <div
      className="rounded-lg p-3"
      style={{ border: '1px solid #1e293b', background: '#0f172a' }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="text-xs font-mono font-medium"
          style={{ color: '#6366f1' }}
        >
          Step {stepIndex + 1} / {totalSteps}
        </span>
        <div className="flex-1 h-px" style={{ background: '#1e293b' }} />
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
    </div>
  );
};

interface ComplexityBadgeProps {
  label: string;
  value: string;
  color?: string;
}

export const ComplexityBadge: React.FC<ComplexityBadgeProps> = ({ label, value, color = '#64748b' }) => (
  <div className="flex flex-col items-center gap-0.5">
    <span className="text-xs text-slate-500 font-mono">{label}</span>
    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded" style={{ background: '#1e293b', color }}>
      {value}
    </span>
  </div>
);

interface ComplexityPanelProps {
  complexity: { best: string; average: string; worst: string; space: string };
  stats?: { comparisons?: number; swaps?: number };
}

export const ComplexityPanel: React.FC<ComplexityPanelProps> = ({ complexity, stats }) => (
  <div
    className="rounded-lg p-3"
    style={{ border: '1px solid #1e293b', background: '#0f172a' }}
  >
    <p className="text-xs text-slate-500 font-mono mb-2 uppercase tracking-widest">Complexity</p>
    <div className="flex gap-3 flex-wrap">
      <ComplexityBadge label="Best" value={complexity.best} color="#22c55e" />
      <ComplexityBadge label="Avg" value={complexity.average} color="#f59e0b" />
      <ComplexityBadge label="Worst" value={complexity.worst} color="#ef4444" />
      <ComplexityBadge label="Space" value={complexity.space} color="#6366f1" />
      {stats?.comparisons !== undefined && (
        <ComplexityBadge label="Comparisons" value={String(stats.comparisons)} color="#94a3b8" />
      )}
      {stats?.swaps !== undefined && (
        <ComplexityBadge label="Swaps" value={String(stats.swaps)} color="#94a3b8" />
      )}
    </div>
  </div>
);

interface CustomInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: number[]) => void;
  placeholder?: string;
  title?: string;
}

export const CustomInputModal: React.FC<CustomInputModalProps> = ({
  isOpen, onClose, onSubmit, placeholder = '5, 3, 8, 1, 9, 2', title = 'Custom Input',
}) => {
  const [value, setValue] = React.useState('');
  const [error, setError] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    const parts = value.split(',').map(s => s.trim()).filter(Boolean);
    const nums = parts.map(Number);
    if (nums.some(isNaN) || nums.length === 0) {
      setError('Enter comma-separated numbers (e.g. 5, 3, 8, 1)');
      return;
    }
    if (nums.length > 100) {
      setError('Maximum 100 elements allowed.');
      return;
    }
    setError('');
    onSubmit(nums);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="rounded-lg p-6 w-96"
        style={{ background: '#0f172a', border: '1px solid #1e293b' }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-slate-200 mb-3 font-mono">{title}</h3>
        <input
          autoFocus
          type="text"
          value={value}
          onChange={e => { setValue(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded text-sm font-mono"
          style={{
            background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0',
            outline: 'none',
          }}
        />
        {error && <p className="text-xs text-red-400 mt-1 font-mono">{error}</p>}
        <p className="text-xs text-slate-500 mt-1.5 font-mono">Comma-separated integers, max 100</p>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSubmit}
            className="flex-1 py-1.5 rounded text-sm font-mono font-medium"
            style={{ background: '#4f46e5', color: 'white' }}
          >
            Visualize
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-sm font-mono"
            style={{ background: '#1e293b', color: '#64748b', border: '1px solid #334155' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

interface CPInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
  title?: string;
  placeholder?: string;
  hint?: string;
}

export const CPInputModal: React.FC<CPInputModalProps> = ({
  isOpen, onClose, onSubmit, title = 'Custom Graph Input',
  placeholder = "4 4\n0 1\n1 2\n2 3\n3 0",
  hint = "Enter n m, then m lines of u v (and optionally w for weighted)",
}) => {
  const [value, setValue] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(value);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="rounded-lg p-6 w-96 flex flex-col"
        style={{ background: '#0f172a', border: '1px solid #1e293b', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-slate-200 mb-3 font-mono">{title}</h3>
        <textarea
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded text-sm font-mono flex-1 min-h-[150px]"
          style={{
            background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0',
            outline: 'none', resize: 'vertical'
          }}
        />
        <p className="text-xs text-slate-500 mt-2 font-mono whitespace-pre-wrap leading-relaxed">{hint}</p>
        <div className="flex gap-2 mt-4 shrink-0">
          <button
            onClick={handleSubmit}
            className="flex-1 py-1.5 rounded text-sm font-mono font-medium"
            style={{ background: '#4f46e5', color: 'white' }}
          >
            Apply Graph
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-sm font-mono"
            style={{ background: '#1e293b', color: '#64748b', border: '1px solid #334155' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

interface ZoomableContainerProps {
  children: React.ReactNode;
  defaultScale?: number;
  minScale?: number;
}

export const ZoomableContainer: React.FC<ZoomableContainerProps> = ({ children, defaultScale = 1, minScale = 0.2 }) => {
  const [zoom, setZoom] = React.useState(defaultScale);
  // Measure the natural (unscaled) size of the viewport so we can size the
  // scroll-spacer correctly and produce working scrollbars at any zoom level.
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [vpSize, setVpSize] = React.useState({ w: 0, h: 0 });

  React.useEffect(() => {
    if (!viewportRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setVpSize({ w: width, h: height });
    });
    ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, []);

  // The content is always rendered at the natural viewport size.
  // CSS transform scales it visually; the spacer div tells the scrollbar
  // how large the scaled content actually is.
  const scaledW = vpSize.w * zoom;
  const scaledH = vpSize.h * zoom;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }} className="group">
      {/* Zoom Controls */}
      <div
        className="absolute top-4 right-4 z-10 flex gap-1 p-1 rounded border shadow-lg transition-opacity opacity-0 group-hover:opacity-90 hover:!opacity-100"
        style={{ background: '#1e293b', borderColor: '#334155' }}
      >
        <button
          onClick={() => setZoom(z => Math.max(+(z - 0.2).toFixed(2), minScale))}
          className="w-8 h-8 flex items-center justify-center rounded font-mono font-bold text-slate-300 hover:bg-slate-700"
        >−</button>
        <div className="w-14 h-8 flex items-center justify-center text-xs font-mono select-none" style={{ color: '#94a3b8' }}>
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={() => setZoom(z => Math.min(+(z + 0.2).toFixed(2), 4))}
          className="w-8 h-8 flex items-center justify-center rounded font-mono font-bold text-slate-300 hover:bg-slate-700"
        >+</button>
        <button
          onClick={() => setZoom(defaultScale)}
          className="px-2 h-8 flex items-center justify-center text-xs font-mono text-slate-400 hover:bg-slate-700 rounded ml-1"
          style={{ borderLeft: '1px solid #334155' }}
        >Reset</button>
      </div>

      {/* Scroll viewport — captures the natural container size */}
      <div
        ref={viewportRef}
        style={{ width: '100%', height: '100%', overflow: 'auto' }}
        className="custom-scrollbar"
      >
        {/* Spacer: expands to the post-scale dimensions so scrollbars appear */}
        <div
          style={{
            width: scaledW || '100%',
            height: scaledH || '100%',
            minWidth: '100%',
            minHeight: '100%',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {/* Content: always rendered at natural size, then scaled from top-left */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: vpSize.w || '100%',
              height: vpSize.h || '100%',
              transformOrigin: 'top left',
              transform: `scale(${zoom})`,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
