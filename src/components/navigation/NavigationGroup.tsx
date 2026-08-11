interface NavigationGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function NavigationGroup({ children, className = '' }: NavigationGroupProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {children}
    </div>
  );
}
