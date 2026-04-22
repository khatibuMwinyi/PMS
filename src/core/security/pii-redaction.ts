/**
 * PII Redaction Utility
 * Manually redacts sensitive information from text using regex patterns
 */

// Phone number patterns (international format)
const PHONE_PATTERNS = [
  // +255 XXX XXX XXX
  /\+\d{1,3}\s?\d{3}\s?\d{3}\s?\d{3}/g,
  // 0XX XXX XXX
  /0\d{2}\s?\d{3}\s?\d{3}/g,
  // (XXX) XXX-XXXX
  /\(\d{3}\)\s?\d{3}-\d{4}/g,
  // XXX-XXX-XXXX
  /\d{3}-\d{3}-\d{4}/g,
];

// Email patterns
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

// Name patterns
const NAME_PATTERNS = [
  // First Last (capitalized)
  /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
  // First Middle Last
  /\b[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
];

// ID number patterns
const ID_PATTERNS = [
  // Tanzanian NID
  /\b\d{2}-\d{4}-\d{4}-\d{3}\b/g,
  // General ID numbers
  /\b\d{6,}\b/g,
];

// Address patterns
const ADDRESS_PATTERNS = [
  // House numbers
  /\bNo\s*\d+\b/gi,
  // Street names with numbers
  /\b\d+\s+[A-Za-z\s]+(?:Street|Road|Avenue|Boulevard|Lane|Drive)\b/gi,
];

/**
 * Redact phone numbers from text
 */
export function redactPhones(text: string): string {
  let redacted = text;

  PHONE_PATTERNS.forEach(pattern => {
    redacted = redacted.replace(pattern, '[PHONE]');
  });

  return redacted;
}

/**
 * Redact email addresses from text
 */
export function redactEmails(text: string): string {
  return text.replace(EMAIL_PATTERN, '[EMAIL]');
}

/**
 * Redact names from text
 */
export function redactNames(text: string): string {
  let redacted = text;

  NAME_PATTERNS.forEach(pattern => {
    redacted = redacted.replace(pattern, '[NAME]');
  });

  return redacted;
}

/**
 * Redact ID numbers from text
 */
export function redactIDs(text: string): string {
  let redacted = text;

  ID_PATTERNS.forEach(pattern => {
    redacted = redacted.replace(pattern, '[ID]');
  });

  return redacted;
}

/**
 * Redact addresses from text
 */
export function redactAddresses(text: string): string {
  let redacted = text;

  ADDRESS_PATTERNS.forEach(pattern => {
    redacted = redacted.replace(pattern, '[ADDRESS]');
  });

  return redacted;
}

/**
 * Comprehensive PII redaction
 */
export function redactAllPII(text: string): string {
  let redacted = text;

  // Apply all redactions in order
  redacted = redactPhones(redacted);
  redacted = redactEmails(redacted);
  redacted = redactNames(redacted);
  redacted = redactIDs(redacted);
  redacted = redactAddresses(redacted);

  return redacted;
}

/**
 * Redact PII from dispute evidence
 */
export interface EvidenceData {
  images: string[];
  notes: string;
}

export function redactDisputeEvidence(evidence: EvidenceData): EvidenceData {
  return {
    images: evidence.images, // Image redaction would require computer vision
    notes: redactAllPII(evidence.notes),
  };
}

/**
 * Check if text contains potential PII
 */
export function containsPII(text: string): boolean {
  const hasPhone = PHONE_PATTERNS.some(pattern => pattern.test(text));
  const hasEmail = EMAIL_PATTERN.test(text);
  const hasName = NAME_PATTERNS.some(pattern => pattern.test(text));
  const hasID = ID_PATTERNS.some(pattern => pattern.test(text));
  const hasAddress = ADDRESS_PATTERNS.some(pattern => pattern.test(text));

  return hasPhone || hasEmail || hasName || hasID || hasAddress;
}

/**
 * Get PII types found in text
 */
export function getPIITypes(text: string): string[] {
  const types: string[] = [];

  if (PHONE_PATTERNS.some(pattern => pattern.test(text))) {
    types.push('PHONE');
  }

  if (EMAIL_PATTERN.test(text)) {
    types.push('EMAIL');
  }

  if (NAME_PATTERNS.some(pattern => pattern.test(text))) {
    types.push('NAME');
  }

  if (ID_PATTERNS.some(pattern => pattern.test(text))) {
    types.push('ID');
  }

  if (ADDRESS_PATTERNS.some(pattern => pattern.test(text))) {
    types.push('ADDRESS');
  }

  return types;
}