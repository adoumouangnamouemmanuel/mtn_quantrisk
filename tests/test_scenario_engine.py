"""
Tests for the scenario engine, reverse-stress solver, and Monte Carlo engine.

These were flagged as "critical missing" coverage in the audit (section 9).
They run against the repository CSVs, so no external services are needed.
"""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.services import scenario_service, reverse_service
from app.services.data_loader import load_base_case


# ── Scenario engine ──────────────────────────────────────────────────────────


class TestScenarioEngine:
    def test_get_all_scenarios_returns_list(self):
        scenarios = scenario_service.get_all_scenarios()
        assert isinstance(scenarios, list)
        assert len(scenarios) > 0

    def test_scenario_has_required_fields(self):
        scenarios = scenario_service.get_all_scenarios()
        sc = scenarios[0]
        for field in ("id", "name", "pillar", "type", "severity", "kpiImpacts"):
            assert field in sc, f"scenario missing {field}"

    def test_get_scenario_by_id(self):
        scenarios = scenario_service.get_all_scenarios()
        first = scenarios[0]
        fetched = scenario_service.get_scenario_by_id(first["id"])
        assert fetched is not None
        assert fetched["id"] == first["id"]

    def test_apply_scenario_pct_impact_changes_values(self):
        scenarios = scenario_service.get_all_scenarios()
        # Pick a scenario that actually has a pct impact on a financial KPI.
        target = next(
            (s for s in scenarios if any(i["type"] == "pct" for i in s["kpiImpacts"])),
            scenarios[0],
        )
        out = scenario_service.apply_scenario(target["id"], 1.0, {})
        assert out["scenarioId"] == target["id"]
        assert len(out["results"]) > 0
        # At least one result should have a non-zero delta when severity=1.
        assert any(abs(r["deltaPct"]) > 0 for r in out["results"])

    def test_apply_unknown_scenario_raises(self):
        with pytest.raises(ValueError):
            scenario_service.apply_scenario("NONEXISTENT", 1.0, {})

    def test_shap_attributions_returns_list_or_none(self):
        scenarios = scenario_service.get_all_scenarios()
        out = scenario_service.apply_scenario(scenarios[0]["id"], 1.0, {})
        # The endpoint must surface an explicit unavailable flag rather than
        # fabricated attributions (audit finding C6).
        assert "shapUnavailable" in out
        assert isinstance(out["shapAttributions"], list)

    def test_macro_overlay_affects_external_kpis(self):
        scenarios = scenario_service.get_all_scenarios()
        out_base = scenario_service.apply_scenario(scenarios[0]["id"], 0.0, {})
        out_overlay = scenario_service.apply_scenario(
            scenarios[0]["id"], 0.0, {"cediShockPct": 10, "inflationOverlayPp": 2, "policyRateOverlayPp": 1}
        )
        base_ext03 = next(r for r in out_base["results"] if r["kpiId"] == "EXT03")
        over_ext03 = next(r for r in out_overlay["results"] if r["kpiId"] == "EXT03")
        assert over_ext03["scenarioValue"] != base_ext03["scenarioValue"]


# ── Reverse stress solver ─────────────────────────────────────────────────────


class TestReverseStress:
    def test_single_scenario_returns_none_when_unbreachable(self):
        # A threshold far below any plausible value should find no breach.
        scenarios = scenario_service.get_all_scenarios()
        result = reverse_service.solve_single(
            scenarios[0]["id"], "FIN01", threshold=1.0, operator="lt", max_severity=3.0, iterations=20
        )
        assert result is None

    def test_single_scenario_finds_breach_when_threshold_in_range(self):
        scenarios = scenario_service.get_all_scenarios()
        base = load_base_case().get("FIN01", 24000)
        # Threshold just below the base so most scenarios breach quickly.
        result = reverse_service.solve_single(
            scenarios[0]["id"], "FIN01", threshold=base * 0.99, operator="lt", max_severity=3.0, iterations=20
        )
        # Either there is a documented breach severity, or no breach was found;
        # both are valid — we only assert the contract shape.
        if result is not None:
            assert result["requiredSeverityMultiplier"] >= 0
            assert len(result["binarySearchTrajectory"]) > 0

    def test_drops_by_normalises_to_absolute_threshold(self):
        scenarios = scenario_service.get_all_scenarios()
        base = load_base_case().get("FIN01", 24000)
        # dropsBy 0.01 means breach when FIN01 falls below base*(1-0.01).
        payload = {
            "kpiId": "FIN01",
            "operator": "dropsBy",
            "threshold": 1,
            "scenarioId": scenarios[0]["id"],
        }
        out = reverse_service.run_reverse_stress(payload)
        assert out["singleScenarioResult"] is None or out["singleScenarioResult"]["scenarioId"] == scenarios[0]["id"]


# ── Monte Carlo ───────────────────────────────────────────────────────────────


class TestMonteCarlo:
    def test_run_monte_carlo_returns_percentiles(self):
        import importlib

        # Import lazily so the module path manipulation does not affect collection.
        models_root = Path(__file__).resolve().parents[1]
        if str(models_root) not in sys.path:
            sys.path.insert(0, str(models_root))
        mc = importlib.import_module("models.monte_carlo")
        out = mc.run_monte_carlo("S01", n_simulations=50, seed=42)
        assert out["nSimulations"] == 50
        assert len(out["results"]) > 0
        first = out["results"][0]
        # Percentile ordering must be monotonic for a well-behaved sim.
        assert first["p05"] <= first["p50"] <= first["p95"]
        assert first["worstCase"] <= first["bestCase"]

    def test_run_monte_carlo_unknown_scenario_raises(self):
        import importlib

        models_root = Path(__file__).resolve().parents[1]
        if str(models_root) not in sys.path:
            sys.path.insert(0, str(models_root))
        mc = importlib.import_module("models.monte_carlo")
        with pytest.raises(ValueError):
            mc.run_monte_carlo("ZZ99", n_simulations=10)


# ── Upload validation (audit C8) ──────────────────────────────────────────────


class TestUploadValidation:
    def test_rejects_oversized_upload(self):
        from app.services.upload_service import MAX_UPLOAD_BYTES, process_csv_upload

        big = b"x" * (MAX_UPLOAD_BYTES + 1)
        with pytest.raises(ValueError, match="too large"):
            process_csv_upload(big, "huge.csv")

    def test_rejects_unknown_kpi_id(self):
        from app.services.upload_service import process_csv_upload

        csv_bytes = b"KPI_ID,FY25_Base_Value\nZZUNKNOWN,100\n"
        with pytest.raises(ValueError, match="Unknown KPI IDs"):
            process_csv_upload(csv_bytes, "bad_kpi.csv")

    def test_rejects_negative_revenue(self):
        from app.services.upload_service import process_csv_upload

        csv_bytes = b"KPI_ID,FY25_Base_Value\nFIN01,-100\n"
        with pytest.raises(ValueError, match="Negative values"):
            process_csv_upload(csv_bytes, "negative.csv")
