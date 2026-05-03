# ServiceQuotePro

**ServiceQuotePro** is a professional, high-performance web application designed for independent contractors and service businesses. It streamlines the entire quoting process—from managing a client directory to generating professional, print-ready PDF quotes.

## 🚀 Overview

In the service industry, the speed and professionalism of a quote can be the difference between winning and losing a job. ServiceQuotePro provides contractors with a "Command Center" to:
- Build detailed project scopes with automated pricing.
- Manage a central directory of clients and project history.
- Share interactive, web-based quotes that clients can view without logging in.
- Generate clean, industry-standard PDFs optimized for physical printing.

## ✨ Key Features

- **Smart Quote Builder**: Create line-itemed quotes with support for quantity, unit pricing, labor hours, and material costs. Save any quote as a reusable **Template** with one click.
- **Advanced Quote Management**: 
  - **Debounced Search**: Instantly filter hundreds of quotes by client name, service category, or status.
  - **Dynamic Sorting**: Sort your project list by Date, Client, Service, Status, or Total value.
- **Service Library (Trade-Logic Sorting)**: Manage standard pricing for hundreds of items. Your "Starred" services (specialties) are automatically pinned to the top of all selection lists.
- **Undo/Redo System**: Full support for `Ctrl+Z` and `Ctrl+Y` across the Quote Builder and Template Editor to prevent accidental data loss.
- **Professional Branding**: Upload your business logo, set your license number, and define default tax/labor rates in Settings.
- **Client Directory (CRM)**: Maintain a detailed history of every quote sent to a specific client with a dedicated profile view.
- **Live Demo Environment**: A specialized "Sandbox" mode allowing users to explore the full power of the app with realistic data and a "Reset to Professional State" safety valve.
- **Print Optimization**: Specialized CSS ensures that "Print to PDF" results in a clean, professional document without website navigation.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescript.org/)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore & Firebase Authentication)
- **State Management**: React `useReducer` with History (Undo/Redo) + Firestore Real-time Listeners.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI primitives)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📁 Project Structure

```text
src/
├── app/                  # Next.js App Router (Dashboard, Public Views, Auth)
├── components/           # UI components (Shadcn + Specialized Quote Builder)
├── firebase/             # Configuration, hooks, and non-blocking mutation patterns
├── lib/                  # Finance engine, type definitions, and validator schemas
├── hooks/                # Custom React hooks (toast, mobile detection)
└── ai/                   # Genkit AI flow definitions (Future Roadmap)
```

## ⚙️ Configuration

### Environment Variables
The application requires standard Firebase configuration. Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 🚀 Deployment

### Firebase App Hosting
The project is configured for **Firebase App Hosting** (see `apphosting.yaml`). 
1. Connect your GitHub repository to Firebase App Hosting.
2. Ensure your Firebase project has **Authentication** (Google & Email) and **Cloud Firestore** enabled.
3. Add your deployment domain to the **Authorized Domains** list in the Firebase Console.

## 🗺 Roadmap

- [ ] **AI-Assisted Scoping**: Generate detailed work descriptions using Google Gemini based on line items.
- [ ] **Expense Tracking**: Log project-specific expenses to calculate real-time profit margins.
- [ ] **Invoice Conversion**: Convert approved quotes into formal Invoices with single-click tracking.
- [ ] **Stripe Integration**: Allow clients to pay deposits directly through the shared quote link.

Built with ❤️ by the ServiceQuotePro Team.
