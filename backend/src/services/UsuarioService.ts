
import bcrypt from 'bcrypt';
import { UsuarioRepository } from '../repositories/UsuarioRepository.js';

type DadosUsuario = {
  nome: string;
  email: string;
  senha: string;
  foto_perfil?: string | null;
  biografia?: string | null;
};

type AtualizacaoUsuario = {
  nome: string;
  email: string;
  senha?: string;
  foto_perfil?: string | null;
  biografia?: string | null;
};

export class UsuarioService {
  private repository = new UsuarioRepository();

  listar() {
    return this.repository.listar();
  }

  async buscarPorId(id: number) {
    this.validarId(id);
    return this.repository.buscarPorId(id);
  }

  async criar(dados: DadosUsuario) {
    this.validarDados(dados, true);

    const senha_hash = await bcrypt.hash(dados.senha, 12);

    return this.repository.criar({
      nome: dados.nome,
      email: dados.email,
      senha_hash,
      foto_perfil: dados.foto_perfil,
      biografia: dados.biografia
    });
  }

  async atualizar(id: number, dados: AtualizacaoUsuario) {
    this.validarId(id);
    this.validarDados(dados, false);

    let senha_hash: string | undefined;

    if (dados.senha !== undefined) {
      senha_hash = await bcrypt.hash(dados.senha, 12);
    }

    return this.repository.atualizar(id, {
      nome: dados.nome,
      email: dados.email,
      senha_hash,
      foto_perfil: dados.foto_perfil,
      biografia: dados.biografia
    });
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

  private validarDados(
    dados: AtualizacaoUsuario,
    senhaObrigatoria: boolean
  ) {
    if (
      !dados ||
      typeof dados.nome !== 'string' ||
      !dados.nome.trim() ||
      typeof dados.email !== 'string' ||
      !dados.email.trim()
    ) {
      throw new Error('Nome e e-mail são obrigatórios.');
    }

    if (senhaObrigatoria && dados.senha === undefined) {
      throw new Error('Senha é obrigatória.');
    }

    if (
      dados.senha !== undefined &&
      (
        typeof dados.senha !== 'string' ||
        !dados.senha.trim()
      )
    ) {
      throw new Error('Senha inválida.');
    }
  }
}
