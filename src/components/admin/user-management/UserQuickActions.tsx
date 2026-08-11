import type { UserRecord } from '../../../pages/admin/AdminDashboard';

interface UserQuickActionsProps {
  user: UserRecord | null;
  onApprove: (id: string, name: string) => void;
  onStatusChange: (id: string, newStatus: string) => void;
  onSelectUser: (user: UserRecord) => void;
}

export default function UserQuickActions({
  user,
  onApprove,
  onStatusChange,
  onSelectUser,
}: UserQuickActionsProps) {
  if (!user) {
    return (
      <div className="bg-white border border-light-border p-5 rounded-3xl shadow-apple-sm text-center text-[10px] text-stone-400 font-medium select-none">
        No active user selected for quick commands.
      </div>
    );
  }

  return (
    <div className="bg-white border border-light-border p-5 rounded-3xl shadow-apple-sm space-y-4 text-left select-none">
      <div>
        <h4 className="text-[10px] font-black uppercase text-stone-900 tracking-wider">
          Quick Commands: {user.name}
        </h4>
        <span className="block text-[8px] text-stone-400 font-bold uppercase mt-0.5">
          Role: {user.role} &bull; Status: {user.status}
        </span>
      </div>

      <div className="grid gap-2 grid-cols-2 text-[9px] font-black uppercase tracking-wider text-center">
        <button
          onClick={() => onSelectUser(user)}
          className="p-2.5 bg-stone-50 hover:bg-stone-100 border border-light-border rounded-xl text-stone-800 font-extrabold transition focus:outline-none"
        >
          🔍 View User
        </button>
        {user.status !== 'Active' ? (
          <button
            onClick={() => onStatusChange(user.id, 'Active')}
            className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-800 font-extrabold transition focus:outline-none"
          >
            ✅ Activate
          </button>
        ) : (
          <button
            onClick={() => onStatusChange(user.id, 'Inactive')}
            className="p-2.5 bg-stone-50 hover:bg-stone-100 border border-light-border rounded-xl text-stone-800 font-extrabold transition focus:outline-none"
          >
            🚫 Deactivate
          </button>
        )}
        <button
          onClick={() => onStatusChange(user.id, 'Suspended')}
          disabled={user.status === 'Suspended'}
          className="p-2.5 bg-rose-50 hover:bg-rose-100 disabled:opacity-40 disabled:pointer-events-none border border-rose-200 text-rose-700 font-extrabold transition focus:outline-none"
        >
          🛑 Suspend
        </button>
        {user.verificationStatus === 'Pending' ? (
          <button
            onClick={() => onApprove(user.id, user.name)}
            className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-extrabold transition focus:outline-none"
          >
            🔬 Verify Request
          </button>
        ) : (
          <button
            onClick={() => alert(`Verification already ${user.verificationStatus}.`)}
            className="p-2.5 bg-stone-50 disabled:opacity-50 border border-light-border rounded-xl text-stone-400 font-extrabold transition focus:outline-none"
          >
            ✓ Verified Status
          </button>
        )}
      </div>
    </div>
  );
}
