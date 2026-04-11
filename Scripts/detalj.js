document.addEventListener("DOMContentLoaded", () => {

    // Čitaj ID nekretnine iz URL parametra ?id=
    const urlParams = new URLSearchParams(window.location.search);
    const nekretninaId = urlParams.get('id');

    if (!nekretninaId) {
        document.getElementById('osnovno').innerHTML = '<p>Nije odabrana nijedna nekretnina.</p>';
        return;
    }

    // Učitaj podatke nekretnine sa servera
    PoziviAjax.getNekretnina(nekretninaId, (err, data) => {
        if (err || !data) {
            document.getElementById('osnovno').innerHTML = '<p>Greška pri učitavanju nekretnine.</p>';
            return;
        }

        // Popuni osnovne podatke
        document.getElementById('naziv').textContent = data.naziv || '—';
        document.getElementById('kvadratura').textContent = data.kvadratura ? `${data.kvadratura} m²` : '—';
        document.getElementById('cijena').textContent = data.cijena ? `${data.cijena.toLocaleString()} BAM` : '—';
        document.getElementById('tip-grijanja').textContent = data.tip_grijanja || '—';
        document.getElementById('godina-izgradnje').textContent = data.godins_izgradnje || '—';
        document.getElementById('opis-nekretnine').textContent = data.opis || '—';

        // Datum objave
        if (data.datum_objave) {
            const datum = new Date(data.datum_objave);
            document.getElementById('datum-objave').textContent = datum.toLocaleDateString('bs-BA');
        }

        // Lokacija link
        const lokacijaLink = document.getElementById('lokacijaLink');
        if (lokacijaLink && data.lokacija) {
            lokacijaLink.textContent = data.lokacija;
        }

        // Upiti carousel
        const upitiDiv = document.getElementById('upiti');
        upitiDiv.innerHTML = '';

        const upiti = data.najnovijiUpiti || [];

        if (upiti.length === 0) {
            upitiDiv.innerHTML = '<p>Nema upita za ovu nekretninu.</p>';
            document.getElementById('prev-btn').style.display = 'none';
            document.getElementById('next-btn').style.display = 'none';
        } else {
            // Kreiraj div elemente za svaki upit
            const upitiElementi = upiti.map(upit => {
                const div = document.createElement('div');
                div.classList.add('upit');
                div.innerHTML = `<p>${upit.tekst}</p>`;
                return div;
            });

            // Postavi carousel
            const carousel = postaviCarousel(upitiDiv, upitiElementi, 0);
            if (carousel) {
                document.getElementById('prev-btn').addEventListener('click', carousel.fnLijevo);
                document.getElementById('next-btn').addEventListener('click', carousel.fnDesno);
            }
        }
    });
});