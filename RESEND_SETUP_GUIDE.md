# Resend SMTP Setup Guide for Supabase Auth

## 📋 Your Resend API Key
```
re_YOUR_RESEND_API_KEY_HERE
```

## 🚀 Quick Setup (5 minutes)

### Step 1: Verify Resend Account
1. Go to [resend.com](https://resend.com) and log in
2. Ensure your account is verified (check email for verification link)

### Step 2: Configure Supabase Custom SMTP
1. Open **Supabase Dashboard** → Your Project
2. Go to **Authentication** → **Settings** → **SMTP Settings**
3. Enable **"Custom SMTP"** toggle
4. Enter these exact values:

| Field | Value |
|-------|-------|
| **Host** | `smtp.resend.com` |
| **Port** | `587` |
| **Username** | `resend` |
| **Password** | `re_YOUR_RESEND_API_KEY_HERE` |
| **Sender Email** | `onboarding@resend.dev` |
| **Sender Name** | `AutoWhatsApp AI` |

5. Click **Save**

### Step 3: Test the Configuration
1. Go to your app's signup page
2. Sign up with a **real email address** (yours)
3. Check your inbox (and spam folder) for the confirmation email
4. Click the confirmation link to verify

## 📧 Email Limits with Resend Free Tier
- **3,000 emails/month** free
- **No daily limit** (unlike Supabase's built-in)
- **No credit card required**
- **onboarding@resend.dev** works without domain verification for testing

## 🔧 For Production: Add Your Own Domain

### Option A: Use Resend's Domain (Quick)
- Keep using `onboarding@resend.dev` 
- Good for development/staging

### Option B: Verify Your Domain (Recommended for Production)
1. In Resend Dashboard → **Domains** → **Add Domain**
2. Add your domain (e.g., `yourdomain.com`)
3. Add the DNS records Resend provides:
   - **SPF** (TXT record)
   - **DKIM** (CNAME records)
   - **DMARC** (TXT record)
4. Wait for verification (usually 5-30 minutes)
5. Update Supabase SMTP:
   - **Sender Email**: `noreply@yourdomain.com`
   - **Sender Name**: `AutoWhatsApp AI`

## 🐛 Troubleshooting

### "Email not sending" / "Auth failed"
1. Check Supabase logs: **Dashboard → Logs → Auth**
2. Verify SMTP credentials are exactly as above
3. Ensure "Custom SMTP" is **enabled** (toggle on)

### "Email goes to spam"
1. Use your own verified domain (Option B above)
2. Set up proper SPF/DKIM/DMARC
3. Ask users to check spam folder

### "Rate limit still showing"
- The error handling in the app now detects this and shows a helpful message
- Users can use "Launch Instant Test Workspace" as fallback

## 📱 Testing Checklist
- [ ] Signup with new email → confirmation email received
- [ ] Click confirmation link → redirects to app
- [ ] Login with confirmed account → works
- [ ] Password reset → email received (if implemented)
- [ ] Instant Demo Login → works without email

## 🔗 Useful Links
- [Resend Dashboard](https://resend.com/dashboard)
- [Resend SMTP Docs](https://resend.com/docs/smtp/introduction)
- [Supabase Custom SMTP Docs](https://supabase.com/docs/guides/auth/auth-smtp)
- [DNS Records Guide](https://resend.com/docs/dashboard/domains/dns-records)

---

## ⚡ Quick Command to Test SMTP (Optional)
```bash
# Test SMTP connection from terminal
echo "Subject: Test" | sendmail -S smtp=smtp.resend.com:587 -xu=resend -xp=re_YOUR_RESEND_API_KEY_HERE -f onboarding@resend.dev your-email@example.com
```