"""Tests for AES-256-GCM encryption in src/crypto.py"""
import json
import os

import pytest

from src.crypto import (
    NONCE_SIZE,
    TAG_SIZE,
    InvalidTag,
    decrypt_data,
    encrypt_data,
    generate_key,
)

RESULTS = json.dumps({"CDU_CSU": 2, "SPD": 2, "Greens": 1, "FDP": 1}).encode("utf-8")


def test_round_trip():
    key = generate_key()
    encrypted = encrypt_data(RESULTS, key)
    assert decrypt_data(encrypted, key) == RESULTS
    assert len(encrypted) == NONCE_SIZE + len(RESULTS) + TAG_SIZE


def test_generate_key_is_32_random_bytes():
    assert len(generate_key()) == 32
    assert generate_key() != generate_key()


def test_same_plaintext_encrypts_differently():
    """A fresh nonce per call means no two ciphertexts repeat."""
    key = generate_key()
    a, b = encrypt_data(RESULTS, key), encrypt_data(RESULTS, key)
    assert a != b
    assert a[:NONCE_SIZE] != b[:NONCE_SIZE]


def test_wrong_key_fails():
    encrypted = encrypt_data(RESULTS, generate_key())
    with pytest.raises(InvalidTag):
        decrypt_data(encrypted, generate_key())


@pytest.mark.parametrize("region", ["nonce", "ciphertext", "tag"])
def test_flipped_bit_is_rejected(region):
    key = generate_key()
    encrypted = bytearray(encrypt_data(RESULTS, key))
    index = {
        "nonce": 0,
        "ciphertext": NONCE_SIZE + 3,
        "tag": len(encrypted) - 1,
    }[region]
    encrypted[index] ^= 0x01
    with pytest.raises(InvalidTag):
        decrypt_data(bytes(encrypted), key)


def test_every_single_byte_tamper_is_rejected():
    key = generate_key()
    encrypted = encrypt_data(RESULTS, key)
    for i in range(len(encrypted)):
        tampered = bytearray(encrypted)
        tampered[i] ^= 0xFF
        with pytest.raises(InvalidTag):
            decrypt_data(bytes(tampered), key)


def test_cbc_style_seat_rewrite_is_rejected():
    """
    The old AES-CBC code let an attacker change '"CDU_CSU": 2' to '8'
    by XOR-ing the IV, without the key. GCM must refuse the result.
    """
    key = generate_key()
    encrypted = bytearray(encrypt_data(RESULTS, key))
    digit = NONCE_SIZE + RESULTS.index(b"2")
    encrypted[digit] ^= ord("2") ^ ord("8")
    with pytest.raises(InvalidTag):
        decrypt_data(bytes(encrypted), key)


def test_truncated_ciphertext_is_rejected():
    key = generate_key()
    encrypted = encrypt_data(RESULTS, key)
    with pytest.raises(InvalidTag):
        decrypt_data(encrypted[:-1], key)
    with pytest.raises(ValueError):
        decrypt_data(encrypted[: NONCE_SIZE + TAG_SIZE - 1], key)


def test_appended_bytes_are_rejected():
    key = generate_key()
    with pytest.raises(InvalidTag):
        decrypt_data(encrypt_data(RESULTS, key) + b"\x00", key)


@pytest.mark.parametrize("length", [0, 16, 31, 33])
def test_invalid_key_length(length):
    with pytest.raises(ValueError, match="Key must be 32 bytes."):
        encrypt_data(b"data", os.urandom(length))
    with pytest.raises(ValueError, match="Key must be 32 bytes."):
        decrypt_data(b"\x00" * 64, os.urandom(length))
