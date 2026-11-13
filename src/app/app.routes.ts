import { Routes } from '@angular/router';

export const routes: Routes = [
  // Default redirect
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // Public (guest-only) routes
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then((m) => m.Login),
    title: 'Sign in',
  },
//   {
//     path: 'signup',
//     canActivate: [guestGuard],
//     loadComponent: () =>
//       import('./features/auth/signup/signup').then((m) => m.Signup),
//     title: 'Create account',
//   },
//   {
//     path: 'forgot-password',
//     canActivate: [guestGuard],
//     loadComponent: () =>
//       import('./features/auth/forgot-password/forgot-password').then(
//         (m) => m.ForgotPassword,
//       ),
//     title: 'Forgot password',
//   },

//   // Legal pages (public)
//   {
//     path: 'terms',
//     loadComponent: () =>
//       import('./features/legal/terms/terms').then((m) => m.Terms),
//     title: 'Terms of Service',
//   },
//   {
//     path: 'privacy',
//     loadComponent: () =>
//       import('./features/legal/privacy/privacy').then((m) => m.Privacy),
//     title: 'Privacy Policy',
//   },

  // Protected routes
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Dashboard',
  },

  // 404 fallback
  {
    path: '**',
    loadComponent: () =>
      import('./pages/login/login').then((m) => m.Login),
    title: 'Login',
  },
];