import API from "./HttpService";

// Get active compliance evidence policy settings
export const getActivePolicy = async () => {
  const response = await API.get("/api/auth/evidence/policy");
  return response.data;
};

// Update compliance evidence policy settings
export const updatePolicy = async (data) => {
  const response = await API.put("/api/auth/evidence/policy", data);
  return response.data;
};

// Ingest a new immutable compliance evidence record into WORM vault
export const ingestEvidenceRecord = async (data) => {
  const response = await API.post("/api/auth/evidence/records/ingest", data);
  return response.data;
};

// Verify cryptographic hash block integrity for an evidence item
export const verifyEvidenceChain = async (data) => {
  const response = await API.post("/api/auth/evidence/chain/verify", data);
  return response.data;
};

// Get all ingested compliance evidence records
export const getAllRecords = async () => {
  const response = await API.get("/api/auth/evidence/records");
  return response.data;
};

// Get all cryptographic audit chain block logs
export const getAllChainLogs = async () => {
  const response = await API.get("/api/auth/evidence/chain/logs");
  return response.data;
};
