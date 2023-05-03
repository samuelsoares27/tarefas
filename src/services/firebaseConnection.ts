
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBpW5VldR3C8WHEjV_pZrtNg6pG8x65mGk",
    authDomain: "tarefasnext.firebaseapp.com",
    projectId: "tarefasnext",
    storageBucket: "tarefasnext.appspot.com",
    messagingSenderId: "643888372645",
    appId: "1:643888372645:web:c8b0bdf7be82052ca3264c"
};

const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);

export { db };