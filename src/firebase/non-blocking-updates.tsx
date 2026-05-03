
'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';
import { Quote, Invoice } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Initiates a setDoc operation for a document reference.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  setDoc(docRef, data, options).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'write',
        requestResourceData: data,
      })
    )
  })
}

/**
 * Updates a quote status and handles lifecycle side effects like invoice creation.
 */
export async function updateQuoteStatus(db: any, contractorId: string, quote: Quote, newStatus: Quote['status']) {
  const quoteRef = doc(db, "contractorProfiles", contractorId, "quotes", quote.id);
  
  const updates: any = {
    status: newStatus,
    updatedAt: serverTimestamp()
  };

  // If moving to 'invoiced', create the invoice record
  if (newStatus === 'invoiced') {
    const invoiceId = uuidv4();
    const invoiceRef = doc(db, "contractorProfiles", contractorId, "invoices", invoiceId);
    
    const invoiceData: Invoice = {
      id: invoiceId,
      quoteId: quote.id,
      contractorId: contractorId,
      clientId: quote.clientId,
      date: new Date().toISOString(),
      status: 'unpaid',
      items: quote.items,
      subtotal: quote.subtotal,
      taxTotal: quote.taxTotal,
      grandTotal: quote.grandTotal
    };

    await setDoc(invoiceRef, invoiceData);
  }

  await updateDoc(quoteRef, updates);
}

/**
 * Mock Stripe payment processing
 */
export async function processMockPayment(db: any, contractorId: string, quote: Quote) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const quoteRef = doc(db, "contractorProfiles", contractorId, "quotes", quote.id);
  
  // 1. Update Quote
  await updateDoc(quoteRef, {
    status: 'paid',
    updatedAt: serverTimestamp()
  });

  // 2. Find and update associated invoice(s)
  // In a real app we'd query, but for this mock we'll assume the status update 
  // triggers a cloud function or similar. Here we just update the quote status.
}

export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  const promise = addDoc(colRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        })
      )
    });
  return promise;
}

export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      )
    });
}

export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      )
    });
}
