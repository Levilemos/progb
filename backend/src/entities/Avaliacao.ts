
export class Avaliacao {
  constructor(
    public id_avaliacao: number | null,
    public id_usuario: number,
    public id_jogo: number,
    public nota: number,
    public comentario: string | null,
    public data_criacao: Date | null
  ) {}
}
