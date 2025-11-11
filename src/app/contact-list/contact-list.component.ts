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
    this.contactService.getContacts().subscribe(
      (response: any) => {
        this.contacts = response.data || response;
      },
      error => {
        console.error('Ошибка загрузки контактов:', error);
      }
    );
  }

  onSelect(contact: Contact): void {
    this.selectedContact = contact;
  }

  createNewContact(): void {
    this.selectedContact = {
      username: '',
      email: '',
      phone: { mobile: '', home: '' }
    };
  }

  onContactSaved(contact: Contact): void {
    if (!contact._id) {
      this.contactService.createContact(contact).subscribe(
        (newContact: any) => {
          const createdContact = newContact.data || newContact;
          this.contacts.push(createdContact);
          this.selectedContact = createdContact;
          this.getContacts(); // Обновляем список
        },
        error => {
          console.error('Ошибка создания контакта:', error);
        }
      );
    } else {
      this.contactService.updateContact(contact).subscribe(
        () => {
          this.getContacts(); // Обновляем весь список
          this.selectedContact = contact;
        },
        error => {
          console.error('Ошибка обновления контакта:', error);
        }
      );
    }
  }

  onContactDeleted(contactId: string | undefined): void {
    if (!contactId) return;
    this.contactService.deleteContact(contactId).subscribe(
      () => {
        this.contacts = this.contacts.filter(c => c._id !== contactId);
        this.selectedContact = undefined;
      },
      error => {
        console.error('Ошибка удаления контакта:', error);
      }
    );
  }
}