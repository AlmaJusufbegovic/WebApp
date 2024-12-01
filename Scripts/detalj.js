document.addEventListener("DOMContentLoaded", () => {
    const prikaz = document.querySelector("#upiti");
    const sviUpiti = Array.from(document.querySelectorAll(".upit"));

    const carousel = postaviCarousel(prikaz, sviUpiti);

    if (carousel) {
        document.querySelector("#prev-btn").addEventListener("click", carousel.fnLijevo);
        document.querySelector("#next-btn").addEventListener("click", carousel.fnDesno);
    } else {
        console.error("Carousel nije pravilno postavljen. Provjerite ulazne podatke.");
    }
});
