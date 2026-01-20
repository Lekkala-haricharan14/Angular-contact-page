export interface Contact {
  id?: number; // JSON Server's internal ID (auto-generated, not used in app)
  employeeId: number; // User-entered unique employee ID
  name: string;
  phone: string;
  email: string;
  photo: string;
  instagram?: string;
  linkedin?: string;
  whatsapp?: string;
  address?: string;
  company?: string;
  notes?: string;
}
