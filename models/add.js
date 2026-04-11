const { models } = require('../index'); 

const bcrypt = require('bcrypt');

const addTestUser = async () => {
  try {
    const hash = await bcrypt.hash("test123", 10);

    await models.Korisnik.create({
      ime: 'Test',
      prezime: 'User',
      username: 'test',
      password: hash,
      admin: false
    });

    console.log("Test user uspješno dodan");
  } catch (err) {
    console.error(err);
  }
};

addTestUser();
