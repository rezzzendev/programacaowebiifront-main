import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cadastro-disciplina',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  styleUrls: ['./cadastro-disciplina.component.css'],
  templateUrl: './cadastro-disciplina.component.html',
})
export class CadastroDisciplinaComponent implements OnInit {
  disciplinaForm: FormGroup;
  mensagemSucesso: string = '';
  mensagemErro: string = '';

  cursos: any[] = [];
  professores: any[] = [];

  private urlApiDisciplina = 'http://localhost:8080/api/disciplinas';
  private urlApiCurso = 'http://localhost:8080/api/cursos';
  private urlApiProfessor = 'http://localhost:8080/api/professores';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.disciplinaForm = this.fb.group({
      nome: ['', Validators.required],
      cursoId: [null, Validators.required],
      professorId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.buscarCursos();
    this.buscarProfessores();
  }

  buscarCursos() {
    this.http.get<any[]>(this.urlApiCurso).subscribe({
      next: (dados) => (this.cursos = dados),
      error: (erro) => console.error('Erro ao buscar cursos:', erro),
    });
  }

  buscarProfessores() {
    this.http.get<any[]>(this.urlApiProfessor).subscribe({
      next: (dados) => (this.professores = dados),
      error: (erro) => console.error('Erro ao buscar professores:', erro),
    });
  }
  logout() {
    console.log('Logout realizado!');
  }

  enviarFormulario() {
    if (this.disciplinaForm.valid) {
      const disciplinaEnviar = {
        nome: this.disciplinaForm.value.nome,
        cursoId: +this.disciplinaForm.value.cursoId,
        professorId: +this.disciplinaForm.value.professorId,
      };

      this.http.post(this.urlApiDisciplina, disciplinaEnviar, { withCredentials: true }).subscribe({
        next: () => {
          this.mensagemSucesso = 'Disciplina cadastrada com sucesso!';
          this.mensagemErro = '';
          this.disciplinaForm.reset();
        },
        error: (erro) => {
          this.mensagemErro = 'Erro ao cadastrar disciplina.';
          this.mensagemSucesso = '';
          console.error('Erro ao cadastrar disciplina:', erro);
        },
      });
    } else {
      this.mensagemErro = 'Preencha todos os campos corretamente.';
      this.mensagemSucesso = '';
    }
  }
}
