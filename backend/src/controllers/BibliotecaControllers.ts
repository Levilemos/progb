
import { Request, Response } from 'express';
import { BibliotecaService } from '../services/BibliotecaService.js';

export class BibliotecaController {
  private service = new BibliotecaService();

  listar = async (_req: Request, res: Response) => {
    try {
      return res.json(await this.service.listar());
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        mensagem: 'Erro ao listar bibliotecas.'
      });
    }
  };

  buscarPorId = async (req: Request, res: Response) => {
    try {
      const biblioteca = await this.service.buscarPorId(
        Number(req.params.id)
      );

      if (!biblioteca) {
        return res.status(404).json({
          mensagem: 'Biblioteca não encontrada.'
        });
      }

      return res.json(biblioteca);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : '';

      if (mensagem === 'ID inválido.') {
        return res.status(400).json({ mensagem });
      }

      console.error(error);
      return res.status(500).json({
        mensagem: 'Erro ao buscar biblioteca.'
      });
    }
  };

  criar = async (req: Request, res: Response) => {
    try {
      const biblioteca = await this.service.criar(req.body);
      return res.status(201).json(biblioteca);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : '';
      const codigo = (error as { code?: string }).code;

      if (
        mensagem === 'ID de jogador inválido.' ||
        mensagem === 'Descrição inválida.' ||
        mensagem === 'A privacidade deve ser PUBLICA ou PRIVADA.'
      ) {
        return res.status(400).json({ mensagem });
      }

      if (codigo === '23505') {
        return res.status(409).json({
          mensagem: 'Este jogador já possui uma biblioteca.'
        });
      }

      if (codigo === '23503') {
        return res.status(400).json({
          mensagem: 'Jogador não encontrado.'
        });
      }

      console.error(error);
      return res.status(500).json({
        mensagem: 'Erro ao criar biblioteca.'
      });
    }
  };

  atualizar = async (req: Request, res: Response) => {
    try {
      const biblioteca = await this.service.atualizar(
        Number(req.params.id),
        req.body
      );

      if (!biblioteca) {
        return res.status(404).json({
          mensagem: 'Biblioteca não encontrada.'
        });
      }

      return res.json(biblioteca);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : '';
      const codigo = (error as { code?: string }).code;

      if (
        mensagem === 'ID inválido.' ||
        mensagem === 'ID de jogador inválido.'
      ) {
        return res.status(400).json({
          mensagem: 'IDs inválidos.'
        });
      }

      if (
        mensagem === 'Descrição inválida.' ||
        mensagem === 'A privacidade deve ser PUBLICA ou PRIVADA.'
      ) {
        return res.status(400).json({ mensagem });
      }

      if (codigo === '23505') {
        return res.status(409).json({
          mensagem: 'Este jogador já possui uma biblioteca.'
        });
      }

      if (codigo === '23503') {
        return res.status(400).json({
          mensagem: 'Jogador não encontrado.'
        });
      }

      console.error(error);
      return res.status(500).json({
        mensagem: 'Erro ao atualizar biblioteca.'
      });
    }
  };

  excluir = async (req: Request, res: Response) => {
    try {
      const excluido = await this.service.excluir(
        Number(req.params.id)
      );

      if (!excluido) {
        return res.status(404).json({
          mensagem: 'Biblioteca não encontrada.'
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
        mensagem: 'Erro ao excluir biblioteca.'
      });
    }
  };
}
