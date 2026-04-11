const BASE_URL = 'http://localhost:3000';

const PoziviAjax = (() => {

    const handleResponse = (response, fnCallback) => {
        if (response.ok) {
          response.json()
            .then(data => fnCallback(null, data))
            .catch(err => fnCallback("Greška pri parsiranju odgovora sa servera.", null));
        } else {
          response.json()
            .then(errorData => fnCallback(errorData.message || "Greška na serveru.", null))
            .catch(() => fnCallback("Nepoznata greška na serveru.", null));
        }
    };
    
    const getTop5Nekretnina = (lokacija, fnCallback) => {
        fetch(`${BASE_URL}/nekretnine/top5?lokacija=${encodeURIComponent(lokacija)}`)
          .then(response => handleResponse(response, fnCallback))
          .catch(err => fnCallback("Greška pri povezivanju sa serverom.", null));
    };
  
    const getMojiUpiti = (fnCallback) => {
        fetch(`${BASE_URL}/upiti/moji`)
          .then(response => handleResponse(response, fnCallback))
          .catch(err => fnCallback("Greška pri povezivanju sa serverom.", null));
    };
  
    const getNekretnina = (nekretnina_id, fnCallback) => {
        fetch(`${BASE_URL}/nekretnine/${nekretnina_id}`)
          .then(response => handleResponse(response, fnCallback))
          .catch(err => fnCallback("Greška pri povezivanju sa serverom.", null));
    };
  
    const getNextUpiti = (nekretnina_id, page, fnCallback) => {
        fetch(`${BASE_URL}/upiti/${nekretnina_id}/page/${page}`)
          .then(response => handleResponse(response, fnCallback))
          .catch(err => fnCallback("Greška pri povezivanju sa serverom.", null));
    };

    function ajaxRequest(method, url, data, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    callback(null, xhr.responseText);
                } else {
                    callback({ status: xhr.status, statusText: xhr.statusText }, null);
                }
            }
        };
        xhr.send(data ? JSON.stringify(data) : null);
    }

    function impl_getKorisnik(fnCallback) {
        let ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                if (ajax.status == 200) {
                    fnCallback(null, JSON.parse(ajax.responseText));
                } else if (ajax.status == 401) {
                    fnCallback("error", null);
                }
            }
        };
        ajax.open("GET", `${BASE_URL}/korisnik/`, true);
        ajax.setRequestHeader("Content-Type", "application/json");
        ajax.send();
    }

    function impl_getNekretnine(fnCallback) {
        ajaxRequest('GET', `${BASE_URL}/nekretnine`, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const nekretnine = JSON.parse(data);
                    fnCallback(null, nekretnine);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }

    function impl_postLogin(username, password, fnCallback) {
        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                fnCallback(null, ajax.response);
            } else if (ajax.readyState == 4) {
                fnCallback(ajax.statusText, null);
            }
        };
        ajax.open("POST", `${BASE_URL}/login`, true);
        ajax.setRequestHeader("Content-Type", "application/json");
        ajax.send(JSON.stringify({ username, password }));
    }

 function impl_postLogout(fnCallback) {
    let ajax = new XMLHttpRequest();

    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            fnCallback(null, ajax.response);
        } else if (ajax.readyState == 4) {
            fnCallback(ajax.statusText, null);
        }
    };

    ajax.open("POST", `${BASE_URL}/logout`, true);
    ajax.withCredentials = true; // 🔥 BITNO

    ajax.send();
}

    function impl_postRegister(data, fnCallback) {

    ajaxRequest(
        'POST',
        `${BASE_URL}/register`,
        data,
        fnCallback
    );

}

    return {
        getTop5Nekretnina,
        getMojiUpiti,
        getNekretnina,
        getNextUpiti,
        postLogin: impl_postLogin,
        postLogout: impl_postLogout,
        postRegister: impl_postRegister,
        getKorisnik: impl_getKorisnik,
        getNekretnine: impl_getNekretnine,
    };
})();
