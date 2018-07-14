import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireFunctionsModule } from 'angularfire2/functions';
import { AngularFireAuthModule } from 'angularfire2/auth';

// Add your project credentials
// Then use it in the imports section below
const yourFirebaseConfig = {
  apiKey: '<your-key>',
  authDomain: '<your-project-authdomain>',
  databaseURL: '<your-database-URL>',
  projectId: '<your-project-id>',
  storageBucket: '<your-storage-bucket>',
  messagingSenderId: '<your-messaging-sender-id>'
};

// Delete Me!
import { firebase } from '../env';
import { PaymentFormComponent } from './payment-form/payment-form.component';
import { FortuneTellerComponent } from './fortune-teller/fortune-teller.component';

@NgModule({
  declarations: [AppComponent, PaymentFormComponent, FortuneTellerComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireFunctionsModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
