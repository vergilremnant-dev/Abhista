import { useState } from 'react';

interface FavoriteButtonProps {
  id: string | number;
  type: 'professional' | 'service' | 'project' | 'consultant';
  className?: string;
}

export function FavoriteButton({ id, type, className = '' }: FavoriteButtonProps) {
  const getFavKey = () => `dbc_fav_${type}_${id}`;
  const [isFav, setIsFav] = useState(() => {
    return localStorage.getItem(`dbc_fav_${type}_${id}`) === 'true';
  });

  const toggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isFav;
    setIsFav(nextState);
    if (nextState) {
      localStorage.setItem(getFavKey(), 'true');
    } else {
      localStorage.removeItem(getFavKey());
    }
  };

  return (
    <button
      onClick={toggleFav}
      className={`w-8 h-8 flex items-center justify-center rounded-full border border-light-border bg-white text-stone-gray hover:text-rose-600 transition shadow-apple-sm ${className}`}
      aria-label={isFav ? "Remove from favorites" : "Save to favorites"}
    >
      <svg
        className="w-4 h-4"
        fill={isFav ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
