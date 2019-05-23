import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import {AuthService} from '../../core/services/auth.service';
import {PhaseService} from '../../core/services/phase.service';
import {UserService} from '../../core/services/user.service';
import {NavigationEnd, Router, RoutesRecognized} from '@angular/router';
import {filter, pairwise, delay} from 'rxjs/operators';

@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  private prevUrl;
  disableButton = false;

  constructor(private router: Router, public auth: AuthService, public phaseService: PhaseService, public userService: UserService,
              private location: Location) {
    router.events.pipe(
      filter((e: any) => e instanceof RoutesRecognized),
      pairwise()
    ).subscribe(e => {
      this.prevUrl = e[0].urlAfterRedirects;
    });
  }

  ngOnInit() {}

  needToShowBackButton(): boolean {
    return `/${this.phaseService.currentPhase}` !== this.router.url && this.router.url !== '/';
  }

  needToShowReloadButton(): boolean {
    return this.router.url === '/phase1' || this.router.url === '/phase2' || this.router.url === '/phase3';
  }

  goBack() {
    if (this.prevUrl === `/${this.phaseService.currentPhase}/issues/new`) {
      this.router.navigate(['/phase1']);
    } else {
      this.location.back();
    }
  }

  refresh() {
    this.disableButton = true;
    this.router.navigate([this.router.url]);
    // Prevent user from spamming the reload button
    setTimeout(() => {
      this.disableButton = false;
    },
    3000);
  }

  logOut() {
    this.auth.logOut();
  }
}
