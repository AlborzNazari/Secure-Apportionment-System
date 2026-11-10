import argparse
import json

from src.apportionment import huntington_hill, read_shares_from_csv
from src.crypto import generate_key, encrypt_data, decrypt_data

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
