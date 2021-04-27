import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";
import "firebase/database";

const firebaseConfig = {
  apiKey: "apiKey",
  projectId: "imagefluxhouse",
  databaseURL: "imagefluxhouse?ns=imagefluxhouse",
};
firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const functions = firebase.app().functions("us-central1");
export const db = firebase.database();
if (location.hostname === "localhost") {
  auth.useEmulator("http://localhost:2001");
  functions.useEmulator("localhost", 2002);
  db.useEmulator("localhost", 2004);
}
auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);

export const CreateRoom = functions.httpsCallable("CreateRoom");
export const ListRoom = functions.httpsCallable("ListRoom");
export const JoinRoom = functions.httpsCallable("JoinRoom");
export const LeaveRoom = functions.httpsCallable("LeaveRoom");
export const SetMute = functions.httpsCallable("SetMute");
export const SetHand = functions.httpsCallable("SetHand");
export const UpgradeUser = functions.httpsCallable("UpgradeUser");
