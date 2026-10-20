
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({
      mensagem: 'Token não fornecido.'
    });
    return;
  }

  const token = authorization.slice(7);
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error('JWT_SECRET não configurado.');

    res.status(500).json({
      mensagem: 'Erro interno de autenticação.'
    });
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret);

    if (
      typeof payload === 'string' ||
      typeof payload.id_usuario !== 'number' ||
      typeof payload.email !== 'string'
    ) {
      res.status(401).json({
        mensagem: 'Token inválido.'
      });
      return;
    }

    res.locals.usuario = {
      id_usuario: payload.id_usuario,
      email: payload.email
    };

    next();
  } catch {
    res.status(401).json({
      mensagem: 'Token inválido ou expirado.'
    });
  }
}
