import { useState } from 'react';

/** Typed payload emitted when registration is complete. */
export interface RegisterPayload {
  role: 'ROLE_CUSTOMER' | 'ROLE_PROVIDER';
  firstName: string;
  lastName?: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  city?: string;
  categoryId?: string;
  [key: string]: unknown;
}

interface RegisterWizardProps {
  onRegisterComplete: (payload: RegisterPayload) => void;
  onBackToLogin: () => void;
}

export function RegisterWizard({ onRegisterComplete, onBackToLogin }: RegisterWizardProps) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'CUSTOMER' | 'PROVIDER' | 'CONSULTANT'>('CUSTOMER');

  // Form Field States
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Customer adaptive fields
    preferredCity: 'Hyderabad',
    projectInterest: 'Build a New Home',
    // Provider adaptive fields
    skills: 'Plumbing Systems',
    experienceYears: 5,
    // Consultant adaptive fields
    specialization: 'Villa Layout Blueprints',
    consultationFee: 1000,
  });

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getPasswordStrength = () => {
    const len = formData.password.length;
    if (len === 0) return { label: 'None', color: 'bg-light-stone' };
    if (len < 6) return { label: 'Weak', color: 'bg-rose-500' };
    if (len < 10) return { label: 'Good', color: 'bg-amber-500' };
    return { label: 'Strong', color: 'bg-brand-emerald' };
  };

  const handleNextStep = () => {
    if (step === 2) {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match.');
        return;
      }
      if (formData.password.length < 6) {
        alert('Password must be at least 6 characters.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate user payload registration success
    const finalPayload: RegisterPayload = {
      ...formData,
      role: role === 'PROVIDER' ? 'ROLE_PROVIDER' : role === 'CONSULTANT' ? 'ROLE_PROVIDER' : 'ROLE_CUSTOMER',
    };
    onRegisterComplete(finalPayload);
    setStep(5); // Show success verification screen
  };

  const strength = getPasswordStrength();

  return (
    <div className="space-y-6 text-left animate-gentle-fade">
      
      {/* Progress indicators stepper */}
      {step < 5 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-stone-gray">
            <span>Setup Step {step} of 4</span>
            <span>{Math.round((step / 4) * 100)}% Setup</span>
          </div>
          <div className="dbc-progress-bar">
            <div
              className="dbc-progress-fill"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 1: Account Type Selection */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-black">Select Account Type</h3>
            <p className="text-[10px] text-stone-gray font-semibold">Choose the profile pathway matching your objective.</p>
          </div>

          <div className="grid gap-3 grid-cols-1">
            {[
              { type: 'CUSTOMER', title: 'Customer Profile', icon: '👤', desc: 'Hire professionals, post project requirements, and compare verified contractor quotes.' },
              { type: 'PROVIDER', title: 'Professional Trade Partner', icon: '👷', desc: 'List manual trade services (plumbing, electrical, brickwork) and receive customer leads.' },
              { type: 'CONSULTANT', title: 'Architect & Layout Consultant', icon: '📐', desc: 'Schedule design consultations, review spatial blueprint drafts, and coordinate layouts.' },
            ].map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => setRole(opt.type as 'CUSTOMER' | 'PROVIDER' | 'CONSULTANT')}
                className={`p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer flex gap-3.5 items-start ${
                  role === opt.type
                    ? 'border-brand-emerald bg-brand-emerald/5 shadow-apple-sm'
                    : 'border-light-border bg-white hover:bg-light-stone/20'
                }`}
              >
                <span className="text-xl p-1 bg-white border border-light-border rounded-xl">{opt.icon}</span>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-stone-black leading-snug">{opt.title}</h4>
                  <p className="text-[10px] text-stone-gray mt-0.5 leading-relaxed font-semibold">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-light-border/40 flex justify-between">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-xs font-black text-stone-gray hover:text-stone-black uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="dbc-btn dbc-btn-primary py-2 px-5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Basic credentials input */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-black">Credential Details</h3>
            <p className="text-[10px] text-stone-gray font-semibold">Enter your secure identification details below.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="reg-firstName" className="block text-[8px] font-black uppercase tracking-widest text-stone-gray">First Name</label>
              <input
                id="reg-firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleFieldChange}
                required
                className="w-full text-xs bg-white border border-light-border rounded-lg px-3 py-2 outline-none focus:border-brand-emerald"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="reg-lastName" className="block text-[8px] font-black uppercase tracking-widest text-stone-gray">Last Name</label>
              <input
                id="reg-lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleFieldChange}
                required
                className="w-full text-xs bg-white border border-light-border rounded-lg px-3 py-2 outline-none focus:border-brand-emerald"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="reg-email" className="block text-[8px] font-black uppercase tracking-widest text-stone-gray">Email Address</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFieldChange}
              required
              className="w-full text-xs bg-white border border-light-border rounded-lg px-3.5 py-2 outline-none focus:border-brand-emerald"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="reg-phone" className="block text-[8px] font-black uppercase tracking-widest text-stone-gray">Phone Contact</label>
            <input
              id="reg-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleFieldChange}
              required
              className="w-full text-xs bg-white border border-light-border rounded-lg px-3.5 py-2 outline-none focus:border-brand-emerald"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="reg-password" className="block text-[8px] font-black uppercase tracking-widest text-stone-gray">Password</label>
              <input
                id="reg-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleFieldChange}
                required
                className="w-full text-xs bg-white border border-light-border rounded-lg px-3 py-2 outline-none focus:border-brand-emerald"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="reg-confirmPassword" className="block text-[8px] font-black uppercase tracking-widest text-stone-gray">Confirm Pass</label>
              <input
                id="reg-confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleFieldChange}
                required
                className="w-full text-xs bg-white border border-light-border rounded-lg px-3 py-2 outline-none focus:border-brand-emerald"
              />
            </div>
          </div>

          {/* Strength Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[8px] font-black uppercase text-stone-gray">
              <span>Security Rating</span>
              <span className="font-extrabold">{strength.label}</span>
            </div>
            <div className="h-1 w-full bg-light-stone rounded-full overflow-hidden">
              <div className={`h-full ${strength.color}`} style={{ width: formData.password.length > 0 ? `${Math.min(100, formData.password.length * 10)}%` : '0%' }}></div>
            </div>
          </div>

          <div className="pt-4 border-t border-light-border/40 flex justify-between">
            <button
              type="button"
              onClick={handlePrevStep}
              className="text-xs font-black text-stone-gray hover:text-stone-black uppercase tracking-wider cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="dbc-btn dbc-btn-primary py-2 px-5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Role Adaptive Selection */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-black">Role Information</h3>
            <p className="text-[10px] text-stone-gray font-semibold">Tell us about your coordination preferences.</p>
          </div>

          {role === 'CUSTOMER' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="customer-city" className="block text-[8px] font-black uppercase tracking-widest text-stone-gray">Primary Region</label>
                <select
                  id="customer-city"
                  name="preferredCity"
                  value={formData.preferredCity}
                  onChange={handleFieldChange}
                  className="w-full text-xs bg-white border border-light-border rounded-lg p-2 focus:outline-none"
                >
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Chennai">Chennai</option>
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="customer-project" className="block text-[8px] font-black uppercase tracking-widest text-stone-gray">Project Focus</label>
                <select
                  id="customer-project"
                  name="projectInterest"
                  value={formData.projectInterest}
                  onChange={handleFieldChange}
                  className="w-full text-xs bg-white border border-light-border rounded-lg p-2 focus:outline-none"
                >
                  <option value="Build a New Home">Build a New Home</option>
                  <option value="Renovate My Home">Renovate My Home</option>
                  <option value="Interior Design">Interior Design</option>
                </select>
              </div>
            </div>
          )}

          {role === 'PROVIDER' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="provider-skills" className="block text-[8px] font-black uppercase tracking-widest text-stone-gray">Primary Skillset</label>
                <select
                  id="provider-skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleFieldChange}
                  className="w-full text-xs bg-white border border-light-border rounded-lg p-2 focus:outline-none"
                >
                  <option value="Plumbing Systems">Plumbing Systems</option>
                  <option value="Electrical Fitouts">Electrical Fitouts</option>
                  <option value="Carpentry & Woods">Carpentry & Woods</option>
                  <option value="Wall Painting">Wall Painting</option>
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="provider-experience" className="block text-[8px] font-black uppercase tracking-widest text-stone-gray">Experience Years</label>
                <input
                  id="provider-experience"
                  type="number"
                  name="experienceYears"
                  min="1"
                  max="40"
                  value={formData.experienceYears}
                  onChange={handleFieldChange}
                  className="w-full text-xs bg-white border border-light-border rounded-lg px-3 py-2 outline-none"
                />
              </div>
            </div>
          )}

          {role === 'CONSULTANT' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="consultant-spec" className="block text-[8px] font-black uppercase tracking-widest text-stone-gray">Specialization Area</label>
                <input
                  id="consultant-spec"
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleFieldChange}
                  className="w-full text-xs bg-white border border-light-border rounded-lg px-3 py-2 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="consultant-fee" className="block text-[8px] font-black uppercase tracking-widest text-stone-gray">Target Consultation Fee (₹)</label>
                <input
                  id="consultant-fee"
                  type="number"
                  name="consultationFee"
                  min="100"
                  max="10000"
                  value={formData.consultationFee}
                  onChange={handleFieldChange}
                  className="w-full text-xs bg-white border border-light-border rounded-lg px-3 py-2 outline-none"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-light-border/40 flex justify-between">
            <button
              type="button"
              onClick={handlePrevStep}
              className="text-xs font-black text-stone-gray hover:text-stone-black uppercase tracking-wider cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="dbc-btn dbc-btn-primary py-2 px-5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Review and Submit */}
      {step === 4 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-black">Review Details</h3>
            <p className="text-[10px] text-stone-gray font-semibold">Confirm your details before activation.</p>
          </div>

          <div className="space-y-2.5 p-4 rounded-2xl border border-light-border bg-light-stone/30 text-stone-gray text-[10px] font-semibold">
            <p className="flex justify-between">
              <span>Account Type:</span>
              <strong className="text-stone-black">{role}</strong>
            </p>
            <p className="flex justify-between">
              <span>Full Name:</span>
              <strong className="text-stone-black">{formData.firstName} {formData.lastName}</strong>
            </p>
            <p className="flex justify-between">
              <span>Email:</span>
              <strong className="text-stone-black">{formData.email}</strong>
            </p>
            <p className="flex justify-between">
              <span>Contact:</span>
              <strong className="text-stone-black">{formData.phone}</strong>
            </p>
            {role === 'CUSTOMER' ? (
              <p className="flex justify-between">
                <span>Preferred Region:</span>
                <strong className="text-stone-black">{formData.preferredCity}</strong>
              </p>
            ) : role === 'PROVIDER' ? (
              <p className="flex justify-between">
                <span>Skillset:</span>
                <strong className="text-stone-black">{formData.skills}</strong>
              </p>
            ) : (
              <p className="flex justify-between">
                <span>Specialization:</span>
                <strong className="text-stone-black">{formData.specialization}</strong>
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-light-border/40 flex justify-between">
            <button
              type="button"
              onClick={handlePrevStep}
              className="text-xs font-black text-stone-gray hover:text-stone-black uppercase tracking-wider cursor-pointer"
            >
              Back
            </button>
            <button
              type="submit"
              className="dbc-btn dbc-btn-primary py-2 px-5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Submit & Register
            </button>
          </div>
        </form>
      )}

      {/* STEP 5: Success Verification Screen */}
      {step === 5 && (
        <div className="space-y-6 text-center py-6">
          <div className="flex justify-center">
            <span className="text-4xl p-2 bg-brand-emerald/10 text-brand-emerald rounded-full">✓</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-stone-black">Verification Email Sent</h3>
            <p className="text-xs text-stone-gray font-semibold leading-relaxed max-w-[280px] mx-auto">
              We have dispatched a validation link to <span className="font-extrabold text-stone-black">{formData.email}</span>. Click the link inside to secure your workspace setup.
            </p>
          </div>
          <button
            onClick={onBackToLogin}
            className="dbc-btn dbc-btn-outline py-2 px-6 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer bg-white"
          >
            Back to Login
          </button>
        </div>
      )}

    </div>
  );
}
