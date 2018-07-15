import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../auth.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'project-manager',
  templateUrl: './project-manager.component.html',
  styleUrls: ['./project-manager.component.scss']
})
export class ProjectManagerComponent implements OnInit {
  @Input() userId;

  projects: Observable<any>;

  constructor(public auth: AuthService, public afs: AngularFirestore) {}

  ngOnInit() {
    console.log(this.userId);
    this.projects = this.afs
      .collection('projects', ref => ref.where('userId', '==', this.userId))
      .valueChanges();
  }

  newProject() {
    this.afs.collection('projects').add({
      userId: this.userId,
      createdAt: Date.now()
    });
  }
}

// function uuid(a?) {
//   return a
//     ? // tslint:disable-next-line:no-bitwise
//       (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
//     : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid);
// }
