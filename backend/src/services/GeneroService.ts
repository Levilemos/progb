import { GeneroRepository } from '../repositories/GeneroRepository.js';

export class GeneroService {
  private repository = new GeneroRepository();

  listar() {
    return this.repository.listar();
  }

  async buscarPorId(id: number) {
    this.validarId(id);
    return this.repository.buscarPorId(id);
  }

  async criar(dados: { nome: string; descricao?: string | null }) {
    this.validarDados(dados);
    return this.repository.criar(dados);
  }

  async atualizar(
    id: number,
    dados: { nome: string; descricao?: string | null }
  ) {
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

  private validarDados(dados: { nome: string }) {
    if (typeof dados.nome !== 'string' || !dados.nome.trim()) {
      throw new Error('O nome é obrigatório.');
    }
  }
}