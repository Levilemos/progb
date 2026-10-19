import { UsuarioRepository } from '../repositories/UsuarioRepository.js';

export class UsuarioService {
  private repository = new UsuarioRepository();

  listar() {
    return this.repository.listar();
  }

  async buscarPorId(id: number) {
    this.validarId(id);
    return this.repository.buscarPorId(id);
  }

  async criar(dados: {
    nome: string;
    email: string;
    senha_hash: string;
    foto_perfil?: string | null;
    biografia?: string | null;
  }) {
    this.validarDados(dados);
    return this.repository.criar(dados);
  }

  async atualizar(id: number, dados: {
    nome: string;
    email: string;
    senha_hash: string;
    foto_perfil?: string | null;
    biografia?: string | null;
  }) {
    this.validarId(id);
    this.validarDados(dados);
    return this.repository.atualizar(id, dados);
  }

  async excluir(id: number) {
    this.validarId(id);
    return this.repository.excluir(id);
  }

  private validarId(id: number) {
    if (!Number.isInteger(id) || id < 1) {
      throw new Error('ID inválido.');
    }
  }

  private validarDados(dados: {
    nome: string;
    email: string;
    senha_hash: string;
  }) {
    if (
      typeof dados.nome !== 'string' || !dados.nome.trim() ||
      typeof dados.email !== 'string' || !dados.email.trim() ||
      typeof dados.senha_hash !== 'string' || !dados.senha_hash.trim()
    ) {
      throw new Error('Nome, e-mail e senha_hash são obrigatórios.');
    }
  }
}