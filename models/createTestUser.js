const bcrypt = require('bcrypt');
const { models } = require('../index'); 

const createUser = async () => {
  try {

    const hash = await bcrypt.hash("test123", 10);

    const user = await models.Korisnik.create({
      ime: "Mimi",
      prezime: "Mimi",
      username: "Mimi",
      password: hash,
      admin: false
    });

    console.log("Korisnik kreiran:", user.username);

  } catch (err) {
    console.error(err);
  }
};

createUser();