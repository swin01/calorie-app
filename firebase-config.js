import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getAnalytics
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js";


/*
=========================================
FIREBASE CONFIGURATION
=========================================

This configuration identifies your Firebase
web application.

Do NOT put Groq or ImgBB secret API keys here.
*/

const firebaseConfig = {

  apiKey: "YOUR_FIREBASE_API_KEY",

  authDomain:
    "calorie-app-aa3d4.firebaseapp.com",

  projectId:
    "calorie-app-aa3d4",

  storageBucket:
    "calorie-app-aa3d4.firebasestorage.app",

  messagingSenderId:
    "405928920989",

  appId:
    "1:405928920989:web:b082265954242d2600d174",

  measurementId:
    "G-1DREHMTQT8"

};


/*
=========================================
INITIALIZE FIREBASE
=========================================
*/

const app =
  initializeApp(firebaseConfig);


/*
=========================================
FIREBASE ANALYTICS
=========================================
*/

const analytics =
  getAnalytics(app);


/*
=========================================
EXPORT
=========================================
*/

export {
  app,
  analytics
};
