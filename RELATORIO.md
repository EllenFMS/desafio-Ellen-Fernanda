# Relatório — Desafio Folhagem & Cia

> Exemplo de relatório para estudo. Revise e adapte para refletir o que você realmente executou, testou e compreendeu.

## 1. O que foi feito

Foi implementada a entidade `Planta`, com os campos definidos no desafio, e as rotas de cadastro, listagem, busca por ID, atualização parcial, remoção, venda e cálculo do valor total do estoque. Também foram implementados os bônus de busca por nome sem diferenciar maiúsculas/minúsculas, ordenação por preço ou nome e listagem de plantas esgotadas.

## 2. Como foi feito

A implementação seguiu a arquitetura já existente no projeto: `routes.ts` direciona as requisições para o controller; o controller valida parâmetros e regras de negócio e define os status HTTP; o repository concentra as operações com Prisma.

O model `Planta` e o enum `Luminosidade` foram adicionados ao `schema.prisma`. A migration correspondente foi incluída no repositório. No cadastro, todos os campos são obrigatórios. No PATCH, somente os campos enviados são validados e atualizados. A validação diferencia ausência de campo (`undefined`) de valores válidos como `0` e `false`.

O preço é armazenado em centavos para evitar imprecisões de ponto flutuante. A venda usa uma atualização condicional no banco (`estoque >= quantidade`) e decremento atômico, evitando que vendas concorrentes reduzam o estoque abaixo de zero.

## 3. Principais dificuldades

Os pontos que exigem mais atenção são a validação de `0` e `false`, a conversão dos parâmetros e filtros que chegam como texto, a ordem de registro das rotas fixas e parametrizadas e a consistência do estoque durante vendas simultâneas. A solução para cada ponto deve ser confirmada com testes HTTP e leitura dos logs.

## 4. Uso de inteligência artificial

A inteligência artificial foi utilizada como apoio para compreender o enunciado, planejar a implementação, sugerir código e explicar decisões técnicas. O código gerado não deve ser considerado correto apenas por ter sido produzido por IA: cada rota e regra precisa ser conferida, executada e testada. Durante o estudo, é importante conseguir explicar a validação dos dados, a separação entre controller e repository, o uso do Prisma e a atualização atômica do estoque.

## Checklist de validação

- [ ] `docker compose up -d --build` inicia os serviços.
- [ ] `yarn migration` aplica as migrations.
- [ ] `yarn typecheck` termina sem erros.
- [ ] Todos os cenários de sucesso e erro do enunciado foram testados.
- [ ] O cenário de duas vendas simultâneas foi testado.
