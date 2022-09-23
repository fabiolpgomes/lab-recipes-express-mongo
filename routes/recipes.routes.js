//Escreva suas rotas para as receitas aqui//
const express = require("express");
const router = express.Router();
//Importe o express e instancie o Router aqui

// Importe os models aqui
const RecipeModel = require("../models/Recipe.model");
const UserModel = require("../models/User.model");

//1º rota: Criar uma receita   Iteration 2 - Create a recipe
router.post("/create", async (req, res) => {
  //rota> localhost:4000/recipes/create
  try {
    const newRecipe = await RecipeModel.create({ ...req.body });
    return res.status(200).json(newRecipe);
  } catch (error) {
    console.log(error);
    return res.status(404).json(error);
  }
});

//2º rota: Acessar todas as receitas - All recipes
router.get("/all", async (req, res) => {
  try {
    const recipe = await RecipeModel.find();
    return res.status(200).json(recipe);
  } catch (error) {
    return res.status(400).json(error);
  }
});

//3º rota: Acessar uma única receita pelo seu ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const recipe = await RecipeModel.findById(id);
    return res.status(200).json(recipe);
  } catch (error) {
    return res.status(400).json(error);
  }
});

//4º rota: Criar várias receitas de uma só vez
router.post("/create/allrecipes", async (req, res) => {
  //rota> localhost:4000/recipes/create
  try {
    const newRecipe = await RecipeModel.insertMany([...req.body]);
    return res.status(201).json(newRecipe);
  } catch (error) {
    console.log(error);
    return res.status(404).json(error);
  }
});

//6º rota: Acessar todos os usuários que favoritaram essa receita
router.get("/favoriteusers/:idRecipe", async (req, res) => {
  try {
    const { idRecipe } = req.params;
    const favoriteUsers = await UserModel.find({ favorites: idRecipe });
    return res.status(200).json({ favoriteUsers });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
});

//7º rota: Acessar todos os usuários que deram dislike essa receita
router.get("/dislikesusers/:id", async (req, res) => {
  try {
    const { idRecipe } = req.params;
    const desfavoriteusers = await UserModel.find({ dislikes: idRecipe });
    return res.status(200).json({ desfavoriteusers });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
});

//!5º rota: Deletar uma receita pelo seu ID - retira-la da array de favorites e dislikes dos USERS
router.delete("/recepie/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteRecipe = await RecipeModel.findByIdAndDelete(id);
    await UserModel.updateMany({ favorites: id }, { $pull: { favorites: id } });
    await UserModel.updateMany({ dislikes: id }, { $pull: { dislikes: id } });
    return res.status(200).json(deleteRecipe);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//Não se esqueça de exportar o router!
module.exports = router;

// Incluir 2 campos Likes e Dislikes no models Recipe.model.js
