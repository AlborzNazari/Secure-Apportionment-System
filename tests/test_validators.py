"""Tests for input validators"""
import pytest
from src.validators import validate_csv_data, validate_seats_allocation

def test_valid_data():
    """Test validation with valid data"""
    data = {'Party A': 1000, 'Party B': 2000, 'Party C': 1500}
    is_valid, msg = validate_csv_data(data)
    assert is_valid
    assert "valid" in msg.lower()

def test_empty_data():
    """Test validation with empty data"""
    is_valid, msg = validate_csv_data({})
    assert not is_valid
    assert "no data provided" in msg.lower()

def test_negative_votes():
    """Test validation with negative votes"""
    data = {'Party A': -100}
    is_valid, msg = validate_csv_data(data)
    assert not is_valid

def test_zero_total_votes():
    """Test validation with zero total votes"""
    data = {'Party A': 0, 'Party B': 0}
    is_valid, msg = validate_csv_data(data)
    assert not is_valid

def test_valid_seats_allocation():
    """Test valid seat allocation parameters"""
    is_valid, msg = validate_seats_allocation(100, 5)
    assert is_valid

def test_invalid_seats_allocation():
    """Test invalid seat allocation (fewer seats than parties)"""
    is_valid, msg = validate_seats_allocation(3, 5)
    assert not is_valid
