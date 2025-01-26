const express = require('express');
const session = require("express-session");
const path = require('path');
const fs = require('fs').promises; // Using asynchronus API for file read and write
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

const failedAttempts = new Map();
const blockTime= 60*1000;

app.use(session({
  secret: 'tajna sifra',
  resave: true,
  saveUninitialized: true
}));

app.use(express.static(__dirname + '/public'));

// Enable JSON parsing without body-parser
app.use(express.json());

/* ---------------- SERVING HTML -------------------- */

// Async function for serving html files
async function serveHTMLFile(req, res, fileName) {
  const htmlPath = path.join(__dirname, 'public/html', fileName);
  try {
    const content = await fs.readFile(htmlPath, 'utf-8');
    res.send(content);
  } catch (error) {
    console.error('Error serving HTML file:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
}

// Array of HTML files and their routes
const routes = [
  { route: '/nekretnine.html', file: 'nekretnine.html' },
  { route: '/detalji.html', file: 'detalji.html' },
  { route: '/meni.html', file: 'meni.html' },
  { route: '/prijava.html', file: 'prijava.html' },
  { route: '/profil.html', file: 'profil.html' },
  // Practical for adding more .html files as the project grows
];

// Loop through the array so HTML can be served
routes.forEach(({ route, file }) => {
  app.get(route, async (req, res) => {
    await serveHTMLFile(req, res, file);
  });
});

/* ----------- SERVING OTHER ROUTES --------------- */

// Async function for reading json data from data folder 
async function readJsonFile(filename) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    const rawdata = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(rawdata);
  } catch (error) {
    throw error;
  }
}

// Async function for reading json data from data folder 
async function saveJsonFile(filename, data) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    throw error;
  }
}

/*
Checks if the user exists and if the password is correct based on korisnici.json data. 
If the data is correct, the username is saved in the session and a success message is sent.
*/

const logAttempt = (username, status) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] - username: "${username}" - status: "${status}"\n`;

  fs.appendFile(path.join(__dirname, 'prijave.txt'), logEntry, (err) => {
    if (err) {
      console.error('Greška prilikom logovanja:', err);
    }
  });
};

app.post('/login', async (req, res) => {
  const jsonObj = req.body;
  const currentTime = Date.now();

  try {
    if (failedAttempts.has(jsonObj.username)) {
      const userData = failedAttempts.get(jsonObj.username);

      if (userData.blockedUntil && userData.blockedUntil > currentTime) {
        return res.status(429).json({
          greska: 'Previse neuspješnih pokušaja. Pokušajte ponovo za 1 minutu.',
        });
      }

      if (userData.blockedUntil && userData.blockedUntil <= currentTime) {
        failedAttempts.set(jsonObj.username, { attempts: 0, blockedUntil: null });
      }
    }

    const data = await fs.readFile(path.join(__dirname, 'data', 'korisnici.json'), 'utf-8');
    const korisnici = JSON.parse(data);

    let found = false;

    for (const korisnik of korisnici) {
      if (korisnik.username === jsonObj.username) {
        const isPasswordMatched = await bcrypt.compare(jsonObj.password, korisnik.password);
        if (isPasswordMatched) {
          req.session.username = korisnik.username;
          found = true;

          failedAttempts.delete(jsonObj.username);
          break;
        }
      }
    }

    if (found) {
      logAttempt(jsonObj.username, 'uspješno');
      return res.json({ poruka: 'Uspješna prijava' });
    } else {
      if (!failedAttempts.has(jsonObj.username)) {
        failedAttempts.set(jsonObj.username, { attempts: 1, blockedUntil: null });
      } else {
        const userData = failedAttempts.get(jsonObj.username);
        userData.attempts += 1;

        if (userData.attempts >= 3) {
          userData.blockedUntil = currentTime + blockTime;
          failedAttempts.set(jsonObj.username, userData);
          logAttempt(jsonObj.username, 'neuspješno');
          return res.status(429).json({
            greska: 'Previse neuspješnih pokušaja. Pokušajte ponovo za 1 minutu.',
          });
        }

        failedAttempts.set(jsonObj.username, userData);
      }

      logAttempt(jsonObj.username, 'neuspješno');
      return res.status(400).json({ poruka: 'Neuspješna prijava' });
    }

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/*
Delete everything from the session.
*/
app.post('/logout', (req, res) => {
  // Check if the user is authenticated
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Clear all information from the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      res.status(500).json({ greska: 'Internal Server Error' });
    } else {
      res.status(200).json({ poruka: 'Uspješno ste se odjavili' });
    }
  });
});

/*
Returns currently logged user data. First takes the username from the session and grabs other data
from the .json file.
*/
app.get('/korisnik', async (req, res) => {
  // Check if the username is present in the session
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // User is logged in, fetch additional user data
  const username = req.session.username;

  try {
    // Read user data from the JSON file
    const users = await readJsonFile('korisnici');

    // Find the user by username
    const user = users.find((u) => u.username === username);

    if (!user) {
      // User not found (should not happen if users are correctly managed)
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    // Send user data
    const userData = {
      id: user.id,
      ime: user.ime,
      prezime: user.prezime,
      username: user.username,
      password: user.password // Should exclude the password for security reasons
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/*
Shows the location of 5 recently added properties on given location
*/
app.get('/nekretnine/top5', async (req, res) => {
  const lokacija = req.query.lokacija;

  if(!lokacija){
    return res.status(403).json({error: 'Lokacija nije zadana'});
  }


  try {
    const nekretnineData = await readJsonFile('nekretnine');

    const filtriraneNekretnine = nekretnineData.filter(
      (nekretnina) => nekretnina.lokacija === lokacija
    );

    if (filtriraneNekretnine.length === 0) {
      return res.status(404).json({ error: 'Lokacija ne postoji u sistemu' });
    }

    filtriraneNekretnine.sort(
      (a,b)=> new Date (b.datum_objave) - new Date(a.datum_objave)
    );

    const top5 = filtriraneNekretnine.slice(0, 5);

    res.status(200).json(top5);

  } catch (error) {
    console.error('Error fetching properties data:', error);
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

  const { nekretnina_id, tekst_upita } = req.body;

  if (!nekretnina_id || !tekst_upita) {
    return res.status(400).json({ greska: 'Nedostaju podaci za upit' });
  }

  try {
    const users = await readJsonFile('korisnici');
    const nekretnine = await readJsonFile('nekretnine');

    const loggedInUser = users.find((user) => user.username === req.session.username);
    const nekretnina = nekretnine.find((property) => property.id === Number(nekretnina_id));

    if (!nekretnina) {
      return res.status(400).json({ greska: `Nekretnina sa id-em ${nekretnina_id} ne postoji` });
    }

    const upitiKorisnika = nekretnina.upiti.filter(
      (upit) => upit.korisnik_id === loggedInUser.id
    );

    if (upitiKorisnika.length >= 3) {
      return res.status(429).json({ greska: 'Previse upita za istu nekretninu.' });
    }

    nekretnina.upiti.push({
      korisnik_id: loggedInUser.id,
      tekst_upita: tekst_upita
    });

    await saveJsonFile('nekretnine', nekretnine);

    res.status(200).json({ poruka: 'Upit je uspješno dodan' });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});


app.get('/upiti/moji', async (req, res) => {
  // Checking if the user is logged in
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  try {
    const users = await readJsonFile('korisnici');
    const nekretnine = await readJsonFile('nekretnine');

    const loggedInUser = users.find((user) => user.username === req.session.username);

    if (!loggedInUser) {
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    const upitiKorisnika = nekretnine.flatMap((nekretnina) =>
      nekretnina.upiti
        .filter((upit) => upit.korisnik_id === loggedInUser.id)
        .map((upit) => ({
          id_nekretnine: nekretnina.id,
          tekst_upita: upit.tekst_upita
        }))
    );

    if (upitiKorisnika.length === 0) {
      return res.status(404).json([]); // Vraća prazan niz ako nema upita
    }

    res.status(200).json(upitiKorisnika);
  } catch (error) {
    console.error('Greška pri dohvaćanju upita:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});


/*
Updates any user field
*/
app.put('/korisnik', async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Get data from the request body
  const { ime, prezime, username, password } = req.body;

  try {
    // Read user data from the JSON file
    const users = await readJsonFile('korisnici');

    // Find the user by username
    const loggedInUser = users.find((user) => user.username === req.session.username);

    if (!loggedInUser) {
      // User not found (should not happen if users are correctly managed)
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    // Update user data with the provided values
    if (ime) loggedInUser.ime = ime;
    if (prezime) loggedInUser.prezime = prezime;
    if (username) loggedInUser.username = username;
    if (password) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      loggedInUser.password = hashedPassword;
    }

    // Save the updated user data back to the JSON file
    await saveJsonFile('korisnici', users);
    res.status(200).json({ poruka: 'Podaci su uspješno ažurirani' });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/*
Returns all properties from the file.
*/
app.get('/nekretnine', async (req, res) => {
  try {
    const nekretnineData = await readJsonFile('nekretnine');
    res.json(nekretnineData);
  } catch (error) {
    console.error('Error fetching properties data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/nekretnine/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10); // Dohvaćanje ID-a iz parametara kao broj

  if (!id) {
    return res.status(403).json({ error: 'ID nije prepoznat u sistemu' });
  }

  try {
    const nekretnineData = await readJsonFile('nekretnine');
    const nekretnina = nekretnineData.find((nekretnina) => nekretnina.id === id);

    if (!nekretnina) {
      return res.status(404).json({ error: 'Nekretnina ne postoji u sistemu' });
    }

    // Sortiranje upita prema datumu objave i uzimanje najnovijih 3
    const najnovijiUpiti = [...nekretnina.upiti]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(0, 3);

    // Kopiranje nekretnine i uklanjanje polja 'upiti'
    const nekretninaBezUpita = { ...nekretnina };
    delete nekretninaBezUpita.upiti;

    // Dodavanje sortirane liste najnovijih upita u rezultat
    const rezultat = { ...nekretninaBezUpita, najnovijiUpiti };

    res.status(200).json(rezultat);

  } catch (error) {
    console.error('Greška pri dohvaćanju podataka o nekretninama:', error);
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
    const nekretnineData = await readJsonFile('nekretnine');

    const nekretnina = nekretnineData.find((nekretnina) => nekretnina.id === id);

    if (!nekretnina) {
      return res.status(404).json({ greska: `Nekretnina sa ID-em ${id} ne postoji` });
    }

    // Sortira upite ako postoje
    const sortiraniUpiti = nekretnina.upiti ? [...nekretnina.upiti].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    ) : [];

    const startIndex = (page - 1) * 3; 
    const endIndex = startIndex + 3; 

    const upitiZaStranicu = sortiraniUpiti.slice(startIndex, endIndex);

    // Ako ima manje od 3 upita za traženu stranicu
    if (upitiZaStranicu.length < 3) {
      return res.status(404).json([]);
    }

    const rezultat = upitiZaStranicu.map(({ korisnik_id, tekst_upita }) => ({
      korisnik_id,
      tekst_upita
    }));

    res.status(200).json(rezultat);
  } catch (error) {
    console.error('Greška pri dohvaćanju upita:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});


/* ----------------- MARKETING ROUTES ----------------- */

// Route that increments value of pretrage for one based on list of ids in nizNekretnina
app.post('/marketing/nekretnine', async (req, res) => {
  const { nizNekretnina } = req.body;

  try {
    // Load JSON data
    let preferencije = await readJsonFile('preferencije');

    // Check format
    if (!preferencije || !Array.isArray(preferencije)) {
      console.error('Neispravan format podataka u preferencije.json.');
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Init object for search
    preferencije = preferencije.map((nekretnina) => {
      nekretnina.pretrage = nekretnina.pretrage || 0;
      return nekretnina;
    });

    // Update atribute pretraga
    nizNekretnina.forEach((id) => {
      const nekretnina = preferencije.find((item) => item.id === id);
      if (nekretnina) {
        nekretnina.pretrage += 1;
      }
    });

    // Save JSON file
    await saveJsonFile('preferencije', preferencije);

    res.status(200).json({});
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/nekretnina/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const nekretninaData = preferencije.find((item) => item.id === parseInt(id, 10));

    if (nekretninaData) {
      // Update clicks
      nekretninaData.klikovi = (nekretninaData.klikovi || 0) + 1;

      // Save JSON file
      await saveJsonFile('preferencije', preferencije);

      res.status(200).json({ success: true, message: 'Broj klikova ažuriran.' });
    } else {
      res.status(404).json({ error: 'Nekretnina nije pronađena.' });
    }
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/osvjezi/pretrage', async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, pretrage: nekretninaData ? nekretninaData.pretrage : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/osvjezi/klikovi', async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, klikovi: nekretninaData ? nekretninaData.klikovi : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
