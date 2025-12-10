import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

interface Disciplina {
  id: number;
  nome: string;
}

interface DadosCard {
  nome: string;
  nota1: number;
  nota2: number;
  media: number;
  notaNecessaria: number;
  faltas: number;
  faltasRestantes: number;
  presencas: number;
  horariosProvas: string[];
}

interface Aluno {
  nome: string;
  matricula: string;
}

@Component({
  selector: 'app-aluno',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './aluno.component.html',
  styleUrls: ['./aluno.component.css'],
})
export class AlunoComponent implements OnInit {
  matricula: string = '';
  nome: string = '';
  disciplinas: Disciplina[] = [];
  dados: DadosCard | null = null;

  private urlApi = 'http://localhost:8080/api/alunos';

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const matriculaParam = params.get('matricula');
      if (matriculaParam) {
        this.matricula = matriculaParam;
        this.carregarAluno();
        this.carregarDisciplinas();
      } else {
        console.error('Matrícula não encontrada na rota');
      }
    });
  }

  carregarAluno() {
    this.http.get<Aluno>(`${this.urlApi}/${this.matricula}`).subscribe({
      next: (res) => (this.nome = res.nome),
      error: (err) => console.error('Erro ao carregar aluno', err),
    });
  }

  carregarDisciplinas() {
    this.http.get<Disciplina[]>(`${this.urlApi}/${this.matricula}/disciplinas`).subscribe({
      next: (res) => {
        // Remove duplicatas por ID
        const unique = res.filter(
          (disc, index, self) => index === self.findIndex((d) => d.id === disc.id)
        );
        this.disciplinas = unique;

        // Exibe a primeira disciplina apenas se dados ainda estiverem nulos
        if (unique.length > 0 && !this.dados) {
          this.mostrarCard(unique[0].id);
        }
      },
      error: (err) => console.error('Erro ao carregar disciplinas', err),
    });
  }

  mostrarCard(disciplinaId: number) {
    this.http
      .get<DadosCard>(`${this.urlApi}/${this.matricula}/disciplinas/${disciplinaId}`)
      .subscribe({
        next: (res) => (this.dados = res),
        error: (err) => console.error('Erro ao buscar dados da disciplina', err),
      });
  }

  formatarData(dataIso: string): string {
    const data = new Date(dataIso);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
  }
}
