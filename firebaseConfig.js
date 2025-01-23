// Importa os métodos do Firebase modular
const { initializeApp, getApps } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getDatabase } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyDGyhOg3Y6D1RvGc5OQadjVsVa8GbgMhcg",
  authDomain: "projetofinal-7ac00.firebaseapp.com",
  databaseURL: "https://projetofinal-7ac00-default-rtdb.firebaseio.com",
  projectId: "projetofinal-7ac00",
  storageBucket: "projetofinal-7ac00.firebasestorage.app",
  messagingSenderId: "654582872689",
  appId: "1:654582872689:web:1c8b8e1ac5ff90267879d0",
  measurementId: "G-Y9J868QRB7"
};

// Inicializa o Firebase apenas se não houver uma instância ativa
let firebaseApp;

if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

// Obtém o Auth e o Database
const auth = getAuth(firebaseApp);
const database = getDatabase(firebaseApp);
const firebase = initializeApp(firebaseConfig);

module.exports = { auth, database, firebase };