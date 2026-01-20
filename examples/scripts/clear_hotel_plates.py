"""
Script to clear all plates from a hotel by hotel name.

Usage:
    python clear_hotel_plates.py <hotel_name> [--delete]

Options:
    --delete    Delete plates entirely instead of just unassigning them from nests
"""

import os
import sys
from typing import Any, Dict, List, Optional

import requests

API_BASE_URL = os.getenv("GALAGO_API_URL", "http://localhost:3010")


def get_hotels() -> List[Dict[str, Any]]:
    """Fetch all hotels."""
    try:
        url = f"{API_BASE_URL}/api/inventory/hotels"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to fetch hotels: {str(e)}")


def get_hotel_by_name(hotel_name: str) -> Optional[Dict[str, Any]]:
    """Find a hotel by name."""
    hotels = get_hotels()
    for hotel in hotels:
        if hotel.get("name") == hotel_name:
            return hotel
    return None


def get_nests() -> List[Dict[str, Any]]:
    """Fetch all nests."""
    try:
        url = f"{API_BASE_URL}/api/inventory/nests"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to fetch nests: {str(e)}")


def get_nests_by_hotel(hotel_id: int) -> List[Dict[str, Any]]:
    """Get all nests belonging to a hotel."""
    nests = get_nests()
    return [nest for nest in nests if nest.get("hotelId") == hotel_id]


def get_plates() -> List[Dict[str, Any]]:
    """Fetch all plates."""
    try:
        url = f"{API_BASE_URL}/api/inventory/plates"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to fetch plates: {str(e)}")


def get_plates_in_hotel(hotel_id: int) -> List[Dict[str, Any]]:
    """Get all plates assigned to nests in a hotel."""
    hotel_nests = get_nests_by_hotel(hotel_id)
    nest_ids = {nest["id"] for nest in hotel_nests}

    plates = get_plates()
    return [plate for plate in plates if plate.get("nestId") in nest_ids]


def unassign_plate(plate_id: int) -> Dict[str, Any]:
    """Unassign a plate from its nest (set nestId to null)."""
    try:
        url = f"{API_BASE_URL}/api/inventory/plates/{plate_id}"
        data = {"nestId": None}
        response = requests.put(url, json=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to unassign plate: {str(e)}")


def delete_plate(plate_id: int) -> Dict[str, Any]:
    """Delete a plate entirely."""
    try:
        url = f"{API_BASE_URL}/api/inventory/plates/{plate_id}"
        response = requests.delete(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to delete plate: {str(e)}")


def clear_hotel_plates(hotel_name: str, delete_plates: bool = False):
    """Clear all plates from a hotel."""

    print(f"Looking for hotel '{hotel_name}'...")
    hotel = get_hotel_by_name(hotel_name)

    if not hotel:
        print(f"Error: Hotel '{hotel_name}' not found")
        sys.exit(1)

    print(f"Found hotel: {hotel['name']} (ID: {hotel['id']})")

    # Get all plates in the hotel
    plates = get_plates_in_hotel(hotel["id"])

    if not plates:
        print(f"No plates found in hotel '{hotel_name}'")
        return

    print(f"Found {len(plates)} plate(s) in hotel")
    print("=" * 50)

    action = "Deleting" if delete_plates else "Unassigning"
    cleared_count = 0
    errors = []

    for plate in plates:
        plate_id = plate["id"]
        plate_name = plate.get("name") or plate.get("barcode") or f"ID:{plate_id}"

        print(f"{action} plate: {plate_name} (ID: {plate_id})...")

        try:
            if delete_plates:
                delete_plate(plate_id)
                print(f"  Deleted plate: {plate_name}")
            else:
                unassign_plate(plate_id)
                print(f"  Unassigned plate: {plate_name}")
            cleared_count += 1
        except Exception as e:
            error_msg = f"  Failed to process plate '{plate_name}': {str(e)}"
            errors.append(error_msg)
            print(error_msg)

    # Print summary
    print("\n" + "=" * 50)
    print("Summary:")
    print(f"  Hotel: {hotel_name} (ID: {hotel['id']})")
    print(f"  Total plates found: {len(plates)}")
    print(f"  Plates {'deleted' if delete_plates else 'unassigned'}: {cleared_count}")
    print(f"  Errors: {len(errors)}")
    print("=" * 50)

    if errors:
        print("\nErrors encountered:")
        for error in errors:
            print(f"  {error}")
        sys.exit(1)

    print("\nDone!")


def main():
    """Main function."""
    if len(sys.argv) < 2:
        print("Usage: python clear_hotel_plates.py <hotel_name> [--delete]")
        print("")
        print("Options:")
        print("  --delete    Delete plates entirely instead of just unassigning them")
        sys.exit(1)

    hotel_name = sys.argv[1]
    delete_plates = "--delete" in sys.argv

    if delete_plates:
        print("Mode: DELETE (plates will be permanently deleted)")
    else:
        print("Mode: UNASSIGN (plates will be unassigned from nests but not deleted)")

    print("")
    clear_hotel_plates(hotel_name, delete_plates)


if __name__ == "__main__":
    main()
