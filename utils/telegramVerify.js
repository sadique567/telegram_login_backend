import crypto from "crypto";

export const verifyTelegramData = (data, botToken) => {
  const secret = crypto
    .createHash("sha256")
    .update(botToken)
    .digest();

  const checkString = Object.keys(data)
    .filter((key) => key !== "hash")
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join("\n");

  const hash = crypto
    .createHmac("sha256", secret)
    .update(checkString)
    .digest("hex");

  return hash === data.hash;
};
