
import { Request, Response } from 'express';
import { JogoService } from '../services/JogoService.js';

export class JogoController {
  private service = new JogoService();

  listar = async (_req: Request, res: Response) => {
    try {
      res.json(await this.service.listar());
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: 'Erro ao listar jogos.' });
    }
  };

  buscarPorId = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ mensagem: 'ID inválido.' });
    }

    try {
      const jogo = await this.service.buscarPorId(id);

      if (!jogo) {
        return res.status(404).json({ mensagem: 'Jogo não encontrado.' });
      }

      res.json(jogo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: 'Erro ao buscar jogo.' });
    }
  };

  
  criar = async (req: Request, res: Response) => {
    try {
      const { titulo, descricao, data_lancamento, desenvolvedora, capa, id_administrador, generos } = req.body;

      if (!Number.isInteger(id_administrador) || id_administrador < 1) {
        return res.status(400).json({
          mensagem: 'Informe um ID de administrador válido.'
        });
      }

      const jogo = await this.service.criar({
        titulo,
        descricao,
        data_lancamento,
        desenvolvedora,
        capa,
        id_administrador,
        generos
      });

      return res.status(201).json(jogo);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : '';

      if (mensagem === 'O título é obrigatório.' ||
          mensagem === 'Informe um ID de administrador válido.' ||
          mensagem === 'Generos deve ser uma lista de IDs válidos.') {
        return res.status(400).json({ mensagem });
      }

      if ((error as { code?: string }).code === '23503') {
        return res.status(400).json({
          mensagem: 'O administrador ou algum gênero informado não existe.'
        });
      }

      console.error(error);
      return res.status(500).json({ mensagem: 'Erro ao cadastrar jogo.' });
    }
  };

  
  atualizar = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    try {
      const { titulo, descricao, data_lancamento, desenvolvedora, capa, id_administrador, generos } = req.body;

      const jogo = await this.service.atualizar(id, {
        titulo,
        descricao,
        data_lancamento,
        desenvolvedora,
        capa,
        id_administrador,
        generos
      });

      if (!jogo) {
        return res.status(404).json({ mensagem: 'Jogo não encontrado.' });
      }

      return res.json(jogo);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : '';

      if ([
        'ID do jogo inválido.',
        'O título é obrigatório.',
        'Informe um ID de administrador válido.',
        'Generos deve ser uma lista de IDs válidos.'
      ].includes(mensagem)) {
        return res.status(400).json({ mensagem });
      }

      if ((error as { code?: string }).code === '23503') {
        return res.status(400).json({
          mensagem: 'O administrador ou algum gênero informado não existe.'
        });
      }

      console.error(error);
      return res.status(500).json({ mensagem: 'Erro ao atualizar jogo.' });
    }
  };

  excluir = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    const excluido = await this.service.excluir(id);

    if (!excluido) {
      return res.status(404).json({ mensagem: 'Jogo não encontrado.' });
    }

    return res.status(204).send();
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : '';

    if (mensagem === 'ID do jogo inválido.') {
      return res.status(400).json({ mensagem });
    }

    if ((error as { code?: string }).code === '23503') {
      return res.status(409).json({
        mensagem: 'Não é possível excluir o jogo porque existem registros vinculados.'
      });
    }

    console.error(error);
    return res.status(500).json({ mensagem: 'Erro ao excluir jogo.' });
  }
};

    estatisticas = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    const resultado = await this.service.estatisticas(id);

    if (!resultado) {
      return res.status(404).json({ mensagem: 'Jogo não encontrado.' });
    }

    return res.json({
      id_jogo: id,
      quantidade_avaliacoes: resultado.quantidade_avaliacoes,
      media_notas: Number(resultado.media_notas)
    });
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : '';

    if (mensagem === 'ID do jogo inválido.') {
      return res.status(400).json({ mensagem });
    }

    console.error(error);
    return res.status(500).json({ mensagem: 'Erro ao consultar estatísticas.' });
  }
};

 atualizarCapa = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      mensagem: 'ID do jogo inválido.'
    });
  }

  if (!req.file) {
    return res.status(400).json({
      mensagem: 'Envie uma imagem no campo "capa".'
    });
  }

  try {
    const capa = `/uploads/${req.file.filename}`;
    const jogo = await this.service.atualizarCapa(id, capa);

    if (!jogo) {
      return res.status(404).json({
        mensagem: 'Jogo não encontrado.'
      });
    }

    return res.json({
      mensagem: 'Capa enviada com sucesso.',
      jogo
    });
  } catch (error) {
    console.error('Erro ao salvar a capa:', error);

    return res.status(500).json({
      mensagem: 'Não foi possível salvar a capa no banco de dados.'
    });
  }
};

}
