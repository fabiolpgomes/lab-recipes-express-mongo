//escreva seu código aqui
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const dbConnection = require("./config/db.config");
dbConnection();

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.REACT_APP_URI }));

//ROTAS
const UsersRoute = require("./routes/users.routes");
app.use("/users", UsersRoute);

const RecipeRoute = require("./routes/recipes.routes");
app.use("/recipes", RecipeRoute);

const RecipesRoute = require("./routes/recipes.routes");



app.listen(Number(process.env.PORT), () => {
  console.log("Server up and running on port", process.env.PORT);
});
