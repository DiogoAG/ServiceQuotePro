
"use client";

import { useEffect, useState, Suspense } from "react";
import { QuoteBuilder } from "@/components/quote-builder";
import { getClients, getBusinessProfile, saveQuotes, getQuotes, getTemplates } from "@/lib/store";
import { Client, BusinessProfile, Quote, QuoteTemplate } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

function NewQuoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [duplicateSource, setDuplicateSource] = useState<Quote | QuoteTemplate | undefined>(undefined);

  const preSelectedClientId = searchParams.get('clientId');
  const duplicateId = searchParams.get('duplicateId');

  useEffect(() => {
    setClients(getClients());
    setProfile(getBusinessProfile());

    if (duplicateId) {
      const allQuotes = getQuotes();
      const allTemplates = getTemplates();
      // Check both quotes and templates for the ID
      const source = allQuotes.find(q => q.id === duplicateId) || allTemplates.find(t => t.id === duplicateId);
      if (source) {
        setDuplicateSource(source);
      }
    }
  }, [duplicateId]);

  const handleSaveQuote = (newQuote: Quote) => {
    const existingQuotes = getQuotes();
    saveQuotes([...existingQuotes, newQuote]);
    toast({ title: "Quote Saved", description: "Your quote has been saved successfully." });
    router.push(`/quotes/${newQuote.id}`);
  };

  if (!profile) return null;

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
