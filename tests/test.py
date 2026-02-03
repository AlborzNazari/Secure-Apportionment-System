import json
import os
import pytest
from src.crypto import encrypt_data, decrypt_data  # Adjust import based on your module name/path


def test_round_trip():
    key = os.urandom(32)
    shares = {"A": 33000, "B": "secret_value"}  # Example data
    original_data = json.dumps(shares).encode("utf-8")

    encrypted = encrypt_data(original_data, key)
    decrypted_bytes = decrypt_data(encrypted, key)
    decrypted = json.loads(decrypted_bytes.decode("utf-8"))

    assert decrypted == shares
    assert len(encrypted) >= 32  # IV (16) + at least one block


def test_wrong_key_fails():
    key = os.urandom(32)
    wrong_key = os.urandom(32)
    data = json.dumps({"test": 123}).encode("utf-8")

    encrypted = encrypt_data(data, key)

    with pytest.raises(ValueError):  # Expects padding error
        decrypt_data(encrypted, wrong_key)


def test_invalid_key_length():
    with pytest.raises(ValueError, match="Key must be 32 bytes."):
        encrypt_data(b"data", os.urandom(31))
