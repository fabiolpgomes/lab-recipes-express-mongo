const UserModel = require("../models/User.model");

async function attachCurrentUser(req, res, next) {
  try {
    //pegar as informacoes que foram disponibilizados no middleware isAuth
    const loggedInUser = req.auth;

    //achar o ususário pelo _id do loggedInUser
    const user = await UserModel.findOne(
      { _id: loggedInUser._id }, //nao adicionar o campo da senha hasheada
      { passwordHash: 0 }
    );

    //condicao para checar se o ususario foi achado
    if (!user) {
      return res.status(400).json({ message: "This user does not exist." });
    }

    //Criar o campo currentUser e adicionar o user achado no banco de dados
    req.currentUser = user;

    //funcao que faz seguir para o próximo passo da requisicao
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

module.exports = attachCurrentUser;
