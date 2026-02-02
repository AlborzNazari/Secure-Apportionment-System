import heapq  # For priority queue (efficient O(log n) operations)
import math   # For sqrt; consider decimal for high precision in large datasets
import csv    # For scalable CSV reading; handles large files without loading all at once

def huntington_hill(shares: dict[str, int], total_seats: int) -> dict[str, int]:
    """
    Implements Huntington-Hill apportionment for fair seat allocation.
    
    Args:
        shares: Dict of group names to vote shares (e.g., {'Party A': 33000}).
        total_seats: Total seats to allocate (must be positive int).
    
    Returns:
        Dict of group names to allocated seats.
    
    Nuances: Handles zero shares gracefully; scales to 200k+ votes via heap.
    Raises ValueError on invalid inputs.
    """
    if total_seats <= 0:
        raise ValueError("Total seats must be positive.")
    if not shares:
        return {}
    
    # Step 1: Initialize allocations (start with 0 or 1 for non-zero shares)
    allocations = {group: 0 for group in shares}
    remaining_seats = total_seats
    pq = []  # Max-heap (use negative priorities)
    
    for group, share in shares.items():
        if share > 0:
            allocations[group] = 1
            remaining_seats -= 1
            if remaining_seats < 0:
                raise ValueError("Not enough seats for initial allocation.")
            priority = - (share / math.sqrt(1 * 2))
            heapq.heappush(pq, (priority, group))
    
    # Step 2: Allocate remaining seats to highest priority
    while remaining_seats > 0:
        if not pq:
            break  # No more eligible groups
        priority, group = heapq.heappop(pq)
        allocations[group] += 1
        new_seats = allocations[group]
        new_priority = - (shares[group] / math.sqrt(new_seats * (new_seats + 1)))
        heapq.heappush(pq, (new_priority, group))
        remaining_seats -= 1
    
    return allocations

def read_shares_from_csv(file_path: str) -> dict[str, int]:
    """
    Reads vote shares from CSV (scalable for large files).
    
    Args:
        file_path: Path to CSV (headers: Group,Votes).
    
    Returns:
        Dict of group to votes.
    
    Nuances: Skips invalid rows; assumes int votes.
    """
    shares = {}
    with open(file_path, 'r') as f:
        reader = csv.reader(f)
        next(reader, None)  # Skip header if present
        for row in reader:
            if len(row) == 2:
                try:
                    shares[row[0]] = int(row[1])
                except ValueError:
                    pass  # Skip invalid rows
    return shares

# Example: Demo heuristics with 27 seats
# shares = {'Party A': 33000, 'Party B': 40000, 'Party C': 26000}
# print(huntington_hill(shares, 27))  # {'Party A': 9, 'Party B': 11, 'Party C': 7}
