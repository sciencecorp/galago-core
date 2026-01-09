"""
Script to import robot arm locations from a GBG XML Locations file
"""

import os
import sys
import xml.etree.ElementTree as ET
from typing import Any, Dict, List

import requests

API_BASE_URL = os.getenv("GALAGO_API_URL", "http://localhost:3010")


def get_tool_by_name(tool_name: str):
    """Fetch tool by name and validate it's a pf400."""
    try:
        url = f"{API_BASE_URL}/api/tools/{tool_name}"
        print(f"Fetching tool info from: {url}")
        response = requests.get(url)
        response.raise_for_status()
        tool = response.json()

        # Verify it's a pf400 type tool
        if tool.get("type") != "pf400":
            raise Exception(
                f"Tool '{tool_name}' is type '{tool.get('type')}', but must be type 'pf400'"
            )

        print(f"✓ Found tool: {tool['name']} (ID: {tool['id']}, Type: {tool['type']})")
        return tool
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to fetch tool '{tool_name}': {str(e)}")


def create_location(data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a location via the API."""
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/robot-arm/locations",
            json=data,
            headers={"Content-Type": "application/json"},
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to create location: {str(e)}")


def is_valid_location_name(name: str) -> bool:
    """Check if location name is valid."""
    # Skip empty names, numeric-only names, or names that are just whitespace
    if not name or not name.strip():
        return False
    if name.strip().isdigit():
        return False
    return True


def are_all_joints_zero(joints: List[str]) -> bool:
    """Check if all joint values are zero."""
    try:
        return all(float(joint) == 0.0 for joint in joints)
    except ValueError:
        return False


def parse_and_import_xml(file_path: str, tool_id: int):
    """Parse XML file and import locations."""
    print(f"Reading XML file: {file_path}")

    # Parse XML file
    tree = ET.parse(file_path)
    root = tree.getroot()

    # Find all Location elements
    # Handle both with and without namespace
    locations = root.findall(
        ".//{http://www.w3.org/2001/XMLSchema-instance}JointLocation"
    ) or root.findall(".//Location")

    if not locations:
        # Try without namespace prefix
        locations = [elem for elem in root.iter() if "Location" in elem.tag]

    print(f"Found {len(locations)} locations in XML file")

    imported = 0
    skipped = 0
    errors = []

    for location in locations:
        # Get name
        name_elem = location.find("Name")
        if name_elem is None or name_elem.text is None:
            skipped += 1
            print("⏭️  Skipped: Empty or invalid name")
            continue

        name = name_elem.text

        # Skip invalid names
        if not is_valid_location_name(name):
            skipped += 1
            print(f"⏭️  Skipped: '{name}' (invalid name)")
            continue

        # Extract joint values
        joints = []
        for i in range(1, 7):
            joint_elem = location.find(f"Joint{i}")
            if joint_elem is not None and joint_elem.text:
                joints.append(joint_elem.text.strip())
            else:
                joints.append("0")

        # Skip if all joints are zero
        if are_all_joints_zero(joints):
            skipped += 1
            print(f"⏭️  Skipped: '{name}' (all joints are zero)")
            continue

        # Create location data
        location_data = {
            "name": name,
            "locationType": "j",
            "coordinates": " ".join(joints),
            "orientation": "landscape",
            "toolId": tool_id,
        }

        try:
            create_location(location_data)
            imported += 1
            print(f"✅ Imported: '{name}'")
        except Exception as e:
            error_msg = f"❌ Failed to import '{name}': {str(e)}"
            errors.append(error_msg)
            print(error_msg)

    # Print summary
    print("\n" + "=" * 50)
    print("Import Summary:")
    print(f"Total locations in file: {len(locations)}")
    print(f"Successfully imported: {imported}")
    print(f"Skipped: {skipped}")
    print(f"Errors: {len(errors)}")
    print("=" * 50)

    if errors:
        print("\nErrors:")
        for error in errors:
            print(error)


def main():
    """Main function."""

    file_path = "/Users/<username>/Downloads/PreciseArm Locations.xml"
    tool_name = "Pf400"

    tool = get_tool_by_name(tool_name)
    if not tool:
        print(f"Error: Tool '{tool_name}' not found")
        sys.exit(1)

    tool_id = tool["id"]
    print(f"Using tool ID: {tool_id}\n")

    if not os.path.exists(file_path):
        print(f"Error: File not found: {file_path}")
        sys.exit(1)

    try:
        parse_and_import_xml(file_path, tool_id)
        print("\n✨ Import completed!")
    except Exception as e:
        print(f"\n❌ Import failed: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
