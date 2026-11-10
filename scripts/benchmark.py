"""
Benchmark huntington_hill() and AES-256-GCM.

Run from the project root:
    python scripts/benchmark.py

Each case reports the median time of one call over several repeats.
Run time depends on the number of parties and seats, not on the number
of votes: the algorithm only ever sees vote totals.
"""
import csv
import platform
import random
import statistics
import sys
import timeit
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from src.apportionment import huntington_hill, read_shares_from_csv  # noqa: E402
from src.crypto import decrypt_data, encrypt_data, generate_key  # noqa: E402

REPEATS = 7


def median_seconds(fn):
    """Median seconds per call, auto-scaling the loop count like `python -m timeit`."""
    timer = timeit.Timer(fn)
    loops, _ = timer.autorange()
    return statistics.median(t / loops for t in timer.repeat(repeat=REPEATS, number=loops))


def us_house_2020():
    with open(ROOT / "tests" / "data" / "us_house_2020.csv", newline="") as f:
        return {r["State"]: int(r["Population"]) for r in csv.DictReader(f)}


def synthetic(parties, seed=0):
    rng = random.Random(seed)
    return {f"P{i}": rng.randint(1_000, 10_000_000) for i in range(parties)}


def fmt(seconds):
    if seconds < 1e-3:
        return f"{seconds * 1e6:,.1f} us"
    if seconds < 1:
        return f"{seconds * 1e3:,.2f} ms"
    return f"{seconds:,.2f} s"


def main():
    large = read_shares_from_csv(str(ROOT / "sample_large_election.csv"))
    cases = [
        ("US House 2020 (50 states, 435 seats)", us_house_2020(), 435),
        ("sample_large_election.csv (12 parties, 650 seats)", large, 650),
        ("same, every vote count x1000", {k: v * 1000 for k, v in large.items()}, 650),
        ("1,000 parties, 10,000 seats", synthetic(1_000), 10_000),
        ("1,000 parties, 100,000 seats", synthetic(1_000), 100_000),
    ]

    print(f"Python {platform.python_version()} on {platform.system()} {platform.release()}, "
          f"{platform.processor() or platform.machine()}")
    print(f"Median of {REPEATS} repeats\n")
    print(f"{'Case':<52} {'Time per call':>14}")
    print("-" * 67)
    for name, votes, seats in cases:
        print(f"{name:<52} {fmt(median_seconds(lambda: huntington_hill(votes, seats))):>14}")

    key = generate_key()
    payload = str(huntington_hill(us_house_2020(), 435)).encode()
    blob = encrypt_data(payload, key)
    print(f"{f'AES-256-GCM encrypt ({len(payload):,} bytes)':<52} "
          f"{fmt(median_seconds(lambda: encrypt_data(payload, key))):>14}")
    print(f"{f'AES-256-GCM decrypt ({len(payload):,} bytes)':<52} "
          f"{fmt(median_seconds(lambda: decrypt_data(blob, key))):>14}")


if __name__ == "__main__":
    main()
