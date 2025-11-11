import { Component, OnInit } from '@angular/core';
import { Contact } from '../models/contact';
import { ContactService } from '../services/contact.service';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css']
})
export class ContactListComponent implements OnInit {
  contacts: Contact[] = [];
  selectedContact?: Contact;

  constructor(private contactService: ContactService) { }

  ngOnInit(): void {
    this.getContacts();
  }

  getContacts(): void {
    this.contactService.getContacts().subscribe(contacts => this.contacts = contacts);
  }

  onSelect(contact: Contact): void {
    this.selectedContact = contact;
  }

  createNewContact(): void {
    this.selectedContact = {
      name: '',
      email: '',
      phone: { mobile: '', work: '' }
    };
  }

  onContactSaved(contact: Contact): void {
    if (!contact._id) {
      this.contactService.createContact(contact).subscribe(newContact => {
        this.contacts.push(newContact);
        this.selectedContact = newContact;
      });
    } else {
      this.contactService.updateContact(contact).subscribe(() => {
        const index = this.contacts.findIndex(c => c._id === contact._id);
        if (index !== -1) {
          this.contacts[index] = contact;
        }
        this.selectedContact = contact;
      });
    }
  }

  onContactDeleted(contactId: string | undefined): void {
    if (!contactId) return;
    this.contactService.deleteContact(contactId).subscribe(() => {
      this.contacts = this.contacts.filter(c => c._id !== contactId);
      this.selectedContact = undefined;
    });
  }
}