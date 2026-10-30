# 🌱 Folhagem & Cia — API de Gerenciamento de Plantas

API REST desenvolvida como parte do desafio de Back-end do Processo Seletivo do CITi, utilizando Node.js, Express, TypeScript, Prisma e PostgreSQL.

O projeto parte de um CRUD de usuários já existente no repositório de treinamento e tem como objetivo desenvolver uma API para gerenciamento de uma loja de plantas, contemplando cadastro, consulta, atualização, remoção e controle de estoque.

## 🛠️ Tecnologias utilizadas

* **Node.js** — Ambiente de execução.
* **Express** — Framework para construção da API.
* **TypeScript** — Tipagem estática.
* **Prisma ORM** — Comunicação com o banco de dados.
* **PostgreSQL** — Banco de dados relacional.
* **Docker** — Containerização da aplicação e do banco.

## 📋 Funcionalidades

A API contempla as seguintes operações:

* Cadastro de plantas.
* Listagem de plantas.
* Busca de uma planta pelo ID.
* Atualização parcial dos dados de uma planta.
* Exclusão de plantas.
* Filtragem por luminosidade e compatibilidade com animais.
* Controle de estoque e registro de vendas.
* Cálculo do valor total do estoque.

### 🌿 Entidade Planta

| Campo           | Tipo     | Descrição                                        |
| --------------- | -------- | ------------------------------------------------ |
| `id`            | Int      | Identificador gerado automaticamente pelo banco. |
| `nome`          | String   | Nome popular da planta.                          |
| `especie`       | String   | Nome científico da planta.                       |
| `preco`         | Int      | Preço em centavos.                               |
| `estoque`       | Int      | Quantidade disponível em estoque.                |
| `luminosidade`  | Enum     | Necessidade de luminosidade.                     |
| `petFriendly`   | Boolean  | Indica se a planta é segura para animais.        |
| `regaACadaDias` | Int      | Intervalo de rega em dias.                       |
| `createdAt`     | DateTime | Data de criação do registro.                     |
| `updatedAt`     | DateTime | Data da última atualização.                      |

**Valores aceitos para luminosidade:**

* `SOMBRA`
* `MEIA_SOMBRA`
* `SOL_PLENO`

**Observação sobre preços:** os valores são armazenados em centavos para evitar problemas de precisão em operações matemáticas com números decimais. Por exemplo, `8990` representa R$ 89,90.

## 🔌 Endpoints

Base URL: `http://localhost:3001`

| Método | Rota                           | Descrição                              | Sucesso |
| ------ | ------------------------------ | -------------------------------------- | ------- |
| POST   | `/plantas`                     | Cadastra uma planta.                   | 201     |
| GET    | `/plantas`                     | Lista as plantas cadastradas.          | 200     |
| GET    | `/plantas/:id`                 | Busca uma planta pelo ID.              | 200     |
| PATCH  | `/plantas/:id`                 | Atualiza os campos enviados.           | 200     |
| DELETE | `/plantas/:id`                 | Remove uma planta.                     | 204     |
| POST   | `/plantas/:id/venda`           | Realiza uma venda e diminui o estoque. | 200     |
| GET    | `/plantas/estoque/valor-total` | Calcula o valor total do estoque.      | 200     |

### Exemplos de requisições

#### Cadastrar planta

`POST /plantas`

```json
{
  "nome": "Costela-de-Adão",
  "especie": "Monstera deliciosa",
  "preco": 8990,
  "estoque": 10,
  "luminosidade": "MEIA_SOMBRA",
  "petFriendly": false,
  "regaACadaDias": 5
}
```

#### Filtrar plantas

`GET /plantas?luminosidade=MEIA_SOMBRA`

`GET /plantas?petFriendly=false`

Também é possível utilizar os dois filtros simultaneamente:

`GET /plantas?luminosidade=MEIA_SOMBRA&petFriendly=false`

#### Buscar planta por ID

`GET /plantas/1`

#### Atualizar planta

`PATCH /plantas/1`

O PATCH permite atualizar somente os campos desejados, sem precisar enviar o objeto completo.

```json
{
  "preco": 9990
}
```

#### Realizar venda

`POST /plantas/1/venda`

```json
{
  "quantidade": 2
}
```

A operação diminui a quantidade disponível no estoque de acordo com a quantidade vendida.

#### Consultar valor total do estoque

`GET /plantas/estoque/valor-total`

Resposta esperada:

```json
{
  "valorTotalEmCentavos": 154300,
  "totalDeVasos": 37
}
```

Os valores acima são ilustrativos.

## ⚖️ Regras de negócio e validações

A API deve respeitar as seguintes regras:

1. Todos os campos são obrigatórios no cadastro.
2. O preço deve ser maior que zero.
3. O intervalo de rega deve ser de pelo menos um dia.
4. O estoque não pode ser negativo, mas pode ser zero.
5. A luminosidade deve corresponder a um dos valores definidos no enum.
6. Dados inválidos no cadastro, na edição, nos filtros ou na venda devem retornar `400 Bad Request`, acompanhados de uma mensagem clara.
7. A consulta ou alteração de um ID inexistente deve retornar `404 Not Found`, conforme a operação.
8. Uma venda nunca pode deixar o estoque negativo. Caso não exista estoque suficiente, a operação deve retornar `400 Bad Request` sem alterar a quantidade disponível.

### Códigos HTTP

| Código | Significado           | Utilização                                |
| ------ | --------------------- | ----------------------------------------- |
| 200    | OK                    | Consulta, atualização e venda realizadas. |
| 201    | Created               | Cadastro realizado.                       |
| 204    | No Content            | Exclusão realizada sem corpo de resposta. |
| 400    | Bad Request           | Dados ou parâmetros inválidos.            |
| 404    | Not Found             | Registro não encontrado.                  |
| 500    | Internal Server Error | Erro inesperado no servidor.              |

## 🏗️ Arquitetura do projeto

O projeto utiliza uma arquitetura organizada em camadas, separando as responsabilidades de cada componente.

```text
Requisição HTTP
      |
      v
  routes.ts
      |
      v
  Controller
      |
      v
  Repository
      |
      v
  Prisma ORM
      |
      v
  PostgreSQL
```

### Responsabilidades

* **Routes:** define os endpoints e direciona as requisições para os respectivos controllers.
* **Controllers:** recebem as requisições, validam os dados, aplicam as regras de negócio e definem os status HTTP das respostas.
* **Repositories:** concentram as operações de acesso ao banco de dados.
* **Prisma:** realiza a comunicação entre a aplicação e o PostgreSQL.

O Repository é a única camada da aplicação responsável por acessar o banco de dados.

### Estrutura de diretórios

```text
prisma/
  migrations/
  schema.prisma

src/
  server.ts
  routes.ts

  database/
    index.ts

  controllers/
    PlantaController.ts
    UserController.ts

  repositories/
    PlantaRepository.ts
    UserRepository.ts
```

## 🐳 Como executar o projeto

### Pré-requisitos

* Docker Desktop.
* Node.js 20 ou superior.
* Yarn.
* Cliente HTTP, como Thunder Client, Insomnia ou Postman.

### 1. Clonar o repositório

```bash
git clone <link-do-repositorio>
cd desafio-Ellen-Fernanda
```

### 2. Criar o arquivo `.env`

Na raiz do projeto, copie o arquivo de exemplo:

```bash
cp .env.example .env
```

No PowerShell ou CMD:

```powershell
copy .env.example .env
```

Configure as variáveis de ambiente conforme o arquivo `.env.example`.

O arquivo `.env` contém informações de configuração e não deve ser enviado ao Git.

### 3. Instalar as dependências

```bash
yarn
```

### 4. Subir os containers

Com o Docker Desktop aberto:

```bash
docker compose up -d --build
```

Esse comando constrói a imagem da aplicação, caso necessário, e inicia os containers da API e do PostgreSQL.

### 5. Aplicar as migrations

Para aplicar as migrations existentes:

```bash
docker compose exec server npx prisma migrate deploy
```

No ambiente de desenvolvimento, quando for necessário criar uma nova migration a partir de alterações no `schema.prisma`, utilize o comando de migration disponibilizado pelo projeto:

```bash
yarn migration
```

### 6. Verificar a aplicação

A API estará disponível em:

`http://localhost:3001`

Para conferir os logs:

```bash
docker compose logs -f server
```

## 🧰 Comandos úteis

| Comando                                                | Descrição                                                 |
| ------------------------------------------------------ | --------------------------------------------------------- |
| `docker compose up -d`                                 | Inicia os containers.                                     |
| `docker compose up -d --build`                         | Reconstrói as imagens e inicia os containers.             |
| `docker compose down`                                  | Para e remove os containers, preservando os volumes.      |
| `docker compose ps`                                    | Exibe o estado dos containers.                            |
| `docker compose logs -f server`                        | Acompanha os logs da API.                                 |
| `docker compose exec server npx prisma migrate deploy` | Aplica migrations pendentes.                              |
| `yarn migration`                                       | Cria e aplica uma migration conforme o script do projeto. |
| `yarn studio`                                          | Abre o Prisma Studio.                                     |
| `yarn typecheck`                                       | Verifica erros de tipagem do TypeScript.                  |

## 🧪 Testes

Os endpoints podem ser testados utilizando Thunder Client, Insomnia, Postman ou cURL.

É importante verificar tanto os casos de sucesso quanto os cenários de erro.

Alguns cenários essenciais:

* Cadastro válido e cadastro com campos ausentes.
* Cadastro com preço inválido.
* Cadastro com estoque negativo.
* Cadastro com luminosidade inválida.
* Consulta de ID existente e inexistente.
* Atualização parcial e atualização com dados inválidos.
* Filtros válidos e inválidos.
* Venda com estoque suficiente e insuficiente.
* Tentativa de venda com quantidade zero.
* Cálculo do valor total do estoque.
* Exclusão e consulta posterior do registro excluído.

Antes da entrega, execute:

```bash
yarn typecheck
```

## 👩‍💻 Créditos

**Projeto-base:** Ellen Fernanda — CRUD de usuários desenvolvido para o treinamento de Back-end do CITi.

**Desafio:** Folhagem & Cia — implementação da API de gerenciamento de plantas como parte do Processo Seletivo do CITi.
