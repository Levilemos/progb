
export class Jogo {
  constructor(
    public id_jogo: number | null,
    public titulo: string,
    public descricao: string | null,
    public data_lancamento: string | null,
    public desenvolvedora: string | null,
    public capa: string | null,
    public id_administrador: number
  ) {}
}
