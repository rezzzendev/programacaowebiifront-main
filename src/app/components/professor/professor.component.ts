import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-professor',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './professor.component.html',
  styleUrls: ['./professor.component.css'],
})
export class ProfessorComponent {
  constructor(public router: Router) {}

  logout() {
    // Aqui você pode adicionar sua lógica de logout
    console.log('Logout executado');
    // Por exemplo, redirecionar para login
    this.router.navigate(['/login']);
  }
}
