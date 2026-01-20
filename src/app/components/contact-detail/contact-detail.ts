import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContactService } from '../../services/contact';
import { Contact } from '../../models/contact.model';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contact-detail.html',
  styleUrl: './contact-detail.css'
})
export class ContactDetailComponent implements OnInit {
  contact: Contact | null = null;
  loading = true;
  deleting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contactService: ContactService
  ) { }

  ngOnInit(): void {
    // Use route.params observable to handle route changes
    this.route.paramMap.subscribe(params => {
      const employeeIdParam = params.get('employeeId');
      console.log('Route param employeeId:', employeeIdParam);
      const employeeId = employeeIdParam ? Number(employeeIdParam) : null;
      
      if (employeeId && !isNaN(employeeId) && employeeId > 0) {
        this.loading = true;
        this.contact = null;
        
        console.log('Fetching contact with Employee ID:', employeeId);
        this.contactService.getContactByEmployeeId(employeeId).subscribe({
          next: (data) => {
            console.log('Contact loaded successfully:', data);
            this.contact = data;
            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading contact:', err);
            this.loading = false;
            this.contact = null;
          }
        });
      } else {
        console.error('Invalid employee ID:', employeeIdParam, 'Parsed as:', employeeId);
        this.loading = false;
        this.contact = null;
      }
    });
  }

  deleteContact(): void {
    const employeeId = this.contact?.employeeId;
    const contactName = this.contact?.name || 'this contact';
    
    if (!employeeId || isNaN(employeeId) || employeeId <= 0) {
      console.error('Invalid employee ID for deletion:', employeeId);
      alert('Cannot delete contact: Invalid Employee ID');
      return;
    }
    
    if (confirm(`Are you sure you want to delete ${contactName} (Employee ID: ${employeeId})?`)) {
      this.deleting = true;
      console.log('Deleting contact with Employee ID:', employeeId);
      
      this.contactService.deleteContactByEmployeeId(employeeId).subscribe({
        next: () => {
          console.log('Contact deleted successfully');
          this.deleting = false;
          this.router.navigate(['/contacts']);
        },
        error: (err) => {
          console.error('Error deleting contact:', err);
          this.deleting = false;
          
          const errorMessage = err?.message || 
            (err?.status 
              ? `Failed to delete contact. HTTP ${err.status}: ${err.statusText || 'Unknown error'}`
              : 'Failed to delete contact. Please check if JSON server is running.');
          alert(errorMessage);
        }
      });
    }
  }

  openWhatsApp(): void {
    if (this.contact?.phone) {
      window.open(`https://wa.me/${this.contact.phone.replace(/\D/g, '')}`, '_blank');
    }
  }

  openInstagram(): void {
    if (this.contact?.instagram) {
      window.open(`https://instagram.com/${this.contact.instagram}`, '_blank');
    }
  }

  openLinkedIn(): void {
    if (this.contact?.linkedin) {
      window.open(`https://linkedin.com/in/${this.contact.linkedin}`, '_blank');
    }
  }
}
