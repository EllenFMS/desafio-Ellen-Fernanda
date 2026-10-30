import express from "express";
import * as UserController from "@controllers/UserController";
import * as PlantaController from "@controllers/PlantaController";

const routes = express.Router();

routes.get("/", (_req, res) => {
  res.status(200).json({ message: "API do treinamento de CRUD do CITi 🚀" });
});

// CRUD de usuários já fornecido no repositório.
routes.post("/users", UserController.createUser);
routes.get("/users", UserController.readAllUsers);
routes.get("/users/:id", UserController.readUserById);
routes.patch("/users/:id", UserController.updateUser);
routes.delete("/users/:id", UserController.deleteUser);

// Rotas fixas antes de /plantas/:id para evitar conflito de correspondência.
routes.get("/plantas/estoque/valor-total", PlantaController.getStockValue);
routes.get("/plantas/esgotadas", PlantaController.readPlantasEsgotadas);

routes.post("/plantas", PlantaController.createPlanta);
routes.get("/plantas", PlantaController.readAllPlantas);
routes.get("/plantas/:id", PlantaController.readPlantaById);
routes.patch("/plantas/:id", PlantaController.updatePlanta);
routes.delete("/plantas/:id", PlantaController.deletePlanta);
routes.post("/plantas/:id/venda", PlantaController.sellPlanta);

export default routes;
