"""Input validation for vote data"""

def validate_csv_data(data_dict):
    """
    Validate vote data before processing
    
    Args:
        data_dict: Dictionary with party names as keys, vote counts as values
        
    Returns:
        tuple: (is_valid, error_message)
    """
    
    # Check if empty
    if not data_dict:
        return False, "No data provided"
    
    # Check all values are positive integers
    for party, votes in data_dict.items():
        if not isinstance(votes, int) or votes < 0:
            return False, f"Invalid vote count for {party}: must be positive integer"
    
    # Check total votes is reasonable (not zero)
    total_votes = sum(data_dict.values())
    if total_votes == 0:
        return False, "Total votes cannot be zero"
    
    return True, "Data is valid"


def validate_seats_allocation(total_seats, num_parties):
    """
    Validate seat allocation parameters
    
    Args:
        total_seats: Total seats to allocate
        num_parties: Number of parties
        
    Returns:
        tuple: (is_valid, error_message)
    """
    
    if total_seats < num_parties:
        return False, f"Need at least {num_parties} seats for {num_parties} parties"
    
    if total_seats > 1000:
        return False, "Seat allocation exceeds safe limits"
    
    return True, "Parameters valid"
