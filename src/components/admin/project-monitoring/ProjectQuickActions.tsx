import type { ProjectRecord } from '../../../pages/admin/AdminDashboard';

interface ProjectQuickActionsProps {
  project: ProjectRecord | null;
  onTabChange: (tabId: 'dashboard' | 'users' | 'verifications' | 'disputes' | 'content' | 'audit' | 'health' | 'marketplace' | 'projects') => void;
  onShowFlaggedOnly: () => void;
  onFlagProject: (id: string, name: string) => void;
}

export default function ProjectQuickActions({
  project,
  onTabChange,
  onShowFlaggedOnly,
  onFlagProject,
}: ProjectQuickActionsProps) {
  return (
    <div className="bg-white border border-light-border p-5 rounded-3xl shadow-apple-sm space-y-4 text-left select-none">
      <div>
        <h4 className="text-[10px] font-black uppercase text-stone-900 tracking-wider">
          Portfolio Shortcuts
        </h4>
        <span className="block text-[8px] text-stone-400 font-bold uppercase mt-0.5">
          Execute operations command actions
        </span>
      </div>

      <div className="grid gap-2 grid-cols-2 text-[9px] font-black uppercase tracking-wider text-center">
        <button
          onClick={onShowFlaggedOnly}
          className="p-2.5 bg-stone-50 hover:bg-stone-100 border border-light-border rounded-xl text-stone-850 font-extrabold transition focus:outline-none"
        >
          ⚠️ Review Flagged
        </button>
        <button
          onClick={() => onTabChange('marketplace')}
          className="p-2.5 bg-stone-50 hover:bg-stone-100 border border-light-border rounded-xl text-stone-850 font-extrabold transition focus:outline-none"
        >
          🛒 Marketplace
        </button>
        <button
          onClick={() => onTabChange('users')}
          className="p-2.5 bg-stone-50 hover:bg-stone-100 border border-light-border rounded-xl text-stone-850 font-extrabold transition focus:outline-none"
        >
          👤 Manage Users
        </button>
        <button
          onClick={() => onTabChange('dashboard')}
          className="p-2.5 bg-stone-50 hover:bg-stone-100 border border-light-border rounded-xl text-stone-850 font-extrabold transition focus:outline-none"
        >
          ⚡ Executive view
        </button>

        {project && !project.flagged && (
          <button
            onClick={() => onFlagProject(project.id, project.name)}
            className="col-span-2 p-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold transition focus:outline-none"
          >
            ⚠️ Flag Selected Project: {project.id}
          </button>
        )}
      </div>
    </div>
  );
}
