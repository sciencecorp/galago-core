"""
Import VWorks labware from Windows Registry into Galago database
"""

import winreg
import argparse
import logging
from typing import Dict, Any
from tools.toolbox.labware import *

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

db = Db()


def fetch_vworks_labware() -> Dict[str, Dict[str, Any]]:
    """Fetch all labware from VWorks registry"""
    base_path = r"SOFTWARE\WOW6432Node\Velocity11\Shared\Labware\Labware_Entries"
    all_labware = {}

    try:
        with winreg.OpenKey(
            winreg.HKEY_LOCAL_MACHINE, base_path, 0, winreg.KEY_READ
        ) as base_key:
            i = 0
            while True:
                try:
                    entry_name = winreg.EnumKey(base_key, i)
                    entry_path = f"{base_path}\\{entry_name}"
                    
                    with winreg.OpenKey(
                        winreg.HKEY_LOCAL_MACHINE, entry_path, 0, winreg.KEY_READ
                    ) as entry_key:
                        entry_data = {}
                        j = 0
                        while True:
                            try:
                                name, value, reg_type = winreg.EnumValue(entry_key, j)
                                entry_data[name] = value
                                j += 1
                            except WindowsError:
                                break
                    
                    all_labware[entry_name] = entry_data
                    i += 1
                except WindowsError:
                    break
        
        logger.info(f"Found {len(all_labware)} labware entries in registry")
        return all_labware

    except Exception as e:
        logger.error(f"Error fetching labware: {e}")
        return {}


def filter_labware(
    labware_dict: Dict[str, Dict[str, Any]],
    name_contains: str = None,
    num_wells: int = None,
) -> Dict[str, Dict[str, Any]]:
    """Filter labware by name or number of wells"""
    filtered = {}
    
    for name, data in labware_dict.items():
        # Filter by name
        if name_contains and name_contains.lower() not in name.lower():
            continue
        
        # Filter by exact number of wells
        if num_wells:
            wells = int(data.get("NUMBER_OF_WELLS", 0))
            if wells != num_wells:
                continue
        
        filtered[name] = data
    
    logger.info(f"Filtered to {len(filtered)} labware entries")
    return filtered


def convert_to_galago_format(name: str, vworks_data: Dict[str, Any]) -> Dict[str, Any]:
    """Convert VWorks labware format to Galago format"""
    
    try:
        num_wells = int(vworks_data.get("NUMBER_OF_WELLS", 96))
        
        # Determine rows and columns based on common formats
        if num_wells == 96:
            rows, columns = 8, 12
        elif num_wells == 384:
            rows, columns = 16, 24
        elif num_wells == 1536:
            rows, columns = 32, 48
        else:
            # Default fallback
            rows = 8
            columns = num_wells // rows
        
        galago_labware = {
            "name": name,
            "description": vworks_data.get("DESCRIPTION", ""),
            "number_of_rows": rows,
            "number_of_columns": columns,
            "z_offset": float(vworks_data.get("BRAVO_ROBOT_GRIPPER_OFFSET", 0.0)),
            "width": 127.76,  # Standard SBS plate width in mm
            "height": float(vworks_data.get("THICKNESS", 0.0)),
            "plate_lid_offset": float(vworks_data.get("LID_RESTING_HEIGHT", 0.0)),
            "lid_offset": float(vworks_data.get("LID_DEPARTURE_HEIGHT", 0.0)),
            "stack_height": float(vworks_data.get("STACKING_THICKNESS", 0.0)),
            "has_lid": vworks_data.get("CAN_HAVE_LID", "0") == "1",
            "image_url": vworks_data.get("IMAGE_FILENAME", ""),
        }
        
        return galago_labware
    
    except Exception as e:
        logger.error(f"Error converting {name}: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(
        description="Import VWorks labware into Galago database"
    )
    parser.add_argument(
        "--name-contains",
        help="Filter by labware name (case-insensitive)",
    )
    parser.add_argument(
        "--num-wells",
        type=int,
        help="Filter by number of wells (e.g., 96, 384, 1536)",
    )
    
    args = parser.parse_args()
    
    # Fetch labware from registry
    logger.info("Fetching labware from VWorks registry...")
    all_labware = fetch_vworks_labware()
    
    if not all_labware:
        logger.error("No labware found in registry")
        return
    
    # Apply filters
    filtered_labware = filter_labware(
        all_labware,
        name_contains=args.name_contains,
        num_wells=args.num_wells,
    )
    
    if not filtered_labware:
        logger.warning("No labware matched the filters")
        return
    
    # Upload labware
    logger.info(f"\nUploading {len(filtered_labware)} labware entries...")
    success_count = 0
    skip_count = 0
    fail_count = 0
    
    for name, vworks_data in filtered_labware.items():
        galago_labware = convert_to_galago_format(name, vworks_data)
        
        if not galago_labware:
            fail_count += 1
            continue
        
        try:
            response = db.post_data(galago_labware, "labware")
            
            if response:
                logger.info(f"✓ Uploaded: {name}")
                success_count += 1
            else:
                logger.error(f"✗ Failed: {name}")
                fail_count += 1
                
        except Exception as e:
            logger.error(f"✗ Error uploading {name}: {e}")
            fail_count += 1
    
    # Summary
    logger.info(f"\n{'=' * 50}")
    logger.info("IMPORT SUMMARY")
    logger.info(f"{'=' * 50}")
    logger.info(f"Total processed: {len(filtered_labware)}")
    logger.info(f"✓ Successfully uploaded: {success_count}")
    logger.info(f"✗ Failed: {fail_count}")


if __name__ == "__main__":
    main()