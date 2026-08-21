# MTN QuantRisk — Monitoring

Prometheus + Grafana observability for the API (audit finding H11 / TD-09).

## Metrics endpoint

The backend exposes a zero-dependency Prometheus text-format endpoint at
`GET /metrics` (intentionally public — no auth — so scrapers can poll it).
It is served by `backend/app/core/metrics.py`.

### Exported metrics

| Metric | Type | Labels | Description |
|---|---|---|---|
| `quantrisk_http_requests_total` | counter | path, method, status | Total HTTP requests |
| `quantrisk_http_request_duration_seconds` | histogram | path | Request latency (bucketed) |
| `quantrisk_scrape_runs_total` | counter | — | Scheduler scrape run count |
| `quantrisk_scrape_new_articles_total` | counter | — | Articles stored across all runs |
| `quantrisk_scrape_last_success_timestamp` | gauge | — | Epoch seconds of last successful scrape |
| `quantrisk_scheduler_status` | gauge | — | 1 if scheduler healthy, 0 otherwise |

Dynamic path segments (`/api/news/{id}`) are collapsed to `:id` to keep label
cardinality bounded.

## Scraping with Prometheus

Add this scrape job to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: quantrisk
    metrics_path: /metrics
    static_configs:
      - targets: ["host.docker.internal:8001"]  # or your backend host:port
```

## Grafana dashboard

Import `infrastructure/monitoring/grafana-dashboard.json` into Grafana
(Dashboards → New → Import → upload the JSON). It ships panels for:

- Request rate by path (req/s)
- Error rate (5xx / total)
- p95 latency by path
- Scrape run count
- New articles stored per minute
- Time since last successful scrape
- Scheduler status gauge

Point the dashboard's `datasource` template variable at your Prometheus instance.
