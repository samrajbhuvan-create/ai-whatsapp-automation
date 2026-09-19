# WhatsApp Business API Compliance & Policy Master Guide
**Meta Business & Commerce Policies Reference Guide for AutoWhatsApp AI**

---

## 1. Eligibility & Prohibited Categories
WhatsApp strictly prohibits direct or indirect automation and commerce in the following sectors:
- **Prohibited Industries:**
  1. Weapons, Firearms, Ammunition, Explosives
  2. Tobacco, Electronic Cigarettes, Vapes, Related Paraphernalia
  3. Alcoholic Beverages & Intoxicants
  4. Prescription & Recreational Drugs, Pharmaceuticals, Supplements
  5. Adult Content, Sexual Products & Services
  6. Real Money Gambling, Online Casinos, Sports Betting
  7. Unregulated Financial Products, Crypto Mining, Payday Loans, MLM
  8. Counterfeit Goods, Pirated Media
- **Permitted Industries with Registration:**
  - Retail, E-Commerce, Financial Services (Regulated Banking), Travel & Hospitality, Real Estate, Education, Healthcare (Appointment reminders only, no diagnostic advice).

---

## 2. Messaging Tiers & Daily Limits
Meta assigns phone numbers to 24-hour rolling conversation tiers based on Phone Number Verification and Quality Rating:

| Tier | Unique Contacts / 24 Hours | Eligibility Requirements |
|---|---|---|
| **Tier 0 (Sandbox / Unverified)** | 250 | Initial state upon phone number registration before Business Verification |
| **Tier 1** | 1,000 | Business Verification approved & identity confirmed |
| **Tier 2** | 10,000 | Reached 500+ messages in 7 days with GREEN quality rating |
| **Tier 3** | 100,000 | Reached 5,000+ messages with sustained GREEN rating |
| **Tier 4** | Unlimited | Enterprise tier for high-volume verified senders |

### Automatic Tier Progression Rules
- A phone number automatically upgrades to the next tier when it sends 2x its current tier limit within a 7-day period while maintaining a **GREEN** quality rating.
- Meta checks phone number volume and quality every 6 hours.

---

## 3. Phone Number Quality Ratings & Enforcement
Meta monitors feedback signals (blocks, spam reports, frequency) over a rolling 7-day period:
- 🟢 **GREEN (High Quality):** Healthy messaging habits, high read and reply rates, low block rates (<0.2%).
- 🟡 **YELLOW (Medium Quality):** Warning zone. Elevating block rate or spam reports.
- 🔴 **RED (Low Quality):** Critical hazard. If unresolved within 7 days, messaging tier is immediately downgraded (e.g., from 10k to 1k) or the number is placed in **FLAGGED** status.
- ⛔ **FLAGGED / RESTRICTED:** The number cannot initiate new template messages. Only inbound customer-initiated conversations can be answered.

---

## 4. Mandatory Opt-In Regulations
Meta requires a clear, affirmative opt-in before sending any business-initiated (template) message:
1. **Clear Statement:** Must explicitly state that the user is subscribing to receive messages via WhatsApp from `[Business Name]`.
2. **Explicit Consent:** Must not be pre-checked checkboxes or bundled into general website terms.
3. **Opt-Out Mechanism:** Every promotional message must contain a frictionless way to stop messages (e.g. "Reply STOP to unsubscribe" or Quick Reply button).
4. **Immediate Opt-Out Processing:** If a recipient sends "STOP", "UNSUBSCRIBE", or "END", the system must immediately mark them as unsubscribed and suppress further outbound marketing messages.

---

## 5. 24-Hour Customer Care Window Rules
- When a user sends an inbound message, a **24-hour service session window** opens.
- Within this 24-hour window, the business can send regular text, media, documents, and interactive buttons **without pre-approval from Meta** and without incurring template fees.
- Every incoming message from the user **resets the 24-hour timer**.
- Once the 24 hours expire, the business **CANNOT** send free-form messages. It can only resume communication using an approved **Utility** or **Marketing Template**.

---

## 6. Template Rejection Triggers (Meta Review)
1. **Vague Placeholders:** E.g. "Hello {{1}}, {{2}} is ready." Meta rejects templates where variable context is ambiguous.
2. **Grammar & Spelling Mistakes:** High typo density leads to automated rejection.
3. **Mismatch of Category:** Submitting promotional content under the `UTILITY` category to pay lower fees.
4. **URL Shorteners:** URLs like `bit.ly`, `tinyurl.com` are blacklisted to protect against phishing.
5. **Requesting Sensitive Data:** Asking for credit card numbers, OTPs, or passwords.
