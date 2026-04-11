window.onload = function () {

    let dugme =
        document.getElementById("dugme");
    dugme.onclick = function () {
        let ime =
            document.getElementById("ime").value;

        let prezime =
            document.getElementById("prezime").value;

        let username =
            document.getElementById("username").value;

        let password =
            document.getElementById("password").value;

        PoziviAjax.postRegister(
            {
                ime,
                prezime,
                username,
                password
            },
            function (err, data) {
                let div =
                  document.getElementById("areaBelow");
                if (err) {
                    div.innerHTML =
                    "<h3>Greška: " + err + "</h3>";
                    return;
                }
                let message =
                  JSON.parse(data);
                div.innerHTML =
                  "<h3>" +
                  message.poruka +
                  "</h3>";
                if (
                  message.poruka ===
                  "Registracija uspješna"
                ) {
                    setTimeout(() => {
                        window.location.href =
                        "/prijava.html";
                    }, 1500);
                }
            }
        );
    };
};