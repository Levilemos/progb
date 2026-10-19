
import { AvaliacaoRepository } from '../repositories/AvaliacaoRepository.js';

export class AvaliacaoService {
  private repository = new AvaliacaoRepository();

  listar() {
    return this.repository.listar();
  }

  async buscarPorId(id: number) {
    this.validarId(id);
    return this.repository.buscarPorId(id);
  }

  async criar(dados: {
    id_usuario: number;
    id_jogo: number;
    nota: number;
    comentario?: string | null;
  }) {
    this.validarDados(dados);
    return this.repository.criar(dados);
  }

  async atualizar(id: number, dados: {
    id_usuario: number;
    id_jogo: number;
    nota: number;
    comentario?: string | null;
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
    id_usuario: number;
    id_jogo: number;
    nota: number;
    comentario?: string | null;
  }) {
    if (
      !Number.isInteger(dados.id_usuario) ||
      dados.id_usuario < 1 ||
      !Number.isInteger(dados.id_jogo) ||
      dados.id_jogo < 1 ||
      !Number.isInteger(dados.nota) ||
      dados.nota < 1 ||
      dados.nota > 5
    ) {
      throw new Error(
        'Informe IDs válidos e uma nota de 1 a 5.'
      );
    }

    if (
      dados.comentario != null &&
      typeof dados.comentario !== 'string'
    ) {
      throw new Error('Comentário inválido.');
    }
  }
}
