"""
Script to create plates in a hotel and assign them to nests.

Uses variables:
- labware: The plate type (e.g., "96 well")
- current_protocol: Determines the mode ("Reader Assay V1" or "Reader Assay V2")
- plate_count: Number of plates to create (used in V1 mode)
- tmp_file: CSV string with Barcode,Assay columns (used in V2 mode)

V1 Mode: Creates plate_count plates with auto-generated barcodes
V2 Mode: Parses CSV and creates plates using barcodes from the first column
"""

import csv
import io
import os
import sys
from typing import Any, Dict, List, Optional

import requests
from tools.toolbox.variables import get_variable

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


def get_plates() -> List[Dict[str, Any]]:
    """Fetch all plates."""
    try:
        url = f"{API_BASE_URL}/api/inventory/plates"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to fetch plates: {str(e)}")


def get_plate_by_barcode(barcode: str) -> Optional[Dict[str, Any]]:
    """Find a plate by barcode."""
    plates = get_plates()
    for plate in plates:
        if plate.get("barcode") == barcode:
            return plate
    return None


def update_plate(plate_id: int, nest_id: int) -> Dict[str, Any]:
    """Update a plate's nest assignment."""
    try:
        url = f"{API_BASE_URL}/api/inventory/plates/{plate_id}"
        data = {"nestId": nest_id}
        response = requests.put(url, json=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to update plate: {str(e)}")


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


def create_or_update_plate(
    name: str, barcode: str, plate_type: str, nest_id: int
) -> tuple[Dict[str, Any], str]:
    """Create a plate or update existing one. Returns (plate, status)."""
    # First check if plate exists
    existing = get_plate_by_barcode(barcode)
    if existing:
        # Update existing plate's nest assignment
        updated = update_plate(existing["id"], nest_id)
        return updated, "updated"

    # Try to create new plate
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
        return response.json(), "created"
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 409:
            # Conflict - plate exists (maybe with different name but same barcode)
            # Try to find it again with fresh data
            existing = get_plate_by_barcode(barcode)
            if existing:
                updated = update_plate(existing["id"], nest_id)
                return updated, "updated"
            else:
                # Conflict - barcode/name exists in another workcell
                return {"name": name, "barcode": barcode, "id": "existing"}, "exists_other_workcell"
        raise Exception(f"Failed to create plate: {str(e)}")


def parse_csv_string(csv_string: str) -> List[Dict[str, str]]:
    """Parse CSV string and return list of rows as dicts."""
    rows = []
    reader = csv.DictReader(io.StringIO(csv_string.strip()))
    for row in reader:
        # Clean up keys and values (strip whitespace)
        cleaned_row = {k.strip(): v.strip() for k, v in row.items()}
        rows.append(cleaned_row)
    return rows


def create_plates_v1(hotel_id: int, plate_count: int, plate_type: str, hotel_name: str):
    """V1 Mode: Create plates with auto-generated barcodes."""
    print(f"V1 Mode: Creating/updating {plate_count} plates")

    target_column = 1
    created_plates = 0
    updated_plates = 0
    skipped_plates = 0
    errors = []

    for row in range(plate_count):
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

        # Create or update plate
        plate_name = f"Plate-{hotel_name.replace(' ', '')}-R{row}C{target_column}"
        barcode = f"BC-{hotel_name.replace(' ', '')}-{row:03d}"

        print(f"  Processing plate: {plate_name} (barcode: {barcode})")

        try:
            plate, status = create_or_update_plate(
                name=plate_name,
                barcode=barcode,
                plate_type=plate_type,
                nest_id=nest_id,
            )
            if status == "created":
                print(f"  Created plate: {plate['name']} (ID: {plate['id']})")
                created_plates += 1
            elif status == "updated":
                print(f"  Updated existing plate: {plate['name']} (ID: {plate['id']})")
                updated_plates += 1
            elif status == "exists_other_workcell":
                print(f"  Skipped: Barcode '{barcode}' exists in another workcell")
                skipped_plates += 1
            else:
                print(f"  Skipped (already exists): {plate['name']}")
                skipped_plates += 1
        except Exception as e:
            error_msg = f"  Failed to process plate '{plate_name}': {str(e)}"
            errors.append(error_msg)
            print(error_msg)

    return created_plates, updated_plates, skipped_plates, errors


def create_plates_v2(hotel_id: int, csv_data: List[Dict[str, str]], plate_type: str):
    """V2 Mode: Create plates from CSV data using barcodes from first column."""
    print(f"V2 Mode: Creating/updating {len(csv_data)} plates from CSV data")

    target_column = 1
    created_plates = 0
    updated_plates = 0
    skipped_plates = 0
    errors = []

    for row_idx, csv_row in enumerate(csv_data):
        # Get barcode from first column (usually "Barcode" key)
        barcode = None
        for key in csv_row.keys():
            barcode = csv_row[key]
            break  # Use first column value as barcode

        if not barcode:
            print(f"  Skipping row {row_idx}: No barcode found")
            continue

        print(f"\nProcessing row {row_idx}: Barcode '{barcode}'...")

        # Get or create nest at position
        nest = get_nest_by_position(hotel_id, row_idx, target_column)

        if nest:
            print(f"  Found existing nest: {nest['name']} (ID: {nest['id']})")
        else:
            nest_name = f"Nest {row_idx + 1}-{target_column + 1}"
            print(f"  Creating nest: {nest_name}")
            try:
                nest = create_nest(
                    name=nest_name, row=row_idx, column=target_column, hotel_id=hotel_id
                )
                print(f"  Created nest: {nest['name']} (ID: {nest['id']})")
            except Exception as e:
                error_msg = f"  Failed to create nest at row {row_idx}: {str(e)}"
                errors.append(error_msg)
                print(error_msg)
                continue

        nest_id = nest["id"]

        # Use barcode from CSV as both name and barcode
        plate_name = barcode

        print(f"  Processing plate: {plate_name} (barcode: {barcode})")

        try:
            plate, status = create_or_update_plate(
                name=plate_name,
                barcode=barcode,
                plate_type=plate_type,
                nest_id=nest_id,
            )
            if status == "created":
                print(f"  Created plate: {plate['name']} (ID: {plate['id']})")
                created_plates += 1
            elif status == "updated":
                print(f"  Updated existing plate: {plate['name']} (ID: {plate['id']})")
                updated_plates += 1
            elif status == "exists_other_workcell":
                print(f"  Skipped: Barcode '{barcode}' exists in another workcell")
                skipped_plates += 1
            else:
                print(f"  Skipped (already exists): {plate['name']}")
                skipped_plates += 1
        except Exception as e:
            error_msg = f"  Failed to process plate '{plate_name}': {str(e)}"
            errors.append(error_msg)
            print(error_msg)

    return created_plates, updated_plates, skipped_plates, errors


def main():
    """Main function to create plates in a hotel."""

    # Get variables
    labware_var = get_variable("labware")
    current_protocol_var = get_variable("current_protocol")
    plate_count_var = get_variable("plate_count")
    tmp_file_var = get_variable("tmp_file")

    # Extract values
    plate_type = labware_var["value"] if labware_var else "96 well"
    current_protocol = current_protocol_var["value"] if current_protocol_var else ""
    plate_count = int(plate_count_var["value"]) if plate_count_var else 0
    tmp_file_content = tmp_file_var["value"] if tmp_file_var else ""

    hotel_name = "Hotel 1"

    print(f"Protocol: {current_protocol}")
    print(f"Plate Type: {plate_type}")
    print("=" * 50)

    # Step 1: Get or create hotel
    print(f"\nLooking for hotel '{hotel_name}'...")
    hotel = get_hotel_by_name(hotel_name)

    # Determine number of rows needed
    if current_protocol == "Reader Assay V1":
        num_rows = plate_count
    elif current_protocol == "Reader Assay V2":
        csv_data = parse_csv_string(tmp_file_content) if tmp_file_content else []
        num_rows = len(csv_data)
    else:
        print(f"Unknown protocol: {current_protocol}")
        sys.exit(1)

    if hotel:
        print(f"Found existing hotel: {hotel['name']} (ID: {hotel['id']})")
    else:
        print(f"Hotel '{hotel_name}' not found, creating it...")
        hotel = create_hotel(name=hotel_name, rows=max(num_rows, 5), columns=2)
        print(f"Created hotel: {hotel['name']} (ID: {hotel['id']})")

    hotel_id = hotel["id"]

    # Step 2: Create plates based on protocol
    if current_protocol == "Reader Assay V1":
        created_plates, updated_plates, skipped_plates, errors = create_plates_v1(
            hotel_id, plate_count, plate_type, hotel_name
        )
        total_expected = plate_count
    elif current_protocol == "Reader Assay V2":
        csv_data = parse_csv_string(tmp_file_content) if tmp_file_content else []
        if not csv_data:
            print("Error: No CSV data found in tmp_file variable")
            sys.exit(1)
        created_plates, updated_plates, skipped_plates, errors = create_plates_v2(hotel_id, csv_data, plate_type)
        total_expected = len(csv_data)
    else:
        print(f"Unknown protocol: {current_protocol}")
        sys.exit(1)

    # Print summary
    total_processed = created_plates + updated_plates + skipped_plates
    print("\n" + "=" * 50)
    print("Summary:")
    print(f"  Protocol: {current_protocol}")
    print(f"  Hotel: {hotel_name} (ID: {hotel_id})")
    print(f"  Plates created: {created_plates}")
    print(f"  Plates updated: {updated_plates}")
    print(f"  Plates skipped: {skipped_plates}")
    print(f"  Total processed: {total_processed}/{total_expected}")
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
