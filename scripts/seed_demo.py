"""
Demo seeder — populates the DB with realistic MTN Ghana articles and guarantees
at least one alert per tier so the dashboard is never empty during a live demo.

Usage:
    cd mtn_quantrisk
    python scripts/seed_demo.py

Run this the night before or morning of the presentation.
"""

import sys
import os
from pathlib import Path

# ── Path setup ────────────────────────────────────────────────────────────────
ROOT    = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(BACKEND))

# Set DB path before any model import
DB_PATH = str(ROOT / "backend" / "quantrisk_news.db")
os.environ.setdefault("DB_PATH", DB_PATH)

from app.models.database import init_db, SessionLocal
from app.models.article   import Article
from app.models.risk_score import RiskScore
from app.models.alert      import Alert
from app.services.pipeline_service import process_article

import uuid
from datetime import datetime, timedelta, timezone

# ── Seed articles ─────────────────────────────────────────────────────────────

SEED_ARTICLES = [
    # --- CRITICAL tier triggers ---
    {
        "title": "NCA Imposes GHS 50 Million Fine on MTN Ghana for Spectrum Licence Violations",
        "body": (
            "The National Communications Authority (NCA) has fined Scancom PLC (MTN Ghana) "
            "fifty million cedis for persistent non-compliance with spectrum licence conditions. "
            "The regulator cited failure to meet rural coverage obligations and unlicensed use of "
            "the 850 MHz band. MTN Ghana must pay within 30 days or face suspension of operations "
            "in the affected regions. This represents the largest regulatory fine in Ghana's telecom history."
        ),
        "source_name": "Citi FM",
        "url": "https://citinewsroom.com/?s=NCA+MTN+Ghana+spectrum+fine",
        "days_ago": 0,
    },
    {
        "title": "Ghana Cedi Collapses 18% Against Dollar — MTN Cost Base Under Severe Pressure",
        "body": (
            "The Ghanaian Cedi has depreciated sharply, losing 18% against the US dollar in a single "
            "week as the Bank of Ghana raised interest rates to 33% amid surging inflation. MTN Ghana "
            "sources most of its network equipment in USD, meaning its capital expenditure costs have "
            "jumped significantly. Analysts warn EBITDA margin could fall below 40% if depreciation "
            "continues. The IMF has been called in for emergency consultations with the Ministry of Finance."
        ),
        "source_name": "Ghana Business News",
        "url": "https://ghanabusinessnews.com/?s=cedi+MTN+Ghana+depreciation",
        "days_ago": 0,
    },
    # --- WARNING tier ---
    {
        "title": "AirtelTigo Cuts Prepaid Tariffs by 30% — MTN Ghana Faces Subscriber Churn Risk",
        "body": (
            "AirtelTigo has launched an aggressive promotional campaign, cutting prepaid call rates "
            "by 30% and doubling data bundles across its network. Industry analysts estimate MTN Ghana "
            "could lose 200,000 subscribers over the next quarter if it does not respond with competitive "
            "pricing. The price war comes at a difficult time as the telecom market share battle intensifies. "
            "Vodafone Ghana is also reported to be planning a similar bundle promotion."
        ),
        "source_name": "TechCabal",
        "url": "https://techcabal.com/?s=AirtelTigo+Ghana+tariff",
        "days_ago": 1,
    },
    {
        "title": "Ghana Parliament Considers 3% Digital Services Tax on Mobile Money Transactions",
        "body": (
            "Ghana's parliament is debating a new digital services tax that would impose a 3% levy "
            "on all mobile money transactions including MTN MoMo. The bill, sponsored by the Finance "
            "Ministry, aims to raise GHS 800 million annually. MTN Ghana's MoMo platform processed "
            "GHS 450 billion in transactions last year, making it the primary target of the new levy. "
            "Industry groups warn the tax could suppress transaction volumes by up to 40%."
        ),
        "source_name": "JoyFM",
        "url": "https://myjoyonline.com/?s=digital+services+tax+mobile+money",
        "days_ago": 1,
    },
    # --- WATCH tier ---
    {
        "title": "MTN Ghana Network Maintenance Scheduled — Partial Outages in Greater Accra",
        "body": (
            "MTN Ghana has announced scheduled maintenance on its core network infrastructure in the "
            "Greater Accra region from midnight to 6am this weekend. Customers may experience intermittent "
            "data and voice service disruptions. The maintenance is part of the ongoing 5G readiness upgrade "
            "programme. MTN engineers will upgrade tower equipment across 45 base stations."
        ),
        "source_name": "Modern Ghana",
        "url": "https://www.modernghana.com/search/?q=MTN+Ghana+network",
        "days_ago": 2,
    },
    {
        "title": "Bank of Ghana Signals Further Rate Increases as Inflation Holds Above 20%",
        "body": (
            "The Bank of Ghana's Monetary Policy Committee signalled it may raise the benchmark interest "
            "rate further from the current 29% as CPI inflation remains stubbornly above 20%. Higher rates "
            "increase borrowing costs for MTN Ghana's GHS-denominated debt facilities. The Cedi has also "
            "seen renewed pressure against the dollar. Economists at Databank forecast the rate could "
            "reach 32% by Q3 2026."
        ),
        "source_name": "African Business",
        "url": "https://african.business/?s=Bank+of+Ghana+interest+rate",
        "days_ago": 2,
    },
    {
        "title": "MTN Ghana MoMo Agent Network Expands to 180,000 Merchants Nationwide",
        "body": (
            "MTN Ghana has expanded its MoMo merchant network to 180,000 registered agents nationwide, "
            "up from 140,000 last year. The expansion focuses on rural Northern Ghana where mobile money "
            "penetration remains below 30%. MTN MoMo revenue grew 28% year-on-year according to the "
            "latest quarterly results. The company plans to invest GHS 200 million in MoMo infrastructure "
            "expansion over the next 18 months."
        ),
        "source_name": "BBC Africa",
        "url": "https://www.bbc.com/news/topics/c8nq32jeww8t",
        "days_ago": 3,
    },
    {
        "title": "Government Announces Digital Economy Policy — Telecom Operators to Benefit",
        "body": (
            "The government of Ghana has unveiled a new Digital Economy Policy that includes subsidies "
            "for rural broadband expansion and tax incentives for telecom operators investing in 4G "
            "infrastructure. MTN Ghana is expected to qualify for GHS 150 million in subsidies under "
            "the scheme. The policy also fast-tracks spectrum allocation for 5G in major cities. "
            "NDC and NPP MPs both expressed support for the initiative."
        ),
        "source_name": "The Africa Report",
        "url": "https://www.theafricareport.com/?s=Ghana+digital+economy+policy",
        "days_ago": 3,
    },
    {
        "title": "MTN Group Q2 Results: Ghana Operations Drive 15% Revenue Growth",
        "body": (
            "MTN Group's Q2 2026 results show Ghana operations contributing 15% revenue growth, "
            "driven by strong MoMo performance and ARPU improvements. Service revenue reached "
            "GHS 4.2 billion for the half year. Data revenue grew 32% as smartphone penetration "
            "exceeded 60% of the subscriber base. The Group flagged Cedi depreciation as the "
            "primary headwind for H2 2026 guidance."
        ),
        "source_name": "Ghana Business News",
        "url": "https://ghanabusinessnews.com/?s=MTN+Ghana+Q2+results",
        "days_ago": 4,
    },
    {
        "title": "Cybersecurity Incident at Ghanaian Bank Raises Concerns About MoMo Platform Security",
        "body": (
            "A major cybersecurity breach at a Ghanaian commercial bank has raised concerns about "
            "the security of mobile money platforms including MTN MoMo. Hackers exploited an API "
            "vulnerability to access customer data. The Bank of Ghana has issued a directive requiring "
            "all mobile money operators to conduct immediate security audits. MTN Ghana said its systems "
            "were not directly affected but launched a precautionary security review. Customer complaints "
            "about suspicious transactions have increased on social media."
        ),
        "source_name": "TechCabal",
        "url": "https://techcabal.com/?s=MoMo+cybersecurity+Ghana",
        "days_ago": 5,
    },
    {
        "title": "NCA Releases 2026 Quality of Service Report — MTN Leads on Data but Trails on Voice",
        "body": (
            "The National Communications Authority's annual Quality of Service report shows MTN Ghana "
            "leading on 4G data speeds with an average of 28 Mbps but trailing AirtelTigo on voice "
            "call completion rates in rural areas. The NCA has set a 90-day remediation deadline for "
            "operators failing to meet minimum voice quality thresholds. MTN must improve rural voice "
            "quality by Q4 or face potential tariff restrictions under the new compliance framework."
        ),
        "source_name": "Citi FM",
        "url": "https://citinewsroom.com/?s=NCA+quality+of+service+MTN",
        "days_ago": 6,
    },
    {
        "title": "MTN Ghana Launches Free WiFi at 500 Schools Across Ghana",
        "body": (
            "MTN Ghana has partnered with the Ministry of Education to provide free WiFi connectivity "
            "to 500 schools across all 16 regions of Ghana under the 'Digital Schools' initiative. "
            "The investment of GHS 80 million will connect over 300,000 students to the internet. "
            "MTN CEO described it as the company's largest corporate social investment in a decade. "
            "The programme is part of MTN's commitment to bridge the digital divide in Ghana."
        ),
        "source_name": "JoyFM",
        "url": "https://myjoyonline.com/?s=MTN+Ghana+digital+schools+WiFi",
        "days_ago": 7,
    },
]


def seed():
    print("=" * 60)
    print("  MTN QuantRisk — Demo Seeder")
    print("=" * 60)

    init_db()

    with SessionLocal() as db:
        new_count = 0
        skipped   = 0

        for raw in SEED_ARTICLES:
            exists = db.query(Article).filter(Article.url == raw["url"]).first()
            if exists:
                print(f"  [skip]  {raw['title'][:60]}")
                skipped += 1
                continue

            pub_dt = datetime.now(timezone.utc) - timedelta(days=raw["days_ago"])
            article = Article(
                url         = raw["url"],
                title       = raw["title"],
                body        = raw["body"],
                source_name = raw["source_name"],
                source_url  = raw["url"],
                published_at= pub_dt,
            )
            db.add(article)
            db.commit()
            db.refresh(article)
            new_count += 1
            print(f"  [added] {raw['title'][:60]}")

            # Run full NLP + scoring pipeline
            try:
                process_article(article.id)
                print(f"          >> NLP scored")
            except Exception as exc:
                print(f"          >> NLP error: {exc}")

        print()
        print(f"  Articles added : {new_count}")
        print(f"  Already existed: {skipped}")

        # ── Show what alerts were generated ───────────────────────────────
        alerts = db.query(Alert).filter(Alert.acknowledged == False).all()  # noqa: E712
        print()
        print(f"  Active alerts in DB: {len(alerts)}")
        for a in alerts:
            print(f"    [{a.tier:8s}] {a.headline[:55]}")

    print()
    print("  Done. Run the backend and open http://localhost:3000/alerts")
    print("=" * 60)


if __name__ == "__main__":
    seed()
