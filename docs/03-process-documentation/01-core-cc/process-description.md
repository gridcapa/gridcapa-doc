---
sidebar_position: 3
---
# Process description
## Input data preprocessing

### Nominal voltage level update

Because of the way the voltage levels are defined in the UCTE network, some nominal voltages have to be changed. 
If the voltage level is 380 kV or 220 kV, it is changed to 400 kV or 225 kV respectively. Otherwise, the nominal voltage is not changed.

> **?** Open questions:
> Why?
> What does this mean (from the code)?: "Should not be changed cause is not equal to the default nominal voltage of voltage levels 6 or 7"

### Import of generators and loads without an initial power flow

When importing an UCTE network file, powsybl ignores generators and loads that do not have an initial power flow.
It can cause an error if a GLSK file associated to this network includes some factors on these nodes. 
The GLSK importers looks for a Generator (GSK) or Load (LSK) associated to this node. 
If the Generator/Load does not exist, the GLSK cannot be created.
GridCapa fixes the problem, by creating for all missing generators a generator (P, Q = 0), and all missing loads a load (P, Q = 0).

## Computation

loopflow

## Output data postprocessing

