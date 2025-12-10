import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cadastro-aluno',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cadastro-aluno.component.html',
  styleUrls: ['./cadastro-aluno.component.css'],
})
export class CadastroAlunoComponent implements OnInit {
  private urlApiAluno = 'http://localhost:8080/api/alunos';
  private urlApiCursos = 'http://localhost:8080/api/cursos';
  private urlApiDisciplinas = 'http://localhost:8080/api/disciplinas';

  alunoDTO: any = {
    matricula: '',
    nome: '',
    email: '',
    dataNascimento: '',
    cursoId: null,
    disciplinasIds: [],
  };

  cursos: any[] = [];
  disciplinas: any[] = [];
  listaAlunos: any[] = [];

  mensagemSucesso = '';
  mensagemErro = '';

  editando = false;

  deletando: { [matricula: string]: boolean } = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarCursos();
    this.carregarDisciplinas();
    this.buscarAlunos();
  }

  carregarCursos() {
    this.http.get<any[]>(this.urlApiCursos).subscribe({
      next: (dados) => (this.cursos = dados),
      error: (err) => console.error('Erro ao carregar cursos', err),
    });
  }

  carregarDisciplinas() {
    this.http.get<any[]>(this.urlApiDisciplinas).subscribe({
      next: (dados) => (this.disciplinas = dados),
      error: (err) => console.error('Erro ao carregar disciplinas', err),
    });
  }

  buscarPorMatricula() {
    if (!this.alunoDTO.matricula || !this.editando) return;

    this.http
      .get<any>(`${this.urlApiAluno}/${encodeURIComponent(this.alunoDTO.matricula)}`)
      .subscribe({
        next: (aluno) => {
          this.alunoDTO = {
            matricula: aluno.matricula,
            nome: aluno.nome,
            email: aluno.email,
            dataNascimento: aluno.dataNascimento,
            cursoId: aluno.curso?.id ?? null,
            disciplinasIds: [],
          };

          this.http
            .get<number[]>(
              `${this.urlApiAluno}/${encodeURIComponent(aluno.matricula)}/disciplinas-ids`
            )
            .subscribe((ids) => (this.alunoDTO.disciplinasIds = ids));

          this.mensagemErro = '';
        },
        error: (err) => {
          console.error('Erro ao buscar por matrícula', err);
          this.mensagemErro = 'Aluno não encontrado.';
        },
      });
  }

  cadastrar() {
    this.http.post(this.urlApiAluno, this.alunoDTO).subscribe({
      next: () => {
        this.mensagemSucesso = 'Aluno cadastrado com sucesso.';
        this.mensagemErro = '';
        this.buscarAlunos();
        this.resetarFormulario();
      },
      error: (err) => {
        console.error('Erro ao cadastrar aluno', err);
        this.mensagemErro = 'Erro ao cadastrar aluno.';
      },
    });
  }

  atualizar() {
    this.http
      .put(`${this.urlApiAluno}/${encodeURIComponent(this.alunoDTO.matricula)}`, this.alunoDTO)
      .subscribe({
        next: () => {
          this.mensagemSucesso = 'Aluno atualizado com sucesso.';
          this.mensagemErro = '';
          this.buscarAlunos();
          this.resetarFormulario();
        },
        error: (err) => {
          console.error('Erro ao atualizar aluno', err);
          this.mensagemErro = 'Erro ao atualizar aluno.';
        },
      });
  }

  excluirAluno(matricula: string) {
    if (!confirm('Deseja realmente excluir?')) return;

    if (this.deletando[matricula]) return;

    this.deletando[matricula] = true;
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    this.http
      .delete(`${this.urlApiAluno}/${encodeURIComponent(matricula)}`, { observe: 'response' })
      .subscribe({
        next: () => {
          this.listaAlunos = this.listaAlunos.filter((x) => x.matricula !== matricula);
          if (this.alunoDTO?.matricula === matricula) this.resetarFormulario();
          this.mensagemSucesso = 'Aluno excluído com sucesso.';
          this.deletando[matricula] = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erro ao excluir aluno', err);
          this.mensagemErro =
            err.status === 404
              ? 'Aluno não encontrado no servidor (404).'
              : err.status === 0
              ? 'Não foi possível conectar ao servidor (verifique backend/CORS).'
              : `Erro ao excluir aluno (status ${err.status}).`;
          this.deletando[matricula] = false;
        },
      });
  }

  buscarAlunos() {
    this.http.get<any[]>(this.urlApiAluno).subscribe({
      next: (dados) => (this.listaAlunos = dados),
      error: (err) => {
        console.error('Erro ao carregar lista de alunos', err);
        this.mensagemErro = 'Erro ao carregar lista de alunos.';
      },
    });
  }

  carregarParaEdicao(a: any) {
    this.editando = true;
    this.alunoDTO = {
      matricula: a.matricula,
      nome: a.nome,
      email: a.email,
      dataNascimento: a.dataNascimento,
      cursoId: a.curso?.id ?? null,
      disciplinasIds: [],
    };

    this.http
      .get<number[]>(`${this.urlApiAluno}/${encodeURIComponent(a.matricula)}/disciplinas-ids`)
      .subscribe({
        next: (ids) => (this.alunoDTO.disciplinasIds = ids),
        error: (err) => console.error('Erro ao carregar disciplinas do aluno', err),
      });

    this.mensagemSucesso = '';
    this.mensagemErro = '';
  }

  resetarFormulario() {
    this.editando = false;
    this.alunoDTO = {
      matricula: '',
      nome: '',
      email: '',
      dataNascimento: '',
      cursoId: null,
      disciplinasIds: [],
    };
  }

  logout() {
    // exemplo: redireciona para login
    window.location.href = '/login';
  }
}
