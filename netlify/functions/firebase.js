const firebase = require("firebase/app")
require("firebase/firestore")

const firebaseConfig = {
  apiKey: "AIzaSyDSyuw3n4ntZw6H1wkOtkp49z3XSY2W7gs",
  authDomain: "softwaredev-66804.firebaseapp.com",
  projectId: "softwaredev-66804",
  storageBucket: "softwaredev-66804.appspot.com",
  messagingSenderId: "563803540368",
  appId: "1:563803540368:web:774517c3936b9d270b4115"
 } // replace

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

module.exports = firebase