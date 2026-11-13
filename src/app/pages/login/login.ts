import { HttpClient } from '@angular/common/http';
import { Component, inject, NgZone, OnInit, OnDestroy, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

// Minimal typing for the parts of GSI we use
declare const google: {
  accounts: {
    id: {
      initialize: (cfg: {
        client_id: string;
        callback: (res: { credential: string }) => void;
      }) => void;
      renderButton: (el: HTMLElement | null, opts: Record<string, unknown>) => void;
      cancel: () => void;
    };
  };
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private zone = inject(NgZone);

  showPassword = signal(false);
  submitting = signal(false);
  serverError = signal<string | null>(null);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    remember: [false],
    acceptTerms: [false, [Validators.requiredTrue]],
  });

  get email()          { return this.loginForm.controls.email; }
  get password()       { return this.loginForm.controls.password; }
  get acceptTerms()    { return this.loginForm.controls.acceptTerms; }

  // ---------- Lifecycle ----------

  ngOnInit(): void {
    // GSI must be initialized outside Angular's zone to avoid
    // change-detection churn, then re-enter on the callback.
    this.zone.runOutsideAngular(() => this.initGoogleLoginWithRetry(0));
  }

  ngOnDestroy(): void {
    // Prevent a pending GSI callback from firing on a destroyed component
    try {
      if (typeof google !== 'undefined' && google?.accounts?.id) {
        google.accounts.id.cancel();
      }
    } catch { /* ignore */ }
  }

  // ---------- Form helpers ----------

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  showError(ctrl: AbstractControl): boolean {
    return ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  // ---------- Email/password submit ----------

  onSubmit(): void {
    this.serverError.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const { email, password, remember } = this.loginForm.getRawValue();

    this.http
      .post<{ token: string }>(
        `${environment.apiUrl}/api/auth/login`,
        { email, password, remember },
      )
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
          this.router.navigateByUrl('/dashboard');
        },
        error: (err) => {
          this.submitting.set(false);
          this.serverError.set(
            err?.error?.message ?? 'Invalid email or password. Please try again.',
          );
        },
        complete: () => this.submitting.set(false),
      });
  }

  // ---------- Google Sign-In ----------

  /** Retries because the GSI script is loaded with async/defer. */
  private initGoogleLoginWithRetry(attempt: number): void {
    if (typeof google !== 'undefined' && google?.accounts?.id) {
      this.initGoogleLogin();
      return;
    }
    if (attempt < 50) {
      setTimeout(() => this.initGoogleLoginWithRetry(attempt + 1), 100);
    } else {
      console.warn('Google Identity Services failed to load.');
    }
  }

  private initGoogleLogin(): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId, // <-- see note below
      callback: (res) => this.zone.run(() => this.handleCredentialResponse(res)),
    });

    const btn = document.getElementById('google-btn');
    if (!btn) {
      console.warn('#google-btn not found in DOM.');
      return;
    }

    google.accounts.id.renderButton(btn, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      width: 320,
    });
  }

  handleCredentialResponse(response: { credential: string }): void {
    const idToken = response.credential;
    if (!idToken) {
      this.serverError.set('Google sign-in failed. Please try again.');
      return;
    }

    this.serverError.set(null);
    this.submitting.set(true);

    this.http
      .post<{ token: string }>(
        `${environment.apiUrl}/api/auth/google`,
        { idToken },
      )
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
          this.router.navigateByUrl('/dashboard');
        },
        error: (err) => {
          this.submitting.set(false);
          this.serverError.set(
            err?.error?.message ?? 'Google sign-in failed. Please try again.',
          );
        },
        complete: () => this.submitting.set(false),
      });
  }
}