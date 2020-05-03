import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ErrorComponent } from './error/error.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/auth' },
  { path: 'auth', loadChildren: './authentication/authentication.module#AuthenticationModule' },
  { path: 'admin', loadChildren: './admin/admin.module#AdminModule' },
  { path: 'group', loadChildren: './school-group/school-group.module#SchoolGroupModule' },
  { path: 'school', loadChildren: './school/school.module#SchoolModule' },
  { path: 'teacher', loadChildren: './teacher/teacher.module#TeacherModule' },
  { path: 'parent', loadChildren: './parent/parent.module#ParentModule' },
  { path: 'enrol', loadChildren: './enroll/enroll.module#EnrollModule' },
  { path: 'password/reset', loadChildren: './password-reset/password-reset.module#PasswordResetModule' },
  { path: 'reset', loadChildren: './password-reset/password-reset.module#PasswordResetModule' },
  { path: 'error', component: ErrorComponent },

  { path: '**', redirectTo: '/auth' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' }) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {
}
