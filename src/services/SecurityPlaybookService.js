import API from "./HttpService";

// Get active security playbook policy
export const getActivePolicy = async () => {
  const response = await API.get("/api/auth/playbook/policy");
  return response.data;
};

// Update security playbook policy settings
export const updatePolicy = async (data) => {
  const response = await API.put("/api/auth/playbook/policy", data);
  return response.data;
};

// Trigger and execute an automated security containment playbook
export const triggerPlaybookExecution = async (data) => {
  const response = await API.post("/api/auth/playbook/trigger", data);
  return response.data;
};

// Record step-by-step action result for an active playbook execution
export const recordPlaybookStep = async (data) => {
  const response = await API.post("/api/auth/playbook/steps/record", data);
  return response.data;
};

// Get all historical automated playbook runs
export const getAllExecutions = async () => {
  const response = await API.get("/api/auth/playbook/executions");
  return response.data;
};

// Get step action logs for a specific execution ID
export const getStepsByExecutionId = async (executionId) => {
  const response = await API.get(`/api/auth/playbook/steps/${executionId}`);
  return response.data;
};
