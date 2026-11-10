"""
Checks that the JavaScript demo in public/index.html gives the same seats as
src/apportionment.py, and that the shared AES-GCM test vector is genuine.
"""
import json
import random
import re
import shutil
import subprocess
from pathlib import Path

import pytest

from src.apportionment import huntington_hill
from src.crypto import decrypt_data

ROOT = Path(__file__).resolve().parent.parent
NODE = shutil.which("node")


def test_gcm_vector_decrypts_with_python():
    v = json.loads((ROOT / "tests" / "data" / "gcm_vector.json").read_text())
    blob = bytes.fromhex(v["blob_hex"])
    assert decrypt_data(blob, bytes.fromhex(v["key_hex"])).decode() == v["plaintext"]


@pytest.mark.skipif(NODE is None, reason="Node.js is not installed")
def test_js_port_matches_python_on_300_random_elections():
    rng = random.Random(2020)
    cases = []
    for _ in range(300):
        parties = rng.randint(1, 60)
        # Some cases use tiny vote counts so exact priority ties actually occur.
        top = rng.choice([5, 1_000, 50_000_000])
        rows = [[f"P{i}", rng.randint(0 if i else 1, top)] for i in range(parties)]
        positive = sum(1 for _, v in rows if v > 0)
        cases.append({"rows": rows, "total": rng.randint(positive, positive + 2000)})

    page = (ROOT / "public" / "index.html").read_text(encoding="utf-8")
    core = re.search(r'<script id="apportion-core">(.*?)</script>', page, re.S).group(1)
    runner = core + """
let input = '';
process.stdin.on('data', d => input += d);
process.stdin.on('end', () => {
  const cases = JSON.parse(input);
  console.log(JSON.stringify(cases.map(c => ApportionCore.huntingtonHill(c.rows, c.total))));
});
"""
    out = subprocess.run(
        [NODE, "-e", runner], input=json.dumps(cases), capture_output=True, text=True, check=True
    )
    js_results = json.loads(out.stdout)
    for case, js in zip(cases, js_results):
        assert js == huntington_hill(dict(case["rows"]), case["total"])
