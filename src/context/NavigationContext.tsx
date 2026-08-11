import React, { createContext, useContext, useEffect, useRef, useState, startTransition } from 'react';
import { useLocation } from 'react-router-dom';

interface CategoryState {
  collarFilter?: string;
  sorting?: string;
  scrollPosition?: number;
}

interface AssistantState {
  step: number;
  goal: string;
  area: string;
  budget: string;
  timeline: string;
}

interface SearchState {
  query: string;
  location: string;
  filters: Record<string, unknown>;
  sorting: string;
  scrollPosition: number;
}

interface NavigationContextType {
  // Global selected city context
  selectedCity: string;
  setSelectedCity: (city: string) => void;

  // Global Workspace Drawer controls
  isCustomerDrawerOpen: boolean;
  setCustomerDrawerOpen: (open: boolean) => void;
  isProviderDrawerOpen: boolean;
  setProviderDrawerOpen: (open: boolean) => void;
  isAdminDrawerOpen: boolean;
  setAdminDrawerOpen: (open: boolean) => void;
  activeWorkspaceTab: string | null;
  setActiveWorkspaceTab: (tab: string | null) => void;

  // Public Marketplace Home state
  homeCollarFilter: 'ALL' | 'BLUE_COLLAR' | 'WHITE_COLLAR';
  setHomeCollarFilter: (filter: 'ALL' | 'BLUE_COLLAR' | 'WHITE_COLLAR') => void;
  homeCarouselSlide: number;
  setHomeCarouselSlide: React.Dispatch<React.SetStateAction<number>>;
  homeAssistant: AssistantState;
  setHomeAssistant: React.Dispatch<React.SetStateAction<AssistantState>>;
  resetHomeAssistant: () => void;

  // Search State
  searchState: SearchState;
  setSearchState: (state: Partial<SearchState>) => void;
  resetSearchState: () => void;

  // Category Providers State
  categoryStates: Record<string, CategoryState>;
  setCategoryState: (categoryId: string, state: Partial<CategoryState>) => void;

  // Last scroll positions by path
  scrollPositions: Record<string, number>;
  saveScrollPosition: (path: string, y: number) => void;

  // Redirect path after authentication
  redirectUrl: string | null;
  setRedirectUrl: (url: string | null) => void;
}

const defaultAssistant: AssistantState = {
  step: 0,
  goal: '',
  area: '',
  budget: '',
  timeline: '',
};

const defaultSearch: SearchState = {
  query: '',
  location: '',
  filters: {},
  sorting: 'POPULARITY',
  scrollPosition: 0,
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const activePathRef = useRef(location.pathname + location.search);

  // States
  const [selectedCity, setSelectedCity] = useState(() => {
    return new URLSearchParams(window.location.search).get('city') || 'Hyderabad';
  });
  const [isCustomerDrawerOpen, setCustomerDrawerOpen] = useState(false);
  const [isProviderDrawerOpen, setProviderDrawerOpen] = useState(false);
  const [isAdminDrawerOpen, setAdminDrawerOpen] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<string | null>(null);
  const [homeCollarFilter, setHomeCollarFilter] = useState<'ALL' | 'BLUE_COLLAR' | 'WHITE_COLLAR'>('ALL');
  const [homeCarouselSlide, setHomeCarouselSlide] = useState<number>(0);
  const [homeAssistant, setHomeAssistantState] = useState<AssistantState>(defaultAssistant);
  const [searchState, setSearchStateInternal] = useState<SearchState>(defaultSearch);
  const [categoryStates, setCategoryStates] = useState<Record<string, CategoryState>>({});
  const [scrollPositions, setScrollPositions] = useState<Record<string, number>>({});
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Sync selectedCity with URL param if it changes externally
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cityParam = params.get('city');
    if (cityParam && cityParam !== selectedCity) {
      startTransition(() => {
        setSelectedCity(cityParam);
      });
    }
  }, [location.search, selectedCity]);

  // Assistant setters
  const setHomeAssistant = setHomeAssistantState;
  const resetHomeAssistant = () => setHomeAssistantState(defaultAssistant);

  // Search setters
  const setSearchState = (state: Partial<SearchState>) => {
    setSearchStateInternal((prev) => ({ ...prev, ...state }));
  };
  const resetSearchState = () => setSearchStateInternal(defaultSearch);

  // Category setters
  const setCategoryState = (categoryId: string, state: Partial<CategoryState>) => {
    setCategoryStates((prev) => ({
      ...prev,
      [categoryId]: { ...prev[categoryId], ...state },
    }));
  };

  // Scroll preservation
  const saveScrollPosition = (path: string, y: number) => {
    setScrollPositions((prev) => ({ ...prev, [path]: y }));
  };

  // Scroll listener to auto-record current path scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentPath = location.pathname + location.search;
      saveScrollPosition(currentPath, window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname, location.search]);

  // Restore scroll on path change
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    activePathRef.current = currentPath;

    const savedScroll = scrollPositions[currentPath] || 0;
    
    // Use requestAnimationFrame to ensure DOM renders before scroll restoration
    const timer = setTimeout(() => {
      window.scrollTo({
        top: savedScroll,
        behavior: 'instant' as ScrollBehavior,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search, scrollPositions]);

  return (
    <NavigationContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
        isCustomerDrawerOpen,
        setCustomerDrawerOpen,
        isProviderDrawerOpen,
        setProviderDrawerOpen,
        isAdminDrawerOpen,
        setAdminDrawerOpen,
        activeWorkspaceTab,
        setActiveWorkspaceTab,
        homeCollarFilter,
        setHomeCollarFilter,
        homeCarouselSlide,
        setHomeCarouselSlide,
        homeAssistant,
        setHomeAssistant,
        resetHomeAssistant,
        searchState,
        setSearchState,
        resetSearchState,
        categoryStates,
        setCategoryState,
        scrollPositions,
        saveScrollPosition,
        redirectUrl,
        setRedirectUrl,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
