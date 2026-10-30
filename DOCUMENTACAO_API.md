# Folhagem & Cia — Documentação da API

## Visão geral
API REST para gerenciamento do catálogo e estoque de uma loja de plantas. Stack: Node.js 20+, Express, TypeScript, Prisma, PostgreSQL e Docker.

## Executar
1. Copie `.env.example` para `.env`.
2. Execute `yarn`.
3. Execute `docker compose up -d --build`.
4. Execute `yarn migration`.
5. A API fica disponível em `http://localhost:3001`.

## Modelo Planta
- `id`: inteiro autoincrementado.
- `nome`, `especie`: textos.
- `preco`: inteiro em centavos.
- `estoque`: inteiro maior ou igual a zero.
- `luminosidade`: `SOMBRA`, `MEIA_SOMBRA` ou `SOL_PLENO`.
- `petFriendly`: booleano.
- `regaACadaDias`: inteiro maior ou igual a um.
- `createdAt`, `updatedAt`: datas automáticas.

## Rotas

### POST /plantas
Cadastra planta. Todos os campos de negócio são obrigatórios.
```json
{
  "nome": "Costela-de-adão",
  "especie": "Monstera deliciosa",
  "preco": 8990,
  "estoque": 12,
  "luminosidade": "MEIA_SOMBRA",
  "petFriendly": false,
  "regaACadaDias": 3
}
```
Sucesso: `201` com o objeto criado. Dados inválidos: `400`.

### GET /plantas
Lista plantas. Filtros opcionais: `luminosidade`, `petFriendly=true|false`, `nome`. Ordenação opcional: `ordem=preco|nome`. Filtro inválido: `400`; sem resultados: `200` com `[]`.

### GET /plantas/:id
Busca por ID. `200` com objeto, `400` para ID inválido, `404` se não existir.

### PATCH /plantas/:id
Atualiza somente os campos enviados, por exemplo:
```json
{ "preco": 9500 }
```
Retorna `200`, `400` para dados inválidos, `404` se não existir.

### DELETE /plantas/:id
Remove planta. Retorna `204`, `400` para ID inválido e `404` se não existir.

### POST /plantas/:id/venda
Corpo:
```json
{ "quantidade": 2 }
```
Retorna `200` com a planta atualizada. Quantidade inválida ou estoque insuficiente: `400`; planta inexistente: `404`.

### GET /plantas/estoque/valor-total
Exemplo de resposta:
```json
{ "valorTotalEmCentavos": 154300, "totalDeVasos": 37 }
```
Com catálogo vazio, os dois totais são zero.

### GET /plantas/esgotadas
Bônus: lista plantas cujo estoque é zero.

## Exemplos de filtros
- `/plantas?luminosidade=MEIA_SOMBRA`
- `/plantas?petFriendly=false`
- `/plantas?luminosidade=SOL_PLENO&petFriendly=true`
- `/plantas?nome=costela&ordem=preco`

## Decisão sobre concorrência
A venda usa `updateMany` com condição `estoque >= quantidade` e decremento no próprio banco. A alteração só ocorre se a condição ainda for verdadeira no momento da operação. Assim, duas requisições concorrentes não conseguem vender o mesmo último vaso e deixar o estoque negativo.
