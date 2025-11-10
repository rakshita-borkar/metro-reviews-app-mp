import axios from "axios";

const API_URL = "http://localhost:8000/api"; // Django backend

// Attach JWT token if present
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ---------- Auth ----------
export const registerUser = async (username, password) => {
  const res = await axios.post(`${API_URL}/auth/register/`, { username, password });
  return res.data;
};

export const loginUser = async (username, password) => {
  const res = await axios.post(`${API_URL}/auth/login/`, { username, password });
  localStorage.setItem("token", res.data.access); // save JWT
  return res.data;
};

// ---------- Stations ----------
export const getStations = async () => {
  const res = await axios.get(`${API_URL}/stations/`, { headers: getAuthHeaders() });
  return res.data;
};

// ---------- Reviews ----------
export const getReviews = async (stationId) => {
  const res = await axios.get(`${API_URL}/reviews/?station=${stationId}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const submitReview = async (stationId, rating, text) => {
  const res = await axios.post(
    `${API_URL}/reviews/`,
    { station: stationId, rating, text },  // now rating is accepted
    { headers: getAuthHeaders() }
  );
  return res.data;
};


// ---------- Stats (ABSA + rating aggregation) ----------
export const getStationStats = async (stationId) => {
  const res = await axios.get(`${API_URL}/stations/${stationId}/stats/`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};
