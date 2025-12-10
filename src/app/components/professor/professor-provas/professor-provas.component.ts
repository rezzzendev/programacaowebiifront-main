import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Disciplina {
  id: number;
  nome: string;
}

interface Prova {
  id: number;
  dataHora: string;
}

@Component({
  selector: 'app-professor-provas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './professor-provas.component.html',
  styleUrls: ['./professor-provas.component.css']
})
export class ProfessorProvasComponent implements OnInit {

  selecaoForm!: FormGroup;
  cadastroForm!: FormGroup;
  provasForm!: FormGroup;

  disciplinas: Disciplina[] = [];
  mensagemSucesso = '';
  mensagemErro = '';

  private readonly urlDisciplinas = 'http://localhost:8080/api/disciplinas';
  private readonly urlProvas = 'http://localhost:8080/api/provas';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.criarFormularios();
  }

  ngOnInit(): void {
    this.buscarDisciplinas();
    this.observarSelecaoDisciplina();
  }

  private criarFormularios() {
    this.selecaoForm = this.fb.group({
      disciplinaId: [null, Validators.required]
    });

    this.cadastroForm = this.fb.group({
      dataHora: ['', Validators.required]
    });

    this.provasForm = this.fb.group({
      provas: this.fb.array([])
    });
  }

  get provasArray(): FormArray {
    return this.provasForm.get('provas') as FormArray;
  }

  private buscarDisciplinas() {
    this.http.get<Disciplina[]>(this.urlDisciplinas).subscribe({
      next: (dados) => this.disciplinas = dados,
      error: () => this.mensagemErro = 'Erro ao carregar disciplinas'
    });
  }

  private observarSelecaoDisciplina() {
    this.selecaoForm.get('disciplinaId')?.valueChanges.subscribe(id => {
      if (id) {
        this.carregarProvas(id);
      } else {
        this.provasArray.clear();
      }
    });
  }

  carregarProvas(disciplinaId: number) {
    this.provasArray.clear();

    this.http.get<Prova[]>(`${this.urlProvas}/disciplina/${disciplinaId}`).subscribe({
      next: (dados) => {
        dados.forEach(prova => {
          this.provasArray.push(this.fb.group({
            id: [prova.id],
            dataHora: [prova.dataHora, Validators.required]
          }));
        });
      },
      error: () => this.mensagemErro = 'Erro ao carregar provas'
    });
  }

  // ✅ CADASTRAR NOVA PROVA
  cadastrarProva() {
    const disciplinaId = this.selecaoForm.value.disciplinaId;

    if (!disciplinaId || this.cadastroForm.invalid) return;

    const payload = {
      disciplinaId: Number(disciplinaId),
      dataHora: this.cadastroForm.value.dataHora
    };

    this.http.post(this.urlProvas, payload).subscribe({
      next: () => {
        this.mensagemSucesso = 'Prova cadastrada com sucesso!';
        this.cadastroForm.reset();
        this.carregarProvas(disciplinaId);
      },
      error: () => this.mensagemErro = 'Erro ao cadastrar prova'
    });
  }

  salvarEdicao(index: number) {
    const prova = this.provasArray.at(index).value;

    this.http.put(`${this.urlProvas}/${prova.id}`, prova).subscribe({
      next: () => this.mensagemSucesso = 'Prova atualizada!',
      error: () => this.mensagemErro = 'Erro ao atualizar prova'
    });
  }

  excluirProva(index: number) {
    const prova = this.provasArray.at(index).value;

    if (!confirm('Deseja excluir esta prova?')) return;

    this.http.delete(`${this.urlProvas}/${prova.id}`).subscribe({
      next: () => {
        this.provasArray.removeAt(index);
        this.mensagemSucesso = 'Prova excluída!';
      },
      error: () => this.mensagemErro = 'Erro ao excluir prova'
    });
  }
}
