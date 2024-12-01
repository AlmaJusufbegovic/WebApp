const nekretnineModul = {
    listaNekretnina: [{
        id: 1,
        tip_nekretnine: "Stan",
        naziv: "Useljiv stan Sarajevo",
        kvadratura: 58,
        cijena: 232000,
        tip_grijanja: "plin",
        lokacija: "Novo Sarajevo",
        godina_izgradnje: 2019,
        datum_objave: "01.10.2023.",
        opis: "Sociis natoque penatibus.",
        upiti: [{
            korisnik_id: 1,
            tekst_upita: "Nullam eu pede mollis pretium."
        },
        {
            korisnik_id: 2,
            tekst_upita: "Phasellus viverra nulla."
        }]
    },{
        id: 1,
        tip_nekretnine: "Stan",
        naziv: "Useljiv stan Sarajevo",
        kvadratura: 58,
        cijena: 32000,
        tip_grijanja: "plin",
        lokacija: "Novo Sarajevo",
        godina_izgradnje: 2019,
        datum_objave: "01.10.2009.",
        opis: "Sociis natoque penatibus.",
        upiti: [{
            korisnik_id: 1,
            tekst_upita: "Nullam eu pede mollis pretium."
        },
        {
            korisnik_id: 2,
            tekst_upita: "Phasellus viverra nulla."
        }]
    },{
        id: 1,
        tip_nekretnine: "Stan",
        naziv: "Useljiv stan Sarajevo",
        kvadratura: 58,
        cijena: 232000,
        tip_grijanja: "plin",
        lokacija: "Novo Sarajevo",
        godina_izgradnje: 2019,
        datum_objave: "01.10.2003.",
        opis: "Sociis natoque penatibus.",
        upiti: [{
            korisnik_id: 1,
            tekst_upita: "Nullam eu pede mollis pretium."
        },
        {
            korisnik_id: 2,
            tekst_upita: "Phasellus viverra nulla."
        }]
    },
    {
        id: 2,
        tip_nekretnine: "Kuća",
        naziv: "Mali poslovni prostor",
        kvadratura: 20,
        cijena: 70000,
        tip_grijanja: "struja",
        lokacija: "Centar",
        godina_izgradnje: 2005,
        datum_objave: "20.08.2023.",
        opis: "Magnis dis parturient montes.",
        upiti: [{
            korisnik_id: 2,
            tekst_upita: "Integer tincidunt."
        }
        ]
    },
    {
        id: 3,
        tip_nekretnine: "Kuća",
        naziv: "Mali poslovni prostor",
        kvadratura: 20,
        cijena: 70000,
        tip_grijanja: "struja",
        lokacija: "Centar",
        godina_izgradnje: 2005,
        datum_objave: "20.08.2023.",
        opis: "Magnis dis parturient montes.",
        upiti: [{
            korisnik_id: 2,
            tekst_upita: "Integer tincidunt."
        }
        ]
    },
    {
        id: 4,
        tip_nekretnine: "Kuća",
        naziv: "Mali poslovni prostor",
        kvadratura: 20,
        cijena: 70000,
        tip_grijanja: "struja",
        lokacija: "Centar",
        godina_izgradnje: 2005,
        datum_objave: "20.08.2023.",
        opis: "Magnis dis parturient montes.",
        upiti: [{
            korisnik_id: 2,
            tekst_upita: "Integer tincidunt."
        }
        ]
    }],

    listaKorisnika: [{
        id: 1,
        ime: "Neko",
        prezime: "Nekic",
        username: "username1",
    },
    {
        id: 2,
        ime: "Neko2",
        prezime: "Nekic2",
        username: "username2",
    }]
}

let chartInstance;

document.addEventListener('DOMContentLoaded', () => {
    const drawChartButton = document.getElementById('iscrtaj-histogram');
    const form = document.getElementById('statistika-form');
    const canvas = document.getElementById('histogram');
    const ctx = canvas.getContext('2d');

    drawChartButton.addEventListener('click', () => {
        const periodOd = parseInt(document.getElementById('period_od').value);
        const periodDo = parseInt(document.getElementById('period_do').value);
        const cijenaOd = parseInt(document.getElementById('cijena_od').value);
        const cijenaDo = parseInt(document.getElementById('cijena_do').value);

        if (isNaN(periodOd) || isNaN(periodDo) || isNaN(cijenaOd) || isNaN(cijenaDo)) {
            alert("Molimo unesite sve podatke ispravno!");
            return;
        }

        const nekretnineUPeriodu = nekretnineModul.listaNekretnina.filter(nekretnina => {
            const godinaObjave = new Date(nekretnina.datum_objave.split('.').reverse().join('-')).getFullYear();
            return godinaObjave >= periodOd && godinaObjave <= periodDo;
        });

        const brojNekretnina = nekretnineUPeriodu.filter(nekretnina =>
            nekretnina.cijena >= cijenaOd && nekretnina.cijena <= cijenaDo
        ).length;

        const newData = {
            label: `Period: ${periodOd}-${periodDo}, Cijena: ${cijenaOd}-${cijenaDo}`,
            data: [brojNekretnina],
            backgroundColor: `rgba(54, 162, 235, 0.6)`,
            borderColor: `rgba(54, 162, 235, 1)`,
            borderWidth: 1,
        };

        if (!chartInstance) {
            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: [`Cijena: ${cijenaOd} - ${cijenaDo}`],
                    datasets: [newData],
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            title: { display: true, text: 'Rasponi cijena' }
                        },
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'Broj nekretnina' }
                        }
                    }
                }
            });
        } else {
            chartInstance.data.datasets.push(newData);
            chartInstance.update();
        }
    });
});

function izracunajKvadraturu() {
    try {
        let kriterij = document.getElementById("kriterij").value.trim(); 
        let nazivSvojstva = document.getElementById("nazivSvojstva").value.trim(); 

        if (!kriterij || !nazivSvojstva) {
            throw new Error("Kriterij i naziv svojstva ne smeju biti prazni!");
        }

        const nekretnine = nekretnineModul.listaNekretnina.filter(nekretnina => 
            String(nekretnina[nazivSvojstva]).toLowerCase() === kriterij.toLowerCase()
        );

        if (nekretnine.length === 0) {
            throw new Error("Nema nekretnina za zadati kriterijum!");
        }

        const ukupnaKvadratura = nekretnine.reduce((sum, nekretnina) => sum + nekretnina.kvadratura, 0);
        const prosjecnaKvadratura = ukupnaKvadratura / nekretnine.length;

        document.getElementById("rezultatKvadratura").value = prosjecnaKvadratura.toFixed(2);
    } catch (error) {
        alert(error.message);
    }
}


function prikaziOutlier() {
    try {
        let kriterij = document.getElementById("kriterijOutlier").value.trim();
        let nazivSvojstva = document.getElementById("nazivSvojstva").value.trim();

        if (!kriterij || !nazivSvojstva) {
            throw new Error("Kriterij i naziv svojstva ne smeju biti prazni!");
        }

        const nekretnine = nekretnineModul.listaNekretnina.filter(nekretnina => 
            String(nekretnina[nazivSvojstva]).toLowerCase() === kriterij.toLowerCase()
        );

        if (nekretnine.length === 0) {
            throw new Error("Nema nekretnina za zadati kriterijum!");
        }

        const vrijednosti = nekretnine.map(nekretnina => nekretnina[nazivSvojstva]);

        if (isNaN(vrijednosti[0])) {
            throw new Error("Vrednosti za outlier treba da budu numeričke!");
        }

        const prosjek = vrijednosti.reduce((sum, v) => sum + v, 0) / vrijednosti.length;
        const devijacija = Math.sqrt(vrijednosti.reduce((sum, v) => sum + Math.pow(v - prosjek, 2), 0) / vrijednosti.length);

        const outlier = nekretnine.find(nekretnina => 
            Math.abs(nekretnina[nazivSvojstva] - prosjek) > 2 * devijacija
        );

        document.getElementById("outlier").value = outlier ? JSON.stringify(outlier) : "Nema outlier-a.";
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

function prikaziStatistiku(korisnikIme) {
    try {
        if (!korisnikIme) {
            throw new Error("Ime korisnika ne sme biti prazno!");
        }

        const filtriraneNekretnine = nekretnineModul.listaNekretnina.filter(nekretnina =>
            nekretnina.upiti.some(upit => upit.korisnik_id == korisnikIme)
        );

        const divStatistika = document.getElementById("rezultat");
        divStatistika.innerHTML = '';

        if (filtriraneNekretnine.length === 0) {
            divStatistika.innerHTML = '<p>Nemate nekretnina sa upitima.</p>';
        } else {
            filtriraneNekretnine.forEach(nekretnina => {
                const nekretninaElement = document.createElement('div');
                nekretninaElement.classList.add('nekretnina');

                const slikaElement = document.createElement('img');
                slikaElement.classList.add('slika-nekretnine');
                slikaElement.src = `../Resources/${nekretnina.id}.jpg`;
                slikaElement.alt = nekretnina.naziv;
                nekretninaElement.appendChild(slikaElement);

                const detaljiElement = document.createElement('div');
                detaljiElement.classList.add('detalji-nekretnine');
                detaljiElement.innerHTML = `
                    <h3>${nekretnina.naziv}</h3>
                    <p>Kvadratura: ${nekretnina.kvadratura} m²</p>
                    <p>Broj upita: ${nekretnina.upiti.filter(upit => upit.korisnik_id == korisnikIme).length}</p>
                `;
                nekretninaElement.appendChild(detaljiElement);

                divStatistika.appendChild(nekretninaElement);
            });
        }
    } catch (error) {
        alert(error.message);
    }
}

