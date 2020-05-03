import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';


// use global to get all classes & credentials
// services are not added to AWS when importing from global
// unless explicity imported.
// Do not use 'aws-sdk' as that will explode build size, use 'aws-sdk/global'
// to get at the namespace without importing everything.
// This way webpack can discard unused modules
import * as AWS from 'aws-sdk/global';

// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-region.html
AWS.config.update({ region: environment.awsRegion });

@NgModule({
  declarations: [
    AppComponent,
    ErrorComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    E2EHackModule,
    SharedModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-center',
      newestOnTop: false
    }),
    StoreModule.forRoot({}) // the the feature modules manager their own state.
  ],
  providers: [
    SessionService,
    ProfileService,
    DynamoService,
    LambdaService,
    VocabService, // here not, in shared module, this is a singleton service
    AnalyticsService,
    HubService,
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
