import requests
from typing import Any
from biology_tools.records.data import CytationDataObjectRecord
from biology_tools.records import bio as rc
import os 
import logging

class Helix:

    def __init__(self) -> None:
        self.base_path = "https://app.science.xyz/api"

def get_culture(self: Any, culture_id: int) -> Any:
        url = f"{self.base_path}/cultures/{culture_id}"
        headers = {"Content-Type": "application/json"}
        logging.debug("url is"+ url)
        try:
            response = requests.get(
                url,
                headers=headers,
                timeout=10  # Set the timeout for the request
            )
            response.raise_for_status()  # Raises an HTTPError if the HTTP request returned an unsuccessful status code
            return response.json()  # Return the response in JSON format
        except requests.exceptions.HTTPError as http_err:
            print(f"HTTP error occurred: {http_err}")  # Python 3.6+
        except Exception as err:
            print(f"An error occurred: {err}")
        return {}

def get_plate_type_from_culture(culture:Any) -> str:
    if culture:
        return str(culture['well_plates'][0]['well_plate_type']['name'])
    else:
        return "uknown"

def get_scientist_from_culture(culture:Any) -> str:

    scientists  = ["Rebecca","Seleipiri", "kev", "Amanda", "Mojgan","Amy","Kacy","Alberto","Mo"]
    if culture:
        # Check if 'tags' exists in culture data
        if 'tags' in culture:
            # Loop through each tag
            for tag in culture['tags']:
                # Check if the tag's name is in the list of scientists
                if tag['name'] in scientists:
                    return str(tag['name'])
        return "Unknown"
    else:
        return "Unknown"

def get_data_from_cytation_file(file_path: str) -> dict:
    if(os.path.isfile(file_path) is False):
        raise RuntimeError(f'Failed to open file: {file_path}')
    with open(file_path, "r", encoding="ISO-8859-1") as file:
        lines = [line.strip() for line in file.readlines() if line.strip()]
        raw_data = CytationDataObjectRecord.parse_analysis_export(lines)
        return dict(raw_data)

def create_well_id_dict(wells: list) -> dict:
    # Map of index to well letter
    index_to_letter = {index: chr(65 + index) for index in range(16)}
    # Initialize the dictionary
    well_id_dict = {}

    # Loop through each well and add the entry to the dictionary
    for well in wells:
        # Convert indexes to well plate format (e.g., A1, B2, ...)
        well_id = f"{index_to_letter[well['row_index']]}{well['column_index'] + 1}"
        # Add to dictionary
        well_id_dict[well_id] = well['id']

    return well_id_dict

#wells_dict = create_well_id_dict([1,2,3,4,5,6])
#print(wells_dict[6])
# def get_well_id_from_well(culture_id:int, well:str) -> Any:
#     get_wells = getCulture(Helix(),culture_id)['well_plates'][0]['wells']
#     well_id_dict = create_well_id_dict(get_wells)
#     well_id = well_id_dict[well]
#     return well_id

def getWellIDsAndConfluenceValuesFromDataObject(record_id: int, threshold:int) -> dict:
    cytation_record = CytationDataObjectRecord.from_helix(record_id = record_id)
    object_data = cytation_record.object_data
    logging.debug("object_data is"+ str(object_data))
    logging.debug("object data type is"+ str(type(object_data)))
    data = object_data
    # print(data)
    well_ids = []
    well_confluence = {}
    for key, value in data['stats'].items():
        # print(value)

        well_ids.append(key)
        try:
            confluence = float(value["%Confluence from Cellular Analysis"])
            # print("confluence",confluence)
            if confluence >= threshold:
                # Round to the nearest 10s
                confluence = round(confluence / 10) * 10
            else:
                confluence = 0
            well_confluence[key] = confluence
        except ValueError:
            # Handle cases where confluence value is not a valid number
            well_confluence[key] = 0
    return well_confluence

def swap_well_ids_from_wells_name(self:Any,well_confluence: dict, culture_id:int) -> dict:
    get_wells = get_culture(self.base_path,culture_id)['well_plates'][0]['wells']
    well_id_dict = create_well_id_dict(get_wells)
    # print(well_id_dict)
    #create new dict swapping the alphanumeric well representation with the Helix well ID as key and confluence as value
    new_dict = {}
    for key, value in well_confluence.items():
        new_dict[well_id_dict[key]] = value
    return new_dict


def getCultureIDFromDataObjectID(data_object_id: int) -> Any:
    cytation_record = CytationDataObjectRecord.from_helix(record_id=data_object_id)
    object_data = cytation_record.object_data
    culture_id = object_data["culture_id"]
    return culture_id


def put_bulk_update_well_notes(self:Any, dataObjectID: int,threshold:int) -> None:
    # Define the URL for the PUT request
    url = f"{self.base_path}/wells/bulk_update_notes"
    headers = {"Content-Type": "application/json"} 
    # Get the well IDs from the data object
    getWellIDsAndConfluenceValuesFromDataObject(dataObjectID, threshold)
    # Get the culture ID from the data object
    culture_id = getCultureIDFromDataObjectID(dataObjectID)
    well_note_dict = swap_well_ids_from_wells_name(self=self,well_confluence=getWellIDsAndConfluenceValuesFromDataObject(dataObjectID,threshold),culture_id=culture_id)
    
    # Iterate through each well and its corresponding note and update the note
    for well_id, note in well_note_dict.items():
        # Define the payload for the PUT request
        print("well_id",well_id)
        print("note",note)
        payload = {
            "ids": [well_id],
            "notes": note
        }
        try:
            print(f"Updating well note for well ID: {well_id}")
            # Send the PUT request for the current well
            print("payload", payload)
            response = requests.put(
                url,
                headers=headers,
                json=payload,
                timeout=10  # Set the timeout for the request
            )
            response.raise_for_status()  # Raises an HTTPError if the HTTP request returned an unsuccessful status code
            print(f"Successfully updated well note for well ID: {well_id}")
        except requests.exceptions.HTTPError as http_err:
            print(f"HTTP error occurred: {http_err}")
        except Exception as err:
            print(f"An error occurred: {err}")


def generate_well_coords(plate_type: int) -> list[dict[str, int]]:
            # Mapping of plate types to their respective number of rows and columns
            plate_layout = {
                6: (2, 3),
                12: (3, 4),
                24: (4, 6),
                96: (8, 12),
                384: (16, 24),
                # Add more plate types here if needed
            }

            # Get the number of rows and columns for the given plate type
            rows, cols = plate_layout.get(plate_type, (0, 0))

            # Generate well coordinates
            well_coords = []
            for row in range(rows):
                for col in range(cols):
                    well_coords.append({'row_index': row, 'column_index': col})

            return well_coords

def attach_culture_to_well_plate(well_plate_id:int, culture_id:int, well_coords:list[dict[str, int]]) -> Any:
        well_plate = rc.WellPlateRecord.from_helix(well_plate_id)
        wells_to_update = []
        if not well_coords:
            wells_to_update = well_plate.wells
        else:
            wells_to_update = well_plate.select_wells(well_coords)

        well_ids = [w.id for w in wells_to_update]
        return rc.attach_culture_to_wells(culture_id=culture_id, well_ids=well_ids)



def post_note_to_well_by_index(self:Any, culture_id: int, well_index: int, note: str) -> None:
    """
    Post a note to a specific well identified by a zero-based index in the culture's well plate.
    """
    # Step 1: Retrieve the culture details
    culture_details = get_culture(self,culture_id)
    print(culture_details)
    if not culture_details:
        print("Failed to retrieve culture details.")
        return
    
    # Assuming the culture has at least one well plate and it's the first one we're interested in
    wells = culture_details['well_plates'][0]['wells']

    # Step 2: Generate the well ID mapping if not already provided
    well_id_dict = create_well_id_dict(wells)

    # Determine the plate type to calculate rows and columns
    plate_type = get_plate_type_from_culture(culture_details)
    print("plate type: ", plate_type)
    plate_layout = {
        "6 well": (2, 3),
        "12 well": (3, 4),
        "24 well": (4, 6),
        "48 well": (6, 8),
        "96 well": (8, 12),
        "384 well": (16, 24),
        # Add more mappings as needed
    }
    # drop the well from plate_type,leaving the number
    if plate_type not in plate_layout:
        print("Unknown or unsupported plate type.")
        return
    
    rows, cols = plate_layout[plate_type]

    # Step 3: Calculate row and column index from well_index
    row_index = well_index // cols
    column_index = well_index % cols

    # Convert to well_id format (e.g., A1, B2, ...)
    row_letter = chr(65 + row_index)
    well_id_format = f"{row_letter}{column_index + 1}"

    # Step 4: Lookup the unique well ID using the mapping
    if well_id_format in well_id_dict:
        unique_well_id = well_id_dict[well_id_format]
    else:
        print(f"Could not find a well with the index {well_index} (formatted as {well_id_format}).")
        return
    
    # Step 5: Post the note to the well using the unique ID
    url = "https://app.science.xyz/api/wells/bulk_update_notes"
    payload = {
            "ids": [unique_well_id],
             "notes": note}
    headers = {"Content-Type": "application/json"}
    print(f"Posting note '{note}' to well ID {unique_well_id}...")
    print(f"Payload: {payload}")
    try:
        response = requests.put(url, headers=headers, json=payload)
        response.raise_for_status()
        print(f"Successfully posted note '{note}' to well ID {unique_well_id}.")
    except requests.exceptions.RequestException as e:
        print(f"Failed to post note to well. Error: {e}")

# Note: Ensure that 'get_plate_type_from_culture' returns a string that matches the keys in 'plate_layout'
# You may need to adjust 'plate_layout' keys to match the expected strings from 'get_plate_type_from_culture'
