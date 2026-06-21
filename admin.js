const BOOKINGS_KEY = "etownBookings";
const bookingsTable = document.querySelector("[data-bookings]");
const emptyState = document.querySelector("[data-empty]");
const searchInput = document.querySelector("[data-search]");
const filterInput = document.querySelector("[data-filter]");
const exportButton = document.querySelector("[data-export]");
const clearButton = document.querySelector("[data-clear]");

const getBookings = () => JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
const setBookings = (bookings) => localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-AE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const updateStats = (bookings) => {
  document.querySelector('[data-stat="total"]').textContent = bookings.length;
  document.querySelector('[data-stat="new"]').textContent = bookings.filter((booking) => booking.status === "New").length;
  document.querySelector('[data-stat="confirmed"]').textContent = bookings.filter((booking) => booking.status === "Confirmed").length;
  document.querySelector('[data-stat="cancelled"]').textContent = bookings.filter((booking) => booking.status === "Cancelled").length;
};

const getVisibleBookings = () => {
  const query = searchInput.value.trim().toLowerCase();
  const status = filterInput.value;

  return getBookings().filter((booking) => {
    const matchesStatus = status === "All" || booking.status === status;
    const matchesSearch = `${booking.name} ${booking.phone}`.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });
};

const renderBookings = () => {
  const allBookings = getBookings();
  const bookings = getVisibleBookings();
  updateStats(allBookings);
  emptyState.hidden = bookings.length > 0;

  bookingsTable.innerHTML = bookings
    .map(
      (booking) => `
        <tr>
          <td>
            <strong>${booking.name || "-"}</strong>
            <small>${booking.id}</small>
          </td>
          <td><a href="tel:${booking.phone}">${booking.phone || "-"}</a></td>
          <td>${formatDate(booking.date)}</td>
          <td>${booking.time || "-"}</td>
          <td>${booking.guests || "-"}</td>
          <td>
            <select data-status="${booking.id}">
              <option value="New" ${booking.status === "New" ? "selected" : ""}>New</option>
              <option value="Confirmed" ${booking.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
              <option value="Cancelled" ${booking.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
            </select>
          </td>
          <td>${booking.notes || "-"}</td>
          <td><button class="table-action" type="button" data-delete="${booking.id}">Delete</button></td>
        </tr>
      `
    )
    .join("");
};

bookingsTable.addEventListener("change", (event) => {
  const statusSelect = event.target.closest("[data-status]");
  if (!statusSelect) return;

  const bookings = getBookings().map((booking) =>
    booking.id === statusSelect.dataset.status ? { ...booking, status: statusSelect.value } : booking
  );
  setBookings(bookings);
  renderBookings();
});

bookingsTable.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete]");
  if (!deleteButton) return;

  setBookings(getBookings().filter((booking) => booking.id !== deleteButton.dataset.delete));
  renderBookings();
});

searchInput.addEventListener("input", renderBookings);
filterInput.addEventListener("change", renderBookings);

exportButton.addEventListener("click", () => {
  const rows = [["ID", "Name", "Phone", "Date", "Time", "Guests", "Status", "Notes"]];
  getBookings().forEach((booking) => {
    rows.push([booking.id, booking.name, booking.phone, booking.date, booking.time, booking.guests, booking.status, booking.notes]);
  });

  const csv = rows.map((row) => row.map((cell) => `"${String(cell || "").replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "etown-bookings.csv";
  link.click();
  URL.revokeObjectURL(link.href);
});

clearButton.addEventListener("click", () => {
  if (!confirm("Clear all bookings from this browser?")) return;
  localStorage.removeItem(BOOKINGS_KEY);
  renderBookings();
});

renderBookings();
