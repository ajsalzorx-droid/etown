const SUPABASE_URL = "https://ofhubsvxejvlrcnwpsqw.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9maHVic3Z4ZWp2bHJjbndwc3F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMjkyNjYsImV4cCI6MjA5NzYwNTI2Nn0.nKmZbHMdPTfVGBnk5Ytps0-H6tCwL5NTQxiGfJQIYvw";
const BOOKINGS_KEY = "etownBookings";
const BOOKINGS_ENDPOINT = `${SUPABASE_URL}/rest/v1/bookings`;

const supabaseHeaders = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

const readLocalBookings = () => JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
const writeLocalBookings = (bookings) => localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

const fromSupabaseBooking = (booking) => ({
  id: booking.id,
  name: booking.name || "",
  phone: booking.phone || "",
  date: booking.booking_date || "",
  time: booking.booking_time ? booking.booking_time.slice(0, 5) : "",
  guests: String(booking.guests || "1"),
  notes: booking.notes || "",
  status: booking.status || "New",
  createdAt: booking.created_at || "",
});

const toSupabaseBooking = (booking) => ({
  id: booking.id,
  name: booking.name,
  phone: booking.phone,
  booking_date: booking.date || null,
  booking_time: booking.time || null,
  guests: Number(booking.guests || 1),
  notes: booking.notes,
  status: booking.status,
  created_at: booking.createdAt,
});

const supabaseRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...supabaseHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

const listBookings = async () => {
  try {
    const bookings = await supabaseRequest(`${BOOKINGS_ENDPOINT}?select=*&order=created_at.desc`);
    return {
      bookings: bookings.map(fromSupabaseBooking),
      source: "Supabase",
    };
  } catch (error) {
    console.warn("Using local booking fallback:", error.message);
    return {
      bookings: readLocalBookings(),
      source: "Local fallback",
    };
  }
};

const createBooking = async (booking) => {
  try {
    const saved = await supabaseRequest(BOOKINGS_ENDPOINT, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(toSupabaseBooking(booking)),
    });
    return {
      booking: fromSupabaseBooking(saved[0]),
      source: "Supabase",
    };
  } catch (error) {
    console.warn("Saving booking locally:", error.message);
    const bookings = readLocalBookings();
    bookings.unshift(booking);
    writeLocalBookings(bookings);
    return {
      booking,
      source: "Local fallback",
    };
  }
};

const updateBookingStatus = async (id, status) => {
  try {
    await supabaseRequest(`${BOOKINGS_ENDPOINT}?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ status }),
    });
    return "Supabase";
  } catch (error) {
    console.warn("Updating booking locally:", error.message);
    writeLocalBookings(
      readLocalBookings().map((booking) => (booking.id === id ? { ...booking, status } : booking))
    );
    return "Local fallback";
  }
};

const deleteBooking = async (id) => {
  try {
    await supabaseRequest(`${BOOKINGS_ENDPOINT}?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });
    return "Supabase";
  } catch (error) {
    console.warn("Deleting booking locally:", error.message);
    writeLocalBookings(readLocalBookings().filter((booking) => booking.id !== id));
    return "Local fallback";
  }
};

const clearBookings = async () => {
  try {
    await supabaseRequest(`${BOOKINGS_ENDPOINT}?id=neq.__none__`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });
    return "Supabase";
  } catch (error) {
    console.warn("Clearing local bookings:", error.message);
    localStorage.removeItem(BOOKINGS_KEY);
    return "Local fallback";
  }
};

window.EtownBookings = {
  createBooking,
  clearBookings,
  deleteBooking,
  listBookings,
  updateBookingStatus,
};
