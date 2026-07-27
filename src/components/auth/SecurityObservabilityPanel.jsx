import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sliders,
  TrendingUp,
  Database,
  Cpu,
  Zap,
  Server
} from "lucide-react";
import {
  getActivePolicy,
  updatePolicy,
  ingestTelemetryStream,
  recordSecurityMetric,
  getAllStreams,
  getAllMetrics
} from "../../services/SecurityObservabilityService";
import "../../pages/auth/auth.css";

export default function SecurityObservabilityPanel() {
  const [policy, setPolicy] = useState(null);
  const [streams, setStreams] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Policy Form State
  const [otelEndpointUrl, setOtelEndpointUrl] = useState("https://otel.medtrack.internal:4318");
  const [sampleRatePercentage, setSampleRatePercentage] = useState(100);
  const [retentionDays, setRetentionDays] = useState(90);
  const [tracePropagationEnabled, setTracePropagationEnabled] = useState(true);
  const [streamAlertsOnAnomaly, setStreamAlertsOnAnomaly] = useState(true);

  // Ingest Stream Form State
  const [streamSource, setStreamSource] = useState("AUTHENTICATION_SERVICE");
  const [eventType, setEventType] = useState("ACCESS_GRANTED");
  const [payloadSizeBytes, setPayloadSizeBytes] = useState(2048);
  const [throughputMbps, setThroughputMbps] = useState(12.5);
  const [traceMetadata, setTraceMetadata] = useState("");

  const loadObservabilityData = useCallback(async () => {
    setLoading(true);
    try {
      const [pol, streamList, metricList] = await Promise.all([
        getActivePolicy().catch(() => null),
        getAllStreams().catch(() => []),
        getAllMetrics().catch(() => [])
      ]);

      if (pol) {
        setPolicy(pol);
        setOtelEndpointUrl(pol.otelEndpointUrl || "https://otel.medtrack.internal:4318");
        setSampleRatePercentage(pol.sampleRatePercentage || 100);
        setRetentionDays(pol.retentionDays || 90);
        setTracePropagationEnabled(pol.traceContextPropagationEnabled);
        setStreamAlertsOnAnomaly(pol.streamAlertsOnAnomaly);
      }

      setStreams(streamList);
      setMetrics(metricList);
    } catch (err) {
      console.error("Failed to load security observability data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadObservabilityData();
  }, [loadObservabilityData]);

  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const updated = await updatePolicy({
        policyName: "MASTER_OBSERVABILITY_POLICY",
        otelEndpointUrl,
        sampleRatePercentage: Number(sampleRatePercentage),
        retentionDays: Number(retentionDays),
        traceContextPropagationEnabled: tracePropagationEnabled,
        streamAlertsOnAnomaly
      });

      setPolicy(updated);
      setMessage({ type: "success", text: "OpenTelemetry collector settings saved!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update policy." });
    } finaly {
      setActionLoading(false);
    }
  };

  const handleIngestStream = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const ingested = await ingestTelemetryStream({
        streamSource,
        eventType,
        payloadSizeBytes: Number(payloadSizeBytes),
        throughputMbps: Number(throughputMbps),
        traceMetadata: traceMetadata.trim() || undefined
      });

      setTraceMetadata("");
      setMessage({ type: "success", text: `Telemetry Stream Ingested! ID: ${ingested.streamId}` });
      await loadObservabilityData();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to ingest stream." });
    } finally {
      setActionLoading(false);
    }
  };

  const activeStreamsCount = streams.filter((s) => s.streamStatus === "ACTIVE").length;

  return (
    <div className="authority-panel-wrapper">
      {/* Header Card */}
      <header className="authority-header-card">
        <div className="authority-header-main">
          <div className="authority-icon-badge bg-indigo-500/20 text-indigo-400">
            <Radio size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="authority-title">Security Observability & Real-Time Telemetry Stream</h2>
              <span className="authority-ver-badge bg-indigo-500/20 text-indigo-300">
                OPENTELEMETRY ACTIVE: {activeStreamsCount} LIVE STREAMS ({metrics.length} SAMPLED METRICS)
              </span>
            </div>
            <p className="authority-subtitle">
              Distributed tracing, OTel collector metrics, and high-throughput security event stream analytics
            </p>
          </div>
        </div>

        <div className="authority-header-actions">
          <button
            type="button"
            className="authority-btn authority-btn-secondary"
            onClick={loadObservabilityData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Sync Telemetry
          </button>
        </div>
      </header>

      {/* Message Alert */}
      {message.text && (
        <div className={`authority-alert ${message.type === "error" ? "authority-alert-error" : "authority-alert-success"}`}>
          {message.type === "error" ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{message.text}</span>
          <button type="button" className="ml-auto text-xs opacity-70 hover:opacity-100" onClick={() => setMessage({ type: "", text: "" })}>
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stream Ingestion Simulator & OpenTelemetry Settings */}
        <div className="space-y-6 lg:col-span-1">
          {/* Telemetry Stream Ingestion Card */}
          <div className="authority-card">
            <div className="card-header justify-between">
              <div className="flex items-center gap-2">
                <Send size={18} className="text-indigo-400" />
                <h3>Push Telemetry Stream</h3>
              </div>
            </div>

            <form onSubmit={handleIngestStream} className="card-body space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stream Source:</label>
                  <select
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    value={streamSource}
                    onChange={(e) => setStreamSource(e.target.value)}
                  >
                    <option value="AUTHENTICATION_SERVICE">AUTH SERVICE</option>
                    <option value="ZERO_TRUST_PROXY">ZTNA PROXY</option>
                    <option value="KEY_VAULT">KEY VAULT KMS</option>
                    <option value="SCIM_CONNECTOR">SCIM CONNECTOR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Event Type:</label>
                  <select
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                  >
                    <option value="ACCESS_GRANTED">ACCESS GRANTED</option>
                    <option value="ACCESS_DENIED">ACCESS DENIED</option>
                    <option value="SUSPICIOUS_IP_BURST">SUSPICIOUS IP BURST</option>
                    <option value="SECRET_ROTATED">SECRET ROTATED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Payload Size (Bytes):</label>
                  <input
                    type="number"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    value={payloadSizeBytes}
                    onChange={(e) => setPayloadSizeBytes(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Throughput (Mbps):</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    value={throughputMbps}
                    onChange={(e) => setThroughputMbps(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Trace Context Metadata:</label>
                <input
                  type="text"
                  placeholder="e.g. trace_id=8801,span_id=994"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  value={traceMetadata}
                  onChange={(e) => setTraceMetadata(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="authority-btn authority-btn-primary w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs mt-2"
                disabled={actionLoading}
              >
                Stream Telemetry Event
              </button>
            </form>
          </div>

          {/* Policy Settings Card */}
          <div className="authority-card">
            <div className="card-header justify-between">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-indigo-400" />
                <h3>OpenTelemetry Settings</h3>
              </div>
            </div>

            <form onSubmit={handleUpdatePolicy} className="card-body space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">OTel Collector Endpoint:</label>
                <input
                  type="text"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-[11px]"
                  value={otelEndpointUrl}
                  onChange={(e) => setOtelEndpointUrl(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sample Rate (%):</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    value={sampleRatePercentage}
                    onChange={(e) => setSampleRatePercentage(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Retention (Days):</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    value={retentionDays}
                    onChange={(e) => setRetentionDays(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="pt-1 space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                  <span className="text-slate-300 font-semibold">Propagate W3C Trace Context</span>
                  <input
                    type="checkbox"
                    className="rounded text-indigo-500 focus:ring-indigo-500 h-4 w-4"
                    checked={tracePropagationEnabled}
                    onChange={(e) => setTracePropagationEnabled(e.target.checked)}
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                  <span className="text-slate-300 font-semibold">Stream Anomaly Alerts</span>
                  <input
                    type="checkbox"
                    className="rounded text-indigo-500 focus:ring-indigo-500 h-4 w-4"
                    checked={streamAlertsOnAnomaly}
                    onChange={(e) => setStreamAlertsOnAnomaly(e.target.checked)}
                  />
                </label>
              </div>

              <button
                type="submit"
                className="authority-btn authority-btn-secondary w-full text-xs mt-2"
                disabled={actionLoading}
              >
                Save OTel Config
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Telemetry Log Streams & Security Metric Gauges */}
        <div className="authority-card lg:col-span-2 space-y-6">
          {/* Active Telemetry Streams Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio size={18} className="text-indigo-400" /> Active Security Telemetry Streams ({streams.length})
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-800/30">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Stream ID</th>
                    <th className="p-3">Source & Event</th>
                    <th className="p-3">Throughput</th>
                    <th className="p-3">Payload Size</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {streams.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50">
                      <td className="p-3 font-bold text-indigo-300">{s.streamId}</td>
                      <td className="p-3 font-sans">
                        <div className="font-semibold text-white">{s.streamSource}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{s.eventType}</div>
                      </td>
                      <td className="p-3 text-amber-300 font-semibold">{s.throughputMbps} Mbps</td>
                      <td className="p-3 text-slate-400 text-[10px]">{s.payloadSizeBytes} B</td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          {s.streamStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {streams.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500 font-sans">
                        No telemetry event streams active.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sampled Security Metrics */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu size={18} className="text-cyan-400" /> Sampled Security Metric Gauges ({metrics.length})
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-800/30">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Metric Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Sampled Value</th>
                    <th className="p-3">Label Tags</th>
                    <th className="p-3 text-right">Sampled At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {metrics.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 text-[11px]">
                      <td className="p-3 font-bold text-white">{m.metricName}</td>
                      <td className="p-3 font-semibold text-indigo-300">{m.metricCategory}</td>
                      <td className="p-3 font-bold text-emerald-400">{m.metricValue} {m.unit}</td>
                      <td className="p-3 text-slate-400 text-[10px]">{m.labelTags}</td>
                      <td className="p-3 text-right text-slate-400 text-[10px]">
                        {m.sampledAt ? new Date(m.sampledAt).toLocaleTimeString() : "Just now"}
                      </td>
                    </tr>
                  ))}
                  {metrics.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500 font-sans">
                        No security metric points sampled yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
