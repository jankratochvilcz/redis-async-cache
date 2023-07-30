import { v4 as uuid } from "uuid";

export const calculate = (key: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const randomNumber = Math.floor(Math.random() * 3) + 1;

    setTimeout(() => {
      if (randomNumber === 3) {
        reject("Request failed");
      } else {
        resolve(`Result for ${key}: ${uuid()}`);
      }
    }, 2000);
  });
}
