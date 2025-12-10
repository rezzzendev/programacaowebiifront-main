import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

interface FrequenciaDTO {
  matricula: string;
  disciplinaId: number;
  presencas: number;
  faltas: number;
}

interface ItemBase {
  id: number;
  nome: string;
}

interface AlunoBase {
  matricula: string;
  nome: string;
}

@Component({
  selector: 'app-professor-frequencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './professor-frequencia.component.html',
  styleUrls: ['./professor-frequencia.component.css'],
})
export class ProfessorFrequenciaComponent implements OnInit {

  frequenciaForm!: FormGroup;
  alunos: AlunoBase[] = [];
  disciplinas: ItemBase[] = [];
  frequenciaId: number | null = null;

  mensagemSucesso = '';
  mensagemErro = '';

  private readonly urlFrequencias = 'http://localhost:8080/api/frequencias';
  private readonly urlAlunos = 'http://localhost:8080/api/alunos';

  constructor(
    private readonly fb: FormBuilder,
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router
  ) {
    this.criarForm();
  }

  ngOnInit(): void {
    this.buscarAlunos();
    this.observarSelecoes();
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  private criarForm(): void {
    this.frequenciaForm = this.fb.group({
      matricula: [null, Validators.required],
      disciplinaId: [null, Validators.required],
      presencas: [0, [Validators.required, Validators.min(0)]],
      faltas: [0, [Validators.required, Validators.min(0)]],
    });
  }

  private observarSelecoes(): void {
    // Quando muda o aluno, carregar apenas as disciplinas vinculadas
    this.frequenciaForm.get('matricula')?.valueChanges.subscribe((matricula) => {
      this.limparMensagens();
      if (matricula) {
        this.buscarDisciplinasDoAluno(matricula);
        this.verificarECarregarFrequencia();
      } else {
        this.disciplinas = [];
      }
    });

    // Quando muda a disciplina, recarrega frequência
    this.frequenciaForm.get('disciplinaId')?.valueChanges.subscribe(() => {
      this.limparMensagens();
      this.verificarECarregarFrequencia();
    });
  }

  private verificarECarregarFrequencia(): void {
    const matricula = this.frequenciaForm.get('matricula')?.value;
    const disciplinaId = this.frequenciaForm.get('disciplinaId')?.value;

    this.frequenciaId = null;

    if (matricula && disciplinaId) {
      this.carregarFrequenciaExistente(matricula, Number(disciplinaId));
    } else {
      this.frequenciaForm.patchValue({ presencas: 0, faltas: 0 }, { emitEvent: false });
    }
  }

  private buscarAlunos(): void {
    this.http.get<AlunoBase[]>(this.urlAlunos).subscribe({
      next: (dados) => (this.alunos = dados),
      error: () => (this.mensagemErro = 'Erro ao carregar alunos'),
    });
  }

  // 🔹 Buscar apenas disciplinas do aluno selecionado
  private buscarDisciplinasDoAluno(matricula: string): void {
    this.http.get<ItemBase[]>(`${this.urlAlunos}/${matricula}/disciplinas`).subscribe({
      next: (dados) => (this.disciplinas = dados),
      error: () => {
        this.mensagemErro = 'Erro ao carregar disciplinas do aluno';
        this.disciplinas = [];
      },
    });
  }

  carregarFrequenciaExistente(matricula: string, disciplinaId: number): void {
    this.http
      .get<any>(`${this.urlFrequencias}/aluno/${matricula}/disciplina/${disciplinaId}`)
      .subscribe({
        next: (freq) => {
          this.frequenciaId = freq.id;
          this.frequenciaForm.patchValue({
            presencas: freq.presencas,
            faltas: freq.faltas,
          });
        },
        error: () => {
          this.frequenciaForm.patchValue({ presencas: 0, faltas: 0 }, { emitEvent: false });
          this.frequenciaId = null;
        },
      });
  }

  enviarFormulario(): void {
    this.limparMensagens();

    if (this.frequenciaForm.invalid) {
      this.mensagemErro = 'Preencha todos os campos corretamente.';
      return;
    }

    const matricula = this.frequenciaForm.value.matricula;
    const disciplinaId = Number(this.frequenciaForm.value.disciplinaId);

    // 🔹 Verifica se disciplina selecionada está vinculada ao aluno
    if (!this.disciplinas.find(d => d.id === disciplinaId)) {
      this.mensagemErro = 'Aluno não está matriculado nesta disciplina!';
      return;
    }

    const payload: FrequenciaDTO = {
      matricula,
      disciplinaId,
      presencas: Number(this.frequenciaForm.value.presencas) || 0,
      faltas: Number(this.frequenciaForm.value.faltas) || 0,
    };

    this.http.post(this.urlFrequencias, payload).subscribe({
      next: (res: any) => {
        this.mensagemSucesso = 'Frequência salva com sucesso!';
        this.frequenciaId = res.id;

        this.frequenciaForm.patchValue(
          {
            presencas: res.presencas || payload.presencas,
            faltas: res.faltas || payload.faltas,
          },
          { emitEvent: false }
        );

        this.cdr.detectChanges();
        setTimeout(() => this.limparMensagens(), 3000);
      },
      error: (err) => {
        this.mensagemErro =
          err.status === 0
            ? 'Erro de comunicação (CORS ou Backend inativo).'
            : err.error?.message || 'Erro ao salvar frequência';
        console.error(err);
        setTimeout(() => this.limparMensagens(), 5000);
      },
    });
  }

  excluirFrequencia(): void {
    if (!this.frequenciaId) {
      this.mensagemErro = 'Nenhuma frequência para excluir.';
      return;
    }

    if (!confirm('Tem certeza que deseja EXCLUIR este registro de frequência?')) {
      return;
    }

    this.limparMensagens();

    this.http.delete(`${this.urlFrequencias}/${this.frequenciaId}`).subscribe({
      next: () => {
        this.mensagemSucesso = 'Frequência excluída com sucesso!';
        this.frequenciaId = null;
        this.frequenciaForm.patchValue({ presencas: 0, faltas: 0 }, { emitEvent: false });
        this.cdr.detectChanges();
        setTimeout(() => this.limparMensagens(), 3000);
      },
      error: (err) => {
        this.mensagemErro = err.error?.message || 'Erro ao excluir frequência.';
        console.error(err);
        setTimeout(() => this.limparMensagens(), 5000);
      },
    });
  }

  private limparMensagens() {
    this.mensagemSucesso = '';
    this.mensagemErro = '';
  }
}
