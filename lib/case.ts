"use server";

import * as shevchenko from "shevchenko";

export async function toGenitive(fullname: string) {
  const lastName = fullname.split(" ")[0];
  const firstName = fullname.split(" ")[1];
  const middleName = fullname.split(" ")[2];

  const anthroponym = {
    familyName: lastName,
    givenName: firstName,
    patronymicName: middleName,
  };

  const gender = await shevchenko.detectGender(anthroponym);

  if (!gender) throw new Error("Failed to detect gender");

  const res = await shevchenko.inGenitive({
    gender,
    ...anthroponym,
  });

  return res.familyName + " " + res.givenName + " " + res.patronymicName;
}
