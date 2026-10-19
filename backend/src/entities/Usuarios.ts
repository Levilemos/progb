export class Usuario {
  constructor(
    public id_usuario: number | null,
    public nome: string,
    public email: string,
    public senha_hash: string,
    public data_cadastro: Date | null,
    public foto_perfil: string | null,
    public biografia: string | null
  ) {}
}