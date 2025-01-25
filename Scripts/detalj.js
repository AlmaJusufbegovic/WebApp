/*document.addEventListener("DOMContentLoaded", () => {
    const prikaz = document.querySelector("#upiti");
    const sviUpiti = Array.from(document.querySelectorAll(".upit"));

    const carousel = postaviCarousel(prikaz, sviUpiti);

    if (carousel) {
        document.querySelector("#prev-btn").addEventListener("click", carousel.fnLijevo);
        document.querySelector("#next-btn").addEventListener("click", carousel.fnDesno);
    } else {
        console.error("Carousel nije pravilno postavljen. Provjerite ulazne podatke.");
    }
});*/

document.addEventListener("DOMContentLoaded", () => {
    const prikaz = document.querySelector("#upiti");
    const sviUpiti = Array.from(document.querySelectorAll(".upit"));

    let krajUcitavanja = false; 
    const carousel = postaviCarousel(prikaz, sviUpiti, 0, ucitajSljedeceUpite);

    if (carousel) {
        document.querySelector("#prev-btn").addEventListener("click", carousel.fnLijevo);
        document.querySelector("#next-btn").addEventListener("click", () => {
            carousel.fnDesno();

            // Provjeri da li smo došli do kraja prikazanih elemenata
            if (!krajUcitavanja && carousel.indeks === carousel.trenutniElementi.length - 1) {
                ucitajSljedeceUpite((noviElementi) => {
                    if (noviElementi.length === 0) {
                        krajUcitavanja = true; // Nema više upita za učitavanje
                    } else {
                        carousel.dodajElemente(noviElementi); // Dodaj nove elemente u carousel
                    }
                });
            }
        });
    } else {
        console.error("Carousel nije pravilno postavljen. Provjerite ulazne podatke.");
    }
});

function ucitajSljedeceUpite(callback) {
    PoziviAjax.getNextUpiti((err, noviUpiti) => {
        if (err || !noviUpiti.length) {
            callback([]); // Vratite prazan niz ako nema više upita
        } else {
            const noviElementi = noviUpiti.map(upit => {
                const div = document.createElement("div");
                div.classList.add("upit"); // Dodaj klasu da bude kompatibilan sa carousel-om
                div.innerHTML = `<p>${upit.tekst_upita}</p>`;
                return div;
            });
            callback(noviElementi);
        }
    });
}
