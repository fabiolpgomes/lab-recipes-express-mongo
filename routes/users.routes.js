const express = require("express");
const router = express.Router();

const UserModel = require("../models/User.model");

//1º rota: Criar um user
router.post("/create", async (req, res) => {
  try {
    const newUser = await UserModel.create({ ...req.body });
    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(404).json(error);
  }
});

module.exports = router;

//2º rota: Pegar todos os users
router.get("/all", async (req, res) => {
  try {
    const allUser = await UserModel.find();
    return res.status(200).json(allUser);
  } catch (error) {
    console.log(error);
    return res.status(404).json(error);
  }
});

module.exports = router;

//3º rota: Acessar um usuário pelo seu ID
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params;
        return res.status(200).json(userId);
    } catch (error) {
        console.log(error);
        return res.status(404).json(error);
    }
});
module.exports = router;


//4º Adicionar uma receita na array de favorites


//5º Adicionar uma receita na array de deslikes

//6º Remover uma receita na array de favorite

//7º Remover uma receita na array de deslikes
