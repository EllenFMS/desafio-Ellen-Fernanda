import { Request, Response } from "express";
import { Luminosidade } from "@prisma/client";
import * as PlantaRepository from "@repositories/PlantaRepository";

const luminosidades = Object.values(Luminosidade);
const isPositiveId = (id: number) => Number.isInteger(id) && id > 0;

type PlantaPayload = {
  nome?: unknown;
  especie?: unknown;
  preco?: unknown;
  estoque?: unknown;
  luminosidade?: unknown;
  petFriendly?: unknown;
  regaACadaDias?: unknown;
};

const validateFields = (body: PlantaPayload, partial = false): string | null => {
  const fields = [
    "nome", "especie", "preco", "estoque",
    "luminosidade", "petFriendly", "regaACadaDias",
  ] as const;

  if (!partial) {
    const missing = fields.find((field) => body[field] === undefined);
    if (missing) return `O campo '${missing}' é obrigatório.`;
  }

  for (const field of fields) {
    const value = body[field];
    if (value === undefined) continue;

    switch (field) {
      case "nome":
      case "especie":
        if (typeof value !== "string" || value.trim() === "")
          return `O campo '${field}' deve ser um texto não vazio.`;
        break;
      case "preco":
        if (!Number.isInteger(value) || (value as number) <= 0)
          return "O preço deve ser um número inteiro maior que zero, em centavos.";
        break;
      case "estoque":
        if (!Number.isInteger(value) || (value as number) < 0)
          return "O estoque deve ser um número inteiro maior ou igual a zero.";
        break;
      case "luminosidade":
        if (typeof value !== "string" || !luminosidades.includes(value as Luminosidade))
          return "Luminosidade inválida. Use SOMBRA, MEIA_SOMBRA ou SOL_PLENO.";
        break;
      case "petFriendly":
        if (typeof value !== "boolean")
          return "O campo 'petFriendly' deve ser booleano.";
        break;
      case "regaACadaDias":
        if (!Number.isInteger(value) || (value as number) < 1)
          return "O campo 'regaACadaDias' deve ser um inteiro maior ou igual a 1.";
        break;
    }
  }
  return null;
};

const getId = (rawId: string): number | null => {
  const id = Number(rawId);
  return isPositiveId(id) ? id : null;
};

export const createPlanta = async (req: Request, res: Response) => {
  try {
    const error = validateFields(req.body ?? {});
    if (error) return res.status(400).json({ message: error });

    const { nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias } = req.body;
    const planta = await PlantaRepository.createPlanta({
      nome: nome.trim(), especie: especie.trim(), preco, estoque,
      luminosidade, petFriendly, regaACadaDias,
    });
    return res.status(201).json(planta);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao cadastrar planta." });
  }
};

export const readAllPlantas = async (req: Request, res: Response) => {
  try {
    const { luminosidade, petFriendly, nome, ordem } = req.query;

    if (luminosidade !== undefined &&
        (typeof luminosidade !== "string" || !luminosidades.includes(luminosidade as Luminosidade)))
      return res.status(400).json({ message: "Filtro de luminosidade inválido." });

    if (petFriendly !== undefined && petFriendly !== "true" && petFriendly !== "false")
      return res.status(400).json({ message: "Filtro petFriendly deve ser true ou false." });

    if (nome !== undefined && (typeof nome !== "string" || !nome.trim()))
      return res.status(400).json({ message: "Filtro nome deve ser um texto não vazio." });

    if (ordem !== undefined && ordem !== "preco" && ordem !== "nome")
      return res.status(400).json({ message: "Ordenação inválida. Use preco ou nome." });

    const plantas = await PlantaRepository.findAllPlantas({
      luminosidade: luminosidade as Luminosidade | undefined,
      petFriendly: petFriendly === undefined ? undefined : petFriendly === "true",
      nome: nome as string | undefined,
      ordem: ordem as "preco" | "nome" | undefined,
    });
    return res.status(200).json(plantas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao listar plantas." });
  }
};

export const readPlantaById = async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    if (id === null) return res.status(400).json({ message: "ID inválido." });

    const planta = await PlantaRepository.findPlantaById(id);
    if (!planta) return res.status(404).json({ message: "Planta não encontrada." });
    return res.status(200).json(planta);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar planta." });
  }
};

export const updatePlanta = async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    if (id === null) return res.status(400).json({ message: "ID inválido." });

    const body = req.body ?? {};
    const allowed = ["nome", "especie", "preco", "estoque", "luminosidade", "petFriendly", "regaACadaDias"];
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        !Object.keys(body).some((key) => allowed.includes(key)) ||
        Object.keys(body).some((key) => !allowed.includes(key)))
      return res.status(400).json({ message: "Envie ao menos um campo válido para atualização." });

    const error = validateFields(body, true);
    if (error) return res.status(400).json({ message: error });

    const planta = await PlantaRepository.findPlantaById(id);
    if (!planta) return res.status(404).json({ message: "Planta não encontrada." });

    const data = { ...body };
    if (typeof data.nome === "string") data.nome = data.nome.trim();
    if (typeof data.especie === "string") data.especie = data.especie.trim();
    const updated = await PlantaRepository.updatePlanta(id, data);
    return res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao atualizar planta." });
  }
};

export const deletePlanta = async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    if (id === null) return res.status(400).json({ message: "ID inválido." });
    const planta = await PlantaRepository.findPlantaById(id);
    if (!planta) return res.status(404).json({ message: "Planta não encontrada." });
    await PlantaRepository.deletePlanta(id);
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao deletar planta." });
  }
};

export const sellPlanta = async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    if (id === null) return res.status(400).json({ message: "ID inválido." });
    const { quantidade } = req.body ?? {};
    if (!Number.isInteger(quantidade) || quantidade <= 0)
      return res.status(400).json({ message: "Quantidade deve ser um inteiro maior que zero." });

    const planta = await PlantaRepository.findPlantaById(id);
    if (!planta) return res.status(404).json({ message: "Planta não encontrada." });

    const updated = await PlantaRepository.sellPlanta(id, quantidade);
    if (!updated)
      return res.status(400).json({ message: `Estoque insuficiente. Disponível: ${planta.estoque} vaso(s).` });
    return res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao realizar venda." });
  }
};

export const getStockValue = async (_req: Request, res: Response) => {
  try {
    const totals = await PlantaRepository.calculateStockValue();
    return res.status(200).json(totals);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao calcular valor do estoque." });
  }
};

export const readPlantasEsgotadas = async (_req: Request, res: Response) => {
  try {
    const plantas = await PlantaRepository.findPlantasEsgotadas();
    return res.status(200).json(plantas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao listar plantas esgotadas." });
  }
};
