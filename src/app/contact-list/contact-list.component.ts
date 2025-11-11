getContacts(): void {
  this.contactService.getContacts().subscribe(
    (response: any) => {
      console.log('Ответ от сервера:', response); // Для отладки
      if (response.success) {
        this.contacts = response.data;
      } else {
        this.contacts = response; // На случай если response уже массив
      }
    },
    error => {
      console.error('Ошибка загрузки контактов:', error);
      alert('Ошибка подключения к серверу. Проверьте, запущен ли бэкенд на порту 5000');
    }
  );
}