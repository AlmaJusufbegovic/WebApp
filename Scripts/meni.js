window.onload = function () {
  function updateMenuForLoginStatus(loggedIn) {
    const profilLink = document.getElementById('profilLink');
    const nekretnineLink = document.getElementById('nekretnineLink');
    const detaljiLink = document.getElementById('detaljiLink');
    const prijavaLink = document.getElementById('prijavaLink');
    const odjavaLink = document.getElementById('odjavaLink');

    if (loggedIn) {
      profilLink.style.display = 'block';
      nekretnineLink.style.display = 'block';
      detaljiLink.style.display = 'block';
      prijavaLink.style.display = 'none';
      odjavaLink.style.display = 'block';
    } else {
      profilLink.style.display = 'none';
      nekretnineLink.style.display = 'block';
      detaljiLink.style.display = 'block';
      prijavaLink.style.display = 'block';
      odjavaLink.style.display = 'none';
    }
  }

  PoziviAjax.getKorisnik(function (err, data) {
    const loggedIn = !(err || !data || !data.username);

    updateMenuForLoginStatus(loggedIn);
  });

 const odjavaLink = document.getElementById('odjavaLink');

if (odjavaLink) {
  odjavaLink.addEventListener('click', function (e) {
    e.preventDefault(); // 🔥 BITNO

    PoziviAjax.postLogout(function (err, data) {
      if (err != null) {
        window.alert(err);
        return;
      }

      updateMenuForLoginStatus(false);

      window.location.href = "/prijava.html";
    });
  });
}
}