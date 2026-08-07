import { useMemo } from 'react';
import { useStore } from '../store';
import { computeCriticalPath } from '../lib/criticalPath';

export function Toolbar() {
  const tasks = useStore((s) => s.tasks);
  const deps = useStore((s) => s.dependencies);
  const focusMode = useStore((s) => s.focusMode);
  const showCritical = useStore((s) => s.showCritical);
  const toggleFocus = useStore((s) => s.toggleFocus);
  const toggleCritical = useStore((s) => s.toggleCritical);
  const addTask = useStore((s) => s.addTask);
  const resetToSeed = useStore((s) => s.resetToSeed);
  const selectedId = useStore((s) => s.selectedId);

  const critical = useMemo(() => computeCriticalPath(tasks, deps), [tasks, deps]);

  const counts = useMemo(() => {
    const c = { total: 0, done: 0, in_progress: 0, blocked: 0, effort: 0, effortDone: 0 };
    Object.values(tasks).forEach((t) => {
      c.total += 1;
      c.effort += t.effort;
      if (t.status === 'done') { c.done += 1; c.effortDone += t.effort; }
      if (t.status === 'in_progress') c.in_progress += 1;
      if (t.status === 'blocked') c.blocked += 1;
    });
    return c;
  }, [tasks]);

  const pct = counts.effort > 0 ? Math.round((counts.effortDone / counts.effort) * 100) : 0;

  return (
    <div className="flex items-center gap-3 px-4 h-14 border-b border-[#262a3d] bg-[#0f1120]/80 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-2">
        <div className="relative h-8 w-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-500 via-pink-500 to-amber-400 opacity-80 blur-[6px]" />
          <div className="absolute inset-[3px] rounded-full bg-[#0f1120] flex items-center justify-center text-sm">
            ✦
          </div>
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold text-slate-100">Constellation</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Graph-first PM</div>
        </div>
      </div>

      <div className="mx-4 h-8 w-px bg-[#262a3d]" />

      <div className="flex items-center gap-4 text-[11px] text-slate-400">
        <Stat label="Tasks" value={String(counts.total)} />
        <Stat label="In progress" value={String(counts.in_progress)} tone="sky" />
        <Stat label="Blocked" value={String(counts.blocked)} tone={counts.blocked > 0 ? 'red' : 'muted'} />
        <Stat label="Critical path" value={`${critical.ids.size} steps`} tone="pink" />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ProgressPill pct={pct} />
        <ToggleBtn active={showCritical} onClick={toggleCritical} title="Highlight critical path">
          <span className="text-pink-400">⟶</span> Critical
        </ToggleBtn>
        <ToggleBtn active={focusMode} onClick={toggleFocus} title="Focus mode: dim non-related tasks (needs a selection)" disabled={!selectedId}>
          ◎ Focus
        </ToggleBtn>
        <button
          onClick={() => addTask()}
          className="px-3 h-8 rounded-lg text-[12px] font-medium bg-violet-500 hover:bg-violet-400 text-white transition-colors shadow-[0_4px_14px_rgba(167,139,250,0.35)]"
        >
          + New task
        </button>
        <button
          onClick={() => confirm('Reset the graph to the seed sample?') && resetToSeed()}
          className="px-2 h-8 rounded-lg text-[12px] text-slate-400 hover:text-slate-200 hover:bg-[#1e2131] transition-colors"
          title="Reset to seed data"
        >
          ↺
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, tone = 'muted' }: { label: string; value: string; tone?: 'muted' | 'sky' | 'red' | 'pink' }) {
  const toneClass = {
    muted: 'text-slate-300',
    sky: 'text-sky-300',
    red: 'text-red-400',
    pink: 'text-pink-300',
  }[tone];
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={`text-[13px] font-semibold ${toneClass}`}>{value}</span>
      <span className="text-slate-500">{label}</span>
    </div>
  );
}

function ToggleBtn({ active, onClick, children, title, disabled }: { active: boolean; onClick: () => void; children: React.ReactNode; title?: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={[
        'px-3 h-8 rounded-lg text-[12px] font-medium transition-colors border',
        active
          ? 'bg-[#1e2131] text-slate-100 border-[#363b52]'
          : 'bg-transparent text-slate-400 border-[#262a3d] hover:text-slate-200 hover:bg-[#171927]',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function ProgressPill({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2 h-8 pl-2 pr-3 rounded-lg bg-[#171927] border border-[#262a3d]">
      <div className="relative h-1.5 w-24 rounded-full bg-[#262a3d] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-slate-300 tabular-nums">{pct}%</span>
    </div>
  );
}
