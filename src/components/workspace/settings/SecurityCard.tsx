import { useState } from 'react';
import { BRAND } from '../../../config/branding';

interface SecurityCardProps {
  onChangePassword: (oldPw: string, newPw: string) => Promise<boolean>;
  onExportData: () => void;
  onDeleteAccount: () => void;
}

export function SecurityCard({ onChangePassword, onExportData, onDeleteAccount }: SecurityCardProps) {
  // Password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Privacy states
  const [visibleInSearch, setVisibleInSearch] = useState(true);
  const [telemetry, setTelemetry] = useState(false);

  // Active Sessions Mock
  const [sessions, setSessions] = useState([
    { id: 's1', browser: 'Chrome on Windows 11', ip: '183.82.112.9', location: 'Hyderabad, India', current: true },
    { id: 's2', browser: 'Safari on iPhone 15', ip: '49.204.113.2', location: 'Chennai, India', current: false }
  ]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwError('Please fill out all password fields.');
      return;
    }
    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New password and confirmation do not match.');
      return;
    }

    setPwLoading(true);
    const success = await onChangePassword(oldPassword, newPassword);
    setPwLoading(false);

    if (success) {
      setPwSuccess('Password successfully updated!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPwError('Failed to change password. Please verify your current credentials.');
    }
  };

  const handleTerminateSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6 text-left text-xs font-semibold text-stone-700">
      {/* 1. Change Password Section */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-stone-900 font-serif border-b border-stone-100 pb-2">
          Change Password
        </h3>

        {pwError && <div className="bg-rose-50 border border-rose-100 text-rose-800 p-3 rounded-xl">{pwError}</div>}
        {pwSuccess && <div className="bg-emerald-50 border border-emerald-100 text-emerald-850 p-3 rounded-xl">{pwSuccess}</div>}

        <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="block text-[10px] uppercase font-bold text-stone-400">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-900 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-stone-400">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-stone-400">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-900 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={pwLoading}
            className="rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 transition duration-200 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {pwLoading ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* 2. Privacy Settings Section */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-stone-900 font-serif border-b border-stone-100 pb-2">
          Privacy Settings
        </h3>

        <div className="space-y-3.5">
          <label className="flex items-start gap-3 p-3 rounded-xl border border-stone-100 bg-stone-50/20 hover:bg-stone-50 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={visibleInSearch}
              onChange={(e) => setVisibleInSearch(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <div className="space-y-0.5">
              <span className="block text-xs font-bold text-stone-900">Show Profile in Marketplace Search</span>
              <p className="text-[10px] text-stone-400 font-medium leading-normal">
                Allow certified coordinators and contractors to view my project interests and contact card.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-stone-100 bg-stone-50/20 hover:bg-stone-50 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={telemetry}
              onChange={(e) => setTelemetry(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <div className="space-y-0.5">
              <span className="block text-xs font-bold text-stone-900">Share Anonymous Telemetry</span>
              <p className="text-[10px] text-stone-400 font-medium leading-normal">
                Help us improve {BRAND.name} by sending anonymous user experience click reports.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* 3. Active Sessions */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-stone-900 font-serif border-b border-stone-100 pb-2">
          Active Login Sessions
        </h3>

        <div className="divide-y divide-stone-100 space-y-3">
          {sessions.length === 0 ? (
            <p className="text-stone-400 text-center py-4 font-medium">No other active sessions detected.</p>
          ) : (
            sessions.map((sess) => (
              <div key={sess.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4 text-xs font-semibold text-stone-700">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-900 font-serif">{sess.browser}</span>
                    {sess.current && (
                      <span className="text-[8px] bg-emerald-50 border border-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-stone-400 font-medium">
                    IP: {sess.ip} • {sess.location}
                  </div>
                </div>
                {!sess.current && (
                  <button
                    onClick={() => handleTerminateSession(sess.id)}
                    className="text-[10px] text-stone-400 hover:text-red-700 font-bold border border-stone-200 hover:border-red-200 bg-stone-50 px-2.5 py-1 rounded-lg transition cursor-pointer"
                  >
                    Log Out
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Dangerous Actions / Data Export */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-l-rose-500">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xs font-extrabold text-stone-900 uppercase">Export & Account Management</h3>
          <p className="text-[10px] text-stone-400 font-semibold max-w-md">
            Download your personal coordination data files in JSON structure, or request to permanently delete your account.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onExportData}
            className="rounded-lg border border-stone-200 bg-white hover:bg-stone-50 px-4 py-2 text-[10px] font-bold text-stone-700 transition cursor-pointer"
          >
            Export Data
          </button>
          
          <button
            onClick={onDeleteAccount}
            className="rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2 text-[10px] font-bold transition cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
