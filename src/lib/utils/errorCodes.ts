/** WhatsApp Error Code descriptions for UI display */
export const WA_ERROR_CODES: Record<number, { title: string; description: string; action: string; severity: 'error' | 'warning' | 'info' }> = {
  // Frequency / Policy
  131049: {
    title: 'Frequency Cap Reached',
    description: 'This user has already received the maximum number of marketing messages from all businesses today.',
    action: 'Retry sending tomorrow or re-segment your audience.',
    severity: 'warning',
  },
  131026: {
    title: 'Message Not Deliverable',
    description: 'The message could not be delivered due to policy restrictions.',
    action: 'Check the recipient\'s opt-in status and try a Utility template instead.',
    severity: 'warning',
  },
  // Recipient
  131047: {
    title: 'Re-engagement Required',
    description: 'More than 24 hours have passed since the customer last replied. You must use an approved template.',
    action: 'Use an approved Message Template to re-open the conversation.',
    severity: 'info',
  },
  130429: {
    title: 'Rate Limit Hit',
    description: 'Your account has hit the rate limit for the current messaging tier.',
    action: 'Slow down your broadcast rate or upgrade to the next tier.',
    severity: 'error',
  },
  131021: {
    title: 'Recipient Not a WhatsApp User',
    description: 'The phone number is not registered on WhatsApp.',
    action: 'Remove this contact from your active lists.',
    severity: 'error',
  },
  // Template
  132000: {
    title: 'Template Not Found',
    description: 'The template name/language combination does not exist in your account.',
    action: 'Check the template name and language code in your WABA.',
    severity: 'error',
  },
  132001: {
    title: 'Template Paused',
    description: 'This template has been paused by Meta due to quality issues.',
    action: 'Review the template content and resubmit after improving quality.',
    severity: 'error',
  },
  132007: {
    title: 'Template Missing Parameters',
    description: 'Template variables ({{1}}, {{2}}) were not provided.',
    action: 'Ensure all variable placeholders have sample values.',
    severity: 'error',
  },
  // Account / Auth
  100: {
    title: 'Invalid API Call',
    description: 'The API call is malformed or missing required parameters.',
    action: 'Review your API integration or contact support.',
    severity: 'error',
  },
  190: {
    title: 'Access Token Expired',
    description: 'Your Meta access token has expired or is invalid.',
    action: 'Reconnect your Meta account in Settings → Meta Connection.',
    severity: 'error',
  },
};

export function getErrorInfo(code: number) {
  return WA_ERROR_CODES[code] ?? {
    title: `Error ${code}`,
    description: 'An unexpected error occurred.',
    action: 'Check the Meta Developer documentation for error code details.',
    severity: 'error' as const,
  };
}
