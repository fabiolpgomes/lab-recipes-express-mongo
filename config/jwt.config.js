// importar a biblioteca que vai gerar o token
const jwt = require("jsonwebtoken");

//quando essa funcao for chamada, ela recebera como parametro o user que vier do banco de dados
function generateToken(user) {
  //escolher quais campos vamos deixar incriptado no token
  const { _id, email, role } = user;

  // a signature é a chave secreta que vai decodificar o token
  const signature = process.env.TOKEN_SIGN_SECRET;

  //determinar o tempo de validade do token
  const expiration = "12h";

  return jwt.sign({ _id, email, role }, signature, {
    expiresIn: expiration,
  });
}

module.exports = generateToken;

//a função retorna a função sign da biblioteca jwt
// essa função recebe 3 parâmetros
//1º um objeto com todas informções que queremos guardar no token
//2º a signature com a chave secreta do token
//3º um objeto de configuração para expiração do token

//exportar a funcao de geracao de token
