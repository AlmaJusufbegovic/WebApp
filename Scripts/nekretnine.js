function spojiNekretnine(gridReferenca, instancaModula, tip_nekretnine) {
    const filtriraneNekretnine = instancaModula.filtrirajNekretnine({ tip_nekretnine: tip_nekretnine });

    gridReferenca.innerHTML = '';

    if (filtriraneNekretnine.length === 0) {
        gridReferenca.innerHTML = '<p style="text-align:center; color:#888;">Trenutno nema dostupnih nekretnina ovoga tipa.</p>';
    } else {
        filtriraneNekretnine.forEach(nekretnina => {
            const nekretninaElement = document.createElement('div');

            if (tip_nekretnine === "Stan") {
                nekretninaElement.classList.add('nekretnina', 'stan');
            } else if (tip_nekretnine === "Kuća") {
                nekretninaElement.classList.add('nekretnina', 'kuca');
            } else {
                nekretninaElement.classList.add('nekretnina', 'pp');
            }
            nekretninaElement.id = `${nekretnina.id}`;

            // --- Stats bar ---
            const statsBar = document.createElement('div');
            statsBar.classList.add('stats-bar');

            const pretrageDiv = document.createElement('span');
            pretrageDiv.id = `pretrage-${nekretnina.id}`;
            pretrageDiv.innerHTML = `<span class="ikona">🔍</span> Pretrage: ${nekretnina.pretrage || 0}`;

            const klikoviDiv = document.createElement('span');
            klikoviDiv.id = `klikovi-${nekretnina.id}`;
            klikoviDiv.innerHTML = `<span class="ikona">👆</span> Klikovi: ${nekretnina.klikovi || 0}`;

            statsBar.appendChild(pretrageDiv);
            statsBar.appendChild(klikoviDiv);
            nekretninaElement.appendChild(statsBar);

            // --- Slika ---
            const slikaElement = document.createElement('img');
            slikaElement.classList.add('slika-nekretnine');
            slikaElement.src = `/Resources/${nekretnina.id}.jpg`;
            slikaElement.alt = nekretnina.naziv;
            slikaElement.onerror = function() { this.style.display = 'none'; };
            nekretninaElement.appendChild(slikaElement);

            // --- Detalji tekst ---
            const detaljiElement = document.createElement('div');
            detaljiElement.classList.add('detalji-nekretnine');
            detaljiElement.innerHTML = `
                <h3>${nekretnina.naziv}</h3>
                <p>Kvadratura: ${nekretnina.kvadratura} m²</p>
                <p>Lokacija: ${nekretnina.lokacija}</p>
            `;
            nekretninaElement.appendChild(detaljiElement);

            // --- Cijena ---
            const cijenaElement = document.createElement('div');
            cijenaElement.classList.add('cijena-nekretnine');
            cijenaElement.innerHTML = `<p><strong>${nekretnina.cijena.toLocaleString()} BAM</strong></p>`;
            nekretninaElement.appendChild(cijenaElement);

            // --- Detalji dugme --- navigira na detalji.html?id=X i broji klik
            const detaljiDugme = document.createElement('a');
            detaljiDugme.classList.add('detalji-dugme');
            detaljiDugme.textContent = 'Detalji';
            detaljiDugme.href = `/detalji.html?id=${nekretnina.id}`;
            detaljiDugme.addEventListener('click', function () {
                MarketingAjax.klikNekretnina(nekretnina.id);
                const klikoviEl = document.getElementById(`klikovi-${nekretnina.id}`);
                if (klikoviEl) {
                    const trenutni = parseInt(klikoviEl.dataset.count || nekretnina.klikovi || 0);
                    const novi = trenutni + 1;
                    klikoviEl.dataset.count = novi;
                    klikoviEl.innerHTML = `<span class="ikona">👆</span> Klikovi: ${novi}`;
                }
            });
            nekretninaElement.appendChild(detaljiDugme);

            gridReferenca.appendChild(nekretninaElement);
        });
    }
}

const listaKorisnika = [];
const gridStan = document.querySelector('#stan .grid-lista-nekretnina');
const gridKuca = document.querySelector('#kuca .grid-lista-nekretnina');
const gridPp   = document.querySelector('#pp .grid-lista-nekretnina');

let nekretnine = SpisakNekretnina();

PoziviAjax.getNekretnine((error, listaNekretnina) => {
    if (error) {
        console.error("Greška prilikom dohvatanja nekretnina sa servera:", error);
    } else {
        nekretnine.init(listaNekretnina, listaKorisnika);
        spojiNekretnine(gridStan, nekretnine, "Stan");
        spojiNekretnine(gridKuca, nekretnine, "Kuća");
        spojiNekretnine(gridPp,   nekretnine, "Poslovni prostor");
        MarketingAjax.novoFiltriranje(listaNekretnina.map(n => n.id));
    }
});

function filtrirajNekretnine(filtriraneNekretnine) {
    const inst = SpisakNekretnina();
    inst.init(filtriraneNekretnine, listaKorisnika);
    spojiNekretnine(gridStan, inst, "Stan");
    spojiNekretnine(gridKuca, inst, "Kuća");
    spojiNekretnine(gridPp,   inst, "Poslovni prostor");
}

function filtrirajOnClick() {
    const kriterij = {
        min_cijena:     parseFloat(document.getElementById('minCijena').value)     || 0,
        max_cijena:     parseFloat(document.getElementById('maxCijena').value)     || Infinity,
        min_kvadratura: parseFloat(document.getElementById('minKvadratura').value) || 0,
        max_kvadratura: parseFloat(document.getElementById('maxKvadratura').value) || Infinity
    };
    const filtriraneNekretnine = nekretnine.filtrirajNekretnine(kriterij);
    MarketingAjax.novoFiltriranje(filtriraneNekretnine.map(n => n.id));
    filtrirajNekretnine(filtriraneNekretnine);
}

document.getElementById('dugmePretraga').addEventListener('click', filtrirajOnClick);

setInterval(() => {
    const divNekretnine = document.getElementById('divNekretnine');
    if (divNekretnine) {
        MarketingAjax.osvjeziPretrage(divNekretnine);
        MarketingAjax.osvjeziKlikove(divNekretnine);
    }
}, 3000);
