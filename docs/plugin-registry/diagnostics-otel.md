---
title: Diagnostics (OpenTelemetry) Plugin
sidebarTitle: Diagnostics OTEL
description: Observability and tracing using @elizaos/plugin-diagnostics-otel.
---

Adds OpenTelemetry-based observability to your agent runtime, including distributed tracing, metrics, and log export.

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-diagnostics-otel` |
| Feature flag | `features.diagnosticsOtel` |

## Configuration

```json
{
  "features": {
    "diagnosticsOtel": true
  }
}
```

Configure the OTEL exporter via standard OpenTelemetry environment variables:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=milady
```

## Related

- [REST diagnostics endpoint](/rest/diagnostics) -- runtime diagnostics API
- [Logs guide](/advanced/logs) -- logging configuration
