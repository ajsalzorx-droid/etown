const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const reservationForm = document.querySelector(".reservation-form");
const formStatus = document.querySelector(".form-status");
const dateInput = document.querySelector('input[type="date"]');
const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));
const heroDots = Array.from(document.querySelectorAll(".hero-dots span"));
const BOOKINGS_KEY = "etownBookings";

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

if (heroSlides.length > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let activeSlide = 0;

  window.setInterval(() => {
    heroSlides[activeSlide].classList.remove("is-active");
    heroDots[activeSlide]?.classList.remove("is-active");
    activeSlide = (activeSlide + 1) % heroSlides.length;
    heroSlides[activeSlide].classList.add("is-active");
    heroDots[activeSlide]?.classList.add("is-active");
  }, 4200);
}

reservationForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(reservationForm);
  const name = data.get("name") || "Guest";
  const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
  const booking = {
    id: `ET-${Date.now()}`,
    name: String(name),
    phone: String(data.get("phone") || ""),
    date: String(data.get("date") || ""),
    time: String(data.get("time") || ""),
    guests: String(data.get("guests") || "1"),
    notes: String(data.get("notes") || ""),
    status: "New",
    createdAt: new Date().toISOString(),
  };

  bookings.unshift(booking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  formStatus.textContent = `Thanks, ${name}. Your booking request has been saved. We will confirm by phone.`;
  reservationForm.reset();
  if (dateInput) {
    dateInput.min = new Date().toISOString().slice(0, 10);
  }
});
