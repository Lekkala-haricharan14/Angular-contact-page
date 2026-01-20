import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContactService } from '../../services/contact';
import { Contact } from '../../models/contact.model';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.css'
})
export class ContactListComponent implements OnInit {
  contacts: Contact[] = [];
  loading = true;
  deletingEmployeeId: number | null = null;

  constructor(
    private contactService: ContactService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.contactService.getContacts().subscribe({
      next: (data) => {
        // JSON Server should always return contacts with IDs
        // If a contact doesn't have an ID, log a warning
        this.contacts = data.map((contact, index) => {
          if (!contact.id) {
            console.warn(`Contact at index ${index} has no ID:`, contact);
          }
          return contact;
        });
        console.log('Loaded contacts:', this.contacts.map(c => ({ id: c.id, name: c.name })));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading contacts:', err);
        this.loading = false;
      }
    });
  }

  viewContact(employeeId: number | undefined): void {
    if (employeeId !== undefined && employeeId !== null && !isNaN(employeeId)) {
      console.log('Navigating to contact with employeeId:', employeeId);
      this.router.navigate(['/contacts', employeeId]).catch(err => {
        console.error('Navigation error:', err);
      });
    } else {
      console.error('Invalid employee ID:', employeeId);
    }
  }

  openWhatsApp(phone: string): void {
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
  }

  openInstagram(username: string | undefined): void {
    if (username) {
      window.open(`https://instagram.com/${username}`, '_blank');
    }
  }

  openLinkedIn(profile: string | undefined): void {
    if (profile) {
      window.open(`https://linkedin.com/in/${profile}`, '_blank');
    }
  }

  deleteContact(employeeId: number | undefined, event: Event): void {
    event.stopPropagation();
    
    if (!employeeId || isNaN(employeeId) || employeeId <= 0) {
      console.error('Invalid employee ID for deletion:', employeeId);
      alert('Cannot delete contact: Invalid Employee ID');
      return;
    }
    
    // Find the contact to show its name in confirmation
    const contactToDelete = this.contacts.find(c => c.employeeId === employeeId);
    const contactName = contactToDelete?.name || 'this contact';
    
    if (confirm(`Are you sure you want to delete ${contactName} (Employee ID: ${employeeId})?`)) {
      this.deletingEmployeeId = employeeId;
      console.log('=== DELETE ATTEMPT ===');
      console.log('Deleting contact with Employee ID:', employeeId);
      console.log('Contact name:', contactName);
      
      this.contactService.deleteContactByEmployeeId(employeeId).subscribe({
        next: () => {
          console.log('✓ Contact deleted successfully');
          this.deletingEmployeeId = null;
          this.loadContacts();
        },
        error: (deleteErr) => {
          console.error('✗ Delete failed:', deleteErr);
          this.deletingEmployeeId = null;
          
          const errorMessage = deleteErr?.message || 
            (deleteErr?.status 
              ? `Failed to delete contact. HTTP ${deleteErr.status}: ${deleteErr.statusText || 'Unknown error'}`
              : 'Failed to delete contact. Please check if JSON server is running.');
          alert(errorMessage);
        }
      });
    }
  }
}
