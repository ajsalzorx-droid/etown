const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const reservationForm = document.querySelector(".reservation-form");
const formStatus = document.querySelector(".form-status");
const dateInput = document.querySelector('input[type="date"]');

if (dateInput) {
  dateInput.min = new Date().toISOString().slice(0, 10);
}

navToggle?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    siteNav.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  }
});

reservationForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(reservationForm);
  const name = data.get("name") || "Guest";
  formStatus.textContent = `Thanks, ${name}. Your booking request is ready to confirm by phone.`;
  reservationForm.reset();
  if (dateInput) {
    dateInput.min = new Date().toISOString().slice(0, 10);
  }
});
