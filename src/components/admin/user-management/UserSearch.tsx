interface UserSearchProps {
  value: string;
  onChange: (val: string) => void;
}

export default function UserSearch({ value, onChange }: UserSearchProps) {
  return (
    <div className="relative text-left">
      <span className="absolute left-3 top-2.5 text-stone-400 text-sm" role="img" aria-label="Search icon">
        🔍
      </span>
      <input
        type="text"
        placeholder="Search users by name, email, phone, ID, or company..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-stone-50 border border-stone-200 focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-stone-800 placeholder-stone-400 focus:outline-none transition-colors"
        aria-label="Search user accounts"
      />
    </div>
  );
}
