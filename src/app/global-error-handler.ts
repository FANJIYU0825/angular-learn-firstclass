import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {
  }

  reportError(url, err) {
    const lambda = this.injector.get(LambdaService);
    const session = this.injector.get(SessionService);
    const environment = this.injector.get(EnvironmentService);

    const identityId = session.authenticatedIdentity$.getValue();

    // A better option might be to send the errors to google analytics.
    // I am not sure off hand if GA is available in CN.
    if (lambda) {
      lambda.execute({
        FunctionName: `lms-error-logger`,
        Payload: JSON.stringify({
          identityId: identityId, // could be null, null means not logged in
          lmsVersion: environment.getVersion(),
          url: url,
          message: err.message || '',
          stack: err.stack, // might not be useful as this is compiled. How to use source maps here?
        })
      }).then(() => console.log('Error report sent'));
    }
  }

  handleError(error) {
    console.error('Global Error Handler recived:');
    console.error(error.originalError || error);

    // save the url where this error happened before changing to the error page
    // const url = window.location.href;
    const location = this.injector.get(LocationStrategy);
    const url = location instanceof PathLocationStrategy ? location.path() : '';
    const environment = this.injector.get(EnvironmentService);

    const store = this.injector.get(Store);
    store.dispatch(new fromError.SetRuntimeError());

    if (environment.getEnvironment() === 'Dev') {
      // in development environments, don't try change to error page, stop as is.
      this.reportError(url, error);
      throw error;
    } else {
      // show error page first, then silently try report the error in the background
      const router = this.injector.get(Router);
      router.navigateByUrl('/error')
        .then(() => this.reportError(url, error))
        .catch(() => this.reportError(url, error));
    }
  }
}
