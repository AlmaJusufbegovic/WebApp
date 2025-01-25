document.addEventListener("DOMContentLoaded", () => {
    const lokacijaLink = document.getElementById("lokacijaLink");

    if (lokacijaLink) {
        lokacijaLink.addEventListener("click", (e) => {
            e.preventDefault();
            const lokacija = e.target.textContent; // Lokacija iz linka
            
            // Provjeri da li je lokacija validna
            if (!lokacija || lokacija.trim() === "") {
                alert("Nepostojeća lokacija.");
                return;
            }

            // Poziv za dohvat podataka o top 5 nekretnina
            PoziviAjax.getTop5Nekretnina(lokacija, (err, data) => {
                if (err) {
                    alert("Greška pri dohvaćanju nekretnina.");
                    console.error("Greška pri dohvaćanju podataka:", err);
                } else {
                    prikaziNekretnine(data); // Ažuriraj prikaz nekretnina
                }
            });
        });
    } else {
        console.error("Element s ID-jem 'lokacijaLink' nije pronađen.");
    }
});

// Funkcija za prikazivanje nekretnina
function prikaziNekretnine(podaci) {
    const lista = document.getElementById("top5Nekretnine");
    
    if (!lista) {
        console.error("Element 'top5Nekretnine' nije pronađen.");
        return;
    }

    lista.innerHTML = ""; // Očisti postojeći sadržaj prije dodavanja novih

    if (!Array.isArray(podaci) || podaci.length === 0) {
        lista.innerHTML = "<p>Nema dostupnih nekretnina za ovu lokaciju.</p>";
        return;
    }

    // Dodaj nove nekretnine u listu
    podaci.forEach(nekretnina => {
        const li = document.createElement("li");
        li.className = "nekretnina-item";

        li.innerHTML = `
            <h2>${nekretnina.naziv}</h2>
            <p><strong>Lokacija:</strong> ${nekretnina.lokacija}</p>
            <p><strong>Cijena:</strong> ${nekretnina.cijena} KM</p>
        `;

        lista.appendChild(li);
    });
}
