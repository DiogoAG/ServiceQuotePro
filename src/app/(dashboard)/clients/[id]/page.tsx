"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Client, Quote } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronLeft, Plus, FileText, Phone, Mail, MapPin, ExternalLink, History, Edit2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, doc, query, where, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function ClientDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const clientRef = useMemoFirebase(() => {
    if (!user || !id) return null;
    return doc(db, "contractorProfiles", user.uid, "clients", id);
  }, [db, user, id]);

  const quotesRef = useMemoFirebase(() => {
    if (!user || !id) return null;
    return query(
      collection(db, "contractorProfiles", user.uid, "quotes"),
      where("clientId", "==", id)
    );
  }, [db, user, id]);

  const { data: client, isLoading: clientLoading } = useDoc<Client>(clientRef);
  const { data: clientQuotes, isLoading: quotesLoading } = useCollection<Quote>(quotesRef);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");

  useEffect(() => {
    if (client) {
      setFormName(client.name);
      setFormEmail(client.email);
      setFormPhone(client.phone || "");
      setFormAddress(client.address || "");
    }
  }, [client]);

  const handleUpdateClient = () => {
    if (!formName || !formEmail || !user || !id) {
      toast({ title: "Required Fields", description: "Name and Email are required.", variant: "destructive" });
      return;
    }

    const docRef = doc(db, "contractorProfiles", user.uid, "clients", id);
    setDocumentNonBlocking(docRef, {
      name: formName,
      email: formEmail,
      phone: formPhone,
      address: formAddress,
      updatedAt: serverTimestamp()
    }, { merge: true });

    setIsEditDialogOpen(false);
    toast({ title: "Client Updated" });
  };

  if (clientLoading) return <div className="flex items-center justify-center h-[50vh]"><Loader2 className="animate-spin" /></div>;
  if (!client) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Link href={`/quotes/new?clientId=${client.id}`}>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Quote for {client.name.split(' ')[0]}
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-4">
          <Card className="h-fit">
            <CardHeader className="text-center pb-2">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary font-bold text-2xl">
                {client.name.charAt(0)}
              </div>
              <CardTitle className="text-xl">{client.name}</CardTitle>
              <CardDescription>Client Profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="break-all">{client.email}</div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>{client.phone || "No phone provided"}</div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>{client.address || "No address provided"}</div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2 text-xs h-9">
                      <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Edit Client Information</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Input value={formAddress} onChange={(e) => setFormAddress(e.target.value)} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleUpdateClient}>Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <CardTitle>Quote History</CardTitle>
              </div>
              <Badge variant="outline">{clientQuotes?.length || 0} Total</Badge>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientQuotes && clientQuotes.length > 0 ? (
                    clientQuotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="text-xs">
                          {new Date(quote.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {quote.serviceCategory}
                        </TableCell>
                        <TableCell>
                          <Badge variant={quote.status === 'approved' ? 'default' : quote.status === 'rejected' ? 'destructive' : 'secondary'} className="text-[10px]">
                            {quote.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${quote.grandTotal.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Link href={`/quotes/${quote.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="w-8 h-8 opacity-20" />
                          <p className="text-sm">No quotes found for this client.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
