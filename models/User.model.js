const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/* CAMPOS 
- name: String, required
- email: String, required, unique e com verificação de email
- favorites: [ObjectsId]
- dislikes: [ObjectsId]
*/

const clientSchema = new Schema(
  {
    // TODO: write the schema
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/gm,
    },
    passwordHash: { type: String, required: true },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
    role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
    emailConfirm: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ClientModel = mongoose.model("Client", clientSchema);

module.exports = ClientModel;
