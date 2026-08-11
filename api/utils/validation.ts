export interface ValidationError {
  field: string;
  message: string;
}

export function validateCustomerProfileInput(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];
  const fullName = data.fullName as string | undefined;
  const phoneNumber = data.phoneNumber as string | undefined;
  const city = data.city as string | undefined;
  const state = data.state as string | undefined;
  const pincode = data.pincode as string | undefined;

  if (!fullName || fullName.trim().length === 0) {
    errors.push({ field: 'fullName', message: 'Full name is required' });
  }

  if (!phoneNumber) {
    errors.push({ field: 'phoneNumber', message: 'Phone number is required' });
  } else if (!validatePhone(phoneNumber)) {
    errors.push({ field: 'phoneNumber', message: 'Invalid phone number format. Must be 10-15 digits' });
  }

  if (!city || city.trim().length === 0) {
    errors.push({ field: 'city', message: 'City is required' });
  }

  if (!state || state.trim().length === 0) {
    errors.push({ field: 'state', message: 'State is required' });
  }

  if (!pincode) {
    errors.push({ field: 'pincode', message: 'Pincode is required' });
  } else if (!validatePincode(pincode)) {
    errors.push({ field: 'pincode', message: 'Pincode must be exactly 5 or 6 digits' });
  }

  return errors;
}

export function validateProviderProfileInput(data: Record<string, unknown>, isConsultant = false): ValidationError[] {
  const errors: ValidationError[] = [];
  const fullName = data.fullName as string | undefined;
  const phoneNumber = data.phoneNumber as string | undefined;
  const city = data.city as string | undefined;
  const state = data.state as string | undefined;
  const experienceYears = data.experienceYears as number | string | undefined;
  const categoryId = data.categoryId as string | number | undefined;
  const consultationFee = data.consultationFee as number | string | undefined;

  if (!fullName || fullName.trim().length === 0) {
    errors.push({ field: 'fullName', message: 'Full name is required' });
  }

  if (!phoneNumber) {
    errors.push({ field: 'phoneNumber', message: 'Phone number is required' });
  } else if (!validatePhone(phoneNumber)) {
    errors.push({ field: 'phoneNumber', message: 'Invalid phone number format. Must be 10-15 digits' });
  }

  if (!city || city.trim().length === 0) {
    errors.push({ field: 'city', message: 'City is required' });
  }

  if (!state || state.trim().length === 0) {
    errors.push({ field: 'state', message: 'State is required' });
  }

  if (experienceYears === undefined || experienceYears === null) {
    errors.push({ field: 'experienceYears', message: 'Experience years is required' });
  } else if (Number(experienceYears) < 0) {
    errors.push({ field: 'experienceYears', message: 'Experience years cannot be negative' });
  }

  if (!categoryId) {
    errors.push({ field: 'categoryId', message: 'Service category is required' });
  }

  if (isConsultant) {
    if (consultationFee === undefined || consultationFee === null) {
      errors.push({ field: 'consultationFee', message: 'Consultation fee is required for consultants' });
    } else if (Number(consultationFee) < 0) {
      errors.push({ field: 'consultationFee', message: 'Consultation fee cannot be negative' });
    }
  }

  return errors;
}

function validatePhone(phone: string): boolean {
  return /^\+?[0-9]{10,15}$/.test(phone);
}

function validatePincode(pincode: string): boolean {
  return /^[0-9]{5,6}$/.test(pincode);
}

/**
 * Sanitizes input string to prevent XSS.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates password strength to enforce enterprise security policy.
 */
export function validatePasswordStrength(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number.');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character.');
  }
  return errors;
}

/**
 * Validates uploaded files to ensure they conform to allowed formats and size.
 */
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateUploadedFile(fileName: string, fileSize: number, fileMimeType: string): FileValidationResult {
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.dwg', '.dxf'];
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/x-dwg',
    'image/vnd.dwg',
    'image/x-dxf'
  ];

  if (fileSize > maxSizeBytes) {
    return { isValid: false, error: 'File size exceeds limit of 10MB.' };
  }

  const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  if (!allowedExtensions.includes(fileExt) || !allowedMimeTypes.includes(fileMimeType)) {
    return { isValid: false, error: 'File extension or type is not allowed.' };
  }

  return { isValid: true };
}
