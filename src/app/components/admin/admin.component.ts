import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // <--- adicione RouterModule
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
})
export class AdminComponent implements OnInit {

  aluno = {
    matricula: '',
    nome: '',
    email: '',
    cursoId: ''
  };

  cursos: any[] = [];

  private apiCurso = 'http://localhost:8080/api/cursos';
  private apiAluno = 'http://localhost:8080/api/alunos';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.buscarCursos();
  }

  buscarCursos() {
    this.http.get<any[]>(this.apiCurso).subscribe({
      next: (dados) => this.cursos = dados,
      error: (err) => console.error('Erro ao buscar cursos', err)
    });
  }

  cadastrarAluno() {
    this.http.post(this.apiAluno, this.aluno).subscribe({
      next: () => {
        alert('Aluno cadastrado com sucesso!');
        this.aluno = {
          matricula: '',
          nome: '',
          email: '',
          cursoId: ''
        };
      },
      error: (err) => {
        console.error('Erro ao cadastrar aluno', err);
        alert('Erro ao cadastrar aluno');
      }
    });
  }

  logout() {
    alert('Logout realizado');
  }
}
