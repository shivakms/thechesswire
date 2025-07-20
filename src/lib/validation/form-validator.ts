/**
 * Centralized Form Validation Library
 * 
 * This module provides a unified form validation interface across the entire platform.
 * It eliminates duplicate validation logic and provides consistent error handling.
 */

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FormValidationSchema {
  [fieldName: string]: ValidationRule[];
}

export class FormValidator {
  private static instance: FormValidator;

  private constructor() {}

  public static getInstance(): FormValidator {
    if (!FormValidator.instance) {
      FormValidator.instance = new FormValidator();
    }
    return FormValidator.instance;
  }

  /**
   * Validate a single field
   */
  validateField(value: any, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];

    for (const rule of rules) {
      const isValid = this.validateRule(value, rule);
      if (!isValid) {
        errors.push(rule.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate entire form
   */
  validateForm(data: Record<string, any>, schema: FormValidationSchema): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};

    for (const [fieldName, rules] of Object.entries(schema)) {
      const value = data[fieldName];
      results[fieldName] = this.validateField(value, rules);
    }

    return results;
  }

  /**
   * Check if entire form is valid
   */
  isFormValid(results: Record<string, ValidationResult>): boolean {
    return Object.values(results).every(result => result.isValid);
  }

  /**
   * Get all form errors
   */
  getAllErrors(results: Record<string, ValidationResult>): string[] {
    const allErrors: string[] = [];
    Object.values(results).forEach(result => {
      allErrors.push(...result.errors);
    });
    return allErrors;
  }

  /**
   * Validate a single rule
   */
  private validateRule(value: any, rule: ValidationRule): boolean {
    switch (rule.type) {
      case 'required':
        return this.validateRequired(value);
      
      case 'email':
        return this.validateEmail(value);
      
      case 'minLength':
        return this.validateMinLength(value, rule.value);
      
      case 'maxLength':
        return this.validateMaxLength(value, rule.value);
      
      case 'pattern':
        return this.validatePattern(value, rule.value);
      
      case 'custom':
        return rule.validator ? rule.validator(value) : true;
      
      default:
        return true;
    }
  }

  /**
   * Required field validation
   */
  private validateRequired(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  /**
   * Email validation
   */
  private validateEmail(value: any): boolean {
    if (!value) return true; // Skip if not required
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(value));
  }

  /**
   * Minimum length validation
   */
  private validateMinLength(value: any, minLength: number): boolean {
    if (!value) return true; // Skip if not required
    return String(value).length >= minLength;
  }

  /**
   * Maximum length validation
   */
  private validateMaxLength(value: any, maxLength: number): boolean {
    if (!value) return true; // Skip if not required
    return String(value).length <= maxLength;
  }

  /**
   * Pattern validation
   */
  private validatePattern(value: any, pattern: RegExp): boolean {
    if (!value) return true; // Skip if not required
    return pattern.test(String(value));
  }

  /**
   * Predefined validation schemas
   */
  static getSchemas() {
    return {
      login: {
        email: [
          { type: 'required', message: 'Email is required' },
          { type: 'email', message: 'Please enter a valid email address' }
        ],
        password: [
          { type: 'required', message: 'Password is required' }
        ]
      },

      register: {
        username: [
          { type: 'required', message: 'Username is required' },
          { type: 'minLength', value: 3, message: 'Username must be at least 3 characters' },
          { type: 'maxLength', value: 30, message: 'Username must be less than 30 characters' },
          { 
            type: 'pattern', 
            value: /^[a-zA-Z0-9_-]+$/, 
            message: 'Username can only contain letters, numbers, hyphens, and underscores' 
          }
        ],
        email: [
          { type: 'required', message: 'Email is required' },
          { type: 'email', message: 'Please enter a valid email address' }
        ],
        password: [
          { type: 'required', message: 'Password is required' },
          { type: 'minLength', value: 12, message: 'Password must be at least 12 characters' },
          { 
            type: 'pattern', 
            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
            message: 'Password must contain uppercase, lowercase, number, and special character' 
          }
        ],
        confirmPassword: [
          { type: 'required', message: 'Please confirm your password' }
        ]
      },

      profile: {
        username: [
          { type: 'minLength', value: 3, message: 'Username must be at least 3 characters' },
          { type: 'maxLength', value: 30, message: 'Username must be less than 30 characters' },
          { 
            type: 'pattern', 
            value: /^[a-zA-Z0-9_-]+$/, 
            message: 'Username can only contain letters, numbers, hyphens, and underscores' 
          }
        ],
        email: [
          { type: 'email', message: 'Please enter a valid email address' }
        ],
        bio: [
          { type: 'maxLength', value: 500, message: 'Bio must be less than 500 characters' }
        ]
      },

      passwordChange: {
        currentPassword: [
          { type: 'required', message: 'Current password is required' }
        ],
        newPassword: [
          { type: 'required', message: 'New password is required' },
          { type: 'minLength', value: 12, message: 'Password must be at least 12 characters' },
          { 
            type: 'pattern', 
            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
            message: 'Password must contain uppercase, lowercase, number, and special character' 
          }
        ],
        confirmPassword: [
          { type: 'required', message: 'Please confirm your new password' }
        ]
      },

      contact: {
        name: [
          { type: 'required', message: 'Name is required' },
          { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' },
          { type: 'maxLength', value: 100, message: 'Name must be less than 100 characters' }
        ],
        email: [
          { type: 'required', message: 'Email is required' },
          { type: 'email', message: 'Please enter a valid email address' }
        ],
        subject: [
          { type: 'required', message: 'Subject is required' },
          { type: 'minLength', value: 5, message: 'Subject must be at least 5 characters' },
          { type: 'maxLength', value: 200, message: 'Subject must be less than 200 characters' }
        ],
        message: [
          { type: 'required', message: 'Message is required' },
          { type: 'minLength', value: 10, message: 'Message must be at least 10 characters' },
          { type: 'maxLength', value: 2000, message: 'Message must be less than 2000 characters' }
        ]
      },

      pgnUpload: {
        pgn: [
          { type: 'required', message: 'PGN content is required' },
          { type: 'minLength', value: 10, message: 'PGN content seems too short' },
          { 
            type: 'custom', 
            message: 'Invalid PGN format',
            validator: (value: string) => {
              // Basic PGN validation
              const hasMetadata = /\[.*".*"\]/.test(value);
              const hasMoves = /\d+\./.test(value);
              return hasMetadata || hasMoves;
            }
          }
        ]
      },

      search: {
        query: [
          { type: 'required', message: 'Search query is required' },
          { type: 'minLength', value: 2, message: 'Search query must be at least 2 characters' },
          { type: 'maxLength', value: 100, message: 'Search query must be less than 100 characters' }
        ]
      }
    };
  }

  /**
   * Validate password confirmation
   */
  validatePasswordConfirmation(password: string, confirmPassword: string): ValidationResult {
    if (password !== confirmPassword) {
      return {
        isValid: false,
        errors: ['Passwords do not match']
      };
    }
    return {
      isValid: true,
      errors: []
    };
  }

  /**
   * Validate file upload
   */
  validateFileUpload(file: File, options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    maxFiles?: number;
  } = {}): ValidationResult {
    const errors: string[] = [];

    // Check file size
    if (options.maxSize && file.size > options.maxSize) {
      const maxSizeMB = options.maxSize / (1024 * 1024);
      errors.push(`File size must be less than ${maxSizeMB}MB`);
    }

    // Check file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      errors.push(`File type not allowed. Allowed types: ${options.allowedTypes.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize input
   */
  sanitizeInput(value: string): string {
    if (typeof value !== 'string') return value;
    
    return value
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate URL
   */
  validateUrl(value: string): ValidationResult {
    if (!value) {
      return {
        isValid: true,
        errors: []
      };
    }

    try {
      new URL(value);
      return {
        isValid: true,
        errors: []
      };
    } catch {
      return {
        isValid: false,
        errors: ['Please enter a valid URL']
      };
    }
  }

  /**
   * Validate phone number
   */
  validatePhoneNumber(value: string): ValidationResult {
    if (!value) {
      return {
        isValid: true,
        errors: []
      };
    }

    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
      return {
        isValid: false,
        errors: ['Please enter a valid phone number']
      };
    }

    return {
      isValid: true,
      errors: []
    };
  }

  /**
   * Validate date
   */
  validateDate(value: string): ValidationResult {
    if (!value) {
      return {
        isValid: true,
        errors: []
      };
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        errors: ['Please enter a valid date']
      };
    }

    return {
      isValid: true,
      errors: []
    };
  }

  /**
   * Validate number range
   */
  validateNumberRange(value: number, min?: number, max?: number): ValidationResult {
    const errors: string[] = [];

    if (min !== undefined && value < min) {
      errors.push(`Value must be at least ${min}`);
    }

    if (max !== undefined && value > max) {
      errors.push(`Value must be at most ${max}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const formValidator = FormValidator.getInstance();

// Export utility functions
export const validateField = (value: any, rules: ValidationRule[]) => 
  formValidator.validateField(value, rules);

export const validateForm = (data: Record<string, any>, schema: FormValidationSchema) => 
  formValidator.validateForm(data, schema);

export const isFormValid = (results: Record<string, ValidationResult>) => 
  formValidator.isFormValid(results);

export const getAllErrors = (results: Record<string, ValidationResult>) => 
  formValidator.getAllErrors(results);

export const validatePasswordConfirmation = (password: string, confirmPassword: string) => 
  formValidator.validatePasswordConfirmation(password, confirmPassword);

export const validateFileUpload = (file: File, options?: any) => 
  formValidator.validateFileUpload(file, options);

export const sanitizeInput = (value: string) => 
  formValidator.sanitizeInput(value);

export const validateUrl = (value: string) => 
  formValidator.validateUrl(value);

export const validatePhoneNumber = (value: string) => 
  formValidator.validatePhoneNumber(value);

export const validateDate = (value: string) => 
  formValidator.validateDate(value);

export const validateNumberRange = (value: number, min?: number, max?: number) => 
  formValidator.validateNumberRange(value, min, max);

// Export predefined schemas
export const validationSchemas = FormValidator.getSchemas(); 