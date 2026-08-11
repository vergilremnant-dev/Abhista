import { useState } from 'react';

interface WelcomeScreenProps {
  user: {
    firstName?: string;
    email: string;
    role: string;
  } | null;
  onCompleteOnboarding: () => void;
}

export function WelcomeScreen({ user, onCompleteOnboarding }: WelcomeScreenProps) {
  const [progress, setProgress] = useState(40);
  const [completedSteps, setCompletedSteps] = useState<string[]>(['profile_created']);

  const getRoleConfig = () => {
    if (!user) return { title: 'User', actions: [] };
    const norm = user.role.toUpperCase();
    if (norm.includes('PROVIDER')) {
      // Professional / Consultant
      return {
        title: 'Trade Partner / Consultant',
        actions: [
          { id: 'profile_created', label: 'Verify Credentials & Account Setup', done: true },
          { id: 'portfolio', label: 'Upload past layout drawing portfolios', done: false },
          { id: 'availability', label: 'Set weekly consultation schedules', done: false },
          { id: 'rates', label: 'Configure consultation session rates', done: false },
        ]
      };
    }
    if (norm.includes('ADMIN')) {
      return {
        title: 'System Administrator',
        actions: [
          { id: 'profile_created', label: 'Admin credentials active', done: true },
          { id: 'overview', label: 'Complete dashboard overview audit', done: false },
          { id: 'onboard_logs', label: 'Check pending provider registration lists', done: false },
        ]
      };
    }
    // Default to Customer
    return {
      title: 'Project Customer',
      actions: [
        { id: 'profile_created', label: 'Complete profile metadata setup', done: true },
        { id: 'explore', label: 'Explore local verified trade partners', done: false },
        { id: 'first_req', label: 'Post your first layout coordinate requirements', done: false },
      ]
    };
  };

  const { title, actions } = getRoleConfig();

  const handleToggleStep = (stepId: string) => {
    if (stepId === 'profile_created') return; // Always done
    let nextSteps;
    if (completedSteps.includes(stepId)) {
      nextSteps = completedSteps.filter((s) => s !== stepId);
    } else {
      nextSteps = [...completedSteps, stepId];
    }
    setCompletedSteps(nextSteps);
    // Recalculate progress: (completedSteps / actions.length) * 100
    const pct = Math.round((nextSteps.length / actions.length) * 100);
    setProgress(pct);
  };

  return (
    <div className="space-y-6 text-left animate-gentle-fade bg-arch-grid p-6 border border-light-border bg-white rounded-3xl shadow-apple-sm">
      
      {/* Welcome Greeting */}
      <div className="space-y-2 border-b border-light-border pb-4">
        <span className="dbc-badge dbc-badge-verified">Welcome to DBC</span>
        <h3 className="text-sm font-black uppercase tracking-wider text-stone-black leading-tight">
          Hello, {user?.firstName || user?.email || 'Partner'}!
        </h3>
        <span className="block text-[8px] font-black uppercase bg-light-stone text-stone-gray px-2 py-0.5 rounded border border-light-border max-w-max">
          Active Role: {title}
        </span>
      </div>

      {/* Profile completion progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-stone-gray">
          <span>Profile Onboarding Progress</span>
          <span>{progress}% Complete</span>
        </div>
        <div className="dbc-progress-bar">
          <div className="dbc-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Suggested next actions checklist */}
      <div className="space-y-3">
        <span className="block text-[9px] font-black uppercase tracking-widest text-stone-gray">Setup Checklist</span>
        
        <div className="space-y-2">
          {actions.map((act) => {
            const isDone = completedSteps.includes(act.id);
            return (
              <div
                key={act.id}
                onClick={() => handleToggleStep(act.id)}
                className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer select-none
                  ${isDone 
                    ? 'bg-light-stone/30 border-light-border opacity-70' 
                    : 'bg-white border-light-border hover:border-brand-emerald hover:shadow-apple-sm'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-black
                    ${isDone 
                      ? 'border-brand-emerald bg-brand-emerald/10 text-brand-emerald' 
                      : 'border-light-border text-transparent'
                    }
                  `}>
                    ✓
                  </span>
                  <span className={`text-[11px] font-semibold ${isDone ? 'line-through text-stone-gray' : 'text-stone-black'}`}>
                    {act.label}
                  </span>
                </div>
                <span className="text-[8px] text-stone-gray font-black uppercase tracking-wider">
                  {isDone ? 'DONE' : 'TODO'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Finalize onboarding */}
      <div className="pt-4 border-t border-light-border/40 flex justify-between items-center">
        <span className="text-[7.5px] text-stone-gray font-semibold max-w-[180px] leading-relaxed">
          You can edit these coordinates anytime in your profile settings panel.
        </span>
        <button
          onClick={onCompleteOnboarding}
          className="dbc-btn dbc-btn-primary py-2.5 px-5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          Enter Workspace
        </button>
      </div>

    </div>
  );
}
