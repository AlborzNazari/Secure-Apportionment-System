import argparse
from src.apportionment import huntington_hill_apportionment 
from src.io import load_votes_from_csv
# AES_256

def main():
    parser = argparse.ArgumentParser(description="Secure Parliamentary Seat Apportionment")
    parser.add_argument("csv_file", help="Path to CSV with vote totals")
    parser.add_argument("--seats", type=int, required=True, help="Total seats to allocate")
    parser.add_argument("--output", default="results.json", help="Output file for results")
    args = parser.parse_args()

    votes = load_votes_from_csv(args.csv_file)
    results = huntington_hill_apportionment(votes, args.seats)
    # Save or print results
    print(results)

if __name__ == "__main__":
    main()
