import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment.development';


declare const google: any;

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit{

  constructor(private http: HttpClient) {}
  
 ngOnInit(): void {
    // Ensure the Google script has loaded
    if (typeof google !== 'undefined') {
      this.initGoogleLogin();
    } else {
      // If the script is still loading, try again shortly
      setTimeout(() => this.initGoogleLogin(), 100);
    }
  }

  initGoogleLogin(): void {
    google.accounts.id.initialize({
      client_id: '291699539989-3npu3mr6qif1n6epf7cplusq06u55n4v.apps.googleusercontent.com', // Replace with your ID
      callback: this.handleCredentialResponse.bind(this),
    });

    google.accounts.id.renderButton(
      document.getElementById('google-btn'),
      { theme: 'outline', size: 'large' } // Customize the button
    );
  }

  handleCredentialResponse(response: any): void {
   const idToken = response.credential;
    
    // Send to your backend API endpoint
    this.http.post(`${environment.apiUrl}/api/auth/google`, { idToken: idToken }).subscribe({
      next: (res) => console.log('Backend verification successful', res),
      error: (err) => console.error('Backend verification failed', err)
    });
  }
}
