# MTN QuantRisk Intelligence Platform: User Guide

Welcome to the **MTN QuantRisk Intelligence Platform**. This guide is designed for analysts, executives, and stakeholders who are new to the platform. It explains the purpose, features, and functionality of every single page on the dashboard in plain, easy-to-understand language.

---

## What is this Platform?
The MTN QuantRisk Intelligence Platform is an AI-powered risk detection and simulation dashboard. It tracks critical business metrics (KPIs) in real-time, projects how they will behave in the future, and lets you "stress test" the business against dozens of hypothetical risk scenarios (like severe economic downturns, cyberattacks, or competitive shifts) to see what the financial and operational impact would be.

---

## 1. Authentication & Profile
### Login Page
When you first open the platform, you will land on the **Login Page**. 
- **Purpose**: Authenticates secure access to the enterprise dashboard.
- **Features**: Allows you to sign in via your MTN Analyst email and password or securely bypass with the "Sign in with MTN SSO" button.

### User Profile & Notifications (Top Navigation)
At the very top of your screen inside the app, you have the **Topbar**.
- **Search**: A universal search bar to quickly find specific KPIs (e.g., "FIN01") or Scenarios (e.g., "Macro").
- **Pipeline Status**: Shows a green "Pipeline: Healthy" badge if all data feeds are up and running.
- **Notifications Bell**: Click the bell icon to see a dropdown feed of automated alerts. It will tell you if a new scenario run is complete, if a KPI threshold breached, or if a new board brief is ready.
- **Profile Icon**: Click your avatar on the top right to access account settings, access credentials, and the Sign Out button.

---

## 2. Core (Monitoring the Present)

The "Core" section gives you an immediate pulse on the business's current health through live monitoring of Key Performance Indicators (KPIs).

### Core Anchors (`/dashboard`)
- **What it is**: The main homepage and executive dashboard.
- **What it shows**: Displays 14 foundational KPIs broken down into 4 main categories: 
  - **Financial** (e.g., Revenue, EBITDA)
  - **Segment** (e.g., Mobile Money performance)
  - **Operational** (e.g., Network uptime)
  - **External** (e.g., FX rates, Inflation)
- **How to use it**: Each metric is displayed on a tile showing the current value against its FY25 base case. The tiles will change color (Safe, Watch, Warning, Critical) based on how close the metric is to breaching its safe operating limits.

### Full KRI Book (`/kri-register`)
- **What it is**: The complete dictionary of Key Risk Indicators (KRIs).
- **What it shows**: A comprehensive list detailing exactly what every metric means, the unit of measurement (e.g., %, GHSm), the safe thresholds, and the historical trend data.
- **How to use it**: Use this page as a reference manual if you are unsure what a specific acronym (like "FIN01") means or what the acceptable operating ranges are.

### Quarterly & Monthly Trends (`/quarterly` & `/monthly`)
- **What it is**: Aggregated historical reports.
- **What it shows**: Roll-ups of KPI performance looking backwards. 
- **How to use it**: Use these to analyze past performance over a fixed period to establish baselines before looking at future forecasts.

---

## 3. Intelligence (Looking Forward)

The Intelligence section uses AI to predict the future based on the data we have today, and generates automated written summaries for executives.

### Predictive (90d) (`/forecasts`)
- **What it is**: A machine-learning powered forecasting tool.
- **What it shows**: Projects how your KPIs are expected to perform over the next 90 days if business continues as usual.
- **How to use it**: It shows a median projection line alongside confidence intervals (P05 and P95). Use this to see if the business is organically drifting towards a "Warning" or "Critical" state without any new external shocks.

### Board Briefs (`/briefs`)
- **What it is**: An automated executive summary generator.
- **What it shows**: It takes the complex mathematical outputs of risk scenarios and translates them into plain-English documents.
- **How to use it**: When you need to report to the board of directors, you can view or generate a brief. It includes an Executive Summary, Estimated Financial Impact in GHS, Key KPI Impacts, and Recommended Actions.

---

## 4. Advanced Modeling (Stress Testing & What-Ifs)

This is the most powerful section of the platform. It allows you to simulate hypothetical disasters or economic shocks to see how resilient MTN Ghana is.

### Stress Tester (`/scenarios`)
- **What it is**: The single-scenario simulation engine.
- **What it shows**: Allows you to pick one of 56 predefined risk scenarios (e.g., "Severe Cedi Depreciation", "Major Telecom Outage") and simulate it.
- **How to use it**:
  - **Macro Overlays**: You can manually tweak the severity, Cedi shock percentage, inflation, and policy rates using sliders.
  - **Run Simulation**: Click "Run Simulation" to execute a Monte Carlo calculation.
  - **Results**: It generates a **Waterfall Chart** that visually explains *why* a metric dropped (showing the starting value, the impact of the shock, and the final value). It also shows "SHAP Attributions," which are AI generated insights explaining the exact driving factors behind the risk.

### Scenario Compare (`/compare`)
- **What it is**: A side-by-side comparison tool for multiple risks.
- **What it shows**: Pits two different scenarios against each other to see which is more destructive.
- **How to use it**: Select Scenario A (e.g., "Cyber Ransomware") and Scenario B (e.g., "Competitor Price War"). The platform will generate a Comparison Table showing exactly which KPIs are hit hardest by A versus B, explicitly highlighting the "Worse Of" the two.

### Reverse Stress (`/reverse`)
- **What it is**: Working backward to find the breaking point of the business.
- **What it shows**: Instead of asking "What happens if a shock occurs?", Reverse Stress Testing asks: "How bad does a shock have to get before our Revenue drops below an unacceptable threshold?"
- **How to use it**: 
  - **Set a breaking point**: E.g., "Find what causes FIN01 (Revenue) to drop below 500M GHS".
  - **Single Scenario Solver**: Finds the exact multiplier for a single scenario required to break the business. It shows a visual trajectory chart of the system mathematically hunting for that breaking point.
  - **Cross-Scenario Sweep**: Scans all 56 scenarios simultaneously to give you a ranked leaderboard of which scenarios pose the most immediate threat to causing that specific breach.

---

## 5. System Configuration
### Settings (`/settings`)
- **What it is**: The platform configuration page.
- **What it shows**: User preferences and application controls.
- **How to use it**: (If configured) Allows you to switch UI themes, adjust data refresh rates, and manage user permissions.

---
*This document serves as your foundational guide. The MTN QuantRisk Platform is designed to ensure there are no surprises for the business—transforming raw data into predictive, actionable intelligence.*
