"use client";

import { useEffect, useState, Suspense, use } from "react";
import { QuoteBuilder } from "@/components/quote-builder";
import { getHardcodedTemplates } from "@/lib/store";
import { Client, BusinessProfile, Quote, QuoteTemplate } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

// Default profile for new users who haven't configured settings yet
const DEFAULT_PROFILE: BusinessProfile = {
  businessName: "My Service Business",
  licenseNumber: "Pending Configuration",
  defaultTaxRate: 0,
  defaultLaborRate: 75,
  offeredServices: ["General Contracting"],
  quoteTerms: "Payment is due within 15 days of completion. All materials guaranteed to be as specified."
};

function NewQuoteContent({ searchParamsPromise }: { searchParamsPromise: Promise<any> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  // Unwrap searchParams to satisfy Next 15
  use(searchParamsPromise);

  const profileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "contractorProfiles", user.uid);
  }, [db, user]);

  const clientsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "contractorProfiles", user.uid, "clients");
  }, [db, user]);

  const quotesRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "contractorProfiles", user.uid, "quotes");
  }, [db, user]);

  const templatesRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "contractorProfiles", user.uid, "templates");
  }, [db, user]);

  const { data: profile, isLoading: profileLoading } = useDoc<BusinessProfile>(profileRef);
  const { data: clients, isLoading: clientsLoading } = useCollection<Client>(clientsRef);
  const { data: quotes } = useCollection<Quote>(quotesRef);
  const { data: userTemplates } = useCollection<QuoteTemplate>(templatesRef);

  const [duplicateSource, setDuplicateSource] = useState<Quote | QuoteTemplate | undefined>(undefined);

  const preSelectedClientId = searchParams.get('clientId');
  const duplicateId = searchParams.get('duplicateId');

  useEffect(() => {
    if (duplicateId) {
      // 1. Check Hardcoded
      const allHardcoded = getHardcodedTemplates();
      const hardcoded = allHardcoded.find(t => t.id === duplicateId);
      if (hardcoded) {
        setDuplicateSource(hardcoded);
        return;
      }

      // 2. Check User Data (when loaded)
      if (quotes || userTemplates) {
        const source = 
          quotes?.find(q => q.id === duplicateId) || 
          userTemplates?.find(t => t.id === duplicateId);
          
        if (source) {
          setDuplicateSource(source);
        }
      }
    } else {
      setDuplicateSource(undefined);
    }
  }, [duplicateId, quotes, userTemplates]);

  const handleSaveQuote = (newQuote: Quote) => {
    if (!user) return;
    
    const docRef = doc(db, "contractorProfiles", user.uid, "quotes", newQuote.id);
    const quoteData = {
      ...newQuote,
      contractorId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    setDocumentNonBlocking(docRef, quoteData, { merge: true });
    toast({ title: "Quote Saved", description: "Your quote has been saved to the cloud." });
    router.push(`/quotes/${newQuote.id}`);
  };

  // If we are actually loading from Firestore, show a spinner
  if (profileLoading || clientsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Preparing your workspace...</p>
      </div>
    );
  }

  // Use the fetched profile or the fallback default if it doesn't exist
  const activeProfile = profile || DEFAULT_PROFILE;
  const activeClients = clients || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {duplicateSource ? "New Quote from Source" : "Create New Quote"}
        </h1>
        <p className="text-muted-foreground">
          {duplicateSource ? `Starting with pre-configured scope for ${duplicateSource.serviceCategory}` : "Fill in the details below to generate a professional quote."}
        </p>
      </div>
      
      <QuoteBuilder 
        key={duplicateId || 'new'}
        initialClients={activeClients} 
        initialProfile={activeProfile} 
        onSave={handleSaveQuote}
        preSelectedClientId={preSelectedClientId || undefined}
        duplicateSource={duplicateSource}
      />
    </div>
  );
}

export default function NewQuotePage({ searchParams }: { searchParams: Promise<any> }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <NewQuoteContent searchParamsPromise={searchParams} />
    </Suspense>
  );
}
