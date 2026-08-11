import type { ReactNode } from 'react';

interface CustomerPageShellProps {
  children: ReactNode;
}

export function CustomerPageShell({ children }: CustomerPageShellProps) {
  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8 sm:px-6">
        {children}
      </div>
    </div>
  );
}


