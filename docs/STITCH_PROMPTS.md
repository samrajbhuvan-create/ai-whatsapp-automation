# Google Stitch UI/UX Design System & Prompt Specifications
**Theme:** Crisp White & Modern WhatsApp Emerald Green (#25D366, #128C7E, #075E54)

---

## 1. Design System Tokens
- **Primary Green:** `#25D366` (WhatsApp Emerald)
- **Primary Green Dark:** `#128C7E` (Forest Teal)
- **Primary Teal:** `#075E54` (Deep Accent)
- **Background:** `#FFFFFF` (Crisp Modern White)
- **Secondary Background:** `#F8FAFC` (Subtle Slate Tint)
- **Card Surface:** `#FFFFFF` with `border: 1px solid #E2E8F0` and `shadow-sm`
- **Text Primary:** `#0F172A` (Slate 900)
- **Text Secondary:** `#64748B` (Slate 500)
- **Incoming Chat Bubble:** `#FFFFFF` with subtle shadow
- **Outgoing Chat Bubble:** `#DCF8C6` / `#D9FDD3` (Classic WhatsApp soft green)

---

## 2. Screen Generation Prompts

### Screen 1: Executive Dashboard & Health Center
> "A state-of-the-art SaaS dashboard for a WhatsApp Business automation platform. Clean white surface with subtle emerald green highlights. Top banner shows WhatsApp Phone Health (GREEN Quality rating pill, 10,000/24h Tier limit progress bar with 4,120 used). 4 summary metric cards: Active Conversations (142), 24h Delivery Rate (99.4%), AI Automation Resolution (74.2%), and Opt-In Subscribers (8,920). Interactive chart displaying daily inbound vs outbound messages. Right drawer showing recent WhatsApp webhook events and compliance health check status."

### Screen 2: Omnichannel WhatsApp Live Inbox
> "A modern three-column WhatsApp team inbox. Column 1: Conversations list with filter tabs (All, Mine, Unassigned, Waiting Agent), search bar, and contact avatars with online dots. Column 2: Active chat conversation showing message bubbles with WhatsApp timestamps and double blue checkmarks. Prominent 24-Hour Customer Care Window countdown timer badge at the top. When expired, shows a subtle warning card 'Service window closed - Send an approved template to re-engage'. Column 3: Contact CRM profile with verified opt-in timestamp, custom tags, previous orders, and AI Copilot response suggestions with 1-click insert."

### Screen 3: WhatsApp Interactive Template Builder & Meta Compliance Linter
> "A split-screen visual template builder for WhatsApp Business API. Left panel: Form fields for Template Name, Category (Marketing, Utility, Authentication), Header (Text or Media Upload), Body with rich text editor and dynamic variable tag insert {{1}}, Footer, and Buttons (Quick Reply & Call-to-Action). Above the form, a live 'Meta Compliance Validator' widget showing real-time feedback with green checkmarks or amber warnings against Meta's 9 rejection policies. Right panel: Realistic high-fidelity WhatsApp smartphone mockup showing the rendered message with live variable preview."

### Screen 4: Visual Workflow Automation Canvas
> "A clean, modern drag-and-drop workflow automation canvas. Nodes connected with smooth curves on a dot-grid canvas. Trigger node: 'Customer sends keyword #ORDER'. Condition node: 'Is 24h Care Window Active?'. Action node: 'AI Agent queries Order Status from API'. Branching paths with visual badges, execution count metrics on each node, and a test simulation panel."
