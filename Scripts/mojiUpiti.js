document.addEventListener("DOMContentLoaded", () => {
    const listaUpita = document.getElementById("lista-upita");
  
    PoziviAjax.getMojiUpiti(upiti => {
      upiti.forEach(upit => {
        const li = document.createElement("li");
        li.textContent = `Upit: ${upit.naslov}, Datum: ${upit.datum}`;
        listaUpita.appendChild(li);
      });
    });
  });
  