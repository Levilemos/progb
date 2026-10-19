import { Request, Response } from 'express';
import { GeneroService } from '../services/GeneroService.js';

export class GeneroController {
  private service = new GeneroService();

  listar = async (_req: Request, res: Response) => {
    try {
      return res.json(await this.service.listar());
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensagem: 'Erro ao listar gêneros.' });
    }
  };

  buscarPorId = async (req: Request, res: Response) => {
    try {
      const genero = await this.service.buscarPorId(Number(req.params.id));

      if (!genero) {
        return res.status(404).json({ mensagem: 'Gênero não encontrado.' });
      }

      return res.json(genero);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : '';

      if (mensagem === 'ID inválido.') {
        return res.status(400).json({ mensagem });
      }

      console.error(error);
      return res.status(500).json({ mensagem: 'Erro ao buscar gênero.' });
    }
  };

  criar = async (req: Request, res: Response) => {
    try {
      return res.status(201).json(await this.service.criar(req.body));
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : '';
      const codigo = (error as { code?: string }).code;

      if (mensagem === 'O nome é obrigatório.') {
        return res.status(400).json({ mensagem });
      }

      if (codigo === '23505') {
        return res.status(409).json({
          mensagem: 'Já existe um gênero com esse nome.'
        });
      }

      console.error(error);
      return res.status(500).json({ mensagem: 'Erro ao criar gênero.' });
    }
  };

  atualizar = async (req: Request, res: Response) => {
    try {
      const genero = await this.service.atualizar(
        Number(req.params.id),
        req.body
      );

      if (!genero) {
        return res.status(404).json({ mensagem: 'Gênero não encontrado.' });
      }

      return res.json(genero);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : '';
      const codigo = (error as { code?: string }).code;

      if (mensagem === 'ID inválido.' || mensagem === 'O nome é obrigatório.') {
        return res.status(400).json({ mensagem });
      }

      if (codigo === '23505') {
        return res.status(409).json({
          mensagem: 'Já existe um gênero com esse nome.'
        });
      }

      console.error(error);
      return res.status(500).json({ mensagem: 'Erro ao atualizar gênero.' });
    }
  };

  excluir = async (req: Request, res: Response) => {
    try {
      const excluido = await this.service.excluir(Number(req.params.id));

      if (!excluido) {
        return res.status(404).json({ mensagem: 'Gênero não encontrado.' });
      }

      return res.status(204).send();
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : '';

      if (mensagem === 'ID inválido.') {
        return res.status(400).json({ mensagem });
      }

      console.error(error);
      return res.status(500).json({ mensagem: 'Erro ao excluir gênero.' });
    }
  };
}