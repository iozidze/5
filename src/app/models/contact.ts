export class Contact {
  _id?: string;
  username: string;  // Изменено с name на username
  email: string;
  phone: {
    mobile: string;
    home?: string;   // Изменено с work на home
  }
}