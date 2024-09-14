**Galago Change Log**

## V1.1.0

June-Oct 2024 

**NEW FEATURE** 

1. Tools server and controller manager. A desktop python gui to launch the app (all tool servers and front-end), includes logging and tool lever restart functionalities.  
2. Galago.exe launcher for windows. (Made via C# console app)
3. Connect All button - allows you to connect all tools with 1 button. 
4. Switch conda environments based on tools. Eg. 32 bits vs 64 bits. 
5. Embed host ip environment across the app, this allows us to fully use Galago via the local network from any computer.
6. Take a photo of the OT2 deck before and after every opentrons protocol run. 
7. Create a Data page to host various data visualization tools. 
9. Visualize OT2 images on the front end. 
10. Re-enable liconic CO2 logging. Add a lock on the thread to prevent race conditions with read/write between the logger and the workcell bringing plates in and out of the liconic. 
11. Cytation Cell Image viewer. Allows you to search for any well plate containing cytation data objects and easily navigate through images by well and filter type. 
12. Hamilton STAR driver.
13. XPeel driver.
14. Plateloc driver. 
12. Visualize Liconic sensor data on a line graph.
13. Implement object recognition on Opentrons deck images, display on the front end. 
14. Add cytation data manual uploader. 
15. Log and visualize media exchange parameters. 
16. Add a Liconic sensor data viewer.
17. Variables Tab under data/log. CRUD GUI

## V1.0.0

Feb-May 2024

**NEW FEATURE**

1. Implemented PF400 arm sequences. Allows us to create 1 sequence per location, which can and should be used across all protocols. 
2. Implemented a Labware model to be used by the PF400. Allows us to reuse the same teachpoint locations and arm sequences across all protocols.This is mainly possible by the use of labware offsets, which allow us to define how a plate is gripped based on its labware definition. Prior to this we had to create new teachpoints for different labware and lids.
3. Implemented PickLid and PlateLid commands, these rely on the labware model and remove the need to have extra teachpoints per location and plate type. 
4. PF400 teaching GUI. Replaced the old monomer cli tool used to teach locations. 
5. Added local logging to controller (front-end). 
6. Added local logging to FRT tools. 
7. Added a Log View to the app. 
8. Added Bravo driver. 
9. Add loading and success banners to show users when workflows are geing queued. Prevents users from trying to queue a workflow while another is being added to the queue. 
10. Added filter buttons on the Daily Actions page. 
11. Added 'Bulk Queue' feature that allows you to queue all (or filtered) todos that meet consumable requirements. 
10. PF400 Grasp parameters now come from config file instead of harcoded in the driver code. We found that the width tolerance varies between arms so we need to be able to change this for each workcell. 
11. Assigned zones (stacks) in Liconic based on plate type to maximize storage. Eg. 2X 384 wells fit in a stack compared to a stack full of 6-well plates.
12. Implement a print an apply label feature, allows users to select a plate on inventory and print and apply a barcode/label. 
13. Added Microplate Labeler (VCode) driver. 
14. Added Plateloc driver. 
15. Added HiG driver. 
16. Added Bravo liquid handler driver. 
17. Users can print and label plates from inventory view. 
18. Added XPeel driver. 
19. Added Alps3000 driver. 
20. Plate Wash workcell. 
21. Patch plate wash protocol.

**ENHANCEMENT**

1. Redis queue database is now local to control computer. Previously hosted in an on-prem server.
2. Refactored RoutineTables.tsx component. Moved all logic to server/utils/RoutineRequirements.ts and cleaned up a standardized a lot of the code. This is the main script that takes in helix routines and local inventory data and turns them into what is displayed in the 'Daily Actions' page. 
3. Added CO2 logging and alerting to liconic driver.
4. Show all runs grouped by run. Display WellPlate ID and progress bar. 
5. Added run group model to redis. 
6. Inventory module was moved to tools and renamed db. 
7. Log Model to db. 
9. Inventory and log data paths now come from config, not harcoded. 
10. Added a tools config script. 
11. Added a WorkcellConfig script for tools.
12. Tool server classes now require to be passed a port as an argument. This was previously harcoded, limiting the ability to add 2 or more tools of the same type. 
13. PF400 arm works best with Joint locations. Added all logic and fixes to be able to do this. We should deprecate the use of carteesian coordinates for pick and place commands. Using these often lead to crashes and weird joint states if not used properly. 
14. Made a script to automatically launch all tool servers by referencing the workcell config file. This should eventually replace all the Procfiles, as they become redundant and add complexity and room for errors. 
15. Made a windows executable to launch tool servers by clicking on a short cut. 
16. Added a home page. 
17. Rid all workcell name hardcoded dependencies from scripts. Eg. Baymax or Ultralight were references across multiple scripts. Now we can use the same branch on different workcells.  
18. Swim lane view for runs, shows run type and progress grouped by run.
19. Renamed Foundry-Runtime to Galago. 

**BUG** 

1. Cytation driver can handle protocol names from Helix that are missing .pro extension. 
2. Inventory Visualizer can now display 384 well plates. 
3. Fix Baymax's hotel nests names. 
4. Fix Routine Tables culture grouping bugs. Media exchange more specific by including the media type to uniqueKey.
5. Cytation output files with paths longer than 250 characters can't be saved. Truncate name to not exceed max character length. 

--- 

## V0.9.3
02/06/24  

**BUG**  

- Fixed various bugs on routines tables. 
1. Can handle multiple todo steps on the same workflow.
2. Can handle multiple cultures on the same well plate. 
3. Replaced aggregate cultures function for mush simpler implementation. 
4. Filter out uncompleted todos from prior dates. 
5. Single call to helix api, improved loading speed. 
--- 

## V0.9.2
01/24/24  

**NEW FEATURE**  

- Passage protocol updates Helix with new well plate and child culture 
- Additional Parameter for tipbox slot in opentrons protocol

**BUG**  

- Updated parameters to include tipbox slot that previously errored out.

--- 

## V0.9.1
01/23/24  

**NEW FEATURE** 

- Grouping to-do by plate and run conditions. 
- Add loading and success message to let user know when run has been queued. 

**BUG** 

- Remove culture id from data object upload to prevent uploading the same files multiple times. 
