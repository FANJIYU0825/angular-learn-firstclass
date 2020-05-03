import { Component } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterEvent, ActivatedRoute } from '@angular/router';
import { SessionService } from './shared/services/session.service';
import { IProfile } from '@shared/types';
import { select, Store } from '@ngrx/store';

import * as fromRoot from './shared/store';
import * as fromUI from './shared/store/ui';
import { LambdaService } from './shared/services/lambda.services';
import { DynamoService } from './shared/services/dynamo.service';
import { VocabService } from './shared/services/vocab.service';
import { filter, take } from 'rxjs/operators';
import { ScrollPosition } from './shared/store/ui';
import { Location } from '@angular/common';
import { AnalyticsService } from './shared/services/analytics.service';
import { LMSErrorTypes } from './shared/types/error';
import { ProductService } from './shared/services/product.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent {
  title = 'app';
  public showModalLoading = false;
  public showError = false;

  private profile: IProfile;


  constructor(private router: Router,
              private route: ActivatedRoute,
              private store: Store<fromRoot.SharedState>,
              private session: SessionService,
              private lambda: LambdaService,
              private dynamo: DynamoService,
              private vocab: VocabService,
              private location: Location,
              private analytics: AnalyticsService,
              private product: ProductService) {
    // Some services are just passed in here to be global,
    // don't remove them from the constructor unless it's
    // confirmed not to be used or needed as a global/singleton
    // type instance
    router.events.subscribe((event: RouterEvent) => {
      this.navigationListener(event);
    });

    // this subscription is live for the entire time the app is.
    // logged in or out, with or without a profile
    this.store.pipe(
      select(fromRoot.getProfile)
    ).subscribe(profile => {
      this.profile = profile;
    });

    // this subscription is live for the entire time the app is.
    this.store.pipe(
      select(fromRoot.getLoadingModalMessages)
    ).subscribe(messages => {
      this.showModalLoading = messages && messages.length > 0;
    });

    // this subscription is live for the entire time the app is.
    this.store.pipe(
      select(fromRoot.getErrorType),
      filter(errType => errType !== LMSErrorTypes.NONE),
      take(1)
    ).subscribe(() => {
      // TODO: set type of error and give information on what todo
      this.showError = true;
    });
  }

  public getRoleClass(): string {
    if (this.profile && this.profile.groups) {
      switch (this.profile.groups[ 0 ]) {
        case SessionService.TEACHER:
          return 'role-teacher';
        case SessionService.SCHOOL_DIRECTOR:
          return 'role-school';
        case SessionService.SCHOOL_GROUP_DIRECTOR:
          return 'role-group';
        case SessionService.STUDENT:
          return 'role-student';
        case SessionService.ADMIN:
          return 'role-admin';
        default:
          return 'role-none';
      }
    }
    return 'role-none';
  }

  private navigationListener(event: RouterEvent) {
    switch (event.constructor) {
      case NavigationStart:
        // save scroll position
        this.store.dispatch(new fromUI.UpdateURLScrollPosition(this.router.url, window.pageYOffset));
        break;
      case NavigationEnd:
        // If there is a scroll position, restore it
        this.store.pipe(
          select(fromRoot.getScrollPositions),
          take(1),
        ).subscribe((scrollPositions: ScrollPosition[]) => {
          const p = scrollPositions.find(sp => sp.url === event.url);
          if (p) {
            // We just want the scroll to happen after the page is updated.
            // so as long as this code isn't executed inline here it should
            // be fine in most cases where the data is loaded and the js event
            // emitter loop will spend the next bunch of cycles updating the DOM.
            //
            // must be a better way than using a time out.
            // always listen to scroll and page redraw events?
            setTimeout(() => {
              window.scrollTo({ top: p.position });
            }, 10);
          }
        });
        break;
      case NavigationCancel || NavigationError:
    }
  }
}
