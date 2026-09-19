/** Prohibited industries per WhatsApp Commerce Policy */
export const PROHIBITED_INDUSTRIES = [
  'Adult products & entertainment',
  'Alcohol sales',
  'Firearms & weapons',
  'Tobacco, vapes & e-cigarettes',
  'Illegal drugs & controlled substances',
  'Live animals & wildlife',
  'Human organs & body parts',
  'Real-money gambling & casinos',
  'Multi-level marketing (MLM)',
  'Pirated / counterfeit goods',
  'Virtual currency & unregistered crypto',
  'Unauthorized financial services',
];

export const RESTRICTED_INDUSTRIES = [
  'Healthcare / Pharmaceuticals',
  'Financial services & lending',
  'Political campaigns',
  'Legal services',
];

/** Check if an industry string matches a prohibited category */
export function isProhibitedIndustry(industry: string): boolean {
  const lower = industry.toLowerCase();
  return PROHIBITED_INDUSTRIES.some(p => lower.includes(p.toLowerCase().split(' ')[0]));
}

export const isIndustryProhibited = isProhibitedIndustry;

/** Template compliance validator */
interface TemplateValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateTemplate(params: {
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  bodyText: string;
  footerText?: string;
  buttons?: { text: string; type: string; url_or_phone?: string }[];
}): TemplateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { category, bodyText, buttons = [] } = params;

  // 1. Length check
  if (bodyText.length > 1024) {
    errors.push('Body text exceeds 1024 character limit.');
  }

  // 2. Promotional content in Utility template
  const promoKeywords = ['sale', 'discount', 'offer', 'promo', 'deal', 'free', 'limited time', 'act now', 'hurry'];
  if (category === 'UTILITY' && promoKeywords.some(k => bodyText.toLowerCase().includes(k))) {
    errors.push('Promotional language detected in a Utility template. Meta will reject or reclassify this template.');
  }

  // 3. Variable positioning — must not start or end sentence
  const sentenceStartVar = /^(\{\{\d+\}\})/m.test(bodyText.trim());
  const sentenceEndVar   = /(\{\{\d+\}\})\s*$/m.test(bodyText.trim());
  if (sentenceStartVar) errors.push('Variables ({{n}}) cannot be placed at the start of a sentence or body.');
  if (sentenceEndVar)   errors.push('Variables ({{n}}) cannot be placed at the end of a sentence or body.');

  // 4. Adjacent variables
  if (/\{\{\d+\}\}\s*\{\{\d+\}\}/.test(bodyText)) {
    errors.push('Variables cannot be placed adjacent to each other (e.g. {{1}}{{2}}).');
  }

  // 5. Consecutive newlines
  if (/\n{3,}/.test(bodyText)) {
    errors.push('More than 2 consecutive line breaks are not allowed by Meta.');
  }

  // 6. URL shortener check
  const shorteners = ['bit.ly', 'tinyurl', 'ow.ly', 't.co', 'goo.gl', 'tiny.cc'];
  if (shorteners.some(s => bodyText.includes(s))) {
    errors.push('URL shorteners (bit.ly, TinyURL, etc.) are prohibited. Use the full HTTPS URL.');
  }

  // 7. Check button URLs
  buttons.forEach(btn => {
    if (btn.type === 'URL' && btn.url_or_phone) {
      if (shorteners.some(s => btn.url_or_phone!.includes(s))) {
        errors.push(`Button "${btn.text}": URL shorteners are prohibited.`);
      }
      if (!btn.url_or_phone.startsWith('https://')) {
        warnings.push(`Button "${btn.text}": URLs should use HTTPS for security.`);
      }
    }
  });

  // 8. Authentication template — warn about marketing language
  if (category === 'AUTHENTICATION' && promoKeywords.some(k => bodyText.toLowerCase().includes(k))) {
    errors.push('Authentication templates cannot contain promotional language.');
  }

  // 9. Footer length
  if (params.footerText && params.footerText.length > 60) {
    errors.push('Footer text exceeds 60 character limit.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
