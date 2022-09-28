//importar o express
const express = require("express");
// instanciar as rotas pegando do express
const router = express.Router();

//importar os models
const UserModel = require("../models/User.model");

const bcrypt = require("bcrypt");
const saltRounds = 10; // Define a quantidade de "saltos que serão adicionados a criptografia da senha"

const generateToken = require("../config/jwt.config");
const isAuth = require("../middlewares/isAuth");
const attachCurrentUser = require("../middlewares/attachCurrentUser");
const isAdmin = require("../middlewares/isAdmin");

const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: process.env.SERVICE,
  auth: {
    secure: false,
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

// Sign up -  1º rota: Criar um user (Login com senha)
router.post("/sign-up", async (req, res) => {
  try {
    //capturando o password enviado no corpo da requisicao
    const { password, email } = req.body;

    //checando se a senha existe e se ela passou na RegEx
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
        .json({
          message: "Password does not have the necessary requirements.",
        });
    }

    //gerar o salt com a quantidade de saltos definida(10)
    const salt = await bcrypt.genSalt(saltRounds); //chamar a funcao hash da biblioteca e passar a senha juntamente com o salt criado
    console.log(salt);

    //chamar a função hash da biblioteca e passar a senha juntamente com o salt criado
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(hashedPassword);

    //criar a entrada no banco e dados adicionando a senha hasheada no campo: passwordHash
    const user = await UserModel.create({
      ...req.body,
      passwordHash: hashedPassword,
    });

    //deletar o campo da senha antes de devolver o usuario para a response
    delete user._doc.passwordHash;

    //return res.status(201).json(user);

    //envio de email   <<<===== ADD
    //configurando o email que será enviado!

    const mailOptions = {
      from: "turma85wdft@hotmail.com", // nossa email
      to: email, //email do usuário que se cadastrou
      subject: "Ativação de conta", //assunto
      html: `<p>Clique no link para ativar sua conta:</p>
      <a href=http://localhost:4000/users/activate-account/${newUser._id}>LINK</a>`,
    };

    //Dispara e=mail para o usuario
    await transporter.sendMail(mailOptions);

    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
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
    // console.log(req.currentUser); //criado no middle attachCurrentUser
    const loggedUser = req.currentUser;
    //busca o user que está logado

    if (!loggedUser) {
      return res.status(404).json({ message: " User not found" });
    }
    const user = await UserModel.findById(loggedUser._id);
    //retorna erro quando o usario esta logado

    delete user._doc.passwordHash; //deletar o password e a versao
    delete user._doc._v;

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: " User not found" });
  }
});

//3º rota: Acessar todas as receitas - Usuario Admin
router.get("/all", isAuth, attachCurrentUser, isAdmin, async (req, res) => {
  try {
    const allUsers = await UserModel.find({}, { passwordHash: 0, __v: 0 });
    return res.status(200).json(allUsers);
  } catch (error) {
    console.log(error);
    return res.status(404).json(error);
  }
});

//4º Editar um usuario
router.put("/edit", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const idUser = req.currentUser._id;
    const newName = req.body.name;
    const editedUser = await UserModel.findIdAndUpdate(
      idUser,
      { name: newname },
      { new: true, runValidators: true }
    );

    delete editedUser._doc.passwordHash;
    delete editedUser._doc.__v;

    return res.status(200).json(editedUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//5º Deletar um usuario que tem receita preferida
router.delete("/delete", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const idUser = req.currentUser._id;

    const userLikes = await UserModel.findOne(
      {
        _id: idUser,
      },
      {
        favorites: 1,
      }
    );

    userLikes.favorites.forEach(async (likedRecipe) => {
      await RecipeModel.findByIdAndUpdate(
        likedRecipe,
        {
          $inc: { likes: -1 },
        },
        { new: true }
      );
    });

    const userDislikes = await UserModel.findOne(
      {
        _id: idUser,
      },
      {
        dislikes: 1,
      }
    );

    userDislikes.dislikes.forEach(async (dislikedRecipe) => {
      await RecipeModel.findByIdAndUpdate(
        dislikedRecipe,
        {
          $inc: { dislikes: -1 },
        },
        { new: true }
      );
    });

    const deletedUser = await UserModel.findByIdAndDelete(idUser);

    delete deletedUser._doc.passwordHash;
    delete deletedUser._doc.__v;

    return res.status(200).json(deletedUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//5º Remover um usuario de uma receita na array de favorite

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
