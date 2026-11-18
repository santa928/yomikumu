"use server";
import { readValues, validate, errorReply, accept } from "./server";
import { validateRegistration } from "./rules";
import { retain } from "./retry";

export async function submitForm(practice, previous, formData) {
  const values = readValues(formData);
  const message = (practice === "validation" ? validateRegistration : validate)(values);
  if (message) {
    const draft = practice === "retention" ? retain(values) : values;
    return errorReply(previous, draft, message);
  }
  return accept(previous, values, formData.get("ticket"));
}
