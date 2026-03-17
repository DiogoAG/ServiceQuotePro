"use client";

import { useEffect, useState } from "react";
import { Quote, Client } from "@/lib/types";
import { getQuotes, getClients, saveQuotes } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, MoreHorizontal, Copy, Trash2, FileText, Undo2, Calendar, User, DollarSign } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function QuotesListPage() {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);

  useEffect(() => {
    setQuotes(getQuotes());
    setClients(getClients());
  }, []);

  const handleDelete = () => {
    if (!quoteToDelete) return;
    const qId = quoteToDelete.id;
    const qName = quoteToDelete.serviceCategory;
    const updated = quotes.filter(q => q.id !== qId);
    
    setQuotes(updated);
    saveQuotes(updated);

    toast({
      title: "Quote Deleted",
      description: `${qName} quote has been removed.`,
      action: (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            const currentQuotes = getQuotes();
            const restored = [...currentQuotes, quoteToDelete];
            setQuotes(restored);
            saveQuotes(restored);
            toast({ title: "Restored", description: "The quote has been restored." });
          }}
        >
          <Undo2 className="w-4 h-4 mr-2" /> Undo
        </Button>
      )
    });
    setQuoteToDelete(null);
  };

  const sortedQuotes = [...quotes].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Quotes</h1>
          <p className="text-muted-foreground">Manage, track, and reuse your service quotes.</p>
        </div>
        <Link href="/quotes/new" className="w-full sm:w-auto">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            New Quote
          </Button>
        </Link>
      </div>

      {/* Mobile Quote Cards */}
      <div className="grid gap-4 md:hidden">
        {sortedQuotes.length > 0 ? (
          sortedQuotes.map((quote) => {
            const client = clients.find(c => c.id === quote.clientId);
            return (
              <Card key={quote.id} className="overflow-hidden border-primary/10 shadow-sm">
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(quote.date).toLocaleDateString()}
                      </div>
                      <h3 className="font-bold text-lg leading-tight">{quote.serviceCategory}</h3>
                    </div>
                    <Badge variant={quote.status === 'approved' ? 'default' : quote.status === 'rejected' ? 'destructive' : 'secondary'} className="text-[10px]">
                      {quote.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 py-2 border-y border-dashed">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-secondary-foreground text-xs shrink-0">
                      {(client?.name || '?').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{client?.name || 'Unknown Client'}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{client?.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-primary">${quote.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Link href={`/quotes/${quote.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full h-9 gap-2">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Button>
                    </Link>
                    <Link href={`/quotes/new?duplicateId=${quote.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full h-9 gap-2">
                        <Copy className="w-3.5 h-3.5" /> Reuse
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 shrink-0 border">
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
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-card border rounded-lg">
            <FileText className="w-12 h-12 opacity-20 mx-auto mb-2" />
            <p>No quotes found.</p>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-40 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedQuotes.length > 0 ? (
              sortedQuotes.map((quote) => {
                const client = clients.find(c => c.id === quote.clientId);
                return (
                  <TableRow key={quote.id}>
                    <TableCell className="text-xs">
                      {new Date(quote.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{client?.name || 'Unknown Client'}</span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{client?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {quote.serviceCategory}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={quote.status === 'approved' ? 'default' : quote.status === 'rejected' ? 'destructive' : 'secondary'} className="text-[10px]">
                        {quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${quote.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
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
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-12 h-12 opacity-20" />
                    <p>No quotes found. Create your first quote to get started!</p>
                    <Link href="/quotes/new">
                      <Button variant="outline" size="sm" className="mt-2">New Quote</Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!quoteToDelete} onOpenChange={(open) => !open && setQuoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this quote?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the quote for <strong>{quoteToDelete?.serviceCategory}</strong> from your history. You can undo this action immediately after.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}