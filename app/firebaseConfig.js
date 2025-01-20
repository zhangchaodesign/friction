// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyC0agrn0lpTWQG_zozWoawG6RXWNB5VVb0',
  authDomain: 'friction-d38f7.firebaseapp.com',
  databaseURL: 'https://friction-d38f7-default-rtdb.firebaseio.com',
  projectId: 'friction-d38f7',
  storageBucket: 'friction-d38f7.appspot.com',
  messagingSenderId: '70851515931',
  appId: '1:70851515931:web:a97ef5a845570e1fa80abe',
  measurementId: 'G-9E3CE4NBJ0'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
