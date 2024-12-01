let StatistikaNekretnina = (function () {
    let listaNekretnina = [];
    let listaKorisnika = [];

    // Inicijalizacija modula s podacima
    let init = function (nekretnine, korisnici) {
        listaNekretnina = nekretnine;
        listaKorisnika = korisnici;
    };

    // Funkcija za izračunavanje prosečne kvadrature za određeni tip nekretnine
    let prosjecnaKvadratura = function (kriterij) {
        let filtrirane = listaNekretnina.filter(nekretnina => nekretnina.tip_nekretnine === kriterij);
        let suma = filtrirane.reduce((ukupno, nekretnina) => ukupno + nekretnina.kvadratura, 0);
        return filtrirane.length > 0 ? suma / filtrirane.length : 0;
    };

    // Funkcija za pronalaženje outliera (ekstremnih vrednosti) u cenama ili kvadraturama
    let outlier = function (kriterij, nazivSvojstva) {
        let filtrirane = listaNekretnina.filter(nekretnina => nekretnina.tip_nekretnine === kriterij);
        if (filtrirane.length === 0) return null;

        let srednjaVrijednost = filtrirane.reduce((ukupno, nekretnina) => ukupno + nekretnina[nazivSvojstva], 0) / filtrirane.length;

        return filtrirane.reduce((najveciOutlier, nekretnina) => {
            let odstupanje = Math.abs(nekretnina[nazivSvojstva] - srednjaVrijednost);
            let maxOdstupanje = Math.abs(najveciOutlier[nazivSvojstva] - srednjaVrijednost);
            return odstupanje > maxOdstupanje ? nekretnina : najveciOutlier;
        }, filtrirane[0]);
    };

    // Funkcija koja vraća sve nekretnine koje su povezane sa određenim korisnikom
    let mojeNekretnine = function (korisnik_id) {
        return listaNekretnina.filter(nekretnina => nekretnina.upiti.some(upit => upit.korisnik_id === korisnik_id));
    };

    // Funkcija za generisanje histograma cena u određenom periodu
    let histogramCijena = function (periodi, rasponiCijena) {
        const histogram = [];
    
        periodi.forEach((period) => {
            let nekretnineUPeriodu = listaNekretnina.filter(nekretnina => {
                const godObj = parseInt(nekretnina.datum_objave.split(".")[2]);
                return godObj >= period.od && godObj <= period.do;
            });
    
            rasponiCijena.forEach((raspon) => {
                const brojNekretnina = nekretnineUPeriodu.filter(nekretnina => {
                    return nekretnina.cijena >= raspon.od && nekretnina.cijena <= raspon.do;
                }).length;
    
                histogram.push({
                    naziv: `Cijena: ${raspon.od}-${raspon.do} | Period: ${period.od}-${period.do}`,
                    brojNekretnina: brojNekretnina
                });
            });
        });
    
        return histogram;
    };

    return {
        init: init,
        prosjecnaKvadratura: prosjecnaKvadratura,
        outlier: outlier,
        mojeNekretnine: mojeNekretnine,
        histogramCijena: histogramCijena
    };
})();
