function intitials(fullname: string) {
  const firstName = fullname.split(" ")[1];
  const middleName = fullname.split(" ")[2];

  return firstName[0] + "." + middleName[0] + ".";
}

export { intitials };
