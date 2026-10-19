
import { BibliotecaRepository } from '../repositories/BibliotecaRepository.js';

type DadosBiblioteca = {
  id_jogador: number;
  descricao?: string | null;
  privacidade?: 'PUBLICA' | 'PRIVADA';
};

export class BibliotecaService {
  private repository = new BibliotecaRepository();

  listar() {
    return this.repository.listar();
  }

  async buscarPorId(id: number) {
    this.validarId(id);
    return this.repository.buscarPorId(id);
  }

  async criar(dados: DadosBiblioteca) {
    this.validarDados(dados);
    return this.repository.criar(dados);
  }

  async atualizar(id: number, dados: DadosBiblioteca) {
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

  private validarDados(dados: DadosBiblioteca) {
    if (!Number.isInteger(dados.id_jogador) ||
        dados.id_jogador < 1) {
      throw new Error('ID de jogador inválido.');
    }

    if (dados.descricao != null &&
        typeof dados.descricao !== 'string') {
      throw new Error('Descrição inválida.');
    }

    const privacidade = dados.privacidade ?? 'PUBLICA';

    if (privacidade !== 'PUBLICA' &&
        privacidade !== 'PRIVADA') {
      throw new Error(
        'A privacidade deve ser PUBLICA ou PRIVADA.'
      );
    }
  }
}
