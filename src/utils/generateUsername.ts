import { randomUUID } from "crypto";

export const generateUsername = (name: string) => {
  const username = name.replace(/ /g, "_").toLowerCase();
  return `${username}_${randomUUID().slice(0, 8)}`;
};
