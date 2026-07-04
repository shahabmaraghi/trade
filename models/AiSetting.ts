import mongoose, { Schema, models, model } from "mongoose";

export type AiProvider = "chatgpt" | "gapgpt";

const AiSettingSchema = new Schema(
  {
    key: {
      type: String,
      default: "global",
      unique: true,
    },

    activeProvider: {
      type: String,
      enum: ["chatgpt", "gapgpt"],
      default: "chatgpt",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const AiSetting =
  models.AiSetting || model("AiSetting", AiSettingSchema);

export default AiSetting;