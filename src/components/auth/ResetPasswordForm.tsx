import { useState } from 'react';

interface ResetPasswordFormProps {
  onResetComplete: () => void;
  onBackToLogin: () => void;
}

export function ResetPasswordForm({ onResetComplete, onBackToLogin }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    setSuccess(true);
  };

  return (
    <div className="space-y-4 text-left">
      
      <div className="space-y-1">
        <h3 className="text-xl font-bold font-serif text-stone-900">Reset Password</h3>
        <p className="text-xs text-stone-500">Enter your new secure password credentials.</p>
      </div>

      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          <div>
            <label htmlFor="reset-pass" className="block text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1">
              New Password
            </label>
            <input
              id="reset-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full text-xs bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 outline-none transition focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700/30 placeholder:text-stone-400"
            />
          </div>

          <div>
            <label htmlFor="reset-confirm" className="block text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1">
              Confirm New Password
            </label>
            <input
              id="reset-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full text-xs bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 outline-none transition focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700/30 placeholder:text-stone-400"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 py-3 text-xs font-bold text-white uppercase tracking-wider shadow-sm transition cursor-pointer"
          >
            Update Password
          </button>
        </form>
      ) : (
        <div className="space-y-3 py-4 text-center">
          <div className="flex justify-center">
            <span className="w-10 h-10 flex items-center justify-center bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-lg">
              ✓
            </span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed max-w-[280px] mx-auto">
            Your password has been successfully updated. You can now log in using your new credentials.
          </p>
          <button
            onClick={() => {
              onResetComplete();
              onBackToLogin();
            }}
            className="rounded-xl bg-emerald-700 hover:bg-emerald-800 py-2.5 px-6 text-xs font-bold text-white uppercase tracking-wider shadow-sm transition cursor-pointer"
          >
            Back to Login
          </button>
        </div>
      )}

      {!success && (
        <div className="pt-2 text-center border-t border-stone-100">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-xs font-bold text-stone-500 hover:text-stone-900 transition cursor-pointer"
          >
            ← Back to Login
          </button>
        </div>
      )}

    </div>
  );
}

