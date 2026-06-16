import csv
import json
import random
from datetime import datetime, timedelta

def get_kpis():
    return [
        {"id": "FIN01", "name": "Service Revenue", "category": "Financial", "unit": "GHSm", "fy25Value": 24400, "lowerThreshold": 23000, "upperThreshold": 26000},
        {"id": "FIN02", "name": "EBITDA", "category": "Financial", "unit": "GHSm", "fy25Value": 14664, "lowerThreshold": 14000, "upperThreshold": 15000},
        {"id": "FIN03", "name": "EBITDA Margin", "category": "Financial", "unit": "%", "fy25Value": 60.1, "lowerThreshold": 58.0, "upperThreshold": 62.0},
        {"id": "FIN04", "name": "PAT", "category": "Financial", "unit": "GHSm", "fy25Value": 8100, "lowerThreshold": 7500, "upperThreshold": 8500},
        {"id": "FIN05", "name": "PAT Margin", "category": "Financial", "unit": "%", "fy25Value": 33.2, "lowerThreshold": 31.0, "upperThreshold": 35.0},
        {"id": "FIN06", "name": "Revenue Growth YoY", "category": "Financial", "unit": "%", "fy25Value": 36.2, "lowerThreshold": 30.0, "upperThreshold": 40.0},
        {"id": "SEG01", "name": "Data Revenue", "category": "Segment", "unit": "GHSm", "fy25Value": 8540, "lowerThreshold": 8000, "upperThreshold": 9000},
        {"id": "SEG03", "name": "MoMo Revenue", "category": "Segment", "unit": "GHSm", "fy25Value": 6000, "lowerThreshold": 5500, "upperThreshold": 6500},
        {"id": "OPS01", "name": "Total Subscribers", "category": "Operational", "unit": "M", "fy25Value": 30.2, "lowerThreshold": 29.0, "upperThreshold": 32.0},
        {"id": "OPS04", "name": "ARPU", "category": "Operational", "unit": "GHS", "fy25Value": 66.9, "lowerThreshold": 64.0, "upperThreshold": 70.0},
        {"id": "OPS07", "name": "4G Coverage", "category": "Operational", "unit": "%", "fy25Value": 99.5, "lowerThreshold": 98.0, "upperThreshold": 100.0},
        {"id": "EXT01", "name": "Inflation", "category": "External", "unit": "%", "fy25Value": 5.4, "lowerThreshold": 4.0, "upperThreshold": 10.0},
        {"id": "EXT02", "name": "BoG Policy Rate", "category": "External", "unit": "%", "fy25Value": 28.0, "lowerThreshold": 25.0, "upperThreshold": 30.0},
        {"id": "EXT03", "name": "Cedi/USD", "category": "External", "unit": "GHS/USD", "fy25Value": 11.6, "lowerThreshold": 11.0, "upperThreshold": 13.0},
    ]

def generate():
    kpis = get_kpis()
    # Add trend24m and currentStatus
    for kpi in kpis:
        kpi['currentStatus'] = random.choice(['Safe', 'Safe', 'Safe', 'Watch', 'Watch', 'Warning'])
        kpi['trend24m'] = [kpi['fy25Value'] * (1 + random.uniform(-0.1, 0.1)) for _ in range(24)]

    # Read scenarios
    scenarios = []
    with open('mtn_scenario_library.csv', 'r') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            if i >= 56: break
            
            pillar_name_map = {
                'Macro & FX': 'A',
                'Regulatory': 'B',
                'Technology': 'C',
                'Competitive': 'D',
                'Operational': 'E',
                'Upside': 'F',
                'Combined': 'A', # fallback
                'Tail Risk': 'G',
                'Financial': 'A'
            }
            pillarName = row['Pillar']
            if pillarName == 'Combined':
                pillarName = 'Macro & FX'
            if pillarName == 'Technology':
                pillarName = 'Tech & Cyber'
            if pillarName == 'Operational':
                pillarName = 'Operational & Climate'
                
            pillar_id = pillar_name_map.get(row['Pillar'], 'A')
            
            def sfloat(val):
                try:
                    return float(val)
                except:
                    return 0.0

            # KPI Impacts
            impacts = []
            if sfloat(row.get('Cedi/USD shock (%)', 0)) != 0: impacts.append({'kpiId': 'EXT03', 'type': 'pct', 'value': sfloat(row['Cedi/USD shock (%)'])})
            if sfloat(row.get('Inflation shock (pp)', 0)) != 0: impacts.append({'kpiId': 'EXT01', 'type': 'delta', 'value': sfloat(row['Inflation shock (pp)'])})
            if sfloat(row.get('Policy rate shock (bps)', 0)) != 0: impacts.append({'kpiId': 'EXT02', 'type': 'delta', 'value': sfloat(row['Policy rate shock (bps)'])/100.0})
            if sfloat(row.get('Service Revenue (% chg)', 0)) != 0: impacts.append({'kpiId': 'FIN01', 'type': 'pct', 'value': sfloat(row['Service Revenue (% chg)'])})
            if sfloat(row.get('EBITDA margin (bps chg)', 0)) != 0: impacts.append({'kpiId': 'FIN03', 'type': 'delta', 'value': sfloat(row['EBITDA margin (bps chg)'])/100.0})
            if sfloat(row.get('ARPU USD (% chg)', 0)) != 0: impacts.append({'kpiId': 'OPS04', 'type': 'pct', 'value': sfloat(row['ARPU USD (% chg)'])})
            if sfloat(row.get('MoMo Revenue (% chg)', 0)) != 0: impacts.append({'kpiId': 'SEG03', 'type': 'pct', 'value': sfloat(row['MoMo Revenue (% chg)'])})
            if sfloat(row.get('Subscribers (% chg)', 0)) != 0: impacts.append({'kpiId': 'OPS01', 'type': 'pct', 'value': sfloat(row['Subscribers (% chg)'])})
            
            scenarios.append({
                "id": row['Scenario ID'],
                "pillar": pillar_id,
                "pillarName": pillarName,
                "type": row['Type'],
                "name": row['Name'],
                "description": row['Trigger Phrase(s)'],
                "severity": random.randint(1, 5),
                "plausibility": random.randint(1, 5),
                "calibrationAnchor": "Historical Volatility",
                "lastCalibrated": "2026-06-01T00:00:00Z",
                "owner": "Risk Team",
                "kpiImpacts": impacts
            })

    # Generate MOCK_FORECAST
    forecast = []
    base_val = 22000
    now = datetime.now()
    for i in range(-90, 31):
        dt = now + timedelta(days=i)
        is_hist = i <= 0
        base_val += random.uniform(-100, 150)
        p50 = base_val
        forecast.append({
            "date": dt.strftime('%Y-%m-%d'),
            "median": p50 if not is_hist else 0,
            "p50": p50,
            "p05": p50 * 0.9 if not is_hist else p50,
            "p95": p50 * 1.1 if not is_hist else p50,
            "isHistorical": is_hist
        })

    # MOCK_MONTE_CARLO
    mc = []
    for kpi in kpis:
        val = kpi['fy25Value']
        mc.append({
            "kpiId": kpi['id'],
            "iterations": 10000,
            "var5": val * 0.8,
            "var50": val,
            "var95": val * 1.2,
            "cvar5": val * 0.75,
            "generatedAt": now.isoformat()
        })

    briefs = [
        {"id": "B01", "title": "Cedi Devaluation Impact", "scenarioIds": ["S01"], "status": "Ready", "generatedAt": "2026-06-05T10:00:00Z", "severityScore": 4.2, "estimatedImpact": {"currency": "GHS", "magnitude": 450, "unit": "M"}, "executiveSummary": "A 25% devaluation of the cedi significantly increases opex and capex costs.", "keyKpiImpacts": [{"kpiId": "FIN02", "narrative": "EBITDA drops 20%"}], "calibrationNotes": "Calibrated against FY22 crisis", "recommendedActions": ["Hedge USD exposure"], "keyEntities": ["BoG", "Ministry of Finance"]},
        {"id": "B02", "title": "Regulatory E-Levy Hike", "scenarioIds": ["S03"], "status": "Ready", "generatedAt": "2026-06-06T11:00:00Z", "severityScore": 3.8, "estimatedImpact": {"currency": "GHS", "magnitude": 250, "unit": "M"}, "executiveSummary": "E-levy increase suppresses MoMo velocity.", "keyKpiImpacts": [{"kpiId": "SEG03", "narrative": "MoMo revenue drops 25%"}], "calibrationNotes": "Calibrated against 2022 implementation", "recommendedActions": ["Launch merchant incentives"], "keyEntities": ["GRA"]},
        {"id": "B03", "title": "Major Cyber Breach", "scenarioIds": ["S06"], "status": "Generating", "generatedAt": "2026-06-10T08:00:00Z", "severityScore": 4.8, "estimatedImpact": {"currency": "GHS", "magnitude": 1.2, "unit": "Bn"}, "executiveSummary": "", "keyKpiImpacts": [], "calibrationNotes": "", "recommendedActions": [], "keyEntities": []},
        {"id": "B04", "title": "Inflation Spike 25%", "scenarioIds": ["S02"], "status": "Ready", "generatedAt": "2026-06-09T09:00:00Z", "severityScore": 3.5, "estimatedImpact": {"currency": "GHS", "magnitude": 150, "unit": "M"}, "executiveSummary": "Inflation reduces real ARPU.", "keyKpiImpacts": [{"kpiId": "OPS04", "narrative": "ARPU drops"}], "calibrationNotes": "", "recommendedActions": ["Adjust tariffs"], "keyEntities": ["NCA"]},
        {"id": "B05", "title": "Data Privacy Fine", "scenarioIds": ["S31"], "status": "Failed", "generatedAt": "2026-06-10T07:00:00Z", "severityScore": 0, "estimatedImpact": {"currency": "GHS", "magnitude": 0, "unit": "M"}, "executiveSummary": "Failed to generate.", "keyKpiImpacts": [], "calibrationNotes": "", "recommendedActions": [], "keyEntities": []},
    ]

    pipeline = {
        "status": "Healthy",
        "lastBeatAt": now.isoformat(),
        "sources": [
            {"name": "MTN Investor Relations", "status": "Healthy", "latencyMs": 150, "lastSyncAt": now.isoformat()},
            {"name": "BoG", "status": "Healthy", "latencyMs": 220, "lastSyncAt": now.isoformat()},
            {"name": "NCA", "status": "Healthy", "latencyMs": 180, "lastSyncAt": now.isoformat()},
            {"name": "GSE", "status": "Degraded", "latencyMs": 850, "lastSyncAt": now.isoformat()},
            {"name": "Anthropic API", "status": "Healthy", "latencyMs": 400, "lastSyncAt": now.isoformat()}
        ]
    }

    # MOCK_QUARTERLY
    quarts = {}
    for kpi in kpis:
        quarts[kpi['id']] = []
        val = kpi['fy25Value'] * 0.5
        for year in range(2020, 2026):
            for q in range(1, 5):
                val = val * random.uniform(0.95, 1.1)
                # FY22 crisis inflection
                if year == 2022 and q >= 3:
                    if kpi['id'] in ['EXT03', 'EXT01']: val *= 1.5
                    elif kpi['id'] in ['FIN01', 'FIN02']: val *= 0.8
                quarts[kpi['id']].append({"quarter": f"FY{str(year)[2:]}Q{q}", "value": val})

    # MOCK_MONTHLY
    months = {}
    for kpi in ['OPS01', 'OPS04', 'EXT01', 'EXT03']:
        months[kpi] = []
        base = next(k['fy25Value'] for k in kpis if k['id'] == kpi) * 0.8
        for i in range(36):
            m_dt = now - timedelta(days=(35-i)*30)
            base = base * random.uniform(0.98, 1.05)
            months[kpi].append({"month": m_dt.strftime('%b %Y'), "value": base})

    with open('frontend/lib/mockData.ts', 'w') as f:
        f.write("import { Kpi, Scenario, ForecastPoint, MonteCarloResult, BoardBrief, PipelineHealth, KpiId } from './types';\n\n")
        f.write(f"export const MOCK_KPIS: Kpi[] = {json.dumps(kpis, indent=2)};\n\n")
        f.write(f"export const MOCK_SCENARIOS: Scenario[] = {json.dumps(scenarios, indent=2)};\n\n")
        f.write(f"export const MOCK_FORECAST: ForecastPoint[] = {json.dumps(forecast, indent=2)};\n\n")
        f.write(f"export const MOCK_MONTE_CARLO: MonteCarloResult[] = {json.dumps(mc, indent=2)};\n\n")
        f.write(f"export const MOCK_BRIEFS: BoardBrief[] = {json.dumps(briefs, indent=2)};\n\n")
        f.write(f"export const MOCK_PIPELINE_HEALTH: PipelineHealth = {json.dumps(pipeline, indent=2)};\n\n")
        f.write(f"export const MOCK_QUARTERLY: Record<KpiId, Array<{{quarter: string; value: number}}>> = {json.dumps(quarts, indent=2)};\n\n")
        f.write(f"export const MOCK_MONTHLY: Record<KpiId, Array<{{month: string; value: number}}>> = {json.dumps(months, indent=2)} as any;\n\n")

if __name__ == '__main__':
    generate()
