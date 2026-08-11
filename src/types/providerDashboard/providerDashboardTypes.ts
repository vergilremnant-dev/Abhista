export interface ProviderDashboardOverview {
  pendingBookings: number;
  acceptedBookings: number;
  todayBookings: number;
  upcomingConsultations: number;
  averageRating: number;
  totalReviews: number;
  portfolioViews: number;
  profileViews: number;
  activeSubscription: string;
  profileCompletionPercentage: number;
}

export interface ProviderPerformance {
  bookingTrends: { month: string; count: number }[];
  consultationTrends: { month: string; count: number }[];
  monthlyRatings: { month: string; avgRating: number }[];
  repeatCustomers: number;
}

export interface ProviderCalendarItem {
  id?: string;
  title: string;
  date: string;
  time?: string;
  type: 'BOOKING' | 'CONSULTATION' | 'BLOCKED';
  reference?: string;
  reason?: string;
}

export interface ProviderCalendar {
  bookings: ProviderCalendarItem[];
  consultations: ProviderCalendarItem[];
  blockedDates: ProviderCalendarItem[];
}
