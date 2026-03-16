
"use client";

import { useEffect, useState } from "react";
import { Client } from "@/lib/types";
import { getClients, saveClients } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2, Search, Eye, Undo2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function ClientsPage() {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");

  useEffect(() => {
    setClients(getClients());
  }, []);

  const handleSaveClient = () => {
    if (!formName || !formEmail) {
      toast({ title: "Required Fields", description: "Name and Email are required.", variant: "destructive" });
      return;
    }

    const newClient: Client = {
      id: editingClient?.id || uuidv4(),
      name: formName,
      email: formEmail,
      phone: formPhone,
      address: formAddress
    };

    let updatedClients;
    if (editingClient) {
      updatedClients = clients.map(c => c.id === editingClient.id ? newClient : c);
    } else {
      updatedClients = [...clients, newClient];
    }

    setClients(updatedClients);
    saveClients(updatedClients);
    setIsDialogOpen(false);
    resetForm();
    toast({ title: editingClient ? "Client Updated" : "Client Added" });
  };

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormAddress("");
    setEditingClient(null);
  };

  const handleDelete = (id: string) => {
    const clientToDelete = clients.find(c => c.id === id);
    if (!clientToDelete) return;

    const updated = clients.filter(c => c.id !== id);
    setClients(updated);
    saveClients(updated);

    toast({ 
      title: "Client Removed", 
      description: `${clientToDelete.name} has been deleted.`,
      action: (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            const currentClients = getClients();
            const restored = [...currentClients, clientToDelete];
            setClients(restored);
            saveClients(restored);
            toast({ title: "Restored", description: `${clientToDelete.name} has been restored.` });
          }}
        >
          <Undo2 className="w-4 h-4 mr-2" /> Undo
        </Button>
      )
    });
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormName(client.name);
    setFormEmail(client.email);
    setFormPhone(client.phone);
    setFormAddress(client.address);
    setIsDialogOpen(true);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your directory and view project history.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="e.g. john@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="e.g. 555-0101" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} placeholder="e.g. 123 Main St" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveClient}>Save Client</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search clients by name or email..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{client.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{client.id.slice(0, 8)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{client.email}</p>
                        <p className="text-muted-foreground">{client.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{client.address}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/clients/${client.id}`}>
                        <Button variant="ghost" size="icon" title="View Profile & History">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove <strong>{client.name}</strong> from your directory. You can undo this action immediately after.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(client.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No clients found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
