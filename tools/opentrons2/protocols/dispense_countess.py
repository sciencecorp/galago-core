from opentrons import protocol_api
from opentrons import types
metadata = {"apiLevel": "2.12"}


## FRT_PARAMS_START ###
# The following will be replaced by the actual parameters on the workcell
# during process execution.
global_reagent_index = 0
# params for 384 well plate
# params = {
#     "tiprack_wells": [
#       "F1"
#     ],
#     "reagent_wells": [
#     ["A1","A2"],
#     ["A3","A4"],
#     ["A5","A6"]
#     ],
#   }

params = {
    "tiprack_wells": {"20 ul tips":["F4","G4"]},
    "chip_slot": 0,
    "plate_type": "6 well",
    "culture_well": "A1",
    "tipbox_slot": 3,
    "trypan_blue_well": "A1",
}


#type check params 

if not isinstance(params["tiprack_wells"], dict):
    raise Exception("tiprack_wells must be a dict")
if not isinstance(params["chip_slot"], int):
    raise Exception("chip_slot must be a int")
if not isinstance(params["plate_type"], str):
    raise Exception("plate_type must be a string")
if not isinstance(params["tipbox_slot"], int):
    raise Exception("tipbox_slot must be an int")
if not isinstance(params["culture_well"], str):
    raise Exception("culture_well must be a string")
if not isinstance(params["trypan_blue_well"], str):
    raise Exception("trypan_blue_well must be a string")


 #print the params to the command line for debugging


### FRT_PARAMS_END ###

# params = {
#     "tiprack_wells": {"20 ul tips":["F4","G4"]},
#     "chip_slot": "A",
#     "tipbox_slot": 6,
#     "trypan_blue_well": "A1",
# }

# Get current instrument config = unused reagent well index and unused tip index
PLATE_OFFSET  = 2
tiprack_wells: dict = params["tiprack_wells"]
chip_slot: int = params["chip_slot"]
plate_type: str = params["plate_type"]
culture_well: str = params["culture_well"]
tipbox_slot: int = params["tipbox_slot"]
trypan_blue_well: str = params["trypan_blue_well"]


PipetteType = protocol_api.instrument_context.InstrumentContext
TiprackType = protocol_api.labware.Labware
PlateType = protocol_api.labware.Labware
wastePlateType = protocol_api.labware.Labware
ReagentPlateType = protocol_api.labware.Labware
protocolType = protocol_api.protocol_context.ProtocolContext


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
    elif plate_type == "counting_chip":
        if process_well_index == "0":
            plate.set_offset(x=7.50, y=1.1, z=61.0)
        elif process_well_index == "1":
            plate.set_offset(x=7.50, y=1.1, z=61.0)
        elif process_well_index == "2":
            plate.set_offset(x=7.50, y=1.1, z=61.0)
        elif process_well_index == "3":
            plate.set_offset(x=7.50, y=1.1, z=61.0)
        

def initializePlate(plate_type:str,protocol:protocol_api.protocol_context.ProtocolContext,percent_change:int,plate_location:int=1) -> tuple:
    addition_volume = 0
    removal_volume = 0
    removal_reps = 1
    tilted = False
    if plate_type == "6 well":
        addition_volume = 1000
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


def run(
    protocol: protocol_api.ProtocolContext,
    tiprack_wells: dict = tiprack_wells,
    chip_slot: int = chip_slot,
    plate_type: str = plate_type,
    culture_well: str = culture_well,
    tipbox_slot: int = tipbox_slot,
    trypan_blue_well: str = trypan_blue_well,
) -> None:

  tiprack_20 = protocol.load_labware('opentrons_96_filtertiprack_20ul', tipbox_slot)
  tiprack_20.set_offset(x=-5.00, y=4.50, z=0.00)
  
  reagent_plate = protocol.load_labware("nest_96_wellplate_2ml_deep", 5)
  reagent_plate.set_offset(x=-5.0, y=6.00, z=86)

  culture_plate, addition_volume, removal_volume, removal_reps, tilted = initializePlate(plate_type=plate_type,percent_change=100,protocol=protocol,plate_location=1)
  plate_type_offset(plate_type=plate_type,process_well_index=0,tilted=tilted,plate=culture_plate,location=1)

  counting_chip = protocol.load_labware('opentrons_universal_flat_adapter_corning_384_wellplate_112ul_flat',2)
  counting_chip.set_offset(x=7.50, y=1.1, z=61.0)  
  
  
    
  p20 = protocol.load_instrument('p20_single_gen2', 'right', tip_racks=[tiprack_20])
  p20.default_speed = 150
  p20.flow_rate.aspirate = 100
  p20.flow_rate.dispense = 200
  tips_20 = tiprack_wells["20 ul tips"]

  plate_type_offset(plate_type="counting_chip",process_well_index=chip_slot,tilted=False,plate=counting_chip,location=2)


  mix_zone = counting_chip['A1']
  #trypan_tip = tips_20[0]
  cell_count_tip = tips_20[1]
  p20.pick_up_tip(tiprack_20[cell_count_tip])
  if tilted:
      tilt(1,'up',p20,protocol)
  p20.mix(20, culture_plate[culture_well])
  p20.aspirate(20, culture_plate[culture_well])
  p20.dispense(20, mix_zone)
  p20.aspirate(20, reagent_plate[trypan_blue_well])
  p20.dispense(20, mix_zone)
  p20.mix(5, 20, mix_zone)
  p20.aspirate(10, mix_zone)
  p20.dispense(10, counting_chip['F4'])
  p20.dispense(10, counting_chip['M3'])
  p20.drop_tip()
      