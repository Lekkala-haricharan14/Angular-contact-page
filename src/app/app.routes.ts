import { Routes } from '@angular/router';
import { ContactListComponent } from './components/contact-list/contact-list';
import { ContactDetailComponent } from './components/contact-detail/contact-detail';
import { ContactFormComponent } from './components/contact-form/contact-form';


export const routes: Routes = [
  { path: '', redirectTo: '/contacts', pathMatch: 'full' },
  { path: 'contacts', component: ContactListComponent },
  { path: 'contacts/new', component: ContactFormComponent },
  { path: 'contacts/:employeeId', component: ContactDetailComponent },
  { path: 'contacts/:employeeId/edit', component: ContactFormComponent }
];
