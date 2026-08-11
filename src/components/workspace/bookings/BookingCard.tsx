import { BookingStatusBadge } from './BookingStatusBadge';

interface Booking {
  id: string;
  professionalName: string;
  professionalCategory: string;
  projectTitle: string;
  serviceCategory: string;
  city: string;
  address: string;
  scheduledDate: string;
  status: string;
  amount: number;
  createdAt: string;
}

interface BookingCardProps {
  booking: Booking;
  onSelect: () => void;
}

export function BookingCard({ booking, onSelect }: BookingCardProps) {
  return (
    <div
      onClick={onSelect}
      className="bg-white border border-stone-200 hover:border-emerald-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200 text-left cursor-pointer flex flex-col justify-between gap-4 group"
    >
      <div className="space-y-2">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-0.5 min-w-0">
            <h4 className="text-xs font-black text-stone-900 leading-snug group-hover:text-emerald-800 transition truncate">
              {booking.projectTitle}
            </h4>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="inline-block text-[8px] font-black uppercase bg-stone-100 text-stone-600 border border-stone-200 px-2 py-0.5 rounded">
                {booking.serviceCategory}
              </span>
              <span className="inline-block text-[8px] font-black uppercase text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                Pro: {booking.professionalName}
              </span>
            </div>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>

        <p className="text-[10px] text-stone-500 font-semibold leading-relaxed">
          Scheduled for: <span className="font-bold text-stone-700">{new Date(booking.scheduledDate).toLocaleDateString()}</span> • Location: {booking.city}
        </p>
      </div>

      <div className="border-t border-stone-100 pt-3 flex justify-between items-center text-[9px] font-bold text-stone-400 uppercase tracking-wider">
        <span>Amount: ₹{booking.amount.toLocaleString()}</span>
        <span>ID: {booking.id}</span>
      </div>
    </div>
  );
}
