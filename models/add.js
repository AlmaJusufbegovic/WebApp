const { models } = require('./index'); 
const addAdmin = async () => {
    try {
        const korisnik = await models.Korisnik.create({
            ime: 'Administrator',
            prezime: 'Admin',
            username: 'admin',
            password: '$2y$10$KtNv0UYOVG.qGyPFgLtdeejiZAxJXY0/YqP4o4koECRpR8rpREslS',
            admin: true,
        });
        console.log('Admin je uspješno dodan:', korisnik.toJSON());
    } catch (error) {
        console.error('Greška prilikom dodavanja admina:', error);
    }
};

addAdmin();

const addUsers = async () => {
    try {
        const korisnici = await models.Korisnik.bulkCreate([
            {
                ime: 'Neko',
                prezime: 'Nekic1',
                username: 'username1',
                password: '$2b$10$OFykzLMWv.wpDk2dXT5C8ObIgy8tlZYbm0ZPN0VTe8I/jXosIX1EG',
                admin: false,
            },
            {
                ime: 'Neko2',
                prezime: 'Nekic2',
                username: 'username1',
                password: '$2b$10$eN2a0Ii0mkjvpSUU.6.S4uASuULIlAspWFc2LkJTmIYPZszB8oyXC',
                admin: false,
            },
            {
                ime: 'Neko3',
                prezime: 'Nekic3',
                username: 'username3',
                password: '$2y$10$h4081yhSUcvMvQi.VPu3Z.PrgHhY.iknLojWQO2dNSCaIDhNS2DHy',
                admin: false,
            },
            {
                ime: 'Neko4',
                prezime: 'Nekic4',
                username: 'username4',
                password: '$2y$10$ehzFBx10al.5s2086UN.JOPx.X5InuLgkggUjRaPGdwYAS2BHOhOe',
                admin: false,
            },
            {
                ime: 'Neko5',
                prezime: 'Nekic5',
                username: 'username5',
                password: '$2y$10$/B7q2zJsvkQrfTe.xWDwau.YfgE5IFGr7QnNc6QuIQvNC5rrMUhrW',
                admin: false,
            },
        ]);
        console.log('Korisnici su uspješno dodani:', korisnici.map(k => k.toJSON()));
    } catch (error) {
        console.error('Greška prilikom dodavanja korisnika:', error);
    }
};

addUsers();

const addProperties = async () => {
    try{
        const nekretnine = await models.Nekretnina.bulkCreate([
            { 
                naziv: 'Useljiv stan Sarajevo',
                tip_nekretnine: 'Stan',
                kvadratura: 58,
                cijena: 232000,
                tip_grijanja: 'plin',
                lokacija: 'Novo Sarajevo',
                godins_izgradnje: 2019,
                datum_objave: '11.07.2023.',
                opis: 'Sociis natoque penatibus.',
            },
            { 
                naziv: 'Mali poslovni prostor',
                tip_nekretnine: 'Poslovni prostor',
                kvadratura: 20,
                cijena: 70000,
                tip_grijanja: 'struja',
                lokacija: 'Centar',
                godins_izgradnje: 2005,
                datum_objave:  '06.05.2022.',
                opis: 'Magnis dis parturient montes.',
            },
            ]);
            console.log('Nekretnine su uspješno dodane:', nekretnine.map(n => n.toJSON()));
        } catch (error) {
            console.error('Greška prilikom dodavanja nekretnina:', error);
        }
};

addProperties();

const addRelatedOffer = async () => {
    try {
        const korisnik = await models.Korisnik.findByPk(1);
        if (!korisnik) throw new Error('Korisnik nije pronađen');

        const nekretnina = await models.Nekretnina.findByPk(1);
        if (!nekretnina) throw new Error('Nekretnina nije pronađena');

        const ponuda = await models.Ponuda.create({
            id_korisnika: korisnik.id,
            id_nekretnine: nekretnina.id,
            tekst: 'Nudim 200000 KM za ovu nekretninu.',
            cijenaPonude: 200000,
            datumPonude: new Date(),
            odbijenaPonuda: false,
            parentPonudaId: null,
        });

        console.log('Ponuda je uspješno dodana:', ponuda.toJSON());
    } catch (error) {
        console.error('Greška prilikom dodavanja ponude:', error);
    }
};

addRelatedOffer();

const addRelatedQuery1 = async () => {
    try {
        const korisnik = await models.Korisnik.findByPk(1);
        if (!korisnik) throw new Error('Korisnik nije pronađen');

        const nekretnina = await models.Nekretnina.findByPk(1);
        if (!nekretnina) throw new Error('Nekretnina nije pronađena');

        const upit = await models.Upit.create({
            id_korisnika: korisnik.id,
            id_nekretnine: nekretnina.id,
            tekst: 'Nullam eu pede mollis pretium.',
        });

        console.log('Upit je uspješno dodan:', upit.toJSON());
    } catch (error) {
        console.error('Greška prilikom dodavanja upita:', error);
    }
};

addRelatedQuery1();

const addRelatedQuery2 = async () => {
    try {
        const korisnik = await models.Korisnik.findByPk(2);
        if (!korisnik) throw new Error('Korisnik nije pronađen');

        const nekretnina = await models.Nekretnina.findByPk(1);
        if (!nekretnina) throw new Error('Nekretnina nije pronađena');

        const upit = await models.Upit.create({
            id_korisnika: korisnik.id,
            id_nekretnine: nekretnina.id,
            tekst: 'Phasellus viverra nulla.',
        });

        console.log('Upit je uspješno dodan:', upit.toJSON());
    } catch (error) {
        console.error('Greška prilikom dodavanja upita:', error);
    }
};

addRelatedQuery2();

const addRelatedQuery3 = async () => {
    try {
        const korisnik = await models.Korisnik.findByPk(1);
        if (!korisnik) throw new Error('Korisnik nije pronađen');

        const nekretnina = await models.Nekretnina.findByPk(1);
        if (!nekretnina) throw new Error('Nekretnina nije pronađena');

        const upit = await models.Upit.create({
            id_korisnika: korisnik.id,
            id_nekretnine: nekretnina.id,
            tekst: 'Koja je cijena nekretnine?',
        });

        console.log('Upit je uspješno dodan:', upit.toJSON());
    } catch (error) {
        console.error('Greška prilikom dodavanja upita:', error);
    }
};

addRelatedQuery3();

const addRelatedQuery4 = async () => {
    try {
        const korisnik = await models.Korisnik.findByPk(1);
        if (!korisnik) throw new Error('Korisnik nije pronađen');

        const nekretnina = await models.Nekretnina.findByPk(1);
        if (!nekretnina) throw new Error('Nekretnina nije pronađena');

        const upit = await models.Upit.create({
            id_korisnika: korisnik.id,
            id_nekretnine: nekretnina.id,
            tekst: 'Kakav je pogled?',
        });

        console.log('Upit je uspješno dodan:', upit.toJSON());
    } catch (error) {
        console.error('Greška prilikom dodavanja upita:', error);
    }
};

addRelatedQuery4();


const addRelatedQuery5 = async () => {
    try {
        const korisnik = await models.Korisnik.findByPk(3);
        if (!korisnik) throw new Error('Korisnik nije pronađen');

        const nekretnina = await models.Nekretnina.findByPk(2);
        if (!nekretnina) throw new Error('Nekretnina nije pronađena');

        const upit = await models.Upit.create({
            id_korisnika: korisnik.id,
            id_nekretnine: nekretnina.id,
            tekst: 'Integer tincidunt.',
        });

        console.log('Upit je uspješno dodan:', upit.toJSON());
    } catch (error) {
        console.error('Greška prilikom dodavanja upita:', error);
    }
};

addRelatedQuery5();


const addRelatedQuery6 = async () => {
    try {
        const korisnik = await models.Korisnik.findByPk(1);
        if (!korisnik) throw new Error('Korisnik nije pronađen');

        const nekretnina = await models.Nekretnina.findByPk(2);
        if (!nekretnina) throw new Error('Nekretnina nije pronađena');

        const upit = await models.Upit.create({
            id_korisnika: korisnik.id,
            id_nekretnine: nekretnina.id,
            tekst: 'Koja je cijena nekretnine?',
        });

        console.log('Upit je uspješno dodan:', upit.toJSON());
    } catch (error) {
        console.error('Greška prilikom dodavanja upita:', error);
    }
};

addRelatedQuery6();

const addRelatedQuery7 = async () => {
    try {
        const korisnik = await models.Korisnik.findByPk(1);
        if (!korisnik) throw new Error('Korisnik nije pronađen');

        const nekretnina = await models.Nekretnina.findByPk(2);
        if (!nekretnina) throw new Error('Nekretnina nije pronađena');

        const upit = await models.Upit.create({
            id_korisnika: korisnik.id,
            id_nekretnine: nekretnina.id,
            tekst: 'Koliko ima prozora?',
        });

        console.log('Upit je uspješno dodan:', upit.toJSON());
    } catch (error) {
        console.error('Greška prilikom dodavanja upita:', error);
    }
};

addRelatedQuery7();


const addRelatedQuery8 = async () => {
    try {
        const korisnik = await models.Korisnik.findByPk(3);
        if (!korisnik) throw new Error('Korisnik nije pronađen');

        const nekretnina = await models.Nekretnina.findByPk(2);
        if (!nekretnina) throw new Error('Nekretnina nije pronađena');

        const upit = await models.Upit.create({
            id_korisnika: korisnik.id,
            id_nekretnine: nekretnina.id,
            tekst: 'Koliko ima soba?',
        });

        console.log('Upit je uspješno dodan:', upit.toJSON());
    } catch (error) {
        console.error('Greška prilikom dodavanja upita:', error);
    }
};

addRelatedQuery8();

const addRelatedClaim = async () => {
    try {
        const korisnik = await models.Korisnik.findByPk(1);
        if (!korisnik) throw new Error('Korisnik nije pronađen');

        const nekretnina = await models.Nekretnina.findByPk(1);
        if (!nekretnina) throw new Error('Nekretnina nije pronađena');

        const zahtjev = await models.Zahtjev.create({
            id_korisnika: korisnik.id,
            id_nekretnine: nekretnina.id,
            tekst: 'Želim da ga pregedam prije kupovine',
            trazeniDatum: new Date(),
            odobren: false,
        });

        console.log('Zahtjev je uspješno dodan:', zahtjev.toJSON());
    } catch (error) {
        console.error('Greška prilikom dodavanja zahtjeva:', error);
    }
};

addRelatedClaim();

