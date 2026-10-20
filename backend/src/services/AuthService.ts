
import 'dotenv/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UsuarioRepository } from '../repositories/UsuarioRepository.js';

export class AuthService {
  private repository = new UsuarioRepository();

  async login(email: string, senha: string) {
    const usuario = await this.repository.buscarPorEmail(email);

    if (!usuario) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const senhaValida = await bcrypt.compare(
      senha,
      usuario.senha_hash
    );

    if (!senhaValida) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET não configurado.');
    }

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        email: usuario.email
      },
      jwtSecret,
      { expiresIn: '2h' }
    );

    return {
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email
      }
    };
  }
}
