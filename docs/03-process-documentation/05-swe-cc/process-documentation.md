---
sidebar_position: 3
---
# Process description
## Input data preprocessing

### CRAC pre-processing

#### Extra CRAC creation parameters

Some business rules for remedial actions optimization are considered by PowSyBl Open RAO framework as part of CRAC definitions. These rules that are not contained in CIM CRAC file itself are added during the conversion from native CIM CRAC format to internal CRAC object actually used for remedial actions optimization.

> **?** Open question: give an example?

Voltage CNEC are not explicitely defined in input CRAC, and are added by configuration of the process through the CRAC creation parameters.

### Baixas-Santa Llogaia HVDC line pre-processing

The Baixas-Santa Llogaia HVDC line is represented by an equivalent model, that is replaced by an HVDC object during the pre-processing phase in GridCapa.

There are two HVDC links between Baixas in France and Santa Llogaia in Spain. Each link is represented by an AC line associated with two generators and two loads (one generator and one load on each side of the AC line).

> **?** Open question: diagram here

For each link, VSC converter stations are created at both sides of the AC line, and an HVDC line is created in parallel of the AC line.
The equivalent generators, loads and AC lines are disconnected from the network.

If the equivalent AC line was disconnected on one side in the initial network, the HVDC line is not connected on that side when created.

The HVDC line is set to AC mode during the preprocessing.

> **?** Open question: check CreationParameters and check what happens in GridCapa when an element is missing

## Dichotomy

In the SWE processes, four computations are run in parallel for a single timestamp: one computation is run for each border and each direction (France to Spain, Spain to France, Portugal to Spain, Spain to Portugal).

### Initial exchange value

**For D2CC**, there is no exchange on the borders in the initial CGMs. This exchange level is considered as secure, which means that no computation is run for the lowest exchange level.
Then, for the given direction, the exchange value is modified through a balances adjustment, to reach the value of 6400 MW (while keeping the other border at 0 MW).

> **?** Open questions: IDCC

### Balances adjustment

- Import of GLSK file:
  Conversion of the GLSK <TimeSeries> corresponding to the process timestamp to merit order scalable for ES and PT. For FR,the shift is done proportionally to all FR generators.
  The limits Pmin, Pmax of generators defined in the network are ignored in order to respect the resource capacity limitation mentioned in the GLSK timeseries.

Computing initial SWE countries balance :
Run a loadflow on the imported cgm (after pre-processing) and computing exchanges on borders ES - FR and ES - PT.

TODO: https://gopro-collaboratif.rte-france.com/display/GRC/SWE+D2CC+documentation

- compensation

### RAO
#### Secure


#### Unsecure
#### Divergence
### Step update strategy

The step update strategy follows the rules of a dichotomy: if the lowest unsecure exchange value computed so far is x MW and the highest secure exchange value is y MW, the next exchange value analysed is (x+y)/2.

Assuming that the network is secure for an exchange of 0 MW in the studied direction and considering that 6400 MW is very likely to be unsecure, this step update strategy applies from the second step on (the first being 6400 MW).

> **?** Open questions: What happens if 6400 MW is secure, in theory? Is 6400 MW the installed capacity

### Dichotomy precision

The computation stops when the difference between the highest secure and the lowest unsecure exchange levels reaches 50 MW.

## Output data postprocessing
### Voltage check

Voltage monitoring checks the voltage on some nodes both in preventive state and after some contingencies.
The CNECs are defined in the CRAC creation parameters, during the pre-processing.

Acceptable thresholds are:
- Between 395kV and 430KV in preventive,
- Between 380kV and 430kV in curative.

Voltage check is only run on FR->ES and ES->FR directions, at the end of the dichotomy, on the last secure network.

Voltage check algorithm is detailed in [PowSyBl OpenRAO documentation](https://powsybl.readthedocs.io/projects/openrao/en/v6.0.0/castor/monitoring/voltage-monitoring.html).

### Angle monitoring

Angle monitoring is the process to check if angle constraints (i.e. limitation of the difference of voltage angle between two nodes) is respected.

The angle constraint represents the physical limit that would make it possible to correctly close back a line after a trip occured.
If voltage angle difference is too high, an automaton would disconnect the line automatically.

This process is run after RAO validation, only on PT->ES and ES->PT directions, and if RAO is secure.

Angle constraints are defined as _AdditionalConstraints_Series_ in CIM CRAC.

Angle monitoring algorithm is detailed in [PowSyBl OpenRAO documentation](https://powsybl.readthedocs.io/projects/openrao/en/v6.0.0/castor/monitoring/angle-monitoring.html).

### Baixas-Santa Llogaia HVDC line post-processing

- disconnect/reconnect and how

### PST regulation

- Two PSTs with CNECs in series

### Shifted CGM export
### CNE file export
### Voltage check result export
### TTC file Export
#### In case of process success
#### In case of failure
