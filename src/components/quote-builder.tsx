"use client";

import { useState, useCallback, useEffect, useMemo, useReducer } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Save, Search, BookOpen, Copy, UserPlus, LayoutTemplate, X, Star, DollarSign, Undo2, Redo2, GripVertical, AlertCircle, Lock, PlusCircle } from "lucide-react";
import { Client, Quote, QuoteItem, BusinessProfile, CommonItem, QuoteTemplate, SERVICE_CATEGORIES } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { getHardcodedItems, getHardcodedTemplates, QuoteDraft, getDraftQuote, saveDraftQuote, clearDraftQuote } from "@/lib/store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { ToastAction } from "@/components/ui/toast";
import { calculateQuoteTotals, roundToCent } from "@/lib/quote-engine";
import { addMoney, multiplyMoney, formatCurrency } from "@/lib/finance";
import { QuoteSchema } from "@/lib/validators/quote";

// --- REDUCER TYPES ---

interface QuoteState {
  clientId: string;
  serviceCategory: string;
  items: QuoteItem[];
  laborHours: number | string;
  laborRate: number | string;
  materialCosts: number | string;
  taxRate: number | string;
  notes: string;
  scopeDescription: string;
  status: Quote['status'];
}

interface HistoryState {
  past: QuoteState[];
  present: QuoteState;
  future: QuoteState[];
}

type QuoteAction =
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_FIELD'; field: keyof QuoteState; value: any; snapshot?: boolean }
  | { type: 'UPDATE_ITEM'; id: string; field: keyof QuoteItem; value: any }
  | { type: 'ADD_ITEM' }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'REORDER_ITEMS'; fromIndex: number; toIndex: number }
  | { type: 'APPLY_TEMPLATE'; template: QuoteTemplate }
  | { type: 'RESET_DRAFT'; draft: QuoteState };

const HISTORY_LIMIT = 50;

function quoteReducer(state: HistoryState, action: QuoteAction): HistoryState {
  const { past, present, future } = state;

  const pushToPast = (newState: QuoteState): HistoryState => {
    const newPast = [...past, present].slice(-HISTORY_LIMIT);
    return {
      past: newPast,
      present: newState,
      future: []
    };
  };

  switch (action.type) {
    case 'UNDO': {
      if (past.length === 0) return state;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [present, ...future]
      };
    }

    case 'REDO': {
      if (future.length === 0) return state;
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        past: [...past, present],
        present: next,
        future: newFuture
      };
    }

    case 'SET_FIELD': {
      const newState = { ...present, [action.field]: action.value };
      if (action.snapshot) {
        return pushToPast(newState);
      }
      return { ...state, present: newState };
    }

    case 'ADD_ITEM': {
      const newItem: QuoteItem = { id: uuidv4(), description: "", unit: "ea", quantity: 1, length: "", width: "", unitPrice: 0, total: 0 };
      const newState = { ...present, items: [...present.items, newItem] };
      return pushToPast(newState);
    }

    case 'REMOVE_ITEM': {
      if (present.items.length <= 1) return state;
      const newState = { ...present, items: present.items.filter(i => i.id !== action.id) };
      return pushToPast(newState);
    }

    case 'UPDATE_ITEM': {
      const newItems = present.items.map(item => {
        if (item.id === action.id) {
          const updated = { ...item, [action.field]: action.value };
          if (action.field === 'length' || action.field === 'width') {
            const l = parseFloat(String(updated.length));
            const w = parseFloat(String(updated.width));
            if (!isNaN(l) && !isNaN(w)) updated.quantity = roundToCent(l * w);
          }
          updated.total = multiplyMoney(Number(updated.unitPrice) || 0, Number(updated.quantity) || 0);
          return updated;
        }
        return item;
      });
      return { ...state, present: { ...present, items: newItems } };
    }

    case 'REORDER_ITEMS': {
      const newItems = [...present.items];
      const [removed] = newItems.splice(action.fromIndex, 1);
      newItems.splice(action.toIndex, 0, removed);
      return pushToPast({ ...present, items: newItems });
    }

    case 'APPLY_TEMPLATE': {
      const newState: QuoteState = {
        ...present,
        serviceCategory: action.template.serviceCategory,
        scopeDescription: action.template.scopeDescription,
        items: action.template.items.map(i => ({
          ...i,
          id: uuidv4(),
          total: multiplyMoney(Number(i.unitPrice) || 0, Number(i.quantity) || 1)
        })) as QuoteItem[]
      };
      return pushToPast(newState);
    }

    case 'RESET_DRAFT': {
      return {
        past: [],
        present: action.draft,
        future: []
      };
    }

    default:
      return state;
  }
}

// --- COMPONENT ---

type QuoteBuilderProps = {
  initialClients: Client[];
  initialProfile: BusinessProfile;
  onSave: (quote: Quote) => void;
  preSelectedClientId?: string;
  duplicateSource?: Quote | QuoteTemplate;
};

export function QuoteBuilder({ initialClients, initialProfile, onSave, preSelectedClientId, duplicateSource }: QuoteBuilderProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const customItemsRef = useMemoFirebase(() => user ? collection(db, "contractorProfiles", user.uid, "customItems") : null, [db, user]);
  const templatesRef = useMemoFirebase(() => user ? collection(db, "contractorProfiles", user.uid, "templates") : null, [db, user]);
  
  const { data: customItems } = useCollection<CommonItem>(customItemsRef);
  const { data: userTemplates } = useCollection<QuoteTemplate>(templatesRef);

  const allLibraryItems = useMemo(() => {
    const hardcodedItems = getHardcodedItems();
    const customMap = new Map((customItems || []).map(i => [i.id, i]));
    const mergedHardcoded = hardcodedItems.map(h => {
      const custom = customMap.get(h.id);
      return custom ? { ...h, ...custom, isHardCoded: false } : h;
    });
    const hardcodedIds = new Set(hardcodedItems.map(h => h.id));
    const newCustom = (customItems || []).filter(c => !hardcodedIds.has(c.id));
    return [...mergedHardcoded, ...newCustom];
  }, [customItems]);

  const allAvailableTemplates = useMemo(() => [...getHardcodedTemplates(), ...(userTemplates || [])], [userTemplates]);

  const [localClients, setLocalClients] = useState<Client[]>([]);
  const clients = useMemo(() => [...initialClients, ...localClients], [initialClients, localClients]);

  const initialState: QuoteState = useMemo(() => {
    const draft = getDraftQuote();
    if (duplicateSource) {
      return {
        clientId: 'clientId' in duplicateSource ? (duplicateSource as Quote).clientId : "",
        serviceCategory: duplicateSource.serviceCategory,
        items: duplicateSource.items.map(i => ({ 
          ...i, 
          id: uuidv4(),
          total: multiplyMoney(Number(i.unitPrice) || 0, Number(i.quantity) || 1)
        })) as QuoteItem[],
        laborHours: 'laborHours' in duplicateSource ? (duplicateSource as Quote).laborHours : 0,
        laborRate: 'laborRate' in duplicateSource ? (duplicateSource as Quote).laborRate : initialProfile.defaultLaborRate,
        materialCosts: 'materialCosts' in duplicateSource ? (duplicateSource as Quote).materialCosts : 0,
        taxRate: 'taxRate' in duplicateSource ? (duplicateSource as Quote).taxRate : initialProfile.defaultTaxRate,
        notes: 'notes' in duplicateSource ? (duplicateSource as Quote).notes : "",
        scopeDescription: duplicateSource.scopeDescription || "",
        status: 'draft'
      };
    }
    if (draft) {
      return {
        ...draft,
        clientId: preSelectedClientId || draft.clientId,
        status: 'status' in draft ? (draft as any).status : 'draft'
      };
    }
    return {
      clientId: preSelectedClientId || "",
      serviceCategory: initialProfile.offeredServices?.[0] || "General Contracting",
      items: [{ id: uuidv4(), description: "", unit: "ea", quantity: 1, length: "", width: "", unitPrice: 0, total: 0 }],
      laborHours: 0,
      laborRate: initialProfile.defaultLaborRate,
      materialCosts: 0,
      taxRate: initialProfile.defaultTaxRate,
      notes: "",
      scopeDescription: "",
      status: 'draft'
    };
  }, [duplicateSource, initialProfile, preSelectedClientId]);

  const [state, dispatch] = useReducer(quoteReducer, {
    past: [],
    present: initialState,
    future: []
  });

  const { present, past, future } = state;

  const isLocked = present.status !== 'draft' && present.status !== 'sent';

  useEffect(() => {
    saveDraftQuote(present);
  }, [present]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey)) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) dispatch({ type: 'REDO' });
          else dispatch({ type: 'UNDO' });
        } else if (e.key === 'y') {
          e.preventDefault();
          dispatch({ type: 'REDO' });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [isTemplateSaveDialogOpen, setIsTemplateSaveDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [isClientPopoverOpen, setIsClientPopoverOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");
  const [openLibraryId, setOpenLibraryId] = useState<string | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const selectedClient = useMemo(() => clients.find(c => c.id === present.clientId), [clients, present.clientId]);

  const totals = useMemo(() => {
    return calculateQuoteTotals({
      items: present.items,
      laborHours: Number(present.laborHours) || 0,
      laborRate: Number(present.laborRate) || 0,
      materialCosts: Number(present.materialCosts) || 0,
      taxRate: Number(present.taxRate) || 0
    });
  }, [present.items, present.laborHours, present.laborRate, present.materialCosts, present.taxRate]);

  const handleCreateAndSelectClient = () => {
    if (!newClientName || !newClientEmail || !user) {
      toast({ title: "Required Fields", description: "Name and Email are required.", variant: "destructive" });
      return;
    }

    const clientId = uuidv4();
    const newClient: Client = {
      id: clientId,
      name: newClientName,
      email: newClientEmail,
      phone: newClientPhone,
      address: newClientAddress,
    };

    const docRef = doc(db, "contractorProfiles", user.uid, "clients", clientId);
    setDocumentNonBlocking(docRef, {
      ...newClient,
      contractorId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    setLocalClients(prev => [...prev, newClient]);
    dispatch({ type: 'SET_FIELD', field: 'clientId', value: clientId, snapshot: true });

    setIsNewClientDialogOpen(false);
    setNewClientName("");
    setNewClientEmail("");
    setNewClientPhone("");
    setNewClientAddress("");
    toast({ title: "Client Created", description: `${newClientName} has been added and selected.` });
  };

  const handleSaveAsTemplate = () => {
    if (!newTemplateName || !user) {
      toast({ title: "Name Required", description: "Please enter a name for your template.", variant: "destructive" });
      return;
    }

    const templateId = uuidv4();
    const templateData: QuoteTemplate = {
      id: templateId,
      name: newTemplateName,
      serviceCategory: present.serviceCategory,
      scopeDescription: present.scopeDescription,
      items: present.items.filter(i => i.description.trim() !== "").map(i => ({
        description: i.description,
        unit: i.unit,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        total: i.total
      }))
    };

    const docRef = doc(db, "contractorProfiles", user.uid, "templates", templateId);
    setDocumentNonBlocking(docRef, templateData, { merge: true });

    setIsTemplateSaveDialogOpen(false);
    setNewTemplateName("");
    toast({ title: "Template Saved", description: `"${templateData.name}" has been added to your library.` });
  };

  const handleSaveQuote = () => {
    if (!present.clientId) {
      toast({ title: "Client Required", variant: "destructive" });
      return;
    }

    const quoteData: any = {
      id: uuidv4(),
      clientId: present.clientId,
      clientSnapshot: selectedClient ? {
        name: selectedClient.name,
        email: selectedClient.email,
        phone: selectedClient.phone,
        address: selectedClient.address
      } : undefined,
      date: new Date().toISOString(),
      status: present.status,
      serviceCategory: present.serviceCategory,
      items: present.items.filter(i => i.description.trim() !== ""),
      scopeDescription: present.scopeDescription,
      laborHours: Number(present.laborHours) || 0,
      laborRate: Number(present.laborRate) || 0,
      materialCosts: Number(present.materialCosts) || 0,
      taxRate: Number(present.taxRate) || 0,
      taxTotal: totals.taxTotal,
      subtotal: totals.subtotal,
      grandTotal: totals.grandTotal,
      notes: present.notes
    };

    const result = QuoteSchema.safeParse(quoteData);
    if (!result.success) {
      toast({ title: "Validation Error", description: result.error.errors[0].message, variant: "destructive" });
      return;
    }
    
    clearDraftQuote();
    onSave(result.data as Quote);
  };

  const organizedLibrary = useMemo(() => {
    const grouped: Record<string, CommonItem[]> = {};
    allLibraryItems.forEach(i => {
      if (!grouped[i.category]) grouped[i.category] = [];
      grouped[i.category].push(i);
    });
    return Object.entries(grouped).sort(([catA], [catB]) => {
      const isOfferedA = initialProfile.offeredServices?.some(s => catA.startsWith(s));
      const isOfferedB = initialProfile.offeredServices?.some(s => catB.startsWith(s));
      if (isOfferedA && !isOfferedB) return -1;
      if (!isOfferedA && isOfferedB) return 1;
      return catA.localeCompare(catB);
    });
  }, [allLibraryItems, initialProfile.offeredServices]);

  // Derived sorted categories for the Select component
  const sortedCategories = useMemo(() => {
    return [...SERVICE_CATEGORIES].sort((a, b) => {
      const isOfferedA = initialProfile.offeredServices?.includes(a);
      const isOfferedB = initialProfile.offeredServices?.includes(b);
      if (isOfferedA && !isOfferedB) return -1;
      if (!isOfferedA && isOfferedB) return 1;
      return a.localeCompare(b);
    });
  }, [initialProfile.offeredServices]);

  return (
    <div className="space-y-8">
      {isLocked && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 flex items-center gap-3 text-amber-800 text-sm font-medium">
            <Lock className="w-4 h-4" />
            This quote is locked because it has been accepted or invoiced. Edits are disabled.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className={cn("border-primary/10", isLocked && "opacity-70 pointer-events-none")}>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-4">
                <CardTitle className="text-lg">Configuration</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => dispatch({ type: 'UNDO' })} disabled={past.length === 0} className="h-7 w-7"><Undo2 className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => dispatch({ type: 'REDO' })} disabled={future.length === 0} className="h-7 w-7"><Redo2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Dialog open={isTemplateSaveDialogOpen} onOpenChange={setIsTemplateSaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
                      <PlusCircle className="w-3.5 h-3.5" /> Save Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader><DialogTitle>Save as Template</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Template Name</Label>
                        <Input 
                          placeholder="e.g. Standard Living Room Refresh" 
                          value={newTemplateName} 
                          onChange={(e) => setNewTemplateName(e.target.value)}
                        />
                        <p className="text-[10px] text-muted-foreground">This will save your current service category, items, and work scope description.</p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsTemplateSaveDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleSaveAsTemplate}>Save Template</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Popover>
                  <PopoverTrigger asChild><Button variant="outline" size="sm" className="gap-2 h-8 text-xs"><Copy className="w-3.5 h-3.5" /> Templates</Button></PopoverTrigger>
                  <PopoverContent className="w-72 p-0" align="end">
                    <div className="p-3 border-b bg-muted/30 font-bold text-[10px] uppercase text-muted-foreground">Available Templates</div>
                    <ScrollArea className="h-72">
                      <div className="p-1">
                        {allAvailableTemplates
                          .sort((a, b) => {
                            const isOfferedA = initialProfile.offeredServices?.includes(a.serviceCategory);
                            const isOfferedB = initialProfile.offeredServices?.includes(b.serviceCategory);
                            if (isOfferedA && !isOfferedB) return -1;
                            if (!isOfferedA && isOfferedB) return 1;
                            return 0;
                          })
                          .map(t => {
                            const isOffered = initialProfile.offeredServices?.includes(t.serviceCategory);
                            return (
                              <Button key={t.id} variant="ghost" className="w-full justify-start text-xs h-auto py-2.5 px-3 flex flex-col items-start" onClick={() => dispatch({ type: 'APPLY_TEMPLATE', template: t })}>
                                <div className="flex items-center gap-2 w-full">
                                  <span className="font-bold flex-1 truncate">{t.name}</span>
                                  {isOffered && <Star className="w-3 h-3 fill-primary text-primary shrink-0" />}
                                </div>
                                <span className="text-[9px] opacity-60 uppercase">{t.serviceCategory}</span>
                              </Button>
                            );
                          })}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Client</Label>
                {selectedClient ? (
                  <div className="flex items-center justify-between px-3 h-12 border rounded-lg bg-primary/5 border-primary/20">
                    <div className="flex items-center gap-3 truncate flex-1">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">{selectedClient.name.charAt(0)}</div>
                      <div className="truncate">
                        <p className="font-bold text-[13px] leading-tight truncate">{selectedClient.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{selectedClient.email}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => dispatch({ type: 'SET_FIELD', field: 'clientId', value: '', snapshot: true })}><X className="w-4 h-4" /></Button>
                  </div>
                ) : (
                  <Popover open={isClientPopoverOpen} onOpenChange={setIsClientPopoverOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <Search className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search name or email..." className="pl-9 h-12" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-full" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                      <ScrollArea className="max-h-64">
                        <div className="p-1">
                          {clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).map(c => (
                            <Button key={c.id} variant="ghost" className="w-full justify-start h-auto py-2 px-3 hover:bg-muted" onClick={() => { dispatch({ type: 'SET_FIELD', field: 'clientId', value: c.id, snapshot: true }); setIsClientPopoverOpen(false); }}>
                              <div className="flex items-center gap-3 overflow-hidden w-full text-left">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">{c.name.charAt(0)}</div>
                                <div className="flex flex-col overflow-hidden"><span className="text-sm font-semibold truncate">{c.name}</span><span className="text-[10px] text-muted-foreground truncate">{c.email}</span></div>
                              </div>
                            </Button>
                          ))}
                          <Button variant="ghost" className="w-full text-primary font-bold justify-start gap-2 border-t mt-1 h-11 rounded-none" onClick={() => setIsNewClientDialogOpen(true)}><UserPlus className="w-4 h-4" /> Add New Client</Button>
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <div className="space-y-2">
                <Label>Service Category</Label>
                <Select value={present.serviceCategory} onValueChange={(v) => dispatch({ type: 'SET_FIELD', field: 'serviceCategory', value: v, snapshot: true })}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedCategories.map(c => {
                      const isOffered = initialProfile.offeredServices?.includes(c);
                      return (
                        <SelectItem key={c} value={c}>
                          <div className="flex items-center justify-between w-full gap-2">
                            <span>{c}</span>
                            {isOffered && <Star className="w-3 h-3 fill-primary text-primary shrink-0" />}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className={cn("border-primary/10", isLocked && "opacity-70 pointer-events-none")}>
            <CardHeader className="bg-muted/30 py-3"><CardTitle className="text-sm font-bold uppercase tracking-wider">Scope & Line Items</CardTitle></CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <div className="hidden md:grid grid-cols-[20px_1fr_60px_50px_50px_60px_80px_90px_40px] gap-2 px-2 text-[10px] font-bold uppercase text-muted-foreground border-b pb-2">
                  <div></div><div>Description</div><div>Unit</div><div>L</div><div>W</div><div>Qty</div><div>Price</div><div className="text-right">Total</div><div></div>
                </div>
                <div className="space-y-2">
                  {present.items.map((item, idx) => (
                    <div key={item.id} className={cn("grid grid-cols-1 md:grid-cols-[20px_1fr_60px_50px_50px_60px_80px_90px_40px] gap-2 items-center group transition-opacity", draggedItemIndex === idx ? "opacity-40" : "opacity-100")} draggable onDragStart={(e) => { setDraggedItemIndex(idx); }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (draggedItemIndex !== null) dispatch({ type: 'REORDER_ITEMS', fromIndex: draggedItemIndex, toIndex: idx }); setDraggedItemIndex(null); }}>
                      <div className="flex justify-center cursor-grab active:cursor-grabbing text-muted-foreground/40 group-hover:text-primary rounded-sm p-0.5"><GripVertical className="w-3.5 h-3.5" /></div>
                      <div className="relative">
                        <Input value={item.description} onChange={(e) => dispatch({ type: 'UPDATE_ITEM', id: item.id, field: 'description', value: e.target.value })} className="h-8 text-xs pr-8" placeholder="Description..." />
                        <Popover open={openLibraryId === item.id} onOpenChange={(o) => setOpenLibraryId(o ? item.id : null)}>
                          <PopoverTrigger asChild><Button variant="ghost" size="icon" className="absolute right-0 top-0 h-8 w-8 text-muted-foreground"><BookOpen className="w-3.5 h-3.5" /></Button></PopoverTrigger>
                          <PopoverContent className="w-80 p-0 shadow-xl" side="bottom">
                            <div className="p-2 border-b bg-muted/50 font-bold text-[10px] uppercase">Library</div>
                            <ScrollArea className="h-80">
                              <div className="p-1">
                                {organizedLibrary.map(([cat, libItems]) => {
                                  const isOffered = initialProfile.offeredServices?.some(s => cat.startsWith(s));
                                  return (
                                    <div key={cat} className="mb-3">
                                      <p className={cn(
                                        "text-[9px] font-black uppercase px-2 py-1 rounded mb-1 flex items-center justify-between",
                                        isOffered ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
                                      )}>
                                        {cat}
                                        {isOffered && <Star className="w-2.5 h-2.5 fill-primary" />}
                                      </p>
                                      {libItems.map(li => (
                                        <Button key={li.id} variant="ghost" className="w-full justify-between text-[11px] h-auto py-1.5 px-2" onClick={() => {
                                          dispatch({ type: 'UPDATE_ITEM', id: item.id, field: 'description', value: li.description });
                                          dispatch({ type: 'UPDATE_ITEM', id: item.id, field: 'unit', value: li.unit || "ea" });
                                          dispatch({ type: 'UPDATE_ITEM', id: item.id, field: 'unitPrice', value: li.defaultUnitPrice });
                                          setOpenLibraryId(null);
                                        }}>
                                          <span className="truncate pr-2 text-left">{li.description}</span>
                                          <span className="font-bold shrink-0 opacity-70">${li.defaultUnitPrice}</span>
                                        </Button>
                                      ))}
                                    </div>
                                  );
                                })}
                              </div>
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Input value={item.unit} onChange={(e) => dispatch({ type: 'UPDATE_ITEM', id: item.id, field: 'unit', value: e.target.value })} className="h-8 text-xs text-center px-1" />
                      <Input type="number" value={item.length} onChange={(e) => dispatch({ type: 'UPDATE_ITEM', id: item.id, field: 'length', value: e.target.value })} className="h-8 text-xs text-center px-1" placeholder="L" />
                      <Input type="number" value={item.width} onChange={(e) => dispatch({ type: 'UPDATE_ITEM', id: item.id, field: 'width', value: e.target.value })} className="h-8 text-xs text-center px-1" placeholder="W" />
                      <Input type="number" value={item.quantity} onChange={(e) => dispatch({ type: 'UPDATE_ITEM', id: item.id, field: 'quantity', value: e.target.value })} className="h-8 text-xs text-center px-1 font-medium" />
                      <Input type="number" value={item.unitPrice} onChange={(e) => dispatch({ type: 'UPDATE_ITEM', id: item.id, field: 'unitPrice', value: e.target.value })} className="h-8 text-xs text-center px-1" />
                      <div className="text-right text-xs font-bold px-1">{formatCurrency(item.total)}</div>
                      <div className="flex justify-end"><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100" onClick={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })}><Trash2 className="w-3.5 h-3.5" /></Button></div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full border-dashed border-2 h-10 gap-2 hover:bg-primary/5 transition-all" onClick={() => dispatch({ type: 'ADD_ITEM' })}><Plus className="w-4 h-4" /> Add Line Item</Button>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Detailed Work Scope</Label>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">Generating clear project objectives helps close more deals.</span>
                </div>
                <Textarea value={present.scopeDescription} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'scopeDescription', value: e.target.value })} className="min-h-[180px] text-sm leading-relaxed" placeholder="Describe project objectives..." />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className={cn("sticky top-8 border-primary/30 shadow-xl overflow-hidden", isLocked && "opacity-70 pointer-events-none")}>
            <CardHeader className="bg-primary/5 border-b border-primary/10 py-4"><CardTitle className="text-lg flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary" /> Pricing & Totals</CardTitle></CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Labor Rate</Label><Input type="number" value={present.laborRate} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'laborRate', value: e.target.value })} className="font-bold text-primary" /></div>
                <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Labor Hours</Label><Input type="number" value={present.laborHours} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'laborHours', value: e.target.value })} className="font-bold" /></div>
                <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Materials</Label><Input type="number" value={present.materialCosts} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'materialCosts', value: e.target.value })} className="font-bold" /></div>
                <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Tax Rate (%)</Label><Input type="number" value={present.taxRate} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'taxRate', value: e.target.value })} className="font-bold" /></div>
              </div>
              <div className="space-y-3 pt-6 border-t border-dashed">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Items & Services</span><span className="font-medium">{formatCurrency(present.items.reduce((acc, i) => addMoney(acc, i.total), 0))}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Labor Subtotal</span><span className="font-medium">{formatCurrency(multiplyMoney(present.laborRate, present.laborHours))}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax ({present.taxRate}%)</span><span className="font-medium">{formatCurrency(totals.taxTotal)}</span></div>
                <div className="pt-4 border-t-2 border-primary/20"><div className="flex justify-between items-center"><span className="text-xs font-black uppercase text-muted-foreground">Total Quote Amount</span><span className="text-2xl font-black text-primary">{formatCurrency(totals.grandTotal)}</span></div></div>
              </div>
              <Button size="lg" className="w-full h-14 text-lg font-black gap-2 shadow-lg" onClick={handleSaveQuote} disabled={isLocked}><Save className="w-5 h-5" /> {isLocked ? "Quote Locked" : "Save Quote"}</Button>
              <div className="pt-4 space-y-3"><Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Internal Notes</Label><Textarea value={present.notes} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'notes', value: e.target.value })} placeholder="Private notes..." className="text-xs min-h-[80px] bg-muted/20 border-none" /></div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="text-xl font-bold">New Client Profile</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Full Name</Label><Input placeholder="e.g. Jane Smith" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Email Address</Label><Input type="email" placeholder="jane@example.com" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} /></div>
            <div className="space-y-2"><Label>Phone Number</Label><Input placeholder="e.g. 555-0100" value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} /></div>
            <div className="space-y-2"><Label>Address</Label><Input placeholder="e.g. 123 Main St" value={newClientAddress} onChange={(e) => setNewClientAddress(e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsNewClientDialogOpen(false)}>Cancel</Button><Button onClick={handleCreateAndSelectClient}>Create & Pre-select</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
