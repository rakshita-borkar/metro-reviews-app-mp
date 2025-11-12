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
  // DRF viewsets return paginated results, so check if it's paginated
  return res.data.results || res.data;
};

// ---------- Reviews ----------
export const getReviews = async (stationId, limit = null, offset = 0) => {
  let url = `${API_URL}/reviews/?station=${stationId}`;
  if (limit) {
    url += `&limit=${limit}&offset=${offset}`;
  }
  const res = await axios.get(url, {
    headers: getAuthHeaders(),
  });
  // Return full response object if paginated, or plain array
  if (res.data.results !== undefined) {
    return res.data; // Return full pagination object
  }
  return res.data; // Return plain array
};

export const submitReview = async (stationId, rating, text) => {
  const res = await axios.post(
    `${API_URL}/reviews/`,
    { station: stationId, rating, text },  // now rating is accepted
    { headers: getAuthHeaders() }
  );
  return res.data;
};

export const deleteReview = async (reviewId) => {
  const res = await axios.delete(`${API_URL}/reviews/${reviewId}/`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};


// ---------- Stats (ABSA + rating aggregation) ----------
export const getStationStats = async (stationId) => {
  const res = await axios.get(`${API_URL}/stations/${stationId}/stats/`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await axios.get(`${API_URL}/auth/whoami/`, { headers: getAuthHeaders() });
  // return an object with username and is_staff to allow frontend to make permission decisions
  if (!res.data) return null;
  return {
    username: res.data.username || null,
    is_staff: !!res.data.is_staff,
  };
};
