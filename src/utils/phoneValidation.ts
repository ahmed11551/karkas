import { Language } from '../types';

export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  normalized?: string;
  digits?: string;
}

// Valid Russian mobile (9XX) and Moscow/regional/toll-free (495, 499, 496, 498, 812, 800, 3XX, 4XX, 8XX) prefix rules
const VALID_OPERATOR_PREFIX_REGEX = /^(9\d{2}|495|499|496|498|812|800|[348]\d{2})$/;

// Known sequential or invalid subscriber numbers (last 7 digits)
const FAKE_SUBSCRIBER_PATTERNS = new Set([
  '1234567',
  '0123456',
  '2345678',
  '3456789',
  '4567890',
  '7654321',
  '6543210',
  '9876543',
  '0000000',
  '1111111',
  '2222222',
  '3333333',
  '4444444',
  '5555555',
  '6666666',
  '7777777',
  '8888888',
  '9999999',
  '1212121',
  '0101010',
  '1010101',
]);

// Known full 10-digit fake numbers (without country code 7)
const FAKE_FULL_10_DIGIT_NUMBERS = new Set([
  '9001234567',
  '9991234567',
  '9990000000',
  '9000000000',
  '9111111111',
  '9999999999',
  '1234567890',
  '0000000000',
]);

/**
 * Formats any user input or pasted phone string into standard Russian mask:
 * +7 (XXX) XXX-XX-XX
 */
export function formatRussianPhoneInput(rawInput: string): string {
  const digits = rawInput.replace(/\D/g, '');
  if (!digits) return '';

  let national = digits;
  if (national.startsWith('7') || national.startsWith('8')) {
    national = national.substring(1);
  }
  national = national.substring(0, 10);

  let formatted = '+7';
  if (national.length > 0) formatted += ` (${national.substring(0, 3)}`;
  if (national.length >= 3) formatted += `) ${national.substring(3, 6)}`;
  if (national.length >= 6) formatted += `-${national.substring(6, 8)}`;
  if (national.length >= 8) formatted += `-${national.substring(8, 10)}`;

  return formatted;
}

/**
 * Strictly validates a Russian phone number to prevent empty, incomplete,
 * invalid operator prefix, or fake/sequential/repeated submissions.
 */
export function validateRussianPhone(
  rawPhone: string,
  lang: Language = 'ru'
): PhoneValidationResult {
  const trimmed = (rawPhone || '').trim();

  // 1. Check empty
  if (!trimmed || trimmed === '+7') {
    return {
      isValid: false,
      error:
        lang === 'ru'
          ? 'Укажите номер телефона для связи.'
          : 'Please enter your phone number.',
    };
  }

  // Extract digits
  let digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10 && (digits.startsWith('9') || digits.startsWith('4'))) {
    digits = '7' + digits;
  } else if (digits.length === 11 && digits.startsWith('8')) {
    digits = '7' + digits.substring(1);
  }

  // 2. Check complete length (11 digits starting with 7)
  if (digits.length !== 11 || !digits.startsWith('7')) {
    return {
      isValid: false,
      error:
        lang === 'ru'
          ? 'Введите полный номер из 11 цифр: +7 (9XX) XXX-XX-XX.'
          : 'Please enter a complete 11-digit number: +7 (9XX) XXX-XX-XX.',
    };
  }

  const tenDigits = digits.substring(1); // XXX XXXXXXX
  const operatorCode = tenDigits.substring(0, 3);
  const subscriberNumber = tenDigits.substring(3); // 7 digits

  // 3. Check valid Russian DEF / city code
  if (!VALID_OPERATOR_PREFIX_REGEX.test(operatorCode)) {
    return {
      isValid: false,
      error:
        lang === 'ru'
          ? `Код оператора (${operatorCode}) не существует. Укажите мобильный (9XX) или городской (495/499) код.`
          : `Invalid operator code (${operatorCode}). Use a valid mobile (9XX) or city code.`,
    };
  }

  // 4. Reject known full fake numbers or sequential patterns
  if (
    FAKE_FULL_10_DIGIT_NUMBERS.has(tenDigits) ||
    FAKE_SUBSCRIBER_PATTERNS.has(subscriberNumber)
  ) {
    return {
      isValid: false,
      error:
        lang === 'ru'
          ? 'Указан некорректный или несуществующий номер. Пожалуйста, введите действующий телефон.'
          : 'Invalid phone number pattern detected. Please enter a valid contact number.',
    };
  }

  // 5. Reject 6 or more identical consecutive digits (e.g. 999999, 000000, 555555)
  if (/(\d)\1{5,}/.test(tenDigits)) {
    return {
      isValid: false,
      error:
        lang === 'ru'
          ? 'Номер содержит слишком много одинаковых цифр подряд. Проверьте правильность ввода.'
          : 'Phone number contains too many repeating digits. Please check your input.',
    };
  }

  // 6. Reject numbers with fewer than 3 distinct digits across the 10-digit national number
  const uniqueDigits = new Set(tenDigits.split('')).size;
  if (uniqueDigits < 3) {
    return {
      isValid: false,
      error:
        lang === 'ru'
          ? 'Пожалуйста, укажите действительный номер телефона (не из повторяющихся цифр).'
          : 'Please enter a genuine phone number.',
    };
  }

  const normalized = `+7 (${operatorCode}) ${subscriberNumber.substring(0, 3)}-${subscriberNumber.substring(3, 5)}-${subscriberNumber.substring(5, 7)}`;

  return {
    isValid: true,
    normalized,
    digits,
  };
}
