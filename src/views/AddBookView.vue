<template>
  <div class="container d-flex flex-column align-items-center justify-content-start min-vh-100 text-center mt-5">
    <h1>Add Book</h1>
    <form @submit.prevent="addBook" class="w-50">
      <div class="mb-3">
        <label for="isbn" class="form-label">ISBN:</label>
        <input type="text" v-model="isbn" id="isbn" class="form-control" required />
      </div>
      <div class="mb-3">
        <label for="name" class="form-label">Name:</label>
        <input type="text" v-model="name" id="name" class="form-control" required />
      </div>
      <button type="submit" class="btn btn-primary">Add Book</button>
    </form>
    <BookList class="mt-4 w-75" />
  </div>
</template>


<script>
import { ref } from 'vue';
import db from '../firebase/init.js'
import { collection, addDoc } from 'firebase/firestore';

import BookList from '../components/BookList.vue';

export default {
  setup() {
    const isbn = ref('');
    const name = ref('');

    const addBook = async () => {
      try {
        const isbnNumber = Number(isbn.value);
        if (isNaN(isbnNumber)) {
          alert('ISBN must be a valid number');
          return;
        }

        await addDoc(collection(db, 'books'), {
          isbn: isbnNumber,
          name: name.value
        });
        isbn.value = '';
        name.value = '';
        alert('Book added successfully!');
      } catch (error) {
        console.error('Error adding book: ', error);
      }
    };

    return {
      isbn,
      name,
      addBook
    };
  },
  components: {
    BookList
  }
};
</script>

