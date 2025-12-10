import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  criarUsuario(usuario: any) {
    return this.http.post(`${this.baseUrl}/usuarios`, usuario);
  }
}
