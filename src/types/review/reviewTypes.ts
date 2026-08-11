export interface Review {
  id: string;
  customerId: string;
  providerId: string;
  bookingId: string | null;
  consultationBookingId: string | null;
  rating: number;
  reviewTitle: string;
  reviewDescription: string;
  wouldRecommend: boolean;
  providerResponse: string | null;
  isVerified: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  customer?: {
    fullName: string;
  };
  provider?: {
    fullName: string;
    businessName: string | null;
  };
}

export interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  rating1Count: number;
  rating2Count: number;
  rating3Count: number;
  rating4Count: number;
  rating5Count: number;
}

export interface SubmitReviewRequest {
  providerId: string;
  bookingId?: string;
  consultationBookingId?: string;
  rating: number;
  reviewTitle: string;
  reviewDescription: string;
  wouldRecommend?: boolean;
}
