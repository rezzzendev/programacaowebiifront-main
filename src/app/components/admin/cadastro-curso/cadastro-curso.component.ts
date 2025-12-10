import { Component } from '@angular/core';
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
  selector: 'app-cadastro-curso',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  styleUrls: ['./cadastro-curso.component.css'],
  templateUrl: './cadastro-curso.component.html',
})
export class CadastroCursoComponent {
  formularioCurso: FormGroup;
  mensagemSucesso: string = '';
  mensagemErro: string = '';

  private urlApi = 'http://localhost:8080/api/cursos';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.formularioCurso = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  enviarFormulario() {
    if (this.formularioCurso.valid) {
      this.http
        .post(this.urlApi, { nome: this.formularioCurso.value.nome }, { withCredentials: true })
        .subscribe({
          next: () => {
            this.mensagemSucesso = 'Curso cadastrado com sucesso!';
            this.mensagemErro = '';
            this.formularioCurso.reset();
          },
          error: (erro) => {
            this.mensagemErro = 'Erro ao cadastrar curso.';
            this.mensagemSucesso = '';
            console.error('Erro ao cadastrar curso:', erro);
          },
        });
    } else {
      this.mensagemErro = 'Preencha o nome do curso corretamente.';
      this.mensagemSucesso = '';
    }
  }
}
