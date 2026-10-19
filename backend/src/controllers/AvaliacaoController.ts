
import { Request, Response } from 'express';
import { AvaliacaoService } from '../services/AvaliacaoServices.js';

export class AvaliacaoController {
  private service = new AvaliacaoService();

  listar = async (_req: Request, res: Response) => {
    try {
      return res.json(await this.service.listar());
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        mensagem: 'Erro ao listar avaliações.'
      });
    }
  };

  buscarPorId = async (req: Request, res: Response) => {
    try {
      const avaliacao = await this.service.buscarPorId(
        Number(req.params.id)
      );

      if (!avaliacao) {
        return res.status(404).json({
          mensagem: 'Avaliação não encontrada.'
        });
      }

      return res.json(avaliacao);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : '';

      if (mensagem === 'ID inválido.') {
        return res.status(400).json({ mensagem });
      }

      console.error(error);
      return res.status(500).json({
        mensagem: 'Erro ao buscar avaliação.'
      });
    }
  };

  criar = async (req: Request, res: Response) => {
    try {
      const avaliacao = await this.service.criar(req.body);
      return res.status(201).json(avaliacao);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : '';
      const codigo = (error as { code?: string }).code;

      if (
        mensagem === 'Informe IDs válidos e uma nota de 1 a 5.' ||
        mensagem === 'Comentário inválido.'
      ) {
        return res.status(400).json({ mensagem });
      }

      if (codigo === '23505') {
        return res.status(409).json({
          mensagem: 'Este usuário já avaliou este jogo.'
        });
      }

      if (codigo === '23503') {
        return res.status(400).json({
          mensagem: 'Usuário ou jogo não encontrado.'
        });
      }

      console.error(error);
      return res.status(500).json({
        mensagem: 'Erro ao criar avaliação.'
      });
    }
  };

  atualizar = async (req: Request, res: Response) => {
    try {
      const avaliacao = await this.service.atualizar(
        Number(req.params.id),
        req.body
      );

      if (!avaliacao) {
        return res.status(404).json({
          mensagem: 'Avaliação não encontrada.'
        });
      }

      return res.json(avaliacao);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : '';
      const codigo = (error as { code?: string }).code;

      if (
        mensagem === 'ID inválido.' ||
        mensagem === 'Informe IDs válidos e uma nota de 1 a 5.' ||
        mensagem === 'Comentário inválido.'
      ) {
        return res.status(400).json({ mensagem });
      }

      if (codigo === '23505') {
        return res.status(409).json({
          mensagem: 'Este usuário já avaliou este jogo.'
        });
      }

      if (codigo === '23503') {
        return res.status(400).json({
          mensagem: 'Usuário ou jogo não encontrado.'
        });
      }

      console.error(error);
      return res.status(500).json({
        mensagem: 'Erro ao atualizar avaliação.'
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
          mensagem: 'Avaliação não encontrada.'
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
        mensagem: 'Erro ao excluir avaliação.'
      });
    }
  };
}
