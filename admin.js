const bookingsTable = document.querySelector("[data-bookings]");
const emptyState = document.querySelector("[data-empty]");
const searchInput = document.querySelector("[data-search]");
const filterInput = document.querySelector("[data-filter]");
const exportButton = document.querySelector("[data-export]");
const clearButton = document.querySelector("[data-clear]");
const sourceLabel = document.querySelector("[data-source]");

let allBookings = [];
let activeSource = "Supabase";

const escapeHtml = (value) =>
  String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-AE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const updateSource = () => {
  sourceLabel.textContent = `Data source: ${activeSource}`;
};

const updateStats = () => {
  document.querySelector('[data-stat="total"]').textContent = allBookings.length;
  document.querySelector('[data-stat="new"]').textContent = allBookings.filter((booking) => booking.status === "New").length;
  document.querySelector('[data-stat="confirmed"]').textContent = allBookings.filter((booking) => booking.status === "Confirmed").length;
  document.querySelector('[data-stat="cancelled"]').textContent = allBookings.filter((booking) => booking.status === "Cancelled").length;
};

const getVisibleBookings = () => {
  const query = searchInput.value.trim().toLowerCase();
  const status = filterInput.value;

  return allBookings.filter((booking) => {
    const matchesStatus = status === "All" || booking.status === status;
    const matchesSearch = `${booking.name} ${booking.phone}`.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });
};

const renderBookings = () => {
  const bookings = getVisibleBookings();
  updateStats();
  updateSource();
  emptyState.hidden = bookings.length > 0;

  bookingsTable.innerHTML = bookings
    .map(
      (booking) => `
        <tr>
          <td>
            <strong>${escapeHtml(booking.name) || "-"}</strong>
            <small>${escapeHtml(booking.id)}</small>
          </td>
          <td><a href="tel:${escapeHtml(booking.phone)}">${escapeHtml(booking.phone) || "-"}</a></td>
          <td>${formatDate(booking.date)}</td>
          <td>${escapeHtml(booking.time) || "-"}</td>
          <td>${escapeHtml(booking.guests) || "-"}</td>
          <td>
            <select data-status="${escapeHtml(booking.id)}">
              <option value="New" ${booking.status === "New" ? "selected" : ""}>New</option>
              <option value="Confirmed" ${booking.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
              <option value="Cancelled" ${booking.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
            </select>
          </td>
          <td>${escapeHtml(booking.notes) || "-"}</td>
          <td><button class="table-action" type="button" data-delete="${escapeHtml(booking.id)}">Delete</button></td>
        </tr>
      `
    )
    .join("");
};

const loadBookings = async () => {
  sourceLabel.textContent = "Loading bookings...";
  const result = await window.EtownBookings.listBookings();
  allBookings = result.bookings;
  activeSource = result.source;
  renderBookings();
};

bookingsTable.addEventListener("change", async (event) => {
  const statusSelect = event.target.closest("[data-status]");
  if (!statusSelect) return;

  activeSource = await window.EtownBookings.updateBookingStatus(statusSelect.dataset.status, statusSelect.value);
  allBookings = allBookings.map((booking) =>
    booking.id === statusSelect.dataset.status ? { ...booking, status: statusSelect.value } : booking
  );
  renderBookings();
});

bookingsTable.addEventListener("click", async (event) => {
  const deleteButton = event.target.closest("[data-delete]");
  if (!deleteButton) return;

  activeSource = await window.EtownBookings.deleteBooking(deleteButton.dataset.delete);
  allBookings = allBookings.filter((booking) => booking.id !== deleteButton.dataset.delete);
  renderBookings();
});

searchInput.addEventListener("input", renderBookings);
filterInput.addEventListener("change", renderBookings);

exportButton.addEventListener("click", () => {
  const rows = [["ID", "Name", "Phone", "Date", "Time", "Guests", "Status", "Notes"]];
  allBookings.forEach((booking) => {
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

clearButton.addEventListener("click", async () => {
  if (!confirm("Clear all bookings?")) return;
  activeSource = await window.EtownBookings.clearBookings();
  allBookings = [];
  renderBookings();
});

loadBookings();
