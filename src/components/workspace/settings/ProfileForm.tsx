import { useState } from 'react';

export interface PersonalInfoData {
  firstName: string;
  lastName: string;
  displayName: string;
  gender: string;
  dob: string;
  bio: string;
}

interface ProfileFormProps {
  initialValues: PersonalInfoData;
  onSubmit: (values: PersonalInfoData) => void;
  onCancel?: () => void;
  saving?: boolean;
}

export function ProfileForm({ initialValues, onSubmit, onCancel, saving = false }: ProfileFormProps) {
  const [values, setValues] = useState<PersonalInfoData>(initialValues);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!values.firstName.trim()) {
      setError('First name is required.');
      return;
    }
    if (!values.lastName.trim()) {
      setError('Last name is required.');
      return;
    }

    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-stone-700 text-left">
      <h3 className="text-sm font-bold text-stone-900 font-serif border-b border-stone-100 pb-2">
        Personal Details
      </h3>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 text-[11px] font-bold p-3 rounded-xl">
          ⚠️ {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-[10px] uppercase font-bold text-stone-400">First Name *</label>
          <input
            type="text"
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            placeholder="e.g. Sanjay"
            required
            className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-900 outline-none focus:border-stone-450 transition"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] uppercase font-bold text-stone-400">Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            placeholder="e.g. Chagantipati"
            required
            className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-900 outline-none focus:border-stone-450 transition"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-[10px] uppercase font-bold text-stone-400">Display Name</label>
          <input
            type="text"
            name="displayName"
            value={values.displayName}
            onChange={handleChange}
            placeholder="e.g. Sanjay C"
            className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-900 outline-none focus:border-stone-450 transition"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] uppercase font-bold text-stone-400">Gender</label>
          <select
            name="gender"
            value={values.gender}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-900 focus:outline-none"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other / Rather not say</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] uppercase font-bold text-stone-400">Date of Birth</label>
        <input
          type="date"
          name="dob"
          value={values.dob}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-900 outline-none focus:outline-none"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] uppercase font-bold text-stone-400">Biography</label>
        <textarea
          name="bio"
          value={values.bio}
          onChange={handleChange}
          placeholder="Brief description about yourself..."
          rows={3}
          className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-900 outline-none focus:border-stone-450 transition resize-none"
        />
      </div>

      <div className="flex gap-2.5 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 transition duration-200 cursor-pointer shadow-sm disabled:opacity-50"
        >
          {saving ? 'Saving Changes...' : 'Save Changes'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 font-bold text-xs uppercase tracking-wider px-6 py-3 transition duration-200 cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
