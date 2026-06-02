// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuração oficial do seu projeto sistema-de-avaliacao-26657
const firebaseConfig = {
  apiKey: "AIzaSyC_ZM0WMWbCgJNzjLTzuHgQFg7_uXwyY",
  authDomain: "sistema-de-avaliacao-26657.firebaseapp.com",
  projectId: "sistema-de-avaliacao-26657",
  storageBucket: "sistema-de-avaliacao-26657.appspot.com",
  messagingSenderId: "301224749983",
  appId: "1:301224749983:web:75387ab7916e7bcf9583cc",
  measurementId: "G-J2JXBXYH7F"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa e exporta o Banco de Dados (Firestore)
export const db = getFirestore(app);
