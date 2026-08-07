import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { Task } from '../types';

const STATUS_STYLES: Record<Task['status'], { dot: string; ring: string; label: string }> = {
  todo:         { dot: 'bg-slate-500',  ring: 'ring-slate-500/40',  label: 'Todo' },
  in_progress:  { dot: 'bg-sky-400',    ring: 'ring-sky-400/50',    label: 'In progress' },
  review:       { dot: 'bg-amber-400',  ring: 'ring-amber-400/50',  label: 'Review' },
  done:         { dot: 'bg-emerald-500', ring: 'ring-emerald-500/50', label: 'Done' },
  blocked:      { dot: 'bg-red-500',    ring: 'ring-red-500/60',    label: 'Blocked' },
};

const PRIORITY_MARK: Record<Task['priority'], string> = {
  low: '·',
  medium: '·· ',
  high: '!! ',
  critical: '⚡',
};

export interface TaskNodeData {
  task: Task;
  size: { w: number; h: number };
  selected: boolean;
  onCritical: boolean;
  dimmed: boolean;
  focused: boolean;
}

function TaskNodeInner({ data, selected }: NodeProps) {
  const d = data as unknown as TaskNodeData;
  const t = d.task;
  const s = STATUS_STYLES[t.status];
  const isBlocked = t.status === 'blocked';

  return (
    <div
      className={[
        'group relative rounded-2xl border transition-all duration-200 ease-out',
        'bg-[#171927] backdrop-blur-sm text-left px-4 py-3',
        'shadow-[0_8px_24px_rgba(0,0,0,0.5)]',
        selected || d.selected ? 'border-violet-400 ring-2 ring-violet-400/40' : 'border-[#262a3d]',
        d.onCritical ? 'ring-2 ring-pink-400/60 shadow-[0_0_24px_rgba(244,114,182,0.35)]' : '',
        d.focused ? 'scale-[1.03]' : '',
        d.dimmed ? 'opacity-25 saturate-50' : 'opacity-100',
        isBlocked ? 'node-blocked' : '',
      ].join(' ')}
      style={{ width: d.size.w, minHeight: d.size.h }}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
        <span className={`inline-block h-2 w-2 rounded-full ${s.dot} ring-4 ${s.ring}`} />
        <span>{s.label}</span>
        <span className="ml-auto text-slate-500">
          {PRIORITY_MARK[t.priority]}{t.effort}pt
        </span>
      </div>

      <div className="text-[13px] font-medium text-slate-100 leading-tight line-clamp-2">
        {t.title}
      </div>

      {(t.assignee || t.tags.length > 0) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {t.assignee && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0f1120] px-2 py-0.5 text-[10px] text-slate-300 border border-[#262a3d]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400" />
              {t.assignee}
            </span>
          )}
          {t.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full bg-[#0f1120] px-2 py-0.5 text-[10px] text-slate-400 border border-[#262a3d]">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export const TaskNode = memo(TaskNodeInner);
