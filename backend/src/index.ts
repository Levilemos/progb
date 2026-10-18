
import 'dotenv/config';
import express from 'express';
import { pool } from './database.js';
import jogosRouter from './routes/jogos.js';
import generosRouter from './routes/generos.js';
import avaliacoesRouter from './routes/avaliacoes.js';
import bibliotecasRouter from './routes/bibliotecas.js';
import usuariosRouter from './routes/usuarios.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.use(express.json());
app.use('/generos', generosRouter);
app.use('/jogos', jogosRouter);
app.use('/avaliacoes', avaliacoesRouter);
app.use('/bibliotecas', bibliotecasRouter);
app.use('/usuarios', usuariosRouter);


app.get('/', (_req, res) => {
  res.json({ mensagem: 'API da BraryGame funcionanduu!' });
});

app.get('/db-test', async (_req, res) => {
  try {
    const resultado = await pool.query('SELECT current_database() AS banco');

    res.json({
      conectado: true,
      banco: resultado.rows[0].banco,
    });
  } catch (error) {
    console.error('Erro ao consultar o banco:', error);
    res.status(500).json({
      conectado: false,
      mensagem: 'Não foi possível conectar ao banco de dados.',
    });
  }
});

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`API disponível em http://localhost:${port}`);
});




