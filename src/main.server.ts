import 'zone.js/node';

// MUDANÇA DA CORREÇÃO 1: Importar BootstrapContext
import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';

// MUDANÇA 1: Importar AppComponent em vez de App
import { AppComponent } from './app/app'; 
import { config } from './app/app.config.server';

// MUDANÇA 2: Usar AppComponent aqui também
// MUDANÇA DA CORREÇÃO 2: Aceitar 'context' como argumento
const bootstrap = (context: BootstrapContext) => 
  bootstrapApplication(AppComponent, config, context); // MUDANÇA DA CORREÇÃO 3: Passar o 'context' aqui

export default bootstrap;