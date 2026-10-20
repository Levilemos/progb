
import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService.js';

export class AuthController {
  private service = new AuthService();

  login = async (req: Request, res: Response) => {
    try {
      const { email, senha } = req.body ?? {};

      if (
        typeof email !== 'string' ||
        !email.trim() ||
        typeof senha !== 'string' ||
        !senha
      ) {
        return res.status(400).json({
          mensagem: 'E-mail e senha são obrigatórios.'
        });
      }

      const resultado = await this.service.login(
        email.trim(),
        senha
      );

      return res.status(200).json(resultado);

    } catch (error) {
      const mensagem = error instanceof Error
        ? error.message
        : '';

      if (mensagem === 'E-mail ou senha incorretos.') {
        return res.status(401).json({ mensagem });
      }

      console.error(error);

      return res.status(500).json({
        mensagem: 'Erro interno ao realizar login.'
      });
    }
  };
}
