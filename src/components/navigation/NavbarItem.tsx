import { NavLink } from 'react-router-dom';

interface NavbarItemProps {
  to: string;
  end?: boolean;
  children: React.ReactNode;
}

export function NavbarItem({ to, end = false, children }: NavbarItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `
        px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-emerald focus:outline-none
        ${isActive 
          ? 'bg-light-stone text-stone-black font-extrabold shadow-sm' 
          : 'text-stone-gray hover:text-stone-black hover:bg-light-stone/60'
        }
      `}
    >
      {children}
    </NavLink>
  );
}
