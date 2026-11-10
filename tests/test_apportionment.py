"""Tests for the Huntington-Hill implementation in src/apportionment.py"""
import csv
import random
from pathlib import Path

import pytest

from src.apportionment import huntington_hill

DATA_DIR = Path(__file__).parent / "data"


def load_us_house_2020():
    """
    2020 Census apportionment, 50 states, 435 seats.
    Source: U.S. Census Bureau, apportionment-2020-table01.xlsx
    https://www2.census.gov/programs-surveys/decennial/2020/data/apportionment/apportionment-2020-table01.xlsx
    """
    populations, seats = {}, {}
    with open(DATA_DIR / "us_house_2020.csv", newline="") as f:
        for row in csv.DictReader(f):
            populations[row["State"]] = int(row["Population"])
            seats[row["State"]] = int(row["Seats"])
    return populations, seats


def random_election(rng):
    parties = rng.randint(1, 40)
    votes = {f"P{i}": rng.randint(1, 10_000_000) for i in range(parties)}
    return votes, rng.randint(parties, parties + 1000)


# --- Known published results ---------------------------------------------

def test_matches_2020_us_house_apportionment():
    populations, expected = load_us_house_2020()
    assert len(populations) == 50
    assert sum(expected.values()) == 435
    assert huntington_hill(populations, 435) == expected


def test_worked_example_from_docs():
    """docs/HOW_IT_WORKS.md, section 3."""
    assert huntington_hill({"A": 5000, "B": 3000, "C": 2000}, 10) == {
        "A": 5, "B": 3, "C": 2,
    }


# --- Seats always sum to the total ---------------------------------------

@pytest.mark.parametrize("seed", range(200))
def test_seats_sum_to_total(seed):
    votes, total = random_election(random.Random(seed))
    assert sum(huntington_hill(votes, total).values()) == total


@pytest.mark.parametrize("csv_file", sorted(Path(__file__).parent.parent.glob("sample_*.csv")))
@pytest.mark.parametrize("total", [25, 26, 100, 650, 1000])
def test_sample_files_sum_to_total(csv_file, total):
    from src.apportionment import read_shares_from_csv

    votes = read_shares_from_csv(str(csv_file))
    assert sum(huntington_hill(votes, total).values()) == total


def test_zero_vote_party_gets_no_seats_and_sum_still_holds():
    result = huntington_hill({"A": 900, "B": 100, "Z": 0}, 10)
    assert result["Z"] == 0
    assert sum(result.values()) == 10


# --- Other properties ----------------------------------------------------

@pytest.mark.parametrize("seed", range(50))
def test_every_party_with_votes_gets_a_seat(seed):
    votes, total = random_election(random.Random(seed))
    assert min(huntington_hill(votes, total).values()) >= 1


@pytest.mark.parametrize("seed", range(50))
def test_house_monotone(seed):
    """Adding a seat never takes a seat away from anyone (no Alabama paradox)."""
    votes, total = random_election(random.Random(seed))
    before = huntington_hill(votes, total)
    after = huntington_hill(votes, total + 1)
    assert all(after[p] >= before[p] for p in votes)


def test_fewer_seats_than_parties_raises():
    with pytest.raises(ValueError):
        huntington_hill({"A": 1, "B": 1, "C": 1}, 2)


@pytest.mark.parametrize("total", [0, -1])
def test_non_positive_seats_raises(total):
    with pytest.raises(ValueError):
        huntington_hill({"A": 1}, total)


def test_empty_input_returns_empty():
    assert huntington_hill({}, 10) == {}
