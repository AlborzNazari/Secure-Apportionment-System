// Tests for the in-browser demo in public/index.html.
// Run from the project root:  node --test tests/js/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import vm from 'node:vm';

const root = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');

// Load the exact code the page ships, from the <script id="apportion-core"> block.
const page = read('public/index.html');
const coreSource = /<script id="apportion-core">([\s\S]*?)<\/script>/.exec(page)[1];
const sandbox = { module: { exports: null } };
vm.runInNewContext(coreSource, sandbox);
const { parseCsv, huntingtonHill, MAX_SEATS } = sandbox.module.exports;

function usHouse2020() {
  const rows = read('tests/data/us_house_2020.csv').trim().split('\n').slice(1).map((l) => l.split(','));
  return {
    populations: rows.map(([state, pop]) => [state, Number(pop)]),
    official: Object.fromEntries(rows.map(([state, , seats]) => [state, Number(seats)])),
  };
}

function rng(seed) { // small deterministic generator (mulberry32)
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomElection(next) {
  const parties = 1 + Math.floor(next() * 40);
  const rows = Array.from({ length: parties }, (_, i) => [`P${i}`, 1 + Math.floor(next() * 10_000_000)]);
  return { rows, total: parties + Math.floor(next() * 1000) };
}

const sum = (seats) => Object.values(seats).reduce((a, b) => a + b, 0);
const plain = (x) => JSON.parse(JSON.stringify(x)); // values from the vm sandbox -> this realm
const hex = (s) => Uint8Array.from(s.match(/../g), (b) => parseInt(b, 16));

test('root index.html is an exact copy of public/index.html', () => {
  assert.equal(read('index.html'), page);
});

test('matches the 2020 U.S. House apportionment for all 50 states', () => {
  const { populations, official } = usHouse2020();
  assert.equal(populations.length, 50);
  assert.deepEqual({ ...huntingtonHill(populations, 435) }, official);
});

test('worked example from docs: A 5, B 3, C 2', () => {
  assert.deepEqual({ ...huntingtonHill([['A', 5000], ['B', 3000], ['C', 2000]], 10) }, { A: 5, B: 3, C: 2 });
});

test('Alabama paradox preset: Party_C keeps 4 seats going from 25 to 26', () => {
  const rows = [['Party_A', 525], ['Party_B', 335], ['Party_C', 140]];
  assert.deepEqual({ ...huntingtonHill(rows, 25) }, { Party_A: 13, Party_B: 8, Party_C: 4 });
  assert.deepEqual({ ...huntingtonHill(rows, 26) }, { Party_A: 13, Party_B: 9, Party_C: 4 });
});

test('seats always sum to the total (200 random elections)', () => {
  const next = rng(1);
  for (let i = 0; i < 200; i++) {
    const { rows, total } = randomElection(next);
    assert.equal(sum(huntingtonHill(rows, total)), total);
  }
});

test('adding a seat never removes one from any party (50 random elections)', () => {
  const next = rng(2);
  for (let i = 0; i < 50; i++) {
    const { rows, total } = randomElection(next);
    const before = huntingtonHill(rows, total);
    const after = huntingtonHill(rows, total + 1);
    for (const [name] of rows) assert.ok(after[name] >= before[name]);
  }
});

test('zero-vote groups get no seats', () => {
  assert.deepEqual({ ...huntingtonHill([['A', 900], ['B', 100], ['Z', 0]], 10) }, { A: 9, B: 1, Z: 0 });
});

test('rejects bad seat counts', () => {
  assert.throws(() => huntingtonHill([['A', 1], ['B', 1], ['C', 1]], 2), /at least 3 seats/);
  assert.throws(() => huntingtonHill([['A', 1]], 0), /positive/);
  assert.throws(() => huntingtonHill([['A', 1]], 1.5), /positive/);
  assert.throws(() => huntingtonHill([['A', 1]], MAX_SEATS + 1), /At most/);
});

test('CSV reader skips the header and rejects bad rows', () => {
  assert.deepEqual(plain(parseCsv('Group,Votes\r\nA,5\n\nB,0\n')), [['A', 5], ['B', 0]]);
  assert.deepEqual(plain(parseCsv('A,5\nB,6')), [['A', 5], ['B', 6]]);
  assert.throws(() => parseCsv('Group,Votes\nA,-5'), /whole number/);
  assert.throws(() => parseCsv('Group,Votes\nA,1.5'), /whole number/);
  assert.throws(() => parseCsv('Group,Votes\nA,5\nA,6'), /appears twice/);
  assert.throws(() => parseCsv('Group,Votes\nA,5,6'), /expected/);
  assert.throws(() => parseCsv('Group,Votes\n'), /No data rows/);
  assert.throws(() => parseCsv('Group,Votes\nA,99999999999999999999'), /too large/);
});

test('Web Crypto decrypts a file made by src/crypto.py (same format)', async () => {
  const v = JSON.parse(read('tests/data/gcm_vector.json'));
  const key = await webcrypto.subtle.importKey('raw', hex(v.key_hex), 'AES-GCM', false, ['decrypt']);
  const blob = hex(v.blob_hex);
  const pt = await webcrypto.subtle.decrypt({ name: 'AES-GCM', iv: blob.slice(0, 12) }, key, blob.slice(12));
  assert.equal(new TextDecoder().decode(pt), v.plaintext);
});

test('Web Crypto rejects the demo\'s seat edit and every single-byte change', async () => {
  const v = JSON.parse(read('tests/data/gcm_vector.json'));
  const key = await webcrypto.subtle.importKey('raw', hex(v.key_hex), 'AES-GCM', false, ['decrypt']);
  const blob = hex(v.blob_hex);
  const open = (b) => webcrypto.subtle.decrypt({ name: 'AES-GCM', iv: b.slice(0, 12) }, key, b.slice(12));

  const edited = blob.slice();
  edited[12 + v.plaintext.indexOf('5')] ^= '5'.charCodeAt(0) ^ '9'.charCodeAt(0);
  await assert.rejects(open(edited));

  for (let i = 0; i < blob.length; i++) {
    const t = blob.slice();
    t[i] ^= 0xff;
    await assert.rejects(open(t));
  }
});
