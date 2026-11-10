"""
Keeps README.md and the project page honest: the test counts they state must
match the real suites, and both must state the same figures.
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
README = (ROOT / "README.md").read_text(encoding="utf-8")
PAGE = (ROOT / "public" / "index.html").read_text(encoding="utf-8")

SHARED_FIGURES = [
    "Splits parliament seats with the Huntington-Hill method and seals the results with authenticated encryption (AES-256-GCM).",
    "122 µs", "168 µs", "178 µs", "3.3 ms", "34 ms", "7 µs",
    "Intel Core i9-12900K", "Python 3.14.3", "median of 7 repeats",
    "Python 3.10–3.13", "2020 Census apportionment", "from 2 to 8",
]


def python_test_count():
    out = subprocess.run(
        [sys.executable, "-m", "pytest", "--collect-only", "-q", "-p", "no:cacheprovider", str(ROOT / "tests")],
        capture_output=True, text=True, cwd=ROOT, check=True,
    ).stdout
    return int(re.search(r"(\d+) tests? collected", out).group(1))


def js_test_count():
    source = (ROOT / "tests" / "js" / "demo.test.mjs").read_text(encoding="utf-8")
    return len(re.findall(r"^test\(", source, re.M))


def test_stated_test_counts_are_real():
    py, js = python_test_count(), js_test_count()
    for text in (README, PAGE):
        assert f"{py + js} automated tests" in text
        assert f"{py} are Python tests and {js} are JavaScript tests" in text


def test_readme_and_page_state_the_same_figures():
    page_text = re.sub(r"<[^>]+>", "", PAGE).replace("&nbsp;", " ")
    for figure in SHARED_FIGURES:
        assert figure in README, figure
        assert figure in page_text, figure
