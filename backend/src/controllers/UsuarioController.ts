
import { Request, Response } from 'express';
import { UsuarioService } from '../services/UsuarioService.js';

export class UsuarioController {
  private service = new UsuarioService();

  listar = async (_req: Request, res: Response) => {
    try {
      return res.json(await this.service.listar());
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        mensagem: 'Erro ao listar usuários.'
      });
    }
  };

  buscarPorId = async (req: Request, res: Response) => {
    try {
      const usuario = await this.service.buscarPorId(Number(req.params.id));

      if (!usuario) {
        return res.status(404).json({
          mensagem: 'Usuário não encontrado.'
        });
      }

      return res.json(usuario);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : '';

      if (mensagem === 'ID inválido.') {
        return res.status(400).json({ mensagem });
      }

      console.error(error);
      return res.status(500).json({
        mensagem: 'Erro ao buscar usuário.'
      });
    }
  };

  criar = async (req: Request, res: Response) => {
    try {
      const usuario = await this.service.criar(req.body);
      return res.status(201).json(usuario);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : '';
      const codigo = (error as { code?: string }).code;

      if (mensagem === 'Nome e e-mail são obrigatórios.' ||
            mensagem === 'Senha é obrigatória.' ||
            mensagem === 'Senha inválida.') {
        return res.status(400).json({ mensagem });
      }

      if (codigo === '23505') {
        return res.status(409).json({ mensagem: 'E-mail já cadastrado.' });
      }

      console.error(error);
      return res.status(500).json({ mensagem: 'Erro ao criar usuário.' });
    }
  };

  atualizar = async (req: Request, res: Response) => {
    try {
      const usuario = await this.service.atualizar(
        Number(req.params.id),
        req.body
      );

      if (!usuario) {
        return res.status(404).json({
          mensagem: 'Usuário não encontrado.'
        });
      }

      return res.json(usuario);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : '';
      const codigo = (error as { code?: string }).code;

      if (
        mensagem === 'ID inválido.' ||
        mensagem === 'Senha é obrigatória.' ||
        mensagem === 'Senha inválida.'
        
      ) {
        return res.status(400).json({ mensagem });
      }

      if (codigo === '23505') {
        return res.status(409).json({ mensagem: 'E-mail já cadastrado.' });
      }

      console.error(error);
      return res.status(500).json({ mensagem: 'Erro ao atualizar usuário.' });
    }
  };

  excluir = async (req: Request, res: Response) => {
    try {
      const excluido = await this.service.excluir(Number(req.params.id));

      if (!excluido) {
        return res.status(404).json({
          mensagem: 'Usuário não encontrado.'
        });
      }

      return res.status(204).send();
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : '';

      if (mensagem === 'ID inválido.') {
        return res.status(400).json({ mensagem });
      }

      console.error(error);
      return res.status(500).json({
        mensagem: 'Erro ao excluir usuário. Verifique as dependências desse usuário.'
      });
    }
  };
}
