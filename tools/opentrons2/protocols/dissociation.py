from opentrons import protocol_api
from typing import List
from opentrons import types
metadata = {"apiLevel": "2.12"}
## FRT_PARAMS_START ###
# The following will be replaced by the actual parameters on the workcell
# during process execution.
global_reagent_index = 0
# params for 384 well plate
params = {
     "plate_type": "384 well",
    "tiprack_wells": [
      "F1"
    ],
    "tipbox_slot": 6,
    "reagent_wells": [
      "A1",
      "A2",
      "A3",
      "A4",
      "A5",
      "A6"
    ],
    "well_array_to_process": [
      58,
      74,
      106,
      110,
      125,
      171,
      198,
      217,
      267,
      273,
      315,
      355
    ]
  }
# params = {
#     "plate_type": "6 well",
#     "tiprack_wells": [
#       "H5"
#     ],
#     "tipbox_slot": 6,
#     "reagent_wells": [
#       "A1",
#       "A2",
#       "A3",
#       "A4",
#       "A5",
#       "A6"
#     ],
#     "well_array_to_process": [
#       0,1
#     ]
# }
# params for 6 well plate

# params = {
#     "tiprack_wells":["A1","B1","C1","D1","E1","F1"],
#     "reagent_wells": ["A1","B1","C1","D1","E1","F1","G1","H1","A2","B2","C2","D2"],
#     "plate_type": "6 well", 
#     "percent_change": 100,
#     "well_array_to_process": [0,1,2,3,4,5]
# }

#type check params 

if not isinstance(params["tiprack_wells"], list) or not all(isinstance(item, str) for item in params["tiprack_wells"]):
    raise Exception("tiprack_wells must be a list of strings")
if not isinstance(params["reagent_wells"], list) or not all(isinstance(item, str) for item in params["reagent_wells"]):
    raise Exception("reagent_wells must be a list of strings")
if not isinstance(params["plate_type"], str):
    raise Exception("plate_type must be a string")
if not isinstance(params["well_array_to_process"], list) or not all(isinstance(item, int) for item in params["well_array_to_process"]):
    raise Exception("well_array_to_process must be a list of ints")
if not isinstance(params["tipbox_slot"], int):
    raise Exception("tipbox_slot must be an int")

 #print the params to the command line for debugging


### FRT_PARAMS_END ###
PipetteType = protocol_api.instrument_context.InstrumentContext
TiprackType = protocol_api.labware.Labware
PlateType = protocol_api.labware.Labware
wastePlateType = protocol_api.labware.Labware
ReagentPlateType = protocol_api.labware.Labware
protocolType = protocol_api.protocol_context.ProtocolContext

# Get current instrument config = unused reagent well index and unused tip index
PLATE_OFFSET  = 2
tiprack_wells: List[str] = params["tiprack_wells"]
tipbox_slot: int = params["tipbox_slot"]
reagent_wells: List[str] = params["reagent_wells"]
well_array_to_process: List[int] = params["well_array_to_process"]
plate_type: str = params["plate_type"]
waste_plate_index: int = 0
percent_change: int = 100
new_tip = False
if plate_type == "96 well":
    addition_volume = 100
elif plate_type == "384 well":
    addition_volume = 100
else:
    addition_volume = 1000

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
        pipette.move_to(protocol.deck.position_for(slot).move(types.Point(x=x, y=y, z=z)))
  
def plate_type_offset(plate_type: str,process_well_index: int,
                      tilted: bool, 
                      plate:PlateType,location: int=1) -> None:
    if plate_type == "6 well" and tilted is True:
        if process_well_index==0 or process_well_index==1: 
            plate.set_offset(x=11.00, y=-6.00, z=45.50)
        if process_well_index == 2 or process_well_index == 3:
            plate.set_offset(x=7.55, y=-6.00, z=32.50)
        if process_well_index == 4 or process_well_index == 5:
            plate.set_offset(x=5.00, y=-6.00, z=19.50)
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
        plate.set_offset(x=-18.00, y=-10.00, z=39)
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
        plate.set_offset(x=-20.00, y=-10.00, z=39.5)
    elif plate_type == "24 well" and tilted is False and location == 5:
        plate.set_offset(x=-8.00, y=0.00, z=90)
    elif plate_type == "6 well with organoid inserts" and tilted is False:
        plate.set_offset(x=-10.00, y=-8.00, z=38)
    elif plate_type =="96 well" and tilted is False:
        plate.set_offset(x=13.00, y=-8.00, z=60.00)
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
        new_tip = False
        addition_volume = 1000
        removal_volume = 1000
        if percent_change == 100:
            tilted = True
            removal_reps  = 2 
        elif percent_change == 50:
            tilted = False
            removal_reps =1
        plate = protocol.load_labware("corning_6_wellplate_16.8ml_flat", plate_location)
    elif plate_type == "12 well":
        new_tip = True
        addition_volume = 1000
        removal_volume = 1000
        plate = protocol.load_labware('corning_12_wellplate_6.9ml_flat', plate_location)
    elif plate_type == "24 well":
        new_tip = False
        addition_volume = 1000
        removal_volume = 1000
        plate = protocol.load_labware('corning_24_wellplate_3.4ml_flat', plate_location)
    elif plate_type == "48 well":
        new_tip = True
        plate = protocol.load_labware('corning_48_wellplate_1.6ml_flat', plate_location)
    elif plate_type == "6 well with organoid inserts":
        addition_volume = 1000
        removal_volume = 900
        plate = protocol.load_labware("corning_6_wellplate_16.8ml_flat", plate_location)
    elif plate_type == "96 well":
        new_tip = False
        removal_volume = 100
        removal_reps = 1
        plate = protocol.load_labware('nest_96_wellplate_200ul_flat', plate_location)
    elif plate_type == "384 well":
        new_tip = False
        addition_volume = 60
        removal_volume = 100
        removal_reps = 1
        plate = protocol.load_labware('opentrons_universal_flat_adapter_corning_384_wellplate_112ul_flat',plate_location)
    return plate, addition_volume, removal_volume, removal_reps, tilted, new_tip


def remove_reagent(process_well_index: int,removal_reps: int,removal_volume: int,
                                 plate_type: str,tiprack:TiprackType, starting_tip: str,
                                 new_tip: bool, plate:PlateType,pipette:PipetteType,
                                 waste_plate:ReagentPlateType,
                                 tilted: bool,protocol:protocolType) -> None:
    print("removing reagent from well: ", process_well_index)
    waste_plate_index:int = 0
    
    plate_type_offset(plate_type=plate_type,process_well_index=process_well_index,tilted=tilted, plate=plate,location=1)
    if plate_type == "384 well" and str(pipette) == "P300 8-Channel GEN2 on right mount":
        if process_well_index % 16 == 0:
            pipette.move_to(plate.wells()[0].top(10))
            pipette.aspirate(removal_volume,plate.wells()[process_well_index])
            pipette.aspirate(removal_volume,plate.wells()[process_well_index+1])
            pipette.move_to(plate.wells()[0].top(10))
            pipette.dispense(2*removal_volume,waste_plate.wells()[0])
            pipette.blow_out(waste_plate.wells()[0])
    elif plate_type == "384 well" and str(pipette) == "P1000 Single-Channel GEN1 on left mount":
        pipette.move_to(plate.wells()[process_well_index].top(40))
        pipette.aspirate(removal_volume,plate.wells()[process_well_index])
        pipette.dispense(removal_volume, waste_plate.wells()[waste_plate_index].top(3))
    elif plate_type == "96 well":
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
    plate_type_offset(plate_type=source_plate_type,process_well_index=source_well_index,tilted=False, plate=source_plate,location=1)
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
    print("adding reagent_index", reagent_index)
    print("to process_well_index: ", process_well_index)
    global global_reagent_index
    if not pipette.has_tip and new_tip is True:
        next_tip = tiprack.next_tip(starting_tip=tiprack.wells_by_name()[starting_tip])
        pipette.pick_up_tip(next_tip)       
    plate_type_offset(plate_type=plate_type,process_well_index=process_well_index,tilted=tilted, plate=plate,location=1)
    if plate_type == "384 well" and str(pipette) == "P300 8-Channel GEN2 on right mount":
        global_reagent_index = (global_reagent_index) % len(reagent_indices)
        current_reagent_index =reagent_indices[global_reagent_index]
        if process_well_index % 16 == 0:
            # print("current_reagent_index: ", current_reagent_index)
            # print("reagent wells: ", reagent_wells)
            current_reagent_well = reagent_wells[current_reagent_index]
            pipette.move_to(reagent_plate.wells_by_name()[current_reagent_well].top(5))
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

    elif plate_type == "96 well":
        reagent_indices = [0, 8, 16]
        current_reagent_index = 0
        for i in range(len(well_array_to_process)):
            process_well_index = well_array_to_process[i]
            current_reagent_well = reagent_wells[current_reagent_index]
            pipette.move_to(reagent_plate.wells_by_name()[current_reagent_well].top(5))
            pipette.aspirate(100, reagent_plate.wells_by_name()[current_reagent_well].bottom(1))
            pipette.move_to(reagent_plate.wells_by_name()[current_reagent_well].top(5))
            pipette.dispense(100, plate.wells()[process_well_index])
            current_reagent_index = (current_reagent_index + 1) % len(reagent_indices)
        pipette.move_to(plate.wells()[0].top(60))
        pipette.drop_tip()
    else:
        pipette.move_to(reagent_plate.wells_by_name()[reagent_index].top(2))
        pipette.aspirate(addition_volume, reagent_plate.wells_by_name()[reagent_index].bottom(1.5))
        pipette.move_to(reagent_plate.wells_by_name()[reagent_index].top(2))
        pipette.move_to(plate.wells()[process_well_index].top(PLATE_OFFSET))
        pipette.dispense(addition_volume, plate.wells()[process_well_index].top(-4))


def mix_liquid(process_well_index: int,mix_volume: int,plate_type: str,starting_tip: str,
        tiprack:TiprackType,pipette:PipetteType,plate:PlateType,PLATE_OFFSET: int, 
        new_tip: bool,mix_reps: int, tilted: bool) -> None:
    print("pipette.has_tip: ", pipette.has_tip)
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
    tiprack_wells: List[str] = tiprack_wells,
    tipbox_slot: int = tipbox_slot,
    well_array_to_process: List[int] = well_array_to_process,
) -> None:
    # Initialize Labware and Pipettes

    tiprack_200 = protocol.load_labware('opentrons_96_filtertiprack_200ul', 11)
    tiprack_200.set_offset(x=-0.40, y=0.60, z=0.00)

    tiprack_1000 = protocol.load_labware("opentrons_96_filtertiprack_1000ul", tipbox_slot)
    tiprack_1000.set_offset(x=0.50, y=2, z=0.00)
    
    reagent_plate = protocol.load_labware("nest_96_wellplate_2ml_deep", 5)
    reagent_plate.set_offset(x=0.00, y=1.00, z=90)
            
    waste_plate = protocol.load_labware("nest_1_reservoir_195ml", 10)
    waste_plate.set_offset(x=-30.00, y=0.50, z=-8.0)

    

    p1000 = protocol.load_instrument("p1000_single", "left", tip_racks=[tiprack_1000])
    p1000.flow_rate.aspirate = 1000
    p1000.flow_rate.dispense = 800
    p1000.default_speed = 600 

    

    plate, addition_volume, removal_volume, removal_reps, tilted,new_tip = initializePlate(plate_type=plate_type,percent_change=percent_change,protocol=protocol,plate_location=1)
    well_count = 0
    if (plate_type=="6 well" or plate_type=="12 well" or plate_type=="24 well" or plate_type=="48 well" or plate_type=="6 well with organoid inserts"):
        # print("tilted: ", tilted)
        addition_reps = 1
        for i in range(len(well_array_to_process)):
            if new_tip is False:
                starting_tip = tiprack_wells[0]
            else:
                starting_tip = tiprack_wells[i]
            if not p1000.has_tip:
                next_tip = tiprack_1000.next_tip(starting_tip=tiprack_1000.wells_by_name()[starting_tip])
                p1000.pick_up_tip(next_tip)
                # print("getting new tip", starting_tip)
                if plate_type == "6 well":
                    tilt(1, "up", pipette=p1000, protocol=protocol)
            process_well_index = well_array_to_process[i]
            remove_reagent(process_well_index,removal_reps=removal_reps,
                            removal_volume=removal_volume,
                            plate_type=plate_type,starting_tip=starting_tip,
                            tiprack=tiprack_1000,pipette=p1000,plate=plate,
                            waste_plate=waste_plate,new_tip=new_tip, tilted=tilted,protocol=protocol)
            
            for j in range(addition_reps):
                reagent_index = reagent_wells[well_count]
                add_reagent(process_well_index=process_well_index,addition_volume=addition_volume,
                                reagent_index=reagent_index,plate_type=plate_type,
                                starting_tip=starting_tip,new_tip=new_tip, tilted=tilted,
                                pipette=p1000,plate=plate,reagent_plate=reagent_plate,
                                tiprack=tiprack_1000,PLATE_OFFSET=PLATE_OFFSET)
                well_count += 1
            if tilted is True:
                tilt(1, "down", pipette=p1000, protocol=protocol)

    elif (plate_type=="96 well" or plate_type=="384 well"):
        
            starting_tip = tiprack_wells[0]
            if not p1000.has_tip:
                next_tip = tiprack_1000.next_tip(starting_tip=tiprack_1000.wells_by_name()[starting_tip])
                p1000.pick_up_tip(next_tip)
            for i in range(len(well_array_to_process)):
                process_well_index = well_array_to_process[i]
                remove_reagent(process_well_index,removal_reps=removal_reps,
                                removal_volume=removal_volume,
                                plate_type=plate_type,starting_tip=starting_tip,
                                tiprack=tiprack_1000,pipette=p1000,plate=plate,
                                waste_plate=waste_plate,new_tip=new_tip, tilted=tilted,protocol=protocol)
        
            for i in range(len(well_array_to_process)):
                process_well_index = well_array_to_process[i]
                reagent_index = reagent_wells[well_count]
                print("reagent index: ", reagent_index)
                add_reagent(process_well_index=process_well_index,
                            addition_volume=addition_volume,reagent_index=reagent_index,plate_type=plate_type,
                            starting_tip=starting_tip,new_tip=new_tip, tilted=False,
                            pipette=p1000,plate=plate,reagent_plate=reagent_plate,
                            tiprack=tiprack_1000,PLATE_OFFSET=PLATE_OFFSET,reagent_wells=reagent_wells)
                well_count += 1
                if well_count >= len(reagent_wells):
                    well_count = 0
    p1000.move_to(plate.wells()[0].top(50))

    protocol.delay(minutes=1)

    if (plate_type=="6 well" or plate_type=="12 well" or plate_type=="24 well" or plate_type=="48 well" or plate_type=="6 well with organoid inserts"):
        for i in range(len(well_array_to_process)):
            if new_tip is False:
                starting_tip = tiprack_wells[0]
            else:
                starting_tip = tiprack_wells[i]
            if not p1000.has_tip:
                next_tip = tiprack_1000.next_tip(starting_tip=tiprack_1000.wells_by_name()[starting_tip])
                p1000.pick_up_tip(next_tip)
            tilt(1, "up", pipette=p1000, protocol=protocol)
            process_well_index = well_array_to_process[i]
            removal_reps = 1
            remove_reagent(process_well_index,removal_reps=removal_reps,
                            removal_volume=removal_volume,
                            plate_type=plate_type,starting_tip=starting_tip,
                            tiprack=tiprack_1000,pipette=p1000,plate=plate,
                            waste_plate=waste_plate,new_tip=new_tip, tilted=tilted,protocol=protocol)
            if tilted is True:
                tilt(1, "down", pipette=p1000, protocol=protocol)
            if new_tip is True:
                p1000.move_to(plate.wells()[process_well_index].top(40))
                p1000.drop_tip()
    elif (plate_type=="96 well" or plate_type=="384 well"):
            starting_tip = tiprack_wells[0]
            if not p1000.has_tip:
                next_tip = tiprack_1000.next_tip(starting_tip=tiprack_1000.wells_by_name()[starting_tip])
                p1000.pick_up_tip(next_tip)
            for i in range(len(well_array_to_process)):
                process_well_index = well_array_to_process[i]
                remove_reagent(process_well_index,removal_reps=removal_reps,
                                removal_volume=removal_volume,
                                plate_type=plate_type,starting_tip=starting_tip,
                                tiprack=tiprack_1000,pipette=p1000,plate=plate,
                                waste_plate=waste_plate,new_tip=new_tip, tilted=tilted,protocol=protocol)
    if p1000.has_tip:
        p1000.drop_tip()
        
    protocol.comment("Dissociation reagent added and aspirated!")