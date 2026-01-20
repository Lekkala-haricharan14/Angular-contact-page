import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactService } from '../../services/contact';
import { Contact } from '../../models/contact.model';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.css'
})
export class ContactFormComponent implements OnInit {
  contactForm: FormGroup;
  isEditMode = false;
  employeeId: number | null = null;
  loading = false;
  allContacts: Contact[] = [];

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.contactForm = this.fb.group({
      employeeId: ['', [Validators.required, Validators.min(1)], [this.uniqueEmployeeIdValidator.bind(this)]],
      name: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      photo: ['', [Validators.required]],
      instagram: [''],
      linkedin: [''],
      whatsapp: [''],
      company: [''],
      address: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Load all contacts for unique validation
    this.contactService.getContacts().subscribe({
      next: (contacts) => {
        this.allContacts = contacts;
      }
    });

    const employeeIdParam = this.route.snapshot.paramMap.get('employeeId');
    if (employeeIdParam) {
      this.isEditMode = true;
      this.employeeId = Number(employeeIdParam);
      this.loadContact(this.employeeId);
    }
  }

  uniqueEmployeeIdValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) {
      return new Observable(observer => {
        observer.next(null);
        observer.complete();
      });
    }

    return this.contactService.getContacts().pipe(
      map((contacts) => {
        const employeeId = Number(control.value);
        const existingContact = contacts.find(c => c.employeeId === employeeId);
        
        // In edit mode, allow the same employeeId if it's the current contact
        if (this.isEditMode && this.employeeId === employeeId) {
          return null;
        }
        
        if (existingContact) {
          return { uniqueEmployeeId: true };
        }
        return null;
      })
    );
  }

  loadContact(employeeId: number): void {
    this.contactService.getContactByEmployeeId(employeeId).subscribe({
      next: (contact) => {
        this.contactForm.patchValue(contact);
        // Disable employeeId in edit mode
        this.contactForm.get('employeeId')?.disable();
      },
      error: (err) => {
        console.error('Error loading contact:', err);
        alert('Contact not found');
        this.router.navigate(['/contacts']);
      }
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.loading = true;
      const formValue = this.contactForm.getRawValue(); // Get raw value to include disabled fields
      const contact: Contact = formValue;

      if (this.isEditMode && this.employeeId) {
        this.contactService.updateContactByEmployeeId(this.employeeId, contact).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/contacts', this.employeeId]);
          },
          error: (err) => {
            console.error('Error updating contact:', err);
            alert('Failed to update contact. Please try again.');
            this.loading = false;
          }
        });
      } else {
        this.contactService.createContact(contact).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/contacts']);
          },
          error: (err) => {
            console.error('Error creating contact:', err);
            if (err.error && err.error.message && err.error.message.includes('employeeId')) {
              alert('Employee ID already exists. Please use a different ID.');
            } else {
              alert('Failed to create contact. Please try again.');
            }
            this.loading = false;
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }

  cancel(): void {
    if (this.isEditMode && this.employeeId) {
      this.router.navigate(['/contacts', this.employeeId]);
    } else {
      this.router.navigate(['/contacts']);
    }
  }
}
