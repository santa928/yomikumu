"use server";
import { readValues, validate, errorReply, accept } from "./server";

export async function reserve(previous, formData) {
  const values = readValues(formData);
  const message = validate(values);
  if (message) return errorReply(previous, values, message);
  return errorReply(previous, values, "受付の処理を書いてください。");
}
