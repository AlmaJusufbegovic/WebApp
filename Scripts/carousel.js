/*
//prijašnja spirala
function postaviCarousel(glavniElement, sviElementi, indeks = 0) {
    if (!glavniElement || !Array.isArray(sviElementi) || sviElementi.length === 0 || indeks < 0 || indeks >= sviElementi.length) {
        return null;
    }

    function azurirajPrikaz() {
        glavniElement.innerHTML = sviElementi[indeks].innerHTML;
    }

    function fnLijevo() {
        indeks = (indeks - 1 + sviElementi.length) % sviElementi.length;
        azurirajPrikaz();
    }

    function fnDesno() {
        indeks = (indeks + 1) % sviElementi.length;
        azurirajPrikaz();
    }

    azurirajPrikaz();

    return { fnLijevo, fnDesno };
}*/

function postaviCarousel(glavniElement, sviElementi, indeks = 0, ucitajSljedece = null) {
    if (!glavniElement || !Array.isArray(sviElementi) || sviElementi.length === 0 || indeks < 0 || indeks >= sviElementi.length) {
        return null;
    }

    let trenutniElementi = [...sviElementi];

    function azurirajPrikaz() {
        glavniElement.innerHTML = trenutniElementi[indeks].innerHTML;
    }

    function fnLijevo() {
        indeks = (indeks - 1 + trenutniElementi.length) % trenutniElementi.length;
        azurirajPrikaz();
    }

    function fnDesno() {
        indeks = (indeks + 1) % trenutniElementi.length;
        azurirajPrikaz();
    }

    function dodajElemente(noviElementi) {
        trenutniElementi.push(...noviElementi); // Dodaj nove elemente na kraj liste
    }

    azurirajPrikaz();

    return { fnLijevo, fnDesno, dodajElemente, indeks, trenutniElementi };
}

