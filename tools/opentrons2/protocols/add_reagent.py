from opentrons import protocol_api
from opentrons import types
from typing import List
metadata = {"apiLevel": "2.12"}
## FRT_PARAMS_START ###
# The following will be replaced by the actual parameters on the workcell
# during process execution.

# params = {
#     "tiprack_wells":["A1","B1","C1","D1","E1","F1","G1","H1"], 
#     "reagent_wells": ["A1","B1","C1","D1","E1","F1","G1","H1","A2","B2","C2","D2","E2","F2","G2","H2","A3","B3","C3","D3","E3","F3","G3","H3"],
#     "plate_type": "384 well", 
#     "percent_change": 100,
#     "well_array_to_process": [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,293,294,295,296,297,298,299,300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,372,373,374,375,376,377,378,379,380,381,382,383]
# }

params = {
    "plate_type": "6 well",
    "tiprack_wells": {"20 ul tips":[],"1000 ul tips":["A1","B1","C1"]},
    "tipbox_slot": "slot5",
    "reagent_wells": [
      "A1","A2","A3"
    ],
    "well_array_to_process": [
      0,1,2
    ]
  }
#type check params 

if not isinstance(params["tiprack_wells"], dict):
    raise Exception("tiprack_wells must be a dict")
if not isinstance(params["reagent_wells"], list) or not all(isinstance(item, str) for item in params["reagent_wells"]):
    raise Exception("reagent_wells must be a list of strings")
if not isinstance(params["plate_type"], str):
    raise Exception("plate_type must be a string")
if not isinstance(params["well_array_to_process"], list) or not all(isinstance(item, int) for item in params["well_array_to_process"]):
    raise Exception("well_array_to_process must be a list of ints")
if not isinstance(params["tipbox_slot"], str):
    raise Exception("tipbox_slot must be a string")

 #print the params to the command line for debugging


### FRT_PARAMS_END ###
global_reagent_index = 0

PipetteType = protocol_api.instrument_context.InstrumentContext
TiprackType = protocol_api.labware.Labware
PlateType = protocol_api.labware.Labware
wastePlateType = protocol_api.labware.Labware
ReagentPlateType = protocol_api.labware.Labware
protocolType = protocol_api.protocol_context.ProtocolContext
# Get current instrument config = unused reagent well index and unused tip index
PLATE_OFFSET  = 2
tiprack_wells: dict = params["tiprack_wells"]
reagent_wells: List[str] = params["reagent_wells"]
tipbox_slot: str = params["tipbox_slot"]
well_array_to_process: List[int] = params["well_array_to_process"]
plate_type: str = params["plate_type"]
waste_plate_index: int = 0
if plate_type == "96 well":
    addition_volume = 100
elif plate_type == "384 well":
    addition_volume = 60
else:
    addition_volume = 500
percent_change: int = 100



def tilt(slot: int, position: str, pipette:PipetteType, 
         protocol:protocol_api.protocol_context.ProtocolContext) -> None:
    if position == 'up':
        # Reset Location
        protocol.comment("Moving the plate upwards")
        x = 105
        y = 69
        z = 39
        protocol.max_speeds['Z'] = 50
        pipette.move_to(protocol.deck.position_for(slot).move(types.Point(x=x, y=y, z=z)))
        protocol.max_speeds['Z'] = 600
    elif position == 'down':
        protocol.comment("Tilting the plate downwards")
        x = 10
        y = 35
        z = 62
        protocol.max_speeds['Z'] = 300
        pipette.move_to(protocol.deck.position_for(slot).move(types.Point(x=x, y=y, z=z)))
        protocol.max_speeds['Z'] = 600

def plate_type_offset(plate_type: str,process_well_index: int,
                      tilted: bool, 
                      plate:PlateType,location: int=1) -> None:
    if plate_type == "6 well" and tilted is True:
        if process_well_index==0 or process_well_index==1: 
            plate.set_offset(x=11.00, y=-6.00, z=46.50)
        if process_well_index == 2 or process_well_index == 3:
            plate.set_offset(x=7.55, y=-6.00, z=33.50)
        if process_well_index == 4 or process_well_index == 5:
            plate.set_offset(x=5.00, y=-6.00, z=20.50)
    elif plate_type == "6 well" and tilted is False:
        plate.set_offset(x=-10.00, y=-3.00, z=39)
    elif plate_type == "12 well" and tilted is True:
        if process_well_index == 0 or process_well_index==1 or process_well_index==2:
            plate.set_offset(x=6.00, y=-8.00, z=47)
        if process_well_index == 3 or process_well_index==4 or process_well_index==5:
            plate.set_offset(x=5.00, y=-8.00, z=38)
        if process_well_index == 6 or process_well_index==7 or process_well_index==8:
            plate.set_offset(x=3.00, y=-8.00, z=29)
        if process_well_index == 9 or process_well_index==10 or process_well_index==11:
            plate.set_offset(x=2.00, y=-8.00, z=20)
    elif plate_type == "12 well" and tilted is False:
        plate.set_offset(x=-18.00, y=-10.00, z=39.5)
    elif plate_type == "24 well" and tilted is True:
        if process_well_index==0 or process_well_index==1 or process_well_index==2 or process_well_index==3: 
            plate.set_offset(x=19.50, y=-6.00, z=73.50)
        if process_well_index==4 or process_well_index==5 or process_well_index==6 or process_well_index==7: 
            plate.set_offset(x=8.00, y=-6.00, z=46.50)
        if process_well_index==8 or process_well_index==9 or process_well_index==10 or process_well_index==11: 
            plate.set_offset(x=-5.50, y=-6.00, z=16.50)
        if process_well_index==12 or process_well_index==13 or process_well_index==14 or process_well_index==15: 
            plate.set_offset(x=-5.50, y=-6.00, z=16.50)
        if process_well_index==16 or process_well_index==17 or process_well_index==18 or process_well_index==19: 
            plate.set_offset(x=-5.50, y=-6.00, z=16.50)
        if process_well_index==20 or process_well_index==21 or process_well_index==22 or process_well_index==23: 
            plate.set_offset(x=-5.50, y=-6.00, z=16.50)
    elif plate_type == "24 well" and tilted is False and location == 1:
        # print("setting offset")
        plate.set_offset(x=-20.00, y=-10.00, z=39.5)
    elif plate_type == "24 well" and tilted is False and location == 5:
       plate.set_offset(x=-8.00, y=0.00, z=91)
    elif plate_type == "6 well with organoid inserts" and tilted is False:
        plate.set_offset(x=-10.00, y=-8.00, z=38)
    elif plate_type =="96 well" and tilted is False and location == 1:
        print("setting offset")
        plate.set_offset(x=-11.0, y=-9.50, z=39)
    elif plate_type =="384 well" and tilted is False and location == 2:
        plate.set_offset(x=7.50, y=1.1, z=61.0)  
    elif plate_type =="384 well" and tilted is False and location == 1:
        plate.set_offset(x=-11.0, y=-9.50, z=35.5)

def initializePlate(plate_type:str,protocol:protocol_api.protocol_context.ProtocolContext,percent_change:int,plate_location:int=1) -> tuple:
    addition_volume = 0
    removal_volume = 0
    removal_reps = 1
    tilted = False
    if plate_type == "6 well":
        addition_volume = 500
        removal_volume = 900
        if percent_change == 100:
            tilted = True
            removal_reps  = 2 
        elif percent_change == 50:
            tilted = False
            removal_reps =1
        plate = protocol.load_labware("corning_6_wellplate_16.8ml_flat", plate_location)
    elif plate_type == "12 well":
        addition_volume = 1000
        removal_volume = 1000
        plate = protocol.load_labware('corning_12_wellplate_6.9ml_flat', plate_location)
    elif plate_type == "24 well":
        addition_volume = 1000
        removal_volume = 1000
        plate = protocol.load_labware('corning_24_wellplate_3.4ml_flat', plate_location)
    elif plate_type == "48 well":
        plate = protocol.load_labware('corning_48_wellplate_1.6ml_flat', plate_location)
    elif plate_type == "6 well with organoid inserts":
        addition_volume = 1000
        removal_volume = 900
        plate = protocol.load_labware("corning_6_wellplate_16.8ml_flat", plate_location)
    elif plate_type == "96 well":
        removal_volume = 95
        addition_volume = 95
        removal_reps = 1
        plate = protocol.load_labware('nest_96_wellplate_200ul_flat', plate_location)
    elif plate_type == "384 well":
        addition_volume = 60
        removal_volume = 60
        removal_reps = 1
        plate = protocol.load_labware('opentrons_universal_flat_adapter_corning_384_wellplate_112ul_flat',plate_location)
    return plate, addition_volume, removal_volume, removal_reps, tilted


def remove_reagent(process_well_index: int,removal_reps: int,removal_volume: int,
                                 plate_type: str,tiprack:TiprackType, starting_tip: str,
                                 new_tip: bool, plate:PlateType,pipette:PipetteType,
                                 waste_plate:ReagentPlateType,
                                 tilted: bool,protocol:protocolType) -> None:
    waste_plate_index:int = 0
    
    plate_type_offset(plate_type=plate_type,process_well_index=process_well_index,tilted=tilted, plate=plate)
    if plate_type == "384 well" and str(pipette) == "P300 8-Channel GEN2 on right mount":
        plate_type_offset(plate_type=plate_type,process_well_index=process_well_index,tilted=tilted, plate=plate,location=2)
        if process_well_index % 16 == 0:
            protocol.comment("started removing reagent from well: " + str(process_well_index))
            pipette.move_to(plate.wells()[0].top(10))
            pipette.aspirate(removal_volume,plate.wells()[process_well_index])
            pipette.aspirate(removal_volume,plate.wells()[process_well_index+1])
            pipette.move_to(plate.wells()[0].top(10))
            pipette.dispense(2*removal_volume,waste_plate.wells()[0])
            protocol.comment("finished removing reagent from well: " + str(process_well_index))
            # pipette.blow_out(waste_plate.wells()[0])
    elif plate_type == "384 well" and str(pipette) == "P1000 Single-Channel GEN1 on left mount":
        pipette.move_to(plate.wells()[0].top(60))
        pipette.aspirate(removal_volume,plate.wells()[process_well_index])
        pipette.move_to(plate.wells()[0].top(60))
        pipette.dispense(removal_volume,waste_plate.wells()[50])
    elif plate_type == "96 well" and str(pipette) == "P1000 Single-Channel GEN1 on left mount":
        pipette.move_to(plate.wells()[0].top(60))
        pipette.aspirate(removal_volume,plate.wells()[process_well_index])
        pipette.move_to(plate.wells()[0].top(60))
        pipette.dispense(removal_volume,waste_plate.wells()[0])
    elif plate_type == "96 well" and str(pipette) == "P300 8-Channel GEN2 on right mount":
        if process_well_index % 8 == 0:
            pipette.move_to(plate.wells()[0].top(60))
            pipette.aspirate(removal_volume,plate.wells()[process_well_index])
            pipette.move_to(plate.wells()[0].top(60))
            pipette.dispense(removal_volume,waste_plate.wells()[50])
    else:
        for i in range(removal_reps):
            pipette.move_to(plate.wells()[process_well_index].top(40))
            pipette.aspirate(removal_volume, plate.wells()[process_well_index])
            pipette.dispense(removal_volume, waste_plate.wells()[waste_plate_index].top(3))
            pipette.move_to(waste_plate.wells()[0].top(105))

def liquid_transfer(source_well_index: int, destination_well_index:int, transfer_volume: int, 
             source_plate_type: str, destination_plate_type: str, starting_tip: str, tiprack:TiprackType, 
             pipette:PipetteType, source_plate:PlateType, dest_plate:PlateType,
             PLATE_OFFSET: int, new_tip: bool) -> None:
    if not pipette.has_tip:
        next_tip = tiprack.next_tip(starting_tip=tiprack.wells_by_name()[starting_tip])
        pipette.pick_up_tip(next_tip)
    plate_type_offset(plate_type=source_plate_type,process_well_index=source_well_index,tilted=False, plate=source_plate)
    pipette.aspirate(transfer_volume, source_plate.wells()[source_well_index].bottom(PLATE_OFFSET))
    plate_type_offset(plate_type=destination_plate_type,process_well_index=destination_well_index,tilted=False, plate=dest_plate)
    pipette.dispense(transfer_volume, dest_plate.wells()[destination_well_index].top(-4))
    if new_tip is True:
        pipette.move_to(dest_plate.wells()[destination_well_index].top(40))
        pipette.drop_tip()
    

def add_reagent(process_well_index: int,addition_volume: int,
                reagent_index: str,plate_type: str,starting_tip: str,
                new_tip: bool, tilted: bool, plate:PlateType, reagent_plate:ReagentPlateType, tiprack:TiprackType, 
                PLATE_OFFSET: int,pipette:PipetteType, well_array_to_process: list=[],reagent_wells: list=[],reagent_indices: list=[]) -> None:
    global global_reagent_index
    if not pipette.has_tip and new_tip is True:
        next_tip = tiprack.next_tip(starting_tip=tiprack.wells_by_name()[starting_tip])
        pipette.pick_up_tip(next_tip)       
    plate_type_offset(plate_type=plate_type,process_well_index=process_well_index,tilted=tilted, plate=plate)
    if plate_type == "384 well" and str(pipette) == "P300 8-Channel GEN2 on right mount":
        plate_type_offset(plate_type=plate_type,process_well_index=process_well_index,tilted=tilted, plate=plate,location=2)
        global_reagent_index = (global_reagent_index) % len(reagent_indices)
        current_reagent_index =reagent_indices[global_reagent_index]
        if process_well_index % 16 == 0:
            # print("adding reagent to well: ", process_well_index)
            # print("current_reagent_index: ", current_reagent_index)
            # print("reagent wells: ", reagent_wells)
            # print("additional volume: ", addition_volume)
            
            current_reagent_well = reagent_wells[current_reagent_index]
            # print("current_reagent_well: ", current_reagent_well)
            pipette.move_to(reagent_plate.wells_by_name()["A1"].top(5))
            pipette.aspirate(2*addition_volume, reagent_plate.wells_by_name()[current_reagent_well].bottom(1))
            pipette.move_to(reagent_plate.wells_by_name()[current_reagent_well].top(5))
            pipette.dispense(addition_volume, plate.wells()[process_well_index])
            # print("dispensing into well: ", process_well_index)
            pipette.dispense(addition_volume, plate.wells()[process_well_index+1])
            global_reagent_index += 1
            # print("global_reagent_index: ", global_reagent_index)
            if global_reagent_index >= len(reagent_indices):
                global_reagent_index = 0

    elif plate_type == "384 well" and str(pipette) == "P1000 Single-Channel GEN1 on left mount":
        # print("reading from reagent well: ", reagent_index)
        pipette.move_to(reagent_plate.wells_by_name()[reagent_index].top(2))
        pipette.aspirate(addition_volume, reagent_plate.wells_by_name()[reagent_index].bottom(1.5))
        pipette.move_to(reagent_plate.wells_by_name()[reagent_index].top(2))
        pipette.move_to(plate.wells()[process_well_index].top(PLATE_OFFSET))
        pipette.dispense(addition_volume, plate.wells()[process_well_index].top(-4))

        if new_tip is True and plate_type != "384 well":
            pipette.move_to(plate.wells()[process_well_index].top(40))
            pipette.drop_tip()

    elif plate_type == "96 well" and str(pipette) == "P1000 Single-Channel GEN1 on left mount":
        pipette.move_to(reagent_plate.wells_by_name()[reagent_index].top(2))
        pipette.aspirate(addition_volume, reagent_plate.wells_by_name()[reagent_index].bottom(1.5))
        pipette.move_to(reagent_plate.wells_by_name()[reagent_index].top(2))
        pipette.move_to(plate.wells()[process_well_index].top(PLATE_OFFSET))
        pipette.dispense(addition_volume, plate.wells()[process_well_index].top(-4))

    else:
        pipette.move_to(reagent_plate.wells_by_name()[reagent_index].top(2))
        pipette.aspirate(addition_volume, reagent_plate.wells_by_name()[reagent_index].bottom(1.5))
        pipette.move_to(reagent_plate.wells_by_name()[reagent_index].top(2))
        pipette.move_to(plate.wells()[process_well_index].top(PLATE_OFFSET))
        pipette.dispense(addition_volume, plate.wells()[process_well_index].top(-4))
        pipette.blow_out()
        pipette.touch_tip(plate.wells()[process_well_index],radius=0.55,v_offset=-4)


def mix_liquid(process_well_index: int,mix_volume: int,plate_type: str,starting_tip: str,
        tiprack:TiprackType,pipette:PipetteType,plate:PlateType,PLATE_OFFSET: int, 
        new_tip: bool,mix_reps: int, tilted: bool) -> None:
    # print("pipette.has_tip: ", pipette.has_tip)
    if not pipette.has_tip:
        next_tip = tiprack.next_tip(starting_tip=tiprack.wells_by_name()[starting_tip])
        pipette.pick_up_tip(next_tip)

    plate_type_offset(plate_type=plate_type,process_well_index=process_well_index, plate=plate, tilted=tilted)
    
    for _ in range(mix_reps):
        pipette.mix(mix_reps,mix_volume, plate.wells()[process_well_index].bottom(PLATE_OFFSET))
        pipette.blow_out()
    if new_tip is True: 
        pipette.move_to(plate.wells()[process_well_index].top(40))
        pipette.drop_tip()
# Things we also need to pass in -> next well for reagent plate, next tip for tip rack
def run(
    protocol: protocol_api.ProtocolContext,
    addition_volume: int = addition_volume,
    plate_type: str = plate_type,
    reagent_wells: List[str] = reagent_wells,
    tiprack_wells: dict = tiprack_wells,
    tipbox_slot: str = tipbox_slot,
    well_array_to_process: List[int] = well_array_to_process,
) -> None:
    # Initialize Labware and Pipettes
    tips_1000 = tiprack_wells["1000 ul tips"]
    tiprack_200 = protocol.load_labware('opentrons_96_filtertiprack_200ul', 11)
    tiprack_200.set_offset(x=-0.40, y=0.60, z=0.00)

    tiprack_1000 = protocol.load_labware("opentrons_96_filtertiprack_1000ul", 6)
    tiprack_1000.set_offset(x=0.50, y=2, z=0.00)
    
    # new_tip = False
    
    if plate_type=="6 well" or plate_type=="12 well" or plate_type=="24 well" or plate_type=="48 well" or plate_type=="6 well with organoid inserts":
        # Define Reagent Plate
        reagent_plate = protocol.load_labware("nest_96_wellplate_2ml_deep", location="5")
        reagent_plate.set_offset(x=1.50, y=1.00, z=89.5)
        # Define Waste Plate      
        waste_plate = protocol.load_labware("nest_1_reservoir_195ml", 10)
        waste_plate.set_offset(x=-30.00, y=0.50, z=-8.0)
    
    elif plate_type=="96 well" or plate_type=="384 well":
        # Define Reagent Plate
        reagent_plate = protocol.load_labware("nest_96_wellplate_2ml_deep", 5)
        reagent_plate.set_offset(x=0.00, y=1.00, z=90)
        # Define Waste Plate
        waste_plate = protocol.load_labware("nest_96_wellplate_2ml_deep", 10)
        waste_plate.set_offset(x=18, y=0.00, z=20)

    p1000 = protocol.load_instrument("p1000_single", "left", tip_racks=[tiprack_1000])
    p1000.flow_rate.aspirate = 1000
    p1000.flow_rate.dispense = 800
    p1000.default_speed = 600 

    # p300 = protocol.load_instrument('p300_multi_gen2', 'right', tip_racks=[tiprack_200])
    
    plate, addition_volume, removal_volume, removal_reps, tilted = initializePlate(plate_type=plate_type,percent_change=percent_change,protocol=protocol)
    well_count = 0
    for i in range(len(reagent_wells)):
        process_well_index = well_array_to_process[well_count]
        plate_type_offset(plate_type=plate_type,process_well_index=process_well_index,tilted=False, plate=plate)
        starting_tip = tips_1000[well_count]
        next_tip = tiprack_1000.next_tip(starting_tip=tiprack_1000.wells_by_name()[starting_tip])
        p1000.pick_up_tip(next_tip)
        p1000.move_to(reagent_plate.wells_by_name()[reagent_wells[i]].top(2))
        p1000.aspirate(addition_volume, reagent_plate.wells_by_name()[reagent_wells[i]])
        p1000.move_to(reagent_plate.wells_by_name()[reagent_wells[i]].top(2))
        p1000.dispense(addition_volume, plate.wells()[process_well_index])
        p1000.blow_out(plate.wells()[process_well_index].top(2))
        # p1000.mix(3, 200, plate.wells()[process_well_index].bottom(2))
        #TODO replace with tilting x3
        p1000.move_to(plate.wells()[process_well_index].top(2))
        well_count += 1
        tilt(1, "up", pipette=p1000, protocol=protocol)
        tilt(1, "down", pipette=p1000, protocol=protocol)
        p1000.drop_tip()

    protocol.comment("Protocol complete!")
