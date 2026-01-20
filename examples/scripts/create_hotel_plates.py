"""
Script to create plates in a hotel and assign them to nests.

Creates 5 plates in "Hotel 1" and assigns them to nests at column 1, rows 0-4.
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


def create_hotel(name: str, rows: int, columns: int) -> Dict[str, Any]:
    """Create a new hotel."""
    try:
        url = f"{API_BASE_URL}/api/inventory/hotels"
        data = {"name": name, "rows": rows, "columns": columns}
        response = requests.post(url, json=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to create hotel: {str(e)}")


def get_nests() -> List[Dict[str, Any]]:
    """Fetch all nests."""
    try:
        url = f"{API_BASE_URL}/api/inventory/nests"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to fetch nests: {str(e)}")


def create_nest(name: str, row: int, column: int, hotel_id: int) -> Dict[str, Any]:
    """Create a nest in a hotel."""
    try:
        url = f"{API_BASE_URL}/api/inventory/nests"
        data = {
            "name": name,
            "row": row,
            "column": column,
            "hotelId": hotel_id,
            "toolId": None,
        }
        response = requests.post(url, json=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to create nest: {str(e)}")


def get_nest_by_position(
    hotel_id: int, row: int, column: int
) -> Optional[Dict[str, Any]]:
    """Find a nest by its position in a hotel."""
    nests = get_nests()
    for nest in nests:
        if (
            nest.get("hotelId") == hotel_id
            and nest.get("row") == row
            and nest.get("column") == column
        ):
            return nest
    return None


def create_plate(
    name: str, barcode: str, plate_type: str, nest_id: int
) -> Dict[str, Any]:
    """Create a plate and assign it to a nest."""
    try:
        url = f"{API_BASE_URL}/api/inventory/plates"
        data = {
            "name": name,
            "barcode": barcode,
            "plateType": plate_type,
            "nestId": nest_id,
        }
        response = requests.post(url, json=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to create plate: {str(e)}")


def main():
    """Main function to create plates in a hotel."""
    hotel_name = "Hotel 1"
    num_plates = 5
    target_column = 1
    plate_type = "96 well"

    print(f"Creating {num_plates} plates in '{hotel_name}'")
    print(f"Target positions: column {target_column}, rows 0-{num_plates - 1}")
    print("=" * 50)

    # Step 1: Get or create hotel
    print(f"\nLooking for hotel '{hotel_name}'...")
    hotel = get_hotel_by_name(hotel_name)

    if hotel:
        print(f"Found existing hotel: {hotel['name']} (ID: {hotel['id']})")
    else:
        print(f"Hotel '{hotel_name}' not found, creating it...")
        hotel = create_hotel(name=hotel_name, rows=num_plates, columns=2)
        print(f"Created hotel: {hotel['name']} (ID: {hotel['id']})")

    hotel_id = hotel["id"]

    # Step 2: Create nests and plates
    created_plates = 0
    errors = []

    for row in range(num_plates):
        print(f"\nProcessing row {row}...")

        # Get or create nest at position
        nest = get_nest_by_position(hotel_id, row, target_column)

        if nest:
            print(f"  Found existing nest: {nest['name']} (ID: {nest['id']})")
        else:
            nest_name = f"Nest {row + 1}-{target_column + 1}"
            print(f"  Creating nest: {nest_name}")
            try:
                nest = create_nest(
                    name=nest_name, row=row, column=target_column, hotel_id=hotel_id
                )
                print(f"  Created nest: {nest['name']} (ID: {nest['id']})")
            except Exception as e:
                error_msg = f"  Failed to create nest at row {row}: {str(e)}"
                errors.append(error_msg)
                print(error_msg)
                continue

        nest_id = nest["id"]

        # Create plate
        plate_name = f"Plate-{hotel_name.replace(' ', '')}-R{row}C{target_column}"
        barcode = f"BC-{hotel_name.replace(' ', '')}-{row:03d}"

        print(f"  Creating plate: {plate_name} (barcode: {barcode})")

        try:
            plate = create_plate(
                name=plate_name,
                barcode=barcode,
                plate_type=plate_type,
                nest_id=nest_id,
            )
            print(f"  Created plate: {plate['name']} (ID: {plate['id']})")
            created_plates += 1
        except Exception as e:
            error_msg = f"  Failed to create plate '{plate_name}': {str(e)}"
            errors.append(error_msg)
            print(error_msg)

    # Print summary
    print("\n" + "=" * 50)
    print("Summary:")
    print(f"  Hotel: {hotel_name} (ID: {hotel_id})")
    print(f"  Plates created: {created_plates}/{num_plates}")
    print(f"  Errors: {len(errors)}")
    print("=" * 50)

    if errors:
        print("\nErrors encountered:")
        for error in errors:
            print(f"  {error}")
        sys.exit(1)

    print("\nDone!")


if __name__ == "__main__":
    main()
