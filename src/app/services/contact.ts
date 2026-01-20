import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, take } from 'rxjs';
import { Contact } from '../models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:3000/contacts';

  constructor(private http: HttpClient) { }

  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.apiUrl);
  }

  getContactByEmployeeId(employeeId: number): Observable<Contact> {
    return this.getContacts().pipe(
      take(1),
      switchMap((contacts) => {
        const contact = contacts.find(c => c.employeeId === employeeId);
        if (contact) {
          return new Observable<Contact>(observer => {
            observer.next(contact);
            observer.complete();
          });
        } else {
          throw new Error(`Contact with employeeId ${employeeId} not found`);
        }
      })
    );
  }

  getContactById(id: number): Observable<Contact> {
    return this.http.get<Contact>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new contact. EmployeeId must be provided and unique.
   */
  createContact(contact: Contact): Observable<Contact> {
    // Remove id to let JSON Server assign its own internal ID
    const { id, ...contactForServer } = contact;
    return this.http.post<Contact>(this.apiUrl, contactForServer);
  }

  updateContactByEmployeeId(employeeId: number, contact: Contact): Observable<Contact> {
    return this.getContacts().pipe(
      take(1),
      switchMap((contacts) => {
        const existingContact = contacts.find(c => c.employeeId === employeeId);
        if (!existingContact || !existingContact.id) {
          throw new Error(`Contact with employeeId ${employeeId} not found`);
        }
        const { id, ...contactWithoutId } = contact;
        return this.http.put<Contact>(`${this.apiUrl}/${existingContact.id}`, contactWithoutId);
      })
    );
  }

  deleteContactByEmployeeId(employeeId: number): Observable<void> {
    return this.getContacts().pipe(
      take(1),
      switchMap((contacts) => {
        const contact = contacts.find(c => c.employeeId === employeeId);
        if (!contact || !contact.id) {
          throw new Error(`Contact with employeeId ${employeeId} not found`);
        }
        return this.http.delete<void>(`${this.apiUrl}/${contact.id}`);
      })
    );
  }
}
