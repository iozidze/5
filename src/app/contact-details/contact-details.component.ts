import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Contact } from '../models/contact';

@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.css']
})
export class ContactDetailsComponent {
  @Input() contact?: Contact;
  @Output() contactSaved = new EventEmitter<Contact>();
  @Output() contactDeleted = new EventEmitter<string>();

  saveContact(): void {
    if (this.contact) {
      this.contactSaved.emit(this.contact);
    }
  }

  deleteContact(): void {
    if (this.contact && this.contact._id) {
      this.contactDeleted.emit(this.contact._id);
    }
  }
}