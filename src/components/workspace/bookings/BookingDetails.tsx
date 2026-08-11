import { BookingStatusBadge } from './BookingStatusBadge';
import { BookingTimeline } from './BookingTimeline';

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

interface BookingDetailsProps {
  booking: Booking;
  onClose: () => void;
  onReschedule: () => void;
  onCancel: () => void;
}

export function BookingDetails({ booking, onClose, onReschedule, onCancel }: BookingDetailsProps) {
  const norm = booking.status.trim().toLowerCase();
  const canRescheduleOrCancel = ['confirmed', 'scheduled'].includes(norm);

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-lg p-6 space-y-6 text-left transition duration-200">
      
      {/* Header and Close */}
      <div className="flex justify-between items-start gap-4 border-b border-stone-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-stone-900 font-serif">{booking.projectTitle}</h3>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="text-[9px] font-black uppercase text-stone-400 tracking-wider">
            Booking ID: {booking.id}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-stone-700 h-6 w-6 rounded-full hover:bg-stone-50 border border-stone-150 flex items-center justify-center transition cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Main Metadata Grid */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="space-y-0.5">
          <span className="block text-[8px] uppercase font-black text-stone-400 tracking-wider">Professional Assignment</span>
          <span className="block font-bold text-stone-700">{booking.professionalName}</span>
          <span className="block text-[8px] text-stone-400 font-semibold">{booking.professionalCategory}</span>
        </div>
        <div className="space-y-0.5">
          <span className="block text-[8px] uppercase font-black text-stone-400 tracking-wider">Service Scope</span>
          <span className="block font-bold text-stone-700">{booking.serviceCategory}</span>
        </div>
        <div className="space-y-0.5">
          <span className="block text-[8px] uppercase font-black text-stone-400 tracking-wider">Total Service Fee</span>
          <span className="block font-bold text-stone-750">₹{booking.amount.toLocaleString()}</span>
        </div>
        <div className="space-y-0.5">
          <span className="block text-[8px] uppercase font-black text-stone-400 tracking-wider">Scheduled Date</span>
          <span className="block font-bold text-stone-700">{new Date(booking.scheduledDate).toLocaleDateString()}</span>
        </div>
        <div className="col-span-2 space-y-0.5">
          <span className="block text-[8px] uppercase font-black text-stone-400 tracking-wider">Service Address</span>
          <span className="block font-semibold text-stone-600 leading-relaxed">{booking.address}, {booking.city}</span>
        </div>
      </div>

      {/* Visual Timeline progress bar */}
      <div className="border-t border-stone-100 pt-4">
        <BookingTimeline status={booking.status} />
      </div>

      {/* Booking Notes section */}
      <div className="space-y-1.5 border-t border-stone-100 pt-4 text-xs">
        <span className="block text-[8px] uppercase font-black text-stone-400 tracking-wider">Booking Notes</span>
        <p className="text-[10px] text-stone-500 font-semibold leading-relaxed">
          * Professional will carry all necessary structural layout equipment. Ensure the site location is cleared before the scheduled visit.
        </p>
      </div>

      {/* Payments and Messaging Placeholders */}
      <div className="grid grid-cols-2 gap-3 border-t border-stone-100 pt-4">
        <div className="border border-stone-200 rounded-xl p-3 bg-stone-50/50 space-y-1 text-center">
          <span className="block text-[8px] uppercase font-black text-stone-400 tracking-wider">Payments Info</span>
          <span className="block text-[10px] font-black text-emerald-800">💸 Paid Securely</span>
          <span className="block text-[8px] text-stone-400 font-bold uppercase tracking-wide">Secure Transaction</span>
        </div>
        <div className="border border-stone-200 rounded-xl p-3 bg-stone-50/50 space-y-1 text-center">
          <span className="block text-[8px] uppercase font-black text-stone-400 tracking-wider">Messaging Chat</span>
          <button className="text-[10px] font-bold text-emerald-700 hover:underline block mx-auto cursor-not-allowed" disabled>
            💬 Open Thread
          </button>
          <span className="block text-[8px] text-stone-400 font-bold uppercase tracking-wide">Available Post-Match</span>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-stone-100 pt-4 flex flex-col gap-2">
        {canRescheduleOrCancel && (
          <div className="flex gap-2">
            <button
              onClick={onReschedule}
              className="flex-1 bg-stone-900 hover:bg-stone-850 text-white font-bold text-[10px] px-3.5 py-2.5 rounded-xl transition uppercase tracking-wider text-center"
            >
              Reschedule Visit
            </button>
            <button
              onClick={onCancel}
              className="bg-rose-55/10 hover:bg-rose-55/20 text-rose-600 font-bold text-[10px] px-3.5 py-2.5 rounded-xl transition uppercase tracking-wider text-center border border-rose-100"
            >
              Cancel
            </button>
          </div>
        )}
        
        <button
          onClick={() => alert('Download receipt feature is a mockup indicator.')}
          className="w-full bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold text-[10px] px-3.5 py-2.5 rounded-xl transition uppercase tracking-wider text-center"
        >
          Download Receipt (PDF)
        </button>
      </div>

    </div>
  );
}
