import { Component } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private afs: AngularFirestore, private auth: AuthService) {
    //   afs.collection('animals').snapshotChanges(
    // ).subscribe(x => {
    //   console.log(x)
    // })
    const fire = firebase.firestore().doc('animals/elephant');
  }
}
