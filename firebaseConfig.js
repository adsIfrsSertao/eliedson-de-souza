// Importa os métodos do Firebase modular
const { initializeApp, getApps } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getDatabase } = require('firebase/database');

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_DOMINIO.firebaseapp.com",
  databaseURL: "https://SEU_DATABASE.firebaseio.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_BUCKET",
  messagingSenderId: "SEU_ID",
  appId: "SEU_APP_ID",
  measurementId: "SEU_ID"
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
