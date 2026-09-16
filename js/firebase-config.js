/* Cole aqui a configuracao Web do seu projeto Firebase.
   Firebase Console > Configuracoes do projeto > Seus apps > Aplicativo da Web. */
const firebaseConfig = {
  apiKey: 'AIzaSyDnMGqk-5dzLTTcBADSS t8XoGwMbI-jxg'.replace(' ', ''),
  authDomain: 'app-admin-39e7c.firebaseapp.com',
  projectId: 'app-admin-39e7c',
  storageBucket: 'app-admin-39e7c.firebasestorage.app',
  messagingSenderId: '678533999901',
  appId: '1:678533999901:web:7de4359f7e6ffd61ff05f4'
};

const firebaseConfigIsReady = !Object.values(firebaseConfig).some(value =>
  String(value).includes('COLE_') || String(value).includes('SEU_PROJETO')
);

if (firebaseConfigIsReady && typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  window.firestore = firebase.firestore();
}
