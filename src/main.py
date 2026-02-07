import argparse
import json
import os
from cryptography.cipher import Cipher, algorithms, modes
from cryptography.padding import PKCS7
from src.apportionment import huntington_hill_apportionment 
from src.io import load_votes_from_csv

def generate_key():
    return os.urandom(32)

def encrypt_data(data, key):
    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    encryptor = cipher.encryptor()
    padder = PKCS7(128).padder()
    padded_data = padder.update(data) + padder.finalize()
    encrypted = encryptor.update(padded_data) + encryptor.finalize()
    return iv + encrypted

def decrypt_data(encrypted_data, key):
    iv = encrypted_data[:16]
    encrypted = encrypted_data[16:]
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    decryptor = cipher.decryptor()
    decrypted_padded = decryptor.update(encrypted) + decryptor.finalize()
    unpadder = PKCS7(128).unpadder()
    data = unpadder.update(decrypted_padded) + unpadder.finalize()
    return data

def main():
    parser = argparse.ArgumentParser(description="Secure Parliamentary Seat Apportionment")
    parser.add_argument("csv_file", help="Path to CSV with vote totals")
    parser.add_argument("--seats", type=int, required=True, help="Total seats to allocate")
    parser.add_argument("--output", default="results.json", help="Output file for results")
    args = parser.parse_args()

    # Load votes
    votes = load_votes_from_csv(args.csv_file)
    
    # Demonstrate secure processing: Encrypt votes
    key = generate_key()
    votes_bytes = json.dumps(votes).encode('utf-8')
    encrypted_votes = encrypt_data(votes_bytes, key)
    
    # Decrypt for apportionment (in-memory secure processing)
    decrypted_bytes = decrypt_data(encrypted_votes, key)
    decrypted_votes = json.loads(decrypted_bytes.decode('utf-8'))
    
    # Perform apportionment
    results = huntington_hill_apportionment(decrypted_votes, args.seats)
    
    # Print results for demo
    print("Apportionment Results:")
    print(results)
    
    # Optionally encrypt and save results
    results_bytes = json.dumps(results).encode('utf-8')
    encrypted_results = encrypt_data(results_bytes, key)
    with open(args.output + ".enc", 'wb') as f:
        f.write(encrypted_results)
    
    # Save key (in production, handle securely; here for demo)
    with open("key.bin", 'wb') as f:
        f.write(key)
    print("Results encrypted and saved to", args.output + ".enc")
    print("Key saved to key.bin (handle securely)")

if __name__ == "__main__":
    main()
