import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register';
import { AlunoComponent } from './components/aluno/aluno.component';
import { AdminComponent } from './components/admin/admin.component';
import { ProfessorComponent } from './components/professor/professor.component';
import { ProfessorNotasComponent } from './components/professor/professor-notas/professor-notas.component';
import { ProfessorFrequenciaComponent } from './components/professor/professor-frequencia/professor-frequencia.component';
import { ProfessorProvasComponent } from './components/professor/professor-provas/professor-provas.component';
import { CadastroDisciplinaComponent } from './components/admin/cadastro-disciplina/cadastro-disciplina.component';
import { CadastroCursoComponent } from './components/admin/cadastro-curso/cadastro-curso.component';
import { CadastroAlunoComponent } from './components/admin/cadastro-aluno/cadastro-aluno.component';
import { CadastroProfessorComponent } from './components/admin/cadastro-professor/cadastro-professor.component';
export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  { path: 'register', component: RegisterComponent },

  { path: 'aluno/:matricula', component: AlunoComponent },

  { path: 'admin', component: AdminComponent },

  {
    path: 'professor',
    component: ProfessorComponent,
    children: [
      { path: 'provas', component: ProfessorProvasComponent },
      { path: 'frequencias', component: ProfessorFrequenciaComponent },
      { path: 'notas', component: ProfessorNotasComponent },
    ],
  },

  { path: 'admin/cursos/cadastro', component: CadastroCursoComponent },
  { path: 'admin/disciplinas/cadastro', component: CadastroDisciplinaComponent },
  { path: 'admin/professores/cadastro', component: CadastroProfessorComponent },
  { path: 'admin/alunos/cadastro', component: CadastroAlunoComponent },

  { path: 'home', component: HomeComponent },

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: '**', redirectTo: 'login' },

  {
    path: 'admin',
    component: AdminComponent,
    children: [
      { path: 'professores/cadastro', component: CadastroProfessorComponent },
      { path: 'disciplinas', component: CadastroDisciplinaComponent },
      { path: 'cursos/cadastro', component: CadastroCursoComponent },
      { path: 'aluno/cadastro', component: CadastroAlunoComponent },
    ],
  },
];
