import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError, throwError, of } from 'rxjs';

interface Disciplina {
  id: number;
  nome: string;
}

interface AlunoComNota {
  id?: number;
  nome: string;
  matricula: string;
  bimestre1: number | null;
  bimestre2: number | null;
  media: number;
  isEditing: boolean;
}

@Component({
  selector: 'app-professor-notas',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './professor-notas.component.html',
  styleUrls: ['./professor-notas.component.css'],
})
export class ProfessorNotasComponent implements OnInit {
  disciplinas: Disciplina[] = [];
  alunosComNotas: AlunoComNota[] = [];
  disciplinaSelecionada: number | null = null;

  mensagemSucesso = '';
  mensagemErro = '';

  private readonly apiBase = 'http://localhost:8080/api';
  private readonly urlNotas = `${this.apiBase}/notas`;
  private readonly urlDisciplinas = `${this.apiBase}/disciplinas`;
  private readonly urlAlunos = `${this.apiBase}/alunos`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarDisciplinas();
  }

  // Helper para limpar mensagens
  private limparMensagens() {
    this.mensagemSucesso = '';
    this.mensagemErro = '';
  }

  carregarDisciplinas() {
    this.limparMensagens();
    this.http.get<Disciplina[]>(this.urlDisciplinas).subscribe({
      next: (d) => {
        this.disciplinas = d;
      },
      error: (err) => {
        this.mensagemErro =
          'Erro ao carregar disciplinas. Verifique se o backend está ativo na porta 8080.';
        console.error('Erro ao carregar disciplinas', err);
      },
    });
  }

  onDisciplinaChange(event: Event) {
    this.limparMensagens();
    const select = event.target as HTMLSelectElement;
    const id = Number(select.value);
    this.disciplinaSelecionada = id > 0 ? id : null;

    if (this.disciplinaSelecionada) {
      this.carregarAlunosENotas(this.disciplinaSelecionada);
    } else {
      this.alunosComNotas = [];
    }
  }

  carregarAlunosENotas(disciplinaId: number) {
    this.limparMensagens();

    this.http.get<any[]>(this.urlAlunos).subscribe({
      next: (todosAlunos) => {
        this.http.get<any[]>(`${this.urlNotas}/disciplina/${disciplinaId}`).subscribe({
          next: (notasExistentes) => {
            this.alunosComNotas = todosAlunos.map((aluno) => {
              const nota = notasExistentes.find((n: any) => n.aluno.matricula === aluno.matricula);

              const b1 = nota?.bimestre1 || 0;
              const b2 = nota?.bimestre2 || 0;

              const alunoComNota: AlunoComNota = {
                id: nota?.id,
                nome: aluno.nome,
                matricula: aluno.matricula,
                bimestre1: b1,
                bimestre2: b2,
                media: this.calcularMedia(b1, b2),
                isEditing: false,
              };
              return alunoComNota;
            });
          },
          error: (err) => {
            this.mensagemErro =
              err.status === 0
                ? 'Erro de comunicação (CORS/Rede). Verifique o backend ou a URL /api/notas/disciplina/{id}'
                : 'Erro ao carregar notas existentes.';
            console.error('Erro ao carregar notas', err);
          },
        });
      },
      error: (err) => {
        this.mensagemErro = 'Erro ao carregar alunos.';
        console.error('Erro ao carregar alunos', err);
      },
    });
  }

  calcularMedia(bimestre1: number | null, bimestre2: number | null): number {
    const b1 = Number(bimestre1) || 0;
    const b2 = Number(bimestre2) || 0;
    return (b1 + b2) / 2;
  }

  atualizarMedia(aluno: AlunoComNota) {
    aluno.media = this.calcularMedia(aluno.bimestre1, aluno.bimestre2);
  }

  habilitarEdicao(aluno: AlunoComNota): void {
    this.alunosComNotas.forEach((a) => {
      if (a !== aluno) {
        a.isEditing = false;
      }
    });
    aluno.isEditing = true;
    this.limparMensagens();
  }

  salvarNota(aluno: AlunoComNota) {
    if (!this.disciplinaSelecionada) {
      this.mensagemErro = 'Selecione uma disciplina antes de salvar a nota.';
      setTimeout(() => this.limparMensagens(), 3000);
      return;
    }

    const b1 = Math.min(10, Math.max(0, Number(aluno.bimestre1) || 0));
    const b2 = Math.min(10, Math.max(0, Number(aluno.bimestre2) || 0));

    aluno.bimestre1 = b1;
    aluno.bimestre2 = b2;

    const payload = {
      matriculaAluno: aluno.matricula,
      disciplinaId: this.disciplinaSelecionada,
      bimestre1: b1,
      bimestre2: b2,
    };

    this.limparMensagens();

    this.http.post(this.urlNotas, payload).subscribe({
      next: (res: any) => {
        aluno.isEditing = false;

        if (this.disciplinaSelecionada) {
          this.carregarAlunosENotas(this.disciplinaSelecionada);
        }

        this.mensagemSucesso = `Nota de ${aluno.nome} salva com sucesso! Média: ${res.media.toFixed(
          1
        )}`;
        setTimeout(() => this.limparMensagens(), 3000);
      },
      error: (err) => {
        this.mensagemErro = 'Erro ao salvar nota. Verifique os dados e o backend.';
        console.error('Erro ao salvar nota', err);
        setTimeout(() => this.limparMensagens(), 3000);
      },
    });
  }

  excluirNota(aluno: AlunoComNota) {
    if (!aluno.id) return;

    if (!confirm(`Tem certeza que deseja EXCLUIR a nota de ${aluno.nome} para esta disciplina?`))
      return;

    this.limparMensagens();

    this.http.delete(`${this.urlNotas}/${aluno.id}`).subscribe({
      next: () => {
        if (this.disciplinaSelecionada) {
          this.carregarAlunosENotas(this.disciplinaSelecionada);
        }

        this.mensagemSucesso = `Nota de ${aluno.nome} excluída com sucesso!`;
        setTimeout(() => this.limparMensagens(), 3000);
      },
      error: (err) => {
        this.mensagemErro = 'Erro ao excluir nota.';
        console.error('Erro ao excluir nota', err);
        setTimeout(() => this.limparMensagens(), 3000);
      },
    });
  }
}
