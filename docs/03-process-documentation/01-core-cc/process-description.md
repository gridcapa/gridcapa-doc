---
sidebar_position: 3
---
# Process description
## Input data preprocessing

### Nominal voltage level update

As the UCTE-DEF network file does not provide a configuration for default nominal voltage setup, the nominal voltage levels 
have to be modified to adapt them to FMAX calculation based on IMAX. By default, UCTE sets nominal voltage to 220 and 380kV 
for the voltage levels 6 and 7, whereas default values of Core countries are 225 and 400 kV instead. The preprocessor 
updates the nominal voltage levels to these values.

### Import of generators and loads without an initial power flow

When importing an UCTE network file, powsybl ignores generators and loads that do not have an initial power flow.
It can cause an error if a GLSK file associated to this network includes some factors on these nodes. 
The GLSK importers looks for a Generator (GSK) or Load (LSK) associated to this node. 
If the Generator/Load does not exist, the GLSK cannot be created.
GridCapa fixes the problem, by creating for all missing generators a generator (P, Q = 0), and all missing loads a load (P, Q = 0).

## Computation

### NRAO and context

The Core day-ahead capacity computation process, described on the [ENTSO-E website](https://www.entsoe.eu/bites/ccr-core/day-ahead/), 
is based on a flow-based market coupling. In this process, GridCapa only performs the NRAO (Non-costly Remedial Action Optimisation), 
which goal is to enlarge the flow-based domain with the application of non-costly remedial actions. The NRAO is described 
[here](https://www.entsoe.eu/bites/ccr-core/day-ahead/#fc22).

Thus, the objective function of the NRAO is to maximise the smallest relative margin on the network at each step (MAX_MIN_RELATIVE_MARGIN).
Contrarily to the other processes performed by GridCapa, the computation of the NRAO does not stop when all states are secured, but goes beyond to try to 
improve the margins as much as possible. The computation is a single RAO on each timestamp, and no dichotomy is performed as the 
goal to find the highest NTC on one specific border.

The computation is performed in DC-mode.

### Balancing

The balancing logic in Core CC follows the compensation on all loads, so that the flows in the CGM are not distorted
(due to different modelling of renewables between TSOs leading to overcompensation of losses in some hubs).

To reach this objective, the input network of the NRAO is a DC balanced CGM (F139). The preventive remedial actions (PRAs) 
selected by the NRAO are then applied on the AC balanced network (F119) for the export of the F304 document.

if the DC CGM is not available, the NRAO will be performed on the AC CGM as fallback strategy.

### Loop-flows

The NRAO is not allowed to increase the loop-flows on the network. A tolerance of 3 MW of increase is allowed, to handle numerical approximations.
The loop-flows are described in the [OpenRAO documentation](https://powsybl.readthedocs.io/projects/openrao/en/stable/algorithms/castor/special-features/loop-flows.html#loop-flows).

The loop-flows cannot be higher than the max between the initial loop-flow value and the percentage defined by the difference between 100 and the minRAMFactor defined in the F301 for each CNEC.

The RAO with loop-flow computation requires the use of Generation and Load Shift Keys (GLSKs).

### MNECs

Some network elements are defined as MNECs, described in the [OpenRAO documentation](https://powsybl.readthedocs.io/projects/openrao/en/latest/algorithms/castor/special-features/mnecs.html#mnecs).
These particular network elements are not optimised but monitored: their margin must be kept positive or above its initial value, with a margin set to 53 MW.

### PTDF computation 

As the objective function of the NRAO is MAX_MIN_RELATIVE_MARGIN, the PTDFs (Power Transfer Distribution Factors) are computed.

The PTDF computation also requires the use of Generation and Load Shift Keys (GLSKs).

The boundaries taken into account in the PTDF computation are adapted to handle the Advanced Hybrid Coupling (AHC) hubs defined in the F327.

## Output data postprocessing

### Generation of F303 (FlowBasedConstraintDocument)

In the F303 (FlowBasedConstraintDocument) document, the list of selected remedial actions and CNECs corresponding to curative states are exported and concatenated into a single file for all timestamps.
All information that can be aggregated (one remedial action applied on two consecutive timestamps) is aggregated.

### Generation of F304 (Networks with PRAs)

The preventive remedial actions (PRAs) selected by the NRAO (either on the AC or on the DC network) are applied on the AC network (F119) exported for each timestamp. 
