"use client";

import { useEffect, useState, useMemo, useTransition } from "react";
import { Quote, Client } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, MoreHorizontal, Copy, Trash2, FileText, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { formatCurrency } from "@/lib/finance";

export default function QuotesListPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [isPending, startTransition] = useTransition();

  const quotesRef = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "contractorProfiles", user.uid, "quotes"),
      orderBy("createdAt", "desc")
    );
  }, [db, user]);

  const clientsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "contractorProfiles", user.uid, "clients");
  }, [db, user]);

  const { data: quotes, isLoading: quotesLoading } = useCollection<Quote>(quotesRef);
  const { data: clients, isLoading: clientsLoading } = useCollection<Client>(clientsRef);

  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
  const [optimisticDeletedIds, setOptimisticDeletedIds] = useState<Set<string>>(new Set());

  // Optimization: Pre-calculate a client map for O(1) lookup during render
  const clientMap = useMemo(() => {
    const map = new Map<string, Client>();
    clients?.forEach(c => map.set(c.id, c));
    return map;
  }, [clients]);

  // Filter out quotes that were just deleted optimistically
  const activeQuotes = useMemo(() => {
    return quotes?.filter(q => !optimisticDeletedIds.has(q.id)) || [];
  }, [quotes, optimisticDeletedIds]);

  const handleDelete = () => {
    if (!quoteToDelete || !user) return;
    
    const idToDelete = quoteToDelete.id;
    const category = quoteToDelete.serviceCategory;

    // 1. Mark as optimistically deleted
    startTransition(() => {
      setOptimisticDeletedIds(prev => {
        const next = new Set(prev);
        next.add(idToDelete);
        return next;
      });
    });

    // 2. Background Firestore Delete
    const docRef = doc(db, "contractorProfiles", user.uid, "quotes", idToDelete);
    deleteDocumentNonBlocking(docRef);

    // 3. Clear state to close dialog
    setQuoteToDelete(null);

    toast({
      title: "Quote Deleted",
      description: `Quote for ${category} has been removed.`,
    });
  };

  if (quotesLoading || clientsLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Quotes</h1>
          <p className="text-muted-foreground">Manage, track, and reuse your service quotes.</p>
        </div>
        <Link href="/quotes/new" className="w-full sm:w-auto">
          <Button className="gap-2 w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm">
            <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
            New Quote
          </Button>
        </Link>
      </div>

      {/* Mobile Quote Cards */}
      <div className="grid gap-4 md:hidden">
        {activeQuotes.length > 0 ? (
          activeQuotes.map((quote) => {
            const client = clientMap.get(quote.clientId);
            return (
              <Card key={quote.id} className="overflow-hidden border-primary/10 shadow-sm active:bg-accent/5 transition-colors">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        <Calendar className="w-3 h-3" />
                        {new Date(quote.date).toLocaleDateString()}
                      </div>
                      <h3 className="font-black text-lg leading-tight tracking-tight">{quote.serviceCategory}</h3>
                    </div>
                    <Badge variant={quote.status === 'approved' || quote.status === 'accepted' ? 'default' : quote.status === 'rejected' ? 'destructive' : 'secondary'} className="text-[9px] px-2 py-0.5">
                      {quote.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 py-3 border-y border-dashed">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-secondary-foreground text-sm shrink-0">
                      {(client?.name || '?').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{client?.name || 'Unknown Client'}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{client?.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-primary">{formatCurrency(quote.grandTotal)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Link href={`/quotes/${quote.id}`} className="flex-1">
                      <Button variant="default" size="sm" className="w-full h-10 gap-2 text-xs">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Button>
                    </Link>
                    <Link href={`/quotes/new?duplicateId=${quote.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full h-10 gap-2 text-xs">
                        <Copy className="w-3.5 h-3.5" /> Reuse
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 shrink-0 border">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem 
                          className="text-destructive cursor-pointer py-2.5"
                          onSelect={() => setQuoteToDelete(quote)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Quote
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-xl">
            <FileText className="w-12 h-12 opacity-20 mx-auto mb-3" />
            <p className="font-bold text-muted-foreground">No quotes found.</p>
            <Link href="/quotes/new" className="mt-4 block">
              <Button variant="outline" size="sm">Create First Quote</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="font-bold">Client</TableHead>
              <TableHead className="font-bold">Service</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-right font-bold">Total</TableHead>
              <TableHead className="w-40 text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeQuotes.length > 0 ? (
              activeQuotes.map((quote) => {
                const client = clientMap.get(quote.clientId);
                return (
                  <TableRow key={quote.id} className="group cursor-pointer hover:bg-muted/50 transition-colors">
                    <TableCell className="text-xs font-medium">
                      {new Date(quote.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Link href={`/quotes/${quote.id}`} className="flex flex-col">
                        <span className="font-bold group-hover:text-primary transition-colors">{client?.name || 'Unknown Client'}</span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{client?.email}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter bg-muted/50">
                        {quote.serviceCategory}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={quote.status === 'approved' || quote.status === 'accepted' ? 'default' : quote.status === 'rejected' ? 'destructive' : 'secondary'} className="text-[10px]">
                        {quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-black text-primary">
                      {formatCurrency(quote.grandTotal)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/quotes/${quote.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 px-2 gap-1.5 text-xs">
                            <Eye className="w-3.5 h-3.5" /> View
                          </Button>
                        </Link>
                        <Link href={`/quotes/new?duplicateId=${quote.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 px-2 gap-1.5 text-xs">
                            <Copy className="w-3.5 h-3.5" /> Reuse
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="text-destructive cursor-pointer"
                              onSelect={() => setQuoteToDelete(quote)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete Quote
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <FileText className="w-16 h-16 opacity-10" />
                    <p className="text-lg font-medium">No quotes found.</p>
                    <Link href="/quotes/new">
                      <Button variant="outline" size="lg" className="mt-2">Create First Quote</Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog 
        open={!!quoteToDelete} 
        onOpenChange={(open) => {
          if (!open) setQuoteToDelete(null);
        }}
      >
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Delete this quote?</AlertDialogTitle>
            <AlertDialogDescription>
              {quoteToDelete ? (
                <>This will remove the quote for <strong>{quoteToDelete.serviceCategory}</strong>. This action cannot be undone.</>
              ) : (
                "This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground rounded-xl"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Quote"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
