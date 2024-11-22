from tools.toolbox.variables import get_all_variables, get_variable, create_variable, update_variable, delete_variable
import time

print("All variables")
time.sleep(1)

print("Waited 1 second")
time.sleep(3)

print("Waited 3 seconds")
print("All variables")
print(get_all_variables())

print("Get variable")
loop1_counter = get_variable("loop_counter")
print(loop1_counter)

# print("Create variable")
# new_var = create_variable({"name":"counter3","value":"10","type":"number"})
# print(new_var)


# print("Update variable")
# counter_var = get_variable("counter3")
# print(counter_var)

print(update_variable(loop1_counter["id"], str(int(50))))
# print(update_variable(loop1_counter.id, {"value":loop1_counter.value + 10}))