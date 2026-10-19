
import { JogoRepository } from '../repositories/JogoRepository.js';

export class JogoService {
  private repository = new JogoRepository();

  listar() {
    return this.repository.listar();
  }

  buscarPorId(id: number) {
    return this.repository.buscarPorId(id);
  }

  
  async criar(dados: {
    titulo: string;
    descricao?: string | null;
    data_lancamento?: string | null;
    desenvolvedora?: string | null;
    capa?: string | null;
    id_administrador: number;
    generos?: number[];
  }) {
    if (typeof dados.titulo !== 'string' || !dados.titulo.trim()) {
      throw new Error('O título é obrigatório.');
    }

    if (!Number.isInteger(dados.id_administrador) || dados.id_administrador < 1) {
      throw new Error('Informe um ID de administrador válido.');
    }

    if (
      dados.generos !== undefined &&
      (!Array.isArray(dados.generos) ||
        !dados.generos.every(id => Number.isInteger(id) && id > 0))
    ) {
      throw new Error('Generos deve ser uma lista de IDs válidos.');
    }

    return this.repository.criar(dados);
  }

  
  async atualizar(id: number, dados: {
    titulo: string;
    descricao?: string | null;
    data_lancamento?: string | null;
    desenvolvedora?: string | null;
    capa?: string | null;
    id_administrador: number;
    generos?: number[];
  }) {
    if (!Number.isInteger(id) || id < 1) {
      throw new Error('ID do jogo inválido.');
    }

    if (typeof dados.titulo !== 'string' || !dados.titulo.trim()) {
      throw new Error('O título é obrigatório.');
    }

    if (!Number.isInteger(dados.id_administrador) || dados.id_administrador < 1) {
      throw new Error('Informe um ID de administrador válido.');
    }

    if (
      dados.generos !== undefined &&
      (!Array.isArray(dados.generos) ||
        !dados.generos.every(genero => Number.isInteger(genero) && genero > 0))
    ) {
      throw new Error('Generos deve ser uma lista de IDs válidos.');
    }

    return this.repository.atualizar(id, dados);
  }

  async excluir(id: number): Promise<boolean> {
  if (!Number.isInteger(id) || id < 1) {
    throw new Error('ID do jogo inválido.');
  }

  return this.repository.excluir(id);
}

    async estatisticas(id: number) {
  if (!Number.isInteger(id) || id < 1) {
    throw new Error('ID do jogo inválido.');
  }

  return this.repository.estatisticas(id);
}

 async atualizarCapa(id: number, capa: string) {
  if (!Number.isInteger(id) || id < 1) {
    throw new Error('ID do jogo inválido.');
  }

  if (!capa) {
    throw new Error('Caminho da capa inválido.');
  }

  return this.repository.atualizarCapa(id, capa);
}


}

