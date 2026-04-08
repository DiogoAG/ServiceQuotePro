# ServiceQuotePro

**ServiceQuotePro** is a professional, high-performance web application designed for independent contractors and service businesses. It streamlines the entire quoting process—from managing a client directory to generating professional, print-ready PDF quotes.

## 🚀 Overview

In the service industry, the speed and professionalism of a quote can be the difference between winning and losing a job. ServiceQuotePro provides contractors with a "Command Center" to:
- Build detailed project scopes with automated pricing.
- Manage a central directory of clients and project history.
- Share interactive, web-based quotes that clients can view without logging in.
- Generate clean, industry-standard PDFs optimized for physical printing.

## ✨ Key Features

- **Smart Quote Builder**: Create line-itemed quotes with support for quantity, unit pricing, labor hours, and material costs.
- **Drag-and-Drop Reordering**: Intuitively rearrange line items to structure your scope exactly how you want.
- **Undo/Redo System**: Full support for `Ctrl+Z` and `Ctrl+Y` across the workspace to prevent accidental data loss.
- **Client Directory (CRM)**: Maintain a history of every quote sent to a specific client.
- **Professional Branding**: Upload your business logo, set your license number, and define default tax/labor rates in Settings.
- **Service Library & Templates**: Save common service items or entire project templates (e.g., "Standard Bathroom Refresh") to generate new quotes in seconds.
- **Client-Ready Sharing**: Generate public links for clients to view their quotes online.
- **Print Optimization**: Specialized CSS ensures that "Print to PDF" results in a clean document without website navigation or private internal notes.
- **Local Draft Persistence**: Automatically saves your work-in-progress to local storage so you never lose a quote due to a browser refresh.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescript.org/)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore & Firebase Authentication)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI primitives)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Hooks + Firebase Real-time Listeners

## 📁 Project Structure

```text
src/
├── app/                  # Next.js App Router (Pages & Layouts)
│   ├── (dashboard)/      # Authenticated routes (Quotes, Clients, Settings)
│   ├── view/             # Publicly accessible client quote views
│   └── login/            # Authentication entry point
├── components/           # Shared UI components
│   ├── ui/               # Shadcn base components
│   └── quote-builder.tsx # Core business logic for quote creation
├── firebase/             # Firebase configuration, hooks, and providers
│   ├── firestore/        # useCollection and useDoc real-time hooks
│   └── non-blocking/     # Optimistic UI update patterns
├── lib/                  # Utilities, types, and hardcoded library data
└── hooks/                # Custom React hooks (toast, mobile detection)
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

## 🛠 Installation & Development

1. **Clone and Install**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:9002](http://localhost:9002) to view the app.

3. **Firebase Security Rules**:
   Ensure your Firestore security rules are deployed. The project includes `firestore.rules` which handles owner-based permissions and public access for shared quotes.

## 🚀 Deployment

### Firebase App Hosting
The project is configured for **Firebase App Hosting** (see `apphosting.yaml`). 
1. Connect your GitHub repository to Firebase App Hosting.
2. Ensure your Firebase project has **Authentication** (Google & Email) and **Cloud Firestore** enabled.
3. Add your deployment domain to the **Authorized Domains** list in the Firebase Console under `Authentication > Settings`.

## 🗺 Roadmap

- [ ] **AI-Assisted Scoping**: Generate detailed work descriptions using Google Gemini.
- [ ] **Expense Tracking**: Log project-specific expenses to calculate real-time profit margins.
- [ ] **Invoice Conversion**: Convert approved quotes into invoices with a single click.
- [ ] **Payment Integration**: Allow clients to pay deposits directly through the shared quote link.

## 📄 License

This project is proprietary and built within the Firebase Studio environment.

## 👥 Authors

Built with ❤️ by the ServiceQuotePro Team.
