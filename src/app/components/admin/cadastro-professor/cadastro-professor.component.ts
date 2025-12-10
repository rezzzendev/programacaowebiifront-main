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
  selector: 'app-cadastro-professor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  styleUrls: ['./cadastro-professor.component.css'],
  templateUrl: './cadastro-professor.component.html',
})
export class CadastroProfessorComponent implements OnInit {
  formularioProfessor: FormGroup;
  mensagemSucesso: string = '';
  mensagemErro: string = '';

  private urlApi = 'http://localhost:8080/api/professores';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.formularioProfessor = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {}

  enviarFormulario() {
    if (this.formularioProfessor.valid) {
      this.http
        .post(this.urlApi, this.formularioProfessor.value, { withCredentials: true })
        .subscribe({
          next: () => {
            this.mensagemSucesso = 'Professor cadastrado com sucesso!';
            this.mensagemErro = '';
            this.formularioProfessor.reset();
          },
          error: (erro) => {
            this.mensagemErro = 'Erro ao cadastrar professor.';
            this.mensagemSucesso = '';
            console.error('Erro ao cadastrar professor:', erro);
          },
        });
    } else {
      this.mensagemErro = 'Preencha todos os campos corretamente.';
      this.mensagemSucesso = '';
    }
  }
}
