const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/* CAMPOS 
- name: String
- email: String
- favorites: [ObjectsId]
- dislikes: [ObjectsId]
{
*/

const clientSchema = new Schema( // TODO: write the schema
  // TODO: write the schema
  {
    name: { type: String },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
  },
  {
    timestamps: true,
  }
);

const ClientModel = mongoose.model("Client", clientSchema);

module.exports = ClientModel;
