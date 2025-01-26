import { loadInteresovanja } from './PoziviAjax';

async function loadInteresovanjaData() {
  try {
    const interesovanja = await loadInteresovanja(nekretninaId);
    displayInteresovanja(interesovanja);
  } catch (error) {
    console.error("Greška pri učitavanju interesovanja", error);
  }
}

function displayInteresovanja(interesovanja) {
    const container = document.getElementById("interesovanjaList");
    container.innerHTML = ""; 
    
    interesovanja.forEach(interesovanje => {
      let interesovanjeHtml = `<div class="interesovanje">`;
  
      let idHtml = `<p>ID: ${interesovanje.id}</p>`;
      interesovanjeHtml += idHtml;
  
      if (interesovanje.tip === "ponuda") {
        interesovanjeHtml += `
          <p>Ponuda: ${interesovanje.tekst}</p>
          <p>Status: ${interesovanje.odobrena ? "Odobrena" : "Odbijena"}</p>
        `;
      } else if (interesovanje.tip === "zahtjev") {
        interesovanjeHtml += `
          <p>Zahtjev: ${interesovanje.tekst}</p>
          <p>Datum: ${new Date(interesovanje.trazeniDatum).toLocaleDateString()}</p>
          <p>Status: ${interesovanje.odobren ? "Odobren" : "Odbijen"}</p>
        `;
      } else if (interesovanje.tip === "upit") {
        interesovanjeHtml += `<p>Upit: ${interesovanje.tekst}</p>`;
      }
  
      if (korisnik.isAdmin || (interesovanje.tip === "zahtjev" && interesovanje.korisnikId === korisnik.id)) {
        interesovanjeHtml += `<p>Detalji: ${JSON.stringify(interesovanje)}</p>`;
      }
  
      interesovanjeHtml += `</div>`;
      
      container.innerHTML += interesovanjeHtml;
    });
  }
  
document.addEventListener("DOMContentLoaded", loadInteresovanjaData);