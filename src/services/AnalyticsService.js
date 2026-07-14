import API from "./HttpService";

// Fetch hospital analytics metrics
export const getHospitalAnalytics = async () => {
  const response = await API.get("/api/analytics/hospital");
  return response.data;
};
