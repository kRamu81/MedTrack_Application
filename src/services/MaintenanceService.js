import API from "./HttpService";

export const getAllTasks = async (technicianId) => {
  const url = technicianId
    ? `/api/maintenance?technicianId=${technicianId}`
    : "/api/maintenance";

  try {
    const response = await API.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch maintenance tasks:", error);
    throw error;
  }
};
export const getTaskById = async (id) => {
  try {
    const response = await API.get(`/api/maintenance/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch maintenance task:", error);
    throw error;
  }
};

export const scheduleTask = async (data) => {
  try {
    const response = await API.post("/api/maintenance", data);
    return response.data;
  } catch (error) {
    console.error("Failed to schedule maintenance task:", error);
    throw error;
  }
};


export const updateTask = async (id, data) => {
  try {
    const response = await API.put(`/api/maintenance/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to update maintenance task:", error);
    throw error;
  }
};

// Export all tasks to iCal .ics file format
export const exportTasksToICal = async () => {
  const response = await API.get("/api/maintenance/export/calendar.ics", {
    responseType: "text",
  });
  return response.data;
};
