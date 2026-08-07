import { useStore } from '../store';
import type { TaskStatus, TaskPriority } from '../types';

const STATUSES: { v: TaskStatus; label: string; color: string }[] = [
  { v: 'todo',        label: 'Todo',        color: 'bg-slate-500' },
  { v: 'in_progress', label: 'In progress', color: 'bg-sky-400' },
  { v: 'review',      label: 'Review',      color: 'bg-amber-400' },
  { v: 'done',        label: 'Done',        color: 'bg-emerald-500' },
  { v: 'blocked',     label: 'Blocked',     color: 'bg-red-500' },
];

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical'];

export function Sidebar() {
  const selectedId = useStore((s) => s.selectedId);
  const tasks = useStore((s) => s.tasks);
  const deps = useStore((s) => s.dependencies);
  const updateTask = useStore((s) => s.updateTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const addDependency = useStore((s) => s.addDependency);
  const deleteDependency = useStore((s) => s.deleteDependency);
  const select = useStore((s) => s.select);

  const task = selectedId ? tasks[selectedId] : null;

  if (!task) {
    return (
      <aside className="w-[340px] shrink-0 border-l border-[#262a3d] bg-[#0f1120]/60 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center">
        <div className="text-4xl mb-3 opacity-60">✦</div>
        <div className="text-slate-300 text-sm font-medium mb-1">Nothing selected</div>
        <p className="text-slate-500 text-xs max-w-[220px] leading-relaxed">
          Click a node to inspect it. Drag from one node's edge to another to create a dependency.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-2 text-[11px] text-slate-500 max-w-[240px] w-full">
          <Tip k="Click" v="Select a task" />
          <Tip k="Double-click edge" v="Delete dependency" />
          <Tip k="Drag handle" v="Create dependency" />
          <Tip k="Focus toggle" v="Show only related" />
        </div>
      </aside>
    );
  }

  const parents = Object.values(deps).filter((d) => d.target === task.id);
  const children = Object.values(deps).filter((d) => d.source === task.id);
  const otherTasks = Object.values(tasks).filter((t) => t.id !== task.id);

  return (
    <aside className="w-[340px] shrink-0 border-l border-[#262a3d] bg-[#0f1120]/60 backdrop-blur-md flex flex-col">
      <div className="p-4 border-b border-[#262a3d] flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Task</span>
        <span className="text-[10px] text-slate-600">·</span>
        <span className="text-[10px] text-slate-500 font-mono">{task.id}</span>
        <button
          onClick={() => select(null)}
          className="ml-auto text-slate-500 hover:text-slate-200 text-lg leading-none"
          title="Close"
        >
          ×
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1 space-y-5">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Title</label>
          <input
            className="mt-1 w-full bg-[#171927] border border-[#262a3d] rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
            value={task.title}
            onChange={(e) => updateTask(task.id, { title: e.target.value })}
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Description</label>
          <textarea
            className="mt-1 w-full bg-[#171927] border border-[#262a3d] rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500 resize-none"
            rows={3}
            value={task.description}
            onChange={(e) => updateTask(task.id, { description: e.target.value })}
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Status</label>
          <div className="mt-2 grid grid-cols-5 gap-1">
            {STATUSES.map((s) => (
              <button
                key={s.v}
                onClick={() => updateTask(task.id, { status: s.v })}
                className={[
                  'py-1.5 rounded-md text-[10px] font-medium border transition-all',
                  task.status === s.v
                    ? 'bg-[#1e2131] border-[#363b52] text-slate-100'
                    : 'bg-transparent border-[#262a3d] text-slate-500 hover:text-slate-300',
                ].join(' ')}
                title={s.label}
              >
                <span className={`inline-block h-2 w-2 rounded-full ${s.color} mr-1`} />
                {s.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Priority</label>
            <select
              className="mt-1 w-full bg-[#171927] border border-[#262a3d] rounded-lg px-2 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500 capitalize"
              value={task.priority}
              onChange={(e) => updateTask(task.id, { priority: e.target.value as TaskPriority })}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p} className="capitalize bg-[#171927]">{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Effort ({task.effort})</label>
            <input
              type="range" min={1} max={10} step={1}
              value={task.effort}
              onChange={(e) => updateTask(task.id, { effort: Number(e.target.value) })}
              className="mt-3 w-full accent-violet-500"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Assignee</label>
          <input
            className="mt-1 w-full bg-[#171927] border border-[#262a3d] rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
            value={task.assignee ?? ''}
            placeholder="Unassigned"
            onChange={(e) => updateTask(task.id, { assignee: e.target.value || undefined })}
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Tags</label>
          <input
            className="mt-1 w-full bg-[#171927] border border-[#262a3d] rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
            value={task.tags.join(', ')}
            placeholder="Comma-separated"
            onChange={(e) =>
              updateTask(task.id, {
                tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
              })
            }
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Dependencies</label>

          <div className="mt-2 space-y-2">
            <DepList
              heading="Depends on"
              items={parents.map((d) => ({ dep: d, task: tasks[d.source] }))}
              onRemove={(id) => deleteDependency(id)}
              onSelect={(id) => select(id)}
              empty="No upstream tasks"
            />
            <DepList
              heading="Blocks"
              items={children.map((d) => ({ dep: d, task: tasks[d.target] }))}
              onRemove={(id) => deleteDependency(id)}
              onSelect={(id) => select(id)}
              empty="No downstream tasks"
            />
          </div>

          <div className="mt-3">
            <AddDepForm
              currentId={task.id}
              options={otherTasks.map((t) => ({ id: t.id, title: t.title }))}
              onAdd={(otherId, direction) => {
                if (direction === 'upstream') addDependency(otherId, task.id);
                else addDependency(task.id, otherId);
              }}
            />
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#262a3d]">
        <button
          onClick={() => {
            if (confirm(`Delete "${task.title}"?`)) deleteTask(task.id);
          }}
          className="w-full py-2 rounded-lg text-[12px] font-medium text-red-300 border border-red-500/30 hover:bg-red-500/10 transition-colors"
        >
          Delete task
        </button>
      </div>
    </aside>
  );
}

function Tip({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 rounded bg-[#171927]/60 border border-[#262a3d]">
      <span className="text-slate-300">{k}</span>
      <span className="text-slate-500">{v}</span>
    </div>
  );
}

function DepList({ heading, items, onRemove, onSelect, empty }: {
  heading: string;
  items: { dep: { id: string }; task: { id: string; title: string } | undefined }[];
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  empty: string;
}) {
  return (
    <div>
      <div className="text-[11px] text-slate-400 mb-1">{heading}</div>
      {items.length === 0 ? (
        <div className="text-[11px] text-slate-600 italic">{empty}</div>
      ) : (
        <ul className="space-y-1">
          {items.map(({ dep, task }) => task && (
            <li key={dep.id} className="flex items-center gap-2 px-2 py-1.5 rounded bg-[#171927] border border-[#262a3d] group">
              <button
                onClick={() => onSelect(task.id)}
                className="flex-1 text-left text-[12px] text-slate-200 hover:text-violet-300 truncate"
              >
                {task.title}
              </button>
              <button
                onClick={() => onRemove(dep.id)}
                className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                title="Remove dependency"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddDepForm({ currentId, options, onAdd }: {
  currentId: string;
  options: { id: string; title: string }[];
  onAdd: (otherId: string, direction: 'upstream' | 'downstream') => void;
}) {
  return (
    <details className="text-[11px]">
      <summary className="cursor-pointer text-slate-400 hover:text-slate-200 select-none">+ Add dependency</summary>
      <div className="mt-2 flex gap-2">
        <select
          id={`dep-add-${currentId}`}
          className="flex-1 bg-[#171927] border border-[#262a3d] rounded-md px-2 py-1.5 text-slate-100 focus:outline-none focus:border-violet-500 text-[11px]"
          defaultValue=""
        >
          <option value="" disabled className="bg-[#171927]">Select task…</option>
          {options.map((o) => (
            <option key={o.id} value={o.id} className="bg-[#171927]">{o.title}</option>
          ))}
        </select>
        <button
          className="px-2 py-1.5 rounded-md bg-[#1e2131] text-slate-200 hover:bg-[#262a3d] text-[11px]"
          onClick={() => {
            const el = document.getElementById(`dep-add-${currentId}`) as HTMLSelectElement | null;
            if (el?.value) { onAdd(el.value, 'upstream'); el.value = ''; }
          }}
          title="This task depends on the selected one"
        >
          ← blocks this
        </button>
        <button
          className="px-2 py-1.5 rounded-md bg-[#1e2131] text-slate-200 hover:bg-[#262a3d] text-[11px]"
          onClick={() => {
            const el = document.getElementById(`dep-add-${currentId}`) as HTMLSelectElement | null;
            if (el?.value) { onAdd(el.value, 'downstream'); el.value = ''; }
          }}
          title="The selected task depends on this one"
        >
          this blocks →
        </button>
      </div>
    </details>
  );
}
