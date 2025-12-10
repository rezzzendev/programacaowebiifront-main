import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// MUDANÇA 1: Adicionar o httpOptions com 'withCredentials'
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true, // ESSENCIAL para enviar o cookie de sessão
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/login`,
      {
        username: credentials.username,
        password: credentials.password,
      },
      httpOptions // MUDANÇA 2: Passar as opções aqui
    );
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user, httpOptions);
  }
}
