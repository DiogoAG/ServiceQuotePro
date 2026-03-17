
"use client";

import { useEffect, useState } from "react";
import { Quote, Client } from "@/lib/types";
import { getQuotes, getClients } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Users, DollarSign, Clock, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DashboardPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setQuotes(getQuotes());
    setClients(getClients());
  }, []);

  const recentQuotes = [...quotes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  
  const totalValue = quotes.reduce((acc, q) => acc + q.grandTotal, 0);
  const pendingQuotes = quotes.filter(q => q.status === 'draft' || q.status === 'sent').length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your quotes.</p>
        </div>
        <Link href="/quotes/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Quote
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingQuotes}</div>
            <p className="text-xs text-muted-foreground">Require follow-up</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">+2 added this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Quotes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotes.filter(q => q.status === 'sent').length}</div>
            <p className="text-xs text-muted-foreground">Awaiting client approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Quotes</CardTitle>
            <CardDescription>You have created {quotes.length} quotes recently.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentQuotes.length > 0 ? (
                  recentQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">
                        <Link 
                          href={`/clients/${quote.clientId}`} 
                          className="hover:underline text-primary transition-colors"
                        >
                          {clients.find(c => c.id === quote.clientId)?.name || 'Unknown Client'}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/quotes/${quote.id}`}>
                          <Badge 
                            variant={quote.status === 'approved' ? 'default' : quote.status === 'rejected' ? 'destructive' : 'secondary'}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            {quote.status}
                          </Badge>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <Link href={`/quotes/${quote.id}`} className="hover:underline">
                          ${quote.grandTotal.toLocaleString()}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      No quotes found. Start by creating one!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {recentQuotes.length > 0 && (
              <div className="mt-4 flex justify-end">
                <Link href="/quotes">
                  <Button variant="ghost" className="gap-2 text-primary">
                    View all quotes <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Clients</CardTitle>
            <CardDescription>A list of your latest clients.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              {clients.slice(0, 5).map((client) => (
                <Link 
                  key={client.id} 
                  href={`/clients/${client.id}`}
                  className="flex items-center gap-4 border-b pb-3 pt-3 first:pt-0 last:border-0 last:pb-0 group hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-secondary-foreground shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {client.name.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors truncate">{client.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0 shrink-0" />
                </Link>
              ))}
              {clients.length === 0 && (
                <p className="text-center py-4 text-muted-foreground">No clients added yet.</p>
              )}
            </div>
            <Link href="/clients" className="block w-full pt-2">
              <Button variant="outline" className="w-full">Manage Clients</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
