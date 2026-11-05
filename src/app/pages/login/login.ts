import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare const google: any;

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  @ViewChild('googleBtn', { static: true }) googleBtn!: ElementRef;
   // Using Angular Signals for reactive state
  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  private readonly GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

  ngOnInit(): void {
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn(): void {
    // Check if the google object is available (library loaded)
    if (typeof google === 'undefined') {
      console.error('Google Identity Services library not loaded.');
      return;
    }

    // Initialize the Google Identity Services client
    google.accounts.id.initialize({
      client_id: this.GOOGLE_CLIENT_ID,
      callback: (response: any) => this.handleGoogleCredential(response),
      auto_select: false, // Set to true if you want auto sign-in
    });

    // Render the official Google button into our ViewChild container
    google.accounts.id.renderButton(
      this.googleBtn.nativeElement,
      {
        theme: 'outline', // Options: outline, filled_blue, filled_black
        size: 'large',    // Options: small, medium, large
        width: '100%',    // Make it full width to match Flowbite inputs
        text: 'signin_with', // Options: signin_with, signup_with, continue_with
        shape: 'rectangular',
      }
    );
  }

  private handleGoogleCredential(response: any): void {
    // The response contains a JWT ID token in response.credential
    // You MUST send this token to your backend to verify it.
    console.log('Google JWT ID Token:', response.credential);

    this.isLoading.set(true);

    // Example: Send to backend for verification
    // this.http.post('/api/auth/google', { token: response.credential }).subscribe(...)

    // Simulating backend verification for this demo
    setTimeout(() => {
      this.isLoading.set(false);
      // In a real app, you would store the session/token and navigate to dashboard
      alert('Google Login Successful! Check console for JWT.');
    }, 1000);
  }
  onSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Simulate an API call
    // Replace this with your actual AuthService call
    setTimeout(() => {
      const { email, password } = form.value;
      
      if (email === 'test@example.com' && password === 'password123') {
        console.log('Login successful');
        // Navigate to dashboard here
      } else {
        this.errorMessage.set('Invalid email or password.');
      }
      
      this.isLoading.set(false);
    }, 1500);
  }
}
