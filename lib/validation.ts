// Form validation utilities with comprehensive error handling

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

export interface FileValidationOptions {
  allowedTypes?: string[];
  maxSize?: number; // in bytes
  minSize?: number; // in bytes
  allowedExtensions?: string[];
}

// File validation
export function validateFile(
  file: File | null,
  options: FileValidationOptions = {}
): ValidationResult {
  const errors: Record<string, string> = {};

  const {
    allowedTypes = ["image/jpeg", "image/png", "application/pdf"],
    maxSize = 10 * 1024 * 1024, // 10MB default
    minSize = 1024, // 1KB minimum
    allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"],
  } = options;

  if (!file) {
    errors.file = "Please select a file to upload";
    return { isValid: false, errors };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const typeList = allowedTypes
      .map((type) => type.split("/")[1].toUpperCase())
      .join(", ");
    errors.file = `Please upload a ${typeList} file`;
    return { isValid: false, errors };
  }

  // Check file extension
  const fileExtension = file.name
    .toLowerCase()
    .substring(file.name.lastIndexOf("."));
  if (!allowedExtensions.includes(fileExtension)) {
    const extList = allowedExtensions.join(", ");
    errors.file = `File must have one of these extensions: ${extList}`;
    return { isValid: false, errors };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);
    errors.file = `File size must be less than ${maxSizeMB}MB`;
    return { isValid: false, errors };
  }

  if (file.size < minSize) {
    const minSizeKB = (minSize / 1024).toFixed(1);
    errors.file = `File size must be at least ${minSizeKB}KB`;
    return { isValid: false, errors };
  }

  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.(exe|bat|cmd|scr|pif|com)$/i,
    /[<>:"|?*]/,
    /^\./,
    /\s+$/,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      errors.file = "Invalid file name. Please rename your file and try again.";
      return { isValid: false, errors };
    }
  }

  return { isValid: true, errors: {} };
}

// Email validation
export function validateEmail(email: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!email) {
    errors.email = "Email is required";
    return { isValid: false, errors };
  }

  if (email.length > 254) {
    errors.email = "Email address is too long";
    return { isValid: false, errors };
  }

  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email)) {
    errors.email = "Please enter a valid email address";
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
}

// Password validation
export function validatePassword(password: string): ValidationResult {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  if (!password) {
    errors.password = "Password is required";
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.password = "Password must be at least 8 characters long";
    return { isValid: false, errors };
  }

  if (password.length > 128) {
    errors.password = "Password is too long (maximum 128 characters)";
    return { isValid: false, errors };
  }

  // Check for common weak passwords
  const commonPasswords = [
    "password",
    "123456",
    "123456789",
    "12345678",
    "12345",
    "1234567",
    "admin",
    "qwerty",
    "abc123",
    "password123",
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.password = "Please choose a stronger password";
    return { isValid: false, errors };
  }

  // Strength checks (warnings, not errors)
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strengthScore = [
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
  ].filter(Boolean).length;

  if (strengthScore < 3) {
    warnings.password =
      "Consider using uppercase, lowercase, numbers, and special characters for a stronger password";
  }

  return { isValid: true, errors: {}, warnings };
}

// Name validation
export function validateName(
  name: string,
  fieldName: string = "Name"
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!name || !name.trim()) {
    errors.name = `${fieldName} is required`;
    return { isValid: false, errors };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    errors.name = `${fieldName} must be at least 2 characters long`;
    return { isValid: false, errors };
  }

  if (trimmedName.length > 50) {
    errors.name = `${fieldName} must be less than 50 characters`;
    return { isValid: false, errors };
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(trimmedName)) {
    errors.name = `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
}

// Age validation
export function validateAge(age: string | number): ValidationResult {
  const errors: Record<string, string> = {};

  const ageNum = typeof age === "string" ? parseInt(age, 10) : age;

  if (isNaN(ageNum)) {
    errors.age = "Please enter a valid age";
    return { isValid: false, errors };
  }

  if (ageNum < 1) {
    errors.age = "Age must be at least 1 year";
    return { isValid: false, errors };
  }

  if (ageNum > 150) {
    errors.age = "Please enter a valid age";
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
}

// Generic required field validation
export function validateRequired(
  value: any,
  fieldName: string
): ValidationResult {
  const errors: Record<string, string> = {};

  if (
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "string" && !value.trim())
  ) {
    errors[fieldName.toLowerCase()] = `${fieldName} is required`;
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
}

// Combine multiple validation results
export function combineValidationResults(
  ...results: ValidationResult[]
): ValidationResult {
  const combinedErrors: Record<string, string> = {};
  const combinedWarnings: Record<string, string> = {};
  let isValid = true;

  for (const result of results) {
    if (!result.isValid) {
      isValid = false;
    }

    Object.assign(combinedErrors, result.errors);

    if (result.warnings) {
      Object.assign(combinedWarnings, result.warnings);
    }
  }

  return {
    isValid,
    errors: combinedErrors,
    warnings:
      Object.keys(combinedWarnings).length > 0 ? combinedWarnings : undefined,
  };
}

// Form validation for registration
export function validateRegistrationForm(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}): ValidationResult {
  const nameResult = validateName(data.name);
  const emailResult = validateEmail(data.email);
  const passwordResult = validatePassword(data.password);

  let confirmPasswordResult: ValidationResult = { isValid: true, errors: {} };

  if (data.confirmPassword !== undefined) {
    if (data.password !== data.confirmPassword) {
      confirmPasswordResult = {
        isValid: false,
        errors: { confirmPassword: "Passwords do not match" },
      };
    }
  }

  return combineValidationResults(
    nameResult,
    emailResult,
    passwordResult,
    confirmPasswordResult
  );
}

// Form validation for login
export function validateLoginForm(data: {
  email: string;
  password: string;
}): ValidationResult {
  const emailResult = validateEmail(data.email);
  const passwordRequired = validateRequired(data.password, "Password");

  return combineValidationResults(emailResult, passwordRequired);
}

// Risk assessment form validation
export function validateRiskAssessmentForm(data: {
  reportAnalysisId?: string;
  faceAnalysisId?: string;
  age?: string;
  gender?: string;
  symptoms?: string;
  includeReport?: boolean;
  includeFace?: boolean;
}): ValidationResult {
  const errors: Record<string, string> = {};

  const includeReport = data.includeReport ?? false;
  const includeFace = data.includeFace ?? false;

  // At least one source must be selected
  if (!includeReport && !includeFace) {
    errors.source = "Select at least one analysis source (face or report)";
  }

  // Validate selected sources have IDs
  if (includeReport && !data.reportAnalysisId) {
    errors.reportAnalysisId = "Please select a report analysis";
  }

  if (includeFace && !data.faceAnalysisId) {
    errors.faceAnalysisId = "Please select a face analysis";
  }

  if (!data.age || !data.age.trim()) {
    errors.age = "Please provide your age";
  } else {
    const ageResult = validateAge(data.age);
    if (!ageResult.isValid) {
      Object.assign(errors, ageResult.errors);
    }
  }

  if (!data.gender || !data.gender.trim()) {
    errors.gender = "Please select your gender";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .substring(0, 1000); // Limit length
}

// Check if error is a validation error vs system error
export function isValidationError(error: any): boolean {
  return (
    error &&
    typeof error === "object" &&
    "errorType" in error &&
    error.errorType === "validation"
  );
}

// Format error message for display
export function formatErrorMessage(error: any): string {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    if (error.message) {
      return error.message;
    }

    if (error.error) {
      return error.error;
    }

    if (error.detail) {
      return error.detail;
    }
  }

  return "An unexpected error occurred";
}

// Validate URL format
export function validateUrl(url: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!url) {
    errors.url = "URL is required";
    return { isValid: false, errors };
  }

  try {
    new URL(url);
  } catch {
    errors.url = "Please enter a valid URL";
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
}

// Validate phone number (basic format)
export function validatePhoneNumber(phone: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!phone) {
    errors.phone = "Phone number is required";
    return { isValid: false, errors };
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, "");

  if (digitsOnly.length < 10) {
    errors.phone = "Phone number must be at least 10 digits";
    return { isValid: false, errors };
  }

  if (digitsOnly.length > 15) {
    errors.phone = "Phone number is too long";
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
}

// Validate date range
export function validateDateRange(
  startDate: string,
  endDate: string
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!startDate) {
    errors.startDate = "Start date is required";
  }

  if (!endDate) {
    errors.endDate = "End date is required";
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      errors.startDate = "Invalid start date";
    }

    if (isNaN(end.getTime())) {
      errors.endDate = "Invalid end date";
    }

    if (start.getTime() > end.getTime()) {
      errors.endDate = "End date must be after start date";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Validate array has minimum length
export function validateArrayMinLength<T>(
  array: T[],
  minLength: number,
  fieldName: string
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!Array.isArray(array) || array.length < minLength) {
    errors[
      fieldName.toLowerCase()
    ] = `${fieldName} must have at least ${minLength} item${
      minLength === 1 ? "" : "s"
    }`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Validate object has required properties
export function validateRequiredProperties(
  obj: any,
  requiredProps: string[],
  objectName: string = "Object"
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!obj || typeof obj !== "object") {
    errors.object = `${objectName} is required`;
    return { isValid: false, errors };
  }

  for (const prop of requiredProps) {
    if (!(prop in obj) || obj[prop] === null || obj[prop] === undefined) {
      errors[prop] = `${prop} is required`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Validate JSON string
export function validateJsonString(jsonString: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!jsonString) {
    errors.json = "JSON string is required";
    return { isValid: false, errors };
  }

  try {
    JSON.parse(jsonString);
  } catch (e) {
    errors.json = "Invalid JSON format";
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
}

// Comprehensive form validation with custom rules
export function validateFormWithRules<T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, (value: any) => ValidationResult>
): ValidationResult {
  const allErrors: Record<string, string> = {};
  const allWarnings: Record<string, string> = {};
  let isValid = true;

  for (const [field, validator] of Object.entries(rules)) {
    const result = validator(data[field]);

    if (!result.isValid) {
      isValid = false;
      Object.assign(allErrors, result.errors);
    }

    if (result.warnings) {
      Object.assign(allWarnings, result.warnings);
    }
  }

  return {
    isValid,
    errors: allErrors,
    warnings: Object.keys(allWarnings).length > 0 ? allWarnings : undefined,
  };
}
