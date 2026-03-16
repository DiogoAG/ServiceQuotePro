
"use client";

import { useEffect, useState } from "react";
import { Quote, Client } from "@/lib/types";
import { getQuotes, getClients, saveQuotes } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, MoreHorizontal, Copy, Trash2, FileText, Undo2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function QuotesListPage() {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setQuotes(getQuotes());
    setClients(getClients());
  }, []);

  const handleDelete = (id: string) => {
    const quoteToDelete = quotes.find(q => q.id === id);
    if (!quoteToDelete) return;

    const updated = quotes.filter(q => q.id !== id);
    setQuotes(updated);
    saveQuotes(updated);

    toast({
      title: "Quote Deleted",
      description: "Quote has been removed.",
      action: (
        <Button variant="outline" size="sm" onClick={() => handleUndo(quoteToDelete)}>
          <Undo2 className="w-4 h-4 mr-2" /> Undo
        </Button>
      )
    });
  };

  const handleUndo = (quote: Quote) => {
    const updated = [...getQuotes(), quote];
    setQuotes(updated);
    saveQuotes(updated);
    toast({ title: "Restored", description: "The quote has been restored." });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Quotes</h1>
          <p className="text-muted-foreground">Manage, track, and reuse your service quotes.</p>
        </div>
        <Link href="/quotes/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Quote
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-card">
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
            {quotes.length > 0 ? (
              quotes.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((quote) => {
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
                            <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground">
                               <AlertDialog>
                                <AlertDialogTrigger className="flex items-center w-full">
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete Quote
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete this quote?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will remove the quote from your history. You can undo this for a short time.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(quote.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                               </AlertDialog>
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
    </div>
  );
}
