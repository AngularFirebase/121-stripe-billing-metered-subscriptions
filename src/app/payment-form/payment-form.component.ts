import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFireFunctions } from 'angularfire2/functions';

declare var Stripe: any;

const stripe = Stripe('pk_test_m3a5moXVKgThpdfwzKILvnbG');
const elements = stripe.elements();

const card = elements.create('card');

@Component({
  selector: 'payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent implements AfterViewInit {
  @ViewChild('cardForm') cardForm: ElementRef;
  constructor(private fun: AngularFireFunctions) {}

  ngAfterViewInit() {
    card.mount(this.cardForm.nativeElement);
  }

  async handleForm(e) {
    e.preventDefault();
    console.log(e);
    const { token, error } = await stripe.createToken(card);

    if (error) {
      // Inform the customer that there was an error.
      const errorElement = document.getElementById('card-errors');
      errorElement.textContent = error.message;
    } else {
      const res = await this.fun
        .httpsCallable('startSubscription')({ source: token.id })
        .toPromise();
      console.log(res);
    }
  }
}
