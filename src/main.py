import argparse
import json
import os
import math  # In case needed, but apportionment handles it
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

from src.apportionment import huntington_hill, read_shares_from_csv  # Correct names!

def generate_key():
    return os.urandom(32)  # Secure 256-bit key

def encrypt_data(data: bytes, key: bytes) -> bytes:
    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    encryptor = cipher.encryptor()
    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(data) + padder.finalize()
    encrypted = encryptor.update(padded_data) + encryptor.finalize()
    return iv + encrypted

def decrypt_data(encrypted_data: bytes, key: bytes) -> bytes:
    iv = encrypted_data[:16]
    encrypted = encrypted_data[16:]
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    decryptor = cipher.decryptor()
    decrypted_padded = decryptor.update(encrypted) + decryptor.finalize()
    unpadder = padding.PKCS7(128).unpadder()
    data = unpadder.update(decrypted_padded) + unpadder.finalize()
    return data

def main():
    parser = argparse.ArgumentParser(description="Secure Parliamentary Seat Apportionment")
    parser.add_argument("csv_file", help="Path to CSV with vote totals (columns: Group,Votes)")
    parser.add_argument("--seats", type=int, required=True, help="Total seats to allocate")
    parser.add_argument("--output", default="results.json", help="Base name for output files")
    args = parser.parse_args()

    # Load votes using the actual function
    votes = read_shares_from_csv(args.csv_file)
    
    # Secure processing demo
    key = generate_key()
    votes_bytes = json.dumps(votes).encode('utf-8')
    encrypted_votes = encrypt_data(votes_bytes, key)
    
    # Decrypt in-memory for calculation
    decrypted_bytes = decrypt_data(encrypted_votes, key)
    decrypted_votes = json.loads(decrypted_bytes.decode('utf-8'))
    
    # Apportion seats using the actual function
    results = huntington_hill(decrypted_votes, args.seats)
    
    # Output
    print("Apportionment Results:")
    print(results)
    
    # Save encrypted results
    results_bytes = json.dumps(results).encode('utf-8')
    encrypted_results = encrypt_data(results_bytes, key)
    with open(f"{args.output}.enc", 'wb') as f:
        f.write(encrypted_results)
    
    # Save key (demo only—secure this in production!)
    with open("key.bin", 'wb') as f:
        f.write(key)
    
    print(f"Encrypted results saved to {args.output}.enc")
    print("Key saved to key.bin (keep secure!)")

if __name__ == "__main__":
    main()
