const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recipeSchema = new Schema(
  // ### Iteration 1 - Recipe Schema - TODO: write the schema

  {
    title: { type: String, required: true, unique: true },
    level: {
      type: String,
      enum: ["Easy Peasy", "Amateur Chef", "UltraPro Chef"],
    },
    ingredients: [{ type: String }],
    cuisine: { type: String, required: true },
    dishType: {
      type: String,
      enum: [
        "breakfast",
        "main_course",
        "soup",
        "snack",
        "drink",
        "dessert",
        "other",
      ],
    },
    image: {
      type: String,
      default: "https://images.media-allrecipes.com/images/75131.jpg",
    },
    duration: { Type: Number, default: 0 },
    likes: { Type: Number, default: 0 },
    dislikes: { Type: Number, default: 0 },
  },
  { timestamps: true }
);

const Recipe = mongoose.model("Recipe", recipeSchema);

module.exports = Recipe;

// likes: { type: Number, default: 0 },
// dislikes: { type: Number, default: 0 },
