"""
Script to remove a plate from a hotel by barcode.
"""

import os
import sys
from typing import Any, Dict, List, Optional

import requests

API_BASE_URL = os.getenv("GALAGO_API_URL", "http://localhost:3010")


def get_plates() -> List[Dict[str, Any]]:
    """Fetch all plates."""
    response = requests.get(f"{API_BASE_URL}/api/inventory/plates")
    response.raise_for_status()
    return response.json()


def get_nests() -> List[Dict[str, Any]]:
    """Fetch all nests."""
    response = requests.get(f"{API_BASE_URL}/api/inventory/nests")
    response.raise_for_status()
    return response.json()


def get_hotels() -> List[Dict[str, Any]]:
    """Fetch all hotels."""
    response = requests.get(f"{API_BASE_URL}/api/inventory/hotels")
    response.raise_for_status()
    return response.json()


def delete_plate(plate_id: int) -> None:
    """Delete a plate by ID."""
    response = requests.delete(f"{API_BASE_URL}/api/inventory/plates/{plate_id}")
    response.raise_for_status()


def find_plate_by_barcode(barcode: str, hotel_name: str) -> Optional[Dict[str, Any]]:
    """Find a plate by barcode and verify it belongs to the specified hotel."""
    plates = get_plates()
    nests = get_nests()
    hotels = get_hotels()

    # Find hotel by name
    hotel = next((h for h in hotels if h["name"] == hotel_name), None)
    if not hotel:
        raise Exception(f"Hotel '{hotel_name}' not found")

    # Find plate by barcode
    plate = next((p for p in plates if p.get("barcode") == barcode), None)
    if not plate:
        return None

    # Verify plate is in the hotel
    if plate.get("nestId"):
        nest = next((n for n in nests if n["id"] == plate["nestId"]), None)
        if nest and nest.get("hotelId") != hotel["id"]:
            raise Exception(
                f"Plate '{barcode}' exists but is not in hotel '{hotel_name}'"
            )

    return plate


def main():
    """Main function."""
    # Configuration - modify these values as needed
    barcode = "BC-Hotel1-000"
    hotel_name = "Hotel 1"

    print(f"Removing plate with barcode '{barcode}' from '{hotel_name}'")

    try:
        plate = find_plate_by_barcode(barcode, hotel_name)

        if not plate:
            print(f"Plate with barcode '{barcode}' not found")
            sys.exit(1)

        print(f"Found plate: {plate['name']} (ID: {plate['id']})")
        delete_plate(plate["id"])
        print(f"Plate '{barcode}' deleted successfully")

    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
