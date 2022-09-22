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

module.exports = router;

//2º rota: Acessar todas as receitas
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

module.exports = router;

//3º rota: Acessar uma única receita pelo seu ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    //const oneAluno = await AlunoModel.find({ _id: id });
    const recipe = await RecipeModel.findById(id);

    return res.status(200).json(recipe);
  } catch (error) {
    return res.status(400).json(error);
  }
});
module.exports = router;

//4º rota: Criar várias receitas de uma só vez

//6º rota: Acessar todos os usuários que favoritaram essa receita

//7º rota: Acessar todos os usuários que deram dislike essa receita

//!5º rota: Deletar uma receita pelo seu ID - retira-la da array de favorites e dislikes dos USERS

//Não se esqueça de exportar o router!
