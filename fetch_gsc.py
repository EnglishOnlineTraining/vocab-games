#!/usr/bin/env python3
"""Fetch Google Search Console data for activities.englishonline.training.

Prerequisites:
  1. Enable the Search Console API in your GCP project.
  2. Create a service account and download its JSON key.
  3. Add the service account email as a user in Search Console
     (Settings > Users and permissions) for the property.
  4. Store the key — either the file path or the raw JSON content —
     in the CLAUDE_GSC_KEY environment variable.

Usage:
  python fetch_gsc.py                        # last 28 days, top 25 queries
  python fetch_gsc.py --days 90              # last 90 days
  python fetch_gsc.py --days 7 --limit 50    # last 7 days, top 50
  python fetch_gsc.py --start 2026-08-01 --end 2026-08-31
  python fetch_gsc.py --dimension page       # group by page instead of query
  python fetch_gsc.py --out results.csv      # write CSV
  python fetch_gsc.py --json                 # output JSON to stdout
"""

import argparse
import csv
import json
import os
import sys
import tempfile
from datetime import date, timedelta

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
except ImportError:
    sys.exit(
        "Missing dependencies. Install them with:\n"
        "  pip install google-auth google-api-python-client"
    )

SITE_URL = "sc-domain:englishonline.training"
SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]


def get_credentials():
    """Load service-account credentials from CLAUDE_GSC_KEY."""
    raw = os.environ.get("CLAUDE_GSC_KEY", "").strip()
    if not raw:
        sys.exit(
            "CLAUDE_GSC_KEY is not set.\n"
            "Set it to the path of your service-account JSON key,\n"
            "or to the raw JSON content of the key."
        )

    if raw.startswith("{"):
        info = json.loads(raw)
        return service_account.Credentials.from_service_account_info(info, scopes=SCOPES)

    if os.path.isfile(raw):
        return service_account.Credentials.from_service_account_file(raw, scopes=SCOPES)

    sys.exit(
        f"CLAUDE_GSC_KEY is set but is neither valid JSON nor a readable file path:\n"
        f"  {raw[:120]}..."
    )


def fetch_search_analytics(service, site, start, end, dimension="query", limit=25):
    """Query the Search Console searchAnalytics endpoint."""
    body = {
        "startDate": start,
        "endDate": end,
        "dimensions": [dimension],
        "rowLimit": limit,
        "dataState": "final",
    }
    response = (
        service.searchanalytics()
        .query(siteUrl=site, body=body)
        .execute()
    )
    return response.get("rows", [])


def format_table(rows, dimension):
    """Print a readable ASCII table to stdout."""
    header = dimension.capitalize()
    print(f"\n{'#':>4}  {header:<60}  {'Clicks':>7}  {'Impr':>7}  {'CTR':>7}  {'Pos':>6}")
    print("-" * 100)
    for i, row in enumerate(rows, 1):
        key = row["keys"][0]
        clicks = row["clicks"]
        impressions = row["impressions"]
        ctr = row["ctr"] * 100
        position = row["position"]
        print(f"{i:>4}  {key:<60}  {clicks:>7.0f}  {impressions:>7.0f}  {ctr:>6.1f}%  {position:>6.1f}")
    print()


def write_csv(rows, dimension, path):
    """Write results to a CSV file."""
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([dimension, "clicks", "impressions", "ctr", "position"])
        for row in rows:
            writer.writerow([
                row["keys"][0],
                row["clicks"],
                row["impressions"],
                round(row["ctr"], 4),
                round(row["position"], 1),
            ])
    print(f"Wrote {len(rows)} rows to {path}")


def main():
    parser = argparse.ArgumentParser(description="Fetch Google Search Console data.")
    parser.add_argument("--days", type=int, default=28, help="Look-back window in days (default: 28)")
    parser.add_argument("--start", help="Start date (YYYY-MM-DD), overrides --days")
    parser.add_argument("--end", help="End date (YYYY-MM-DD), default: 3 days ago")
    parser.add_argument("--dimension", default="query", choices=["query", "page", "device", "country", "date"],
                        help="Dimension to group by (default: query)")
    parser.add_argument("--limit", type=int, default=25, help="Max rows to return (default: 25)")
    parser.add_argument("--site", default=SITE_URL, help=f"Site URL (default: {SITE_URL})")
    parser.add_argument("--out", help="Write results to a CSV file")
    parser.add_argument("--json", action="store_true", dest="as_json", help="Output raw JSON to stdout")
    args = parser.parse_args()

    end_date = args.end or (date.today() - timedelta(days=3)).isoformat()
    if args.start:
        start_date = args.start
    else:
        start_date = (date.fromisoformat(end_date) - timedelta(days=args.days)).isoformat()

    print(f"Site:      {args.site}")
    print(f"Period:    {start_date} → {end_date}")
    print(f"Dimension: {args.dimension}")
    print(f"Limit:     {args.limit}")

    credentials = get_credentials()
    service = build("searchconsole", "v1", credentials=credentials)

    rows = fetch_search_analytics(
        service, args.site, start_date, end_date,
        dimension=args.dimension, limit=args.limit,
    )

    if not rows:
        print("\nNo data returned for this period/property.")
        return

    if args.as_json:
        json.dump(rows, sys.stdout, indent=2)
        print()
    elif args.out:
        write_csv(rows, args.dimension, args.out)
    else:
        format_table(rows, args.dimension)

    total_clicks = sum(r["clicks"] for r in rows)
    total_impressions = sum(r["impressions"] for r in rows)
    avg_ctr = (total_clicks / total_impressions * 100) if total_impressions else 0
    avg_pos = sum(r["position"] for r in rows) / len(rows) if rows else 0
    print(f"Totals: {total_clicks:.0f} clicks, {total_impressions:.0f} impressions, "
          f"{avg_ctr:.1f}% avg CTR, {avg_pos:.1f} avg position")


if __name__ == "__main__":
    main()
