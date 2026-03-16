
"use client";

import { useEffect, useState } from "react";
import { QuoteBuilder } from "@/components/quote-builder";
import { getClients, getBusinessProfile, saveQuotes, getQuotes } from "@/lib/store";
import { Client, BusinessProfile, Quote } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function NewQuotePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);

  useEffect(() => {
    setClients(getClients());
    setProfile(getBusinessProfile());
  }, []);

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
        <h1 className="text-3xl font-bold tracking-tight">Create New Quote</h1>
        <p className="text-muted-foreground">Fill in the details below to generate a professional quote.</p>
      </div>
      
      <QuoteBuilder 
        initialClients={clients} 
        initialProfile={profile} 
        onSave={handleSaveQuote} 
      />
    </div>
  );
}
