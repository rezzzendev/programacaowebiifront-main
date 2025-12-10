import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class RegisterComponent {
  form: any = {
    login: '',
    usuarioNome: '',
    email: '',
    senha: '',
  };
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    const { login, usuarioNome, email, senha } = this.form;

    this.authService.register({ login, usuarioNome, email, senha }).subscribe({
      next: (data: any) => {
        console.log('Registro bem-sucedido!', data);
        this.errorMessage = '';
        // Redireciona para o login após o sucesso
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error('Erro no registro:', err);

        if (err.error && err.error.error) {
          this.errorMessage = err.error.error;
        } else if (err.error && typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else if (err.message) {
          this.errorMessage = err.message;
        } else {
          this.errorMessage = 'Erro desconhecido. Tente novamente.';
        }
      },
    });
  }
}
