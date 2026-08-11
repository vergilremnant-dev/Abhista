import { useState, useEffect } from 'react';
import ConsultationRequestsPage from '../consultant/ConsultationRequestsPage';
import RequirementMarketplace from './RequirementMarketplace';

export default function ProfessionalLeads() {
  const [workspaceView, setWorkspaceView] = useState<'PRO' | 'CONSULTANT'>(() => {
    return (localStorage.getItem('dbc_provider_view') as 'PRO' | 'CONSULTANT') || 'PRO';
  });

  useEffect(() => {
    const handleStorage = () => {
      setWorkspaceView((localStorage.getItem('dbc_provider_view') as 'PRO' | 'CONSULTANT') || 'PRO');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-left relative pb-10 animate-gentle-fade">
      {workspaceView === 'CONSULTANT' ? (
        <ConsultationRequestsPage />
      ) : (
        <RequirementMarketplace />
      )}
    </div>
  );
}
