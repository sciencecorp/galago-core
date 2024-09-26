## Example

```
driver = Pf400Driver("192.168.0.1", "10100")

driver.initialize()

# Get current location
driver.wherec()

# Move to a location
driver.movec("200 200 100 0 0 0")

# Grip plate of size 130mm
driver.graspplate(130)

# Ungrip the plate
driver.releaseplate(130)

# Free the robot so you can move it around.
driver.free()

driver.close()
```


## Manual

Manual part 1:
https://docs.google.com/document/d/12NAZH7V9KVTTgdMQFOVbM75LX0eyNLj8/edit

Manual part 2:
https://docs.google.com/document/d/13VuKOT4ApR_-LE2DZKDzWVDNrionoRv8/edit
