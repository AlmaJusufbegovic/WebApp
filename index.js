const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('./config/db-config');

const sequelize = new Sequelize(dbConfig.DATABASE, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.DIALECT,
    logging: false, 
  });

const app = express();
const PORT = 3000;

  const Korisnik = sequelize.define('Korisnik', {
      id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
      },
      ime: {
          type: DataTypes.STRING,
          allowNull: false,
      },
      prezime: {
          type: DataTypes.STRING,
          allowNull: false,
      },
      username: {
          type: DataTypes.STRING,
          allowNull: false,
      },
      password: {
          type: DataTypes.STRING,
          allowNull: false,
      },
      admin: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
      },
  },
  {
      freezeTableName: true,
      timestamps: false
  });

  const Nekretnina = sequelize.define('Nekretnina', {
      id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
      },
      tip_nekretnine: {
          type: DataTypes.STRING,
          allowNull: false,
      },
      naziv: {
          type: DataTypes.STRING,
          allowNull: false,
      },
      kvadratura: {
          type: DataTypes.INTEGER,
          allowNull: false,
      },
      cijena: {
          type: DataTypes.FLOAT,
          allowNull: false,
      },
      tip_grijanja: {
          type: DataTypes.STRING,
          allowNull: false,
      },
      lokacija: {
          type: DataTypes.STRING,
          allowNull: false,
      },
      godins_izgradnje: {
          type: DataTypes.INTEGER,
          allowNull: false,
      },
      datum_objave: {
          type: DataTypes.DATE,
          allowNull: false,
      },
      opis: {
          type: DataTypes.TEXT,
          allowNull: false,
      },
      klikovi: {
          type: DataTypes.INTEGER,
          defaultValue: 0
      },
      pretrage: {
      type: DataTypes.INTEGER,
      defaultValue: 0
      },
  },
  {
      freezeTableName: true,
      timestamps: false
  });

  const Upit = sequelize.define('Upit', {
      id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
      },
      id_korisnika: {
          type: DataTypes.INTEGER,
          references: {
              model: Korisnik,
              key: 'id',
          },
      },
      id_nekretnine: {
          type: DataTypes.INTEGER,
          references: {
              model: Nekretnina,
              key: 'id',
          },
      },
      tekst: {
          type: DataTypes.TEXT,
          allowNull: false,
      },
  },
  {
      freezeTableName: true,
      timestamps: false
  });

  const Zahtjev = sequelize.define('Zahtjev', {
      id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
      },
      id_korisnika: {
          type: DataTypes.INTEGER,
          references: {
              model: Korisnik,
              key: 'id',
          },
      },
      id_nekretnine: {
          type: DataTypes.INTEGER,
          references: {
              model: Nekretnina,
              key: 'id',
          },
      },
      tekst: {
          type: DataTypes.TEXT,
          allowNull: false,
      },
      trazeniDatum: {
          type: DataTypes.DATE,
          allowNull: false,
      },
      odobren: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
      },
  },
  {
      freezeTableName: true,
      timestamps: false
  });

  const Ponuda = sequelize.define('Ponuda', {
      id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
      },
      id_korisnika: {
          type: DataTypes.INTEGER,
          references: {
              model: Korisnik,
              key: 'id',
          },
      },
      id_nekretnine: {
          type: DataTypes.INTEGER,
          references: {
              model: Nekretnina,
              key: 'id',
          },
      },
      tekst: {
          type: DataTypes.TEXT,
          allowNull: false,
      },
      cijenaPonude: {
          type: DataTypes.FLOAT,
          allowNull: false,
      },
      datumPonude: {
          type: DataTypes.DATE,
          allowNull: false,
      },
      odbijenaPonuda: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
      },
      parentPonudaId: { 
          type: DataTypes.INTEGER,
          references: {
              model: 'Ponuda',
              key: 'id',
          },
          allowNull: true,
      },
  },
  {
      freezeTableName: true,
      timestamps: false
  });

  Nekretnina.hasMany(Upit, { foreignKey: 'id_nekretnine', as: 'Upiti' });
  Upit.belongsTo(Nekretnina, { foreignKey: 'id_nekretnine', as: 'Nekretnina' });

  Nekretnina.hasMany(Zahtjev, { foreignKey: 'id_nekretnine', as: 'zahtjevi' });
  Zahtjev.belongsTo(Nekretnina, { foreignKey: 'id_nekretnine' });

  Nekretnina.hasMany(Ponuda, { foreignKey: 'id_nekretnine', as: 'ponude' });
  Ponuda.belongsTo(Nekretnina, { foreignKey: 'id_nekretnine' });


  Nekretnina.prototype.getInteresovanja = async function () {
      const upiti = await this.getUpiti();
      const zahtjevi = await this.getZahtjevi();
      const ponude = await this.getPonude();
  
      return {
          upiti,
          zahtjevi,
          ponude,
      };
  };

  Korisnik.hasMany(Upit, { foreignKey: 'id_korisnika', as: 'upiti' });
  Upit.belongsTo(Korisnik, { foreignKey: 'id_korisnika' });

  Korisnik.hasMany(Zahtjev, { foreignKey: 'id_korisnika', as: 'zahtjevi' });
  Zahtjev.belongsTo(Korisnik, { foreignKey: 'id_korisnika' });

  Korisnik.hasMany(Ponuda, { foreignKey: 'id_korisnika', as: 'ponude' });
  Ponuda.belongsTo(Korisnik, { foreignKey: 'id_korisnika' });

  Ponuda.hasMany(Ponuda, { foreignKey: 'parentPonudaId', as: 'vezanePonude' });
  Ponuda.belongsTo(Korisnik, { foreignKey: 'parentPonudaId', as: 'parentPonuda' });

  Ponuda.prototype.getVezanePonude = async function () {
      return await this.getVezanePonude(); 
  };

  const LoginLog = sequelize.define('LoginLog', {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING, 
        allowNull: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
      },
    });


const failedAttempts = new Map();
const blockTime = 60 * 1000; 


app.use(session({
  secret: 'tajna sifra',
  resave: true,
  saveUninitialized: true,
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); 

const logAttempt = async (username, status) => {
  try {
    await LoginLog.create({ username, status });
  } catch (error) {
    console.error('Greška prilikom logovanja u bazu:', error);
  }
};

app.get('/', (req, res) => {

  res.redirect('/nekretnine.html');

});

app.post('/register', async (req, res) => {

  const { ime, prezime, username, password } = req.body;

  try {

    // Provjera da li username već postoji
    const existingUser = await Korisnik.findOne({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({
        poruka: "Username već postoji"
      });
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // Kreiranje korisnika
    const noviKorisnik =
      await Korisnik.create({

        ime,
        prezime,
        username,
        password: hashedPassword,
        admin: false

      });

    res.status(200).json({
      poruka: "Registracija uspješna"
    });

  } catch (error) {

    console.error("Greška registracije:", error);

    res.status(500).json({
      greska: "Internal Server Error"
    });

  }
});

app.post('/login', async (req, res) => {

  console.log("LOGIN BODY:", req.body);
  const { username, password } = req.body;
  const currentTime = Date.now();

  try {
    // Inicijalizacija podataka o korisniku u `failedAttempts` ako ne postoji
    if (!failedAttempts.has(username)) {
      failedAttempts.set(username, { attempts: 0, blockedUntil: null });
    }

    const userData = failedAttempts.get(username);

    // Provjera da li je korisnik blokiran
    if (userData.blockedUntil && userData.blockedUntil > currentTime) {
      console.log(`Korisnik ${username} je blokiran.`);
      return res.status(429).json({
        greska: 'Previše neuspješnih pokušaja. Pokušajte ponovo za 1 minut.',
      });
    }

    // Ako je prošlo više od 1 minute, resetujemo blokadu
    if (userData.blockedUntil && userData.blockedUntil <= currentTime) {
      console.log(`Blokada za korisnika ${username} je istekla.`);
      userData.attempts = 0;
      userData.blockedUntil = null;
    }

    // Pronalazak korisnika u bazi
    const korisnik = await Korisnik.findOne({ where: { username } });

    if (!korisnik) {
      console.log(`Korisnik ${username} ne postoji.`);
      userData.attempts += 1;

      if (userData.attempts >= 3) {
        userData.blockedUntil = currentTime + blockTime;
        console.log(`Korisnik ${username} je blokiran zbog previše pokušaja.`);
      }

      failedAttempts.set(username, userData);
      await logAttempt(username, 'neuspješno');
      return res.status(400).json({ poruka: 'Neuspješna prijava' });
    }

    // Provjera lozinke
    const isPasswordMatched = await bcrypt.compare(password, korisnik.password);
    if (isPasswordMatched) {
      console.log(`Korisnik ${username} se uspješno prijavio.`);
      req.session.username = korisnik.username;

      // Reset pokušaja i blokade
      failedAttempts.delete(username);
      await logAttempt(username, 'uspješno');
      return res.json({ poruka: 'Uspješna prijava' });
    } else {
      console.log(`Pogrešna lozinka za korisnika ${username}.`);
      userData.attempts += 1;

      if (userData.attempts >= 3) {
        userData.blockedUntil = currentTime + blockTime;
        console.log(`Korisnik ${username} je blokiran zbog previše pokušaja.`);
      }

      failedAttempts.set(username, userData);
      await logAttempt(username, 'neuspješno');
      return res.status(400).json({ poruka: 'Neuspješna prijava' });
    }
  } catch (error) {
    console.error('Greška prilikom prijave:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).json({ greska: 'Internal Server Error' });
    }

    res.clearCookie('connect.sid');
    return res.status(200).json({ poruka: 'Uspješno ste se odjavili' });
  });
});

app.get('/korisnik', async (req, res) => {

  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  try {

    const korisnik = await Korisnik.findOne({
      where: { username: req.session.username }
    });

    if (!korisnik) {
      return res.status(404).json({ greska: 'Korisnik nije pronađen' });
    }

    res.status(200).json({
      id: korisnik.id,
      ime: korisnik.ime,
      prezime: korisnik.prezime,
      username: korisnik.username
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ greska: 'Internal Server Error' });

  }

});

/*
Shows the location of 5 recently added properties on given location
*/

app.get('/nekretnine/top5', async (req, res) => {
  const lokacija = req.query.lokacija;

  if (!lokacija) {
    return res.status(403).json({ error: 'Lokacija nije zadana' });
  }

  try {
    // Dohvaćanje nekretnina iz baze podataka na osnovu zadane lokacije
    const filtriraneNekretnine = await Nekretnina.findAll({
      where: { lokacija },
      order: [['datum_objave', 'DESC']], // Sortiranje po datumu objave silazno
      limit: 5, // Ograničenje na top 5 rezultata
    });

    if (filtriraneNekretnine.length === 0) {
      return res.status(404).json({ error: 'Lokacija ne postoji u sistemu' });
    }

    // Vraćanje rezultata
    res.status(200).json(filtriraneNekretnine);
  } catch (error) {
    console.error('Greška prilikom dohvaćanja nekretnina:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});


/*
Allows logged user to make a request for a property
*/
app.post('/upit', async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  const { id_nekretnine, tekst_upita } = req.body;

  if (!id_nekretnine || !tekst_upita) {
    return res.status(400).json({ greska: 'Nedostaju podaci za upit' });
  }

  try {
    const loggedInUser = await Korisnik.findOne({
      where: { username: req.session.username },
    });

    if (!loggedInUser) {
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    const nekretnina = await Nekretnina.findByPk(id_nekretnine);

    if (!nekretnina) {
      return res.status(400).json({ greska: `Nekretnina sa id-em ${id_nekretnine} ne postoji` });
    }

    const brojUpita = await Upit.count({
      where: {
        id_korisnika: loggedInUser.id,
        id_nekretnine: id_nekretnine,
      },
    });

    if (brojUpita >= 3) {
      return res.status(429).json({ greska: 'Previše upita za istu nekretninu.' });
    }

    await Upit.create({
      id_korisnika: loggedInUser.id,
      id_nekretnine: id_nekretnine,
      tekst_upita: tekst_upita,
    });

    res.status(200).json({ poruka: 'Upit je uspješno dodan' });
  } catch (error) {
    console.error('Greška prilikom obrade upita:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});



app.get('/upiti/moji', async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  try {
    const loggedInUser = await Korisnik.findOne({ where: { username: req.session.username } });

    if (!loggedInUser) {
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    const upitiKorisnika = await Upit.findAll({
      where: { id_korisnika: loggedInUser.id },
      include: [
        {
          model: Nekretnina,
          attributes: ['id'] 
        }
      ]
    });

    // Mapiranje rezultata u željeni format
    const rezultat = upitiKorisnika.map((upit) => ({
      id_nekretnine: upit.Nekretnina.id,
      tekst: upit.tekst
    }));

    // Ako nema upita, vratiti prazan niz
    if (rezultat.length === 0) {
      return res.status(404).json([]);
    }

    // Vraćanje rezultata
    res.status(200).json(rezultat);
  } catch (error) {
    console.error('Greška pri dohvaćanju upita:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});


app.put('/korisnik', async (req, res) => {

  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  const { ime, prezime, username, password } = req.body;

  try {

    const korisnik = await Korisnik.findOne({
      where: { username: req.session.username }
    });

    if (!korisnik) {
      return res.status(404).json({ greska: 'Korisnik nije pronađen' });
    }

    if (ime) korisnik.ime = ime;
    if (prezime) korisnik.prezime = prezime;
    if (username) korisnik.username = username;

    if (password) {

      const hashedPassword = await bcrypt.hash(password, 10);
      korisnik.password = hashedPassword;

    }

    await korisnik.save();

    res.status(200).json({
      poruka: 'Podaci uspješno ažurirani'
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ greska: 'Internal Server Error' });

  }

});

/*
Returns all properties from database.
*/
app.get('/nekretnine', async (req, res) => {
  try {
    const nekretnine = await Nekretnina.findAll();
    res.status(200).json(nekretnine);
  } catch (error) {
    console.error('Greška pri dohvaćanju podataka o nekretninama:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});


app.get('/nekretnine/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10); 

  if (!id) {
    return res.status(403).json({ error: 'ID nije prepoznat u sistemu' });
  }

  try {
    const nekretnina = await Nekretnina.findByPk(id, {
      include: {
        model: Upit, 
        as: 'Upiti', // Dodajte alias ovde
        attributes: ['tekst'],
        limit: 3, 
      }
    });

    if (!nekretnina) {
      return res.status(404).json({ error: 'Nekretnina ne postoji u sistemu' });
    }

    const rezultat = {
      id: nekretnina.id,
      naziv: nekretnina.naziv,
      opis: nekretnina.opis,
      lokacija: nekretnina.lokacija,
      cijena: nekretnina.cijena,
      najnovijiUpiti: nekretnina.Upiti // Obavezno koristite alias ovde
    };

    res.status(200).json(rezultat);

  } catch (error) {
    console.error('Greška pri dohvaćanju podataka o nekretnini:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/next/upiti/nekretnina/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10); // Dohvaćanje ID-a nekretnine
  const page = parseInt(req.query.page, 10); // Dohvaćanje broja stranice iz query parametara

  if (isNaN(id) || isNaN(page) || page < 1) {
    return res.status(400).json({ greska: 'Neispravan ID ili broj stranice' });
  }

  try {
    const nekretnina = await Nekretnina.findByPk(id, {
      include: {
        model: Upit,
        as: 'Upiti', 
        attributes: ['id_korisnika', 'tekst'],
      }
    });

    if (!nekretnina) {
      return res.status(404).json({ greska: `Nekretnina sa ID-em ${id} ne postoji` });
    }

    const pageSize = 3;
    const startIndex = (page - 1) * pageSize;

    const upitiZaStranicu = nekretnina.Upiti.slice(startIndex, startIndex + pageSize);

    if (upitiZaStranicu.length < 3) {
      return res.status(404).json([]);
    }

    const rezultat = upitiZaStranicu.map(({ id_korisnika, tekst }) => ({
      id_korisnika,
      tekst
    }));

    res.status(200).json(rezultat);
  } catch (error) {
    console.error('Greška pri dohvaćanju upita:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/nekretnina/:id/interesovanja', async (req, res) => {
  const nekretninaId = parseInt(req.params.id, 10);
  const korisnikId = req.user ? req.user.id : null;  
  const isAdmin = req.user && req.user.admin == true; 

  if (!nekretninaId) {
    return res.status(400).json({ error: 'ID nekretnine nije validan' });
  }

  try {
    const interesovanja = await Promise.all([
      Upit.findAll({
        where: { id_nekretnine: nekretninaId },
        include: [{ model: Korisnik, attributes: ['id', 'ime', 'prezime'] }]
      }),
      Ponuda.findAll({
        where: { id_nekretnine: nekretninaId },
        include: [{ model: Korisnik, attributes: ['id', 'ime', 'prezime'] }]
      }),
      Zahtjev.findAll({
        where: { id_nekretnine: nekretninaId },
        include: [{ model: Korisnik, attributes: ['id', 'ime', 'prezime'] }]
      })
    ]);

    const svePonude = [
      ...interesovanja[0], // Upiti
      ...interesovanja[1], // Ponude
      ...interesovanja[2]  // Zahtjevi
    ];

    if (!svePonude || svePonude.length === 0) {
      return res.status(404).json({ error: 'Nema interesovanja za ovu nekretninu' });
    }


    const rezultat = svePonude.map(interesovanje => {
      const interesovanjeData = interesovanje.toJSON();

      if (!isAdmin) {
        if (korisnikId !== interesovanjeData.id_korisnika && interesovanjeData.id_korisnika !== korisnikId) {
          delete interesovanjeData.cijena;
        }
      }

      interesovanjeData.tipInteresovanja = interesovanje.constructor.name; 

      return interesovanjeData;
    });

    res.status(200).json(rezultat);

  } catch (error) {
    console.error('Greška pri dohvaćanju interesovanja:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/nekretnina/:id/ponuda', async (req, res) => {
  const nekretninaId = parseInt(req.params.id, 10);
  const { tekst, cijenaPonude, datumPonude, idVezanePonude, odbijenaPonuda } = req.body;
  const korisnikId = req.user ? req.user.id : null; 
  const isAdmin = req.user && req.user.admin == true; 

  if (!tekst || !cijenaPonude || !datumPonude) {
    return res.status(400).json({ error: 'Svi obavezni podaci (tekst, cijenaPonude, datumPonude) moraju biti prisutni' });
  }

  try {
    if (idVezanePonude) {
      const vezanaPonuda = await Ponuda.findByPk(parentPonudaId);
      if (!vezanaPonuda) {
        return res.status(404).json({ error: 'Vezana ponuda nije pronađena' });
      }

      if (vezanaPonuda.odbijenaPonuda) {
        return res.status(400).json({ error: 'Nema više novih ponuda za ovu odbijenu ponudu' });
      }

      if (!isAdmin && vezanaPonuda.id_korisnika !== korisnikId) {
        return res.status(403).json({ error: 'Nemate pravo da odgovorite na ovu ponudu' });
      }
    }

    if (odbijenaPonuda) {
      const odbijenePonude = await Ponuda.findAll({
        where: { id_nekretnine: nekretninaId, odbijena: true }
      });

      if (odbijenePonude.length > 0) {
        return res.status(400).json({ error: 'Ponude ne mogu biti dodane kada je već neka odbijena' });
      }
    }

    const novaPonuda = await Ponuda.create({
      id_korisnika: korisnikId,
      id_nekretnine: nekretninaId,
      tekst,
      cijenaPonude,
      datumPonude,
      odbijenaPonuda,
      parentPonudaId: idVezanePonude || null
    });

    res.status(201).json(novaPonuda);
  } catch (error) {
    console.error('Greška pri kreiranju ponude:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/nekretnina/:id/zahtjev', async (req, res) => {
  const nekretninaId = parseInt(req.params.id, 10);
  const { tekst, trazeniDatum } = req.body;
  const korisnikId = req.user ? req.user.id : null; 

  if (!tekst || !trazeniDatum) {
    return res.status(400).json({ error: 'Svi obavezni podaci (tekst, trazeniDatum) moraju biti prisutni' });
  }

  const currentDate = new Date();
  const requestedDate = new Date(trazeniDatum);
  if (requestedDate < currentDate) {
    return res.status(400).json({ error: 'Trazeni datum ne može biti raniji od trenutnog datuma' });
  }

  try {
    const nekretnina = await Nekretnina.findByPk(nekretninaId);
    if (!nekretnina) {
      return res.status(404).json({ error: 'Nekretnina sa zadatim ID-em ne postoji' });
    }

    const noviZahtjev = await Zahtjev.create({
      id_korisnika: korisnikId,
      id_nekretnine: nekretninaId,
      tekst,
      trazeniDatum
    });

    res.status(201).json(noviZahtjev);
  } catch (error) {
    console.error('Greška pri kreiranju zahtjeva:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/nekretnina/:id/zahtjev/:zid', async (req, res) => {
  const nekretninaId = parseInt(req.params.id, 10);
  const zahtjevId = parseInt(req.params.zid, 10);
  const { odobren, addToTekst } = req.body;
  const korisnikId = req.user ? req.user.id : null; 

  if (!req.user || !req.user.admin == true) {
    return res.status(403).json({ error: 'Samo admin može odgovoriti na zahtjev' });
  }

  if (odobren === undefined) {
    return res.status(400).json({ error: 'Parametar "odobren" je obavezan' });
  }

  if (odobren === false && !addToTekst) {
    return res.status(400).json({ error: 'Parametar "addToTekst" je obavezan kada je "odobren" false' });
  }

  try {
    const nekretnina = await Nekretnina.findByPk(nekretninaId);
    if (!nekretnina) {
      return res.status(404).json({ error: 'Nekretnina sa zadatim ID-em ne postoji' });
    }

    const zahtjev = await Zahtjev.findByPk(zahtjevId);
    if (!zahtjev) {
      return res.status(404).json({ error: 'Zahtjev sa zadatim ID-em ne postoji' });
    }

    let updatedTekst = zahtjev.tekst;
    if (addToTekst) {
      updatedTekst += ` ODGOVOR ADMINA: ${addToTekst}`;
    }

    await zahtjev.update({
      odobren,
      tekst: updatedTekst,
    });

    res.status(200).json({ message: 'Zahtjev uspješno ažuriran', zahtjev });
  } catch (error) {
    console.error('Greška pri ažuriranju zahtjeva:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



/* ----------------- MARKETING ROUTES ----------------- */

app.post('/marketing/nekretnine', async (req, res) => {

  const { nizNekretnina } = req.body;

  try {
    for (const id of nizNekretnina) {
      const nekretnina = await Nekretnina.findByPk(id);
      if (nekretnina) {
        nekretnina.pregledi += 1;
        await nekretnina.save();
      }
    }

    res.status(200).json({});

  } catch (error) {

    console.error(error);
    res.status(500).json({
      error: 'Internal Server Error'
    });
  }
});

app.post('/marketing/nekretnina/:id', async (req, res) => {

  const { id } = req.params;

  try {

    const nekretnina = await Nekretnina.findByPk(id);

    if (!nekretnina) {
      return res.status(404).json({
        error: 'Nekretnina nije pronađena'
      });
    }

    nekretnina.klikovi += 1;

    await nekretnina.save();

    res.status(200).json({
      klikovi: nekretnina.klikovi
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({
      error: 'Internal Server Error'
    });

  }

});

app.post('/marketing/osvjezi/pretrage', async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };
  try {
    const promjene = await Promise.all(
      nizNekretnina.map(async (id) => {
        const n = await Nekretnina.findByPk(id, { attributes: ['id', 'pretrage'] });
        return { id, pretrage: n ? n.pretrage : 0 };
      })
    );
    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error('Greška:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/osvjezi/klikovi', async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };
  try {
    const promjene = await Promise.all(
      nizNekretnina.map(async (id) => {
        const n = await Nekretnina.findByPk(id, { attributes: ['id', 'klikovi'] });
        return { id, klikovi: n ? n.klikovi : 0 };
      })
    );
    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error('Greška:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const connectWithRetry = async (retries = 3, delay = 3000) => {
  for (let i = 1; i <= retries; i++) {
    try {
      await sequelize.authenticate();
      console.log('Povezivanje s bazom uspješno.');

      await sequelize.sync({ alter: true });
      console.log('Modeli su sinhronizovani s bazom.');

      app.use(express.static('HTML'));
      app.use('/Scripts', express.static('Scripts'));
      app.use('/Style', express.static('Style'));
      app.use('/Resources', express.static('Resources'));
      
      app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
      return; 
    } catch (error) {
      console.error(`Pokušaj ${i}/${retries} neuspješan:`, error.message);
      if (i < retries) {
        console.log(`Čekanje ${delay / 1000}s prije ponovnog pokušaja...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        console.error('Sve veze s bazom su neuspješne. Server se gasi.');
        process.exit(1);
      }
    }
  }
};

connectWithRetry();

module.exports = {
  sequelize,
  models: {
    Korisnik,
    Nekretnina,
    Upit,
    Zahtjev,
    Ponuda
  }
};
