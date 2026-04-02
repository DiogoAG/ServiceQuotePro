
"use client";

import { useEffect, useState, Suspense } from "react";
import { QuoteBuilder } from "@/components/quote-builder";
import { getHardcodedTemplates } from "@/lib/store";
import { Client, BusinessProfile, Quote, QuoteTemplate } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

function NewQuoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

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

  const { data: profile } = useDoc<BusinessProfile>(profileRef);
  const { data: clients } = useCollection<Client>(clientsRef);
  const { data: quotes } = useCollection<Quote>(quotesRef);
  const { data: userTemplates } = useCollection<QuoteTemplate>(templatesRef);

  const [duplicateSource, setDuplicateSource] = useState<Quote | QuoteTemplate | undefined>(undefined);

  const preSelectedClientId = searchParams.get('clientId');
  const duplicateId = searchParams.get('duplicateId');

  useEffect(() => {
    if (duplicateId && (quotes || userTemplates)) {
      const allHardcoded = getHardcodedTemplates();
      const source = 
        quotes?.find(q => q.id === duplicateId) || 
        userTemplates?.find(t => t.id === duplicateId) || 
        allHardcoded.find(t => t.id === duplicateId);
        
      if (source) {
        setDuplicateSource(source);
      }
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

  if (!profile || !clients) return <div className="p-8 text-center">Initializing builder...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {duplicateSource ? "New Quote from Template" : "Create New Quote"}
        </h1>
        <p className="text-muted-foreground">
          {duplicateSource ? `Starting with pre-configured scope for ${duplicateSource.serviceCategory}` : "Fill in the details below to generate a professional quote."}
        </p>
      </div>
      
      <QuoteBuilder 
        initialClients={clients} 
        initialProfile={profile} 
        onSave={handleSaveQuote}
        preSelectedClientId={preSelectedClientId || undefined}
        duplicateSource={duplicateSource}
      />
    </div>
  );
}

export default function NewQuotePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading builder...</div>}>
      <NewQuoteContent />
    </Suspense>
  );
}
