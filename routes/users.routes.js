//importar o express
const express = require("express");
// instanciar as rotas pegando do express
const router = express.Router();

const bcrypt = require("bcrypt");
const saltRounds = 10; // Define a quantidade de "saltos que serão adicionados a criptografia da senha"

//importar os models
const UserModel = require("../models/User.model");

const generateToken = require("../config/jwt.config");
const isAuth = require("../middlewares/isAuth");
const attachCurrentUser = require("../middlewares/attachCurrentUser");

// Sign up -  1º rota: Criar um user
router.post("/sign-up", async (req, res) => {
  try {
    //capturando o password enviado no corpo da requisicao
    const { password } = req.body;

    if (
      //checando se existe esse campo o req.body
      !password ||
      !password.match(
        //checando se a senha tem os pré requisitos de segurança
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{8,}$/
      )
    ) {
      return res
        .status(400)
        .json({ message: "Senha nâo tem os requisitos necessários." });
    }

    //gerar o salt com a quantidade de saltos definida(10)
    const salt = await bcrypt.genSalt(saltRounds); //chamar a funcao hash da biblioteca e passar a senha juntamente com o salt criado

    //chamar a função hash da biblioteca e passar a senha juntamente com o salt criado
    const hashedPassword = await bcrypt.hash(password, salt);

    //criar a entrada no banco e dados adicionando a senha hasheada no campo: passwordHash
    const user = await UserModel.create({
      ...req.body,
      passwordHash: hashedPassword,
    });

    //deletar o campo da senha antes de devolver o usuario para a response
    delete user._doc.passwordHash;

    return res.status(201).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

/*
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
*/

// LOGIN
router.post("/login", async (req, res) => {
  try {
    //capturar as chaves de email e password enviadas no corpo da requisicao
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please, inform email and password! " });
    }
    // achar o user que esta tentando logar
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found it on the system" });
    }

    //checar se o usuario existe
    if (await bcrypt.compare(password, user.passwordHash)) {
      //caso positivo, apagar o passwordHash do user para nao devolver essa informacao
      delete user._doc.passwordHash;

      // gerar o token com as informacoes do usuario
      const token = generateToken(user);

      // retornar um objeto com as informacoes do user e o token
      return res.status(200).json({
        user: user,
        token: token,
      });
    } else {
      //se a comparacao da password e do passwordHash nao forem compativeis, retornar o erro com a mensagem
      return res
        .status(400)
        .json({ message: "Email and/or password not correct" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get("/profile", isAuth, attachCurrentUser, async (req, res) => {
  try {
    console.log(req.currentUser); //criado no middle attachCurrentUser

    return res.status(200).json(req.currentUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//3º rota: Acessar um usuário pelo seu ID
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params;
    return res.status(200).json(userId);
  } catch (error) {
    console.log(error);
    return res.status(404).json(error);
  }
});

//4º Adicionar uma receita na array de favorites
router.put("/addFavorite/:idUser/:idRecipe", async (req, res) => {
  const { idUser, idRecipe } = req.params;

  //conferir se a receita já não foi adicionada
  const user = await UserModel.findById(idUser);
  if (user.favorites.includes(idRecipe)) {
    return res.status(400).json("receita já adicionada");
  }

  const userUpdate = await UserModel.findByIdAndUpdate(
    idUser,
    {
      $push: {
        favorites: idRecipe,
      },
    },
    { new: true }
  ).populate("favorites");

  await RecipeModel.findByIdAndUpdate(idRecipe, { $inc: { likes: 1 } });

  return res.status(200).json(userUpdate);
});

//5º Adicionar uma receita na array de deslikes
router.put("/addDislike/:idUser/:idRecipe", async (req, res) => {
  const { idUser, idRecipe } = req.params;

  const userUpdate = await UserModel.findByIdAndUpdate(
    idUser,
    {
      $push: {
        dislikes: idRecipe,
      },
    },
    { new: true }
  ).populate("dislikes");

  await RecipeModel.findByIdAndUpdate(idRecipe, { $inc: { dislikes: 1 } });

  return res.status(200).json(userUpdate);
});

//6º Remover uma receita na array de favorite

router.put("/removeFavorite/:idUser/:idRecipe", async (req, res) => {
  const { idUser, idRecipe } = req.params;

  const userUpdate = await UserModel.findByIdAndUpdate(
    idUser,
    {
      $pull: {
        favorites: idRecipe,
      },
    },
    { new: true }
  ).populate("favorites");

  await RecipeModel.findByIdAndUpdate(idRecipe, { $inc: { likes: -1 } });

  return res.status(200).json(userUpdate);
});

//7º Remover uma receita na array de deslikes
router.put("/removeDislike/:idUser/:idRecipe", async (req, res) => {
  const { idUser, idRecipe } = req.params;

  const userUpdate = await UserModel.findByIdAndUpdate(
    idUser,
    {
      $pull: {
        dislikes: idRecipe,
      },
    },
    { new: true }
  ).populate("dislikes");

  await RecipeModel.findByIdAndUpdate(idRecipe, { $inc: { dislikes: -1 } });

  return res.status(200).json(userUpdate);
});

module.exports = router;
