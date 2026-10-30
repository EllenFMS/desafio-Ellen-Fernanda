import { Luminosidade, Prisma } from "@prisma/client";
import prisma from "@database";

export type PlantaFilters = {
  luminosidade?: Luminosidade;
  petFriendly?: boolean;
  nome?: string;
  ordem?: "preco" | "nome";
};

export const createPlanta = async (data: Prisma.PlantaCreateInput) =>
  prisma.planta.create({ data });

export const findAllPlantas = async (filters: PlantaFilters = {}) =>
  prisma.planta.findMany({
    where: {
      luminosidade: filters.luminosidade,
      petFriendly: filters.petFriendly,
      ...(filters.nome ? { nome: { contains: filters.nome, mode: "insensitive" } } : {}),
    },
    ...(filters.ordem
      ? { orderBy: { [filters.ordem]: "asc" as const } }
      : {}),
  });

export const findPlantaById = async (id: number) =>
  prisma.planta.findUnique({ where: { id } });

export const updatePlanta = async (id: number, data: Prisma.PlantaUpdateInput) =>
  prisma.planta.update({ where: { id }, data });

export const deletePlanta = async (id: number) =>
  prisma.planta.delete({ where: { id } });

export const findPlantasEsgotadas = async () =>
  prisma.planta.findMany({ where: { estoque: 0 } });

/**
 * Atualização condicional atômica: o banco só decrementa se ainda houver
 * estoque suficiente. Isso evita que duas vendas concorrentes vendam o último vaso.
 */
export const sellPlanta = async (id: number, quantidade: number) => {
  const result = await prisma.planta.updateMany({
    where: { id, estoque: { gte: quantidade } },
    data: { estoque: { decrement: quantidade } },
  });

  if (result.count === 0) return null;
  return prisma.planta.findUnique({ where: { id } });
};

export const calculateStockValue = async () => {
  const plantas = await prisma.planta.findMany({
    select: { preco: true, estoque: true },
  });

  return plantas.reduce(
    (totals, planta) => ({
      valorTotalEmCentavos: totals.valorTotalEmCentavos + planta.preco * planta.estoque,
      totalDeVasos: totals.totalDeVasos + planta.estoque,
    }),
    { valorTotalEmCentavos: 0, totalDeVasos: 0 },
  );
};
