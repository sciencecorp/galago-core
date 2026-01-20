"""
Script to create or reset variables for protocol runs.
"""

from tools.toolbox.variables import get_variable, update_variable, create_variable

variables_to_create = [
    {
        "name": "counter",
        "value": "0",
        "type": "number",
    },
    {
        "name": "plate_counter",
        "value": "0",
        "type": "number",
    },
    {
        "name": "times_to_loop",
        "value": "0",
        "type": "number",
    },
    {
        "name": "user_name",
        "value": "",
        "type": "string",
    },
    {
        "name": "custom_message",
        "value": "",
        "type": "string",
    },
    {
        "name": "confirm_message",
        "value": "",
        "type": "string",
    },
    {
        "name": "total_plates",
        "value": "0",
        "type": "number",
    },
    {
        "name": "tmp_file",
        "value": "",
        "type": "string",
    },
    {
        "name": "current_barcode",
        "value": "",
        "type": "string",
    },
    {
        "name": "all_barcodes",
        "value": "[]",
        "type": "array",
    },
    {
        "name": "plate_type",
        "value": "",
        "type": "string",
    },
    {
        "name": "skip_sealing",
        "value": "true",
        "type": "boolean",
    },
    {
        "name": "timer_duration",
        "value": "0",
        "type": "number",
    },
]

for var in variables_to_create:
    exists = get_variable(var["name"])
    if not exists:
        print(f"Variable {var['name']} does not exist. Creating it.")
        create_variable(var)
    else:
        print(f"Variable {var['name']} exists. Resetting to default value.")
        update_variable(var["name"], var["value"])

print("All variables initialized.")
