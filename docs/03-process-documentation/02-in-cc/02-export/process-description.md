---
sidebar_position: 3
---
# Process description

Unlike the import EC process, the export process performs a single Remedial Action Optimization (RAO) computation on the initial grid model without performing any generation shift or dichotomy.

## Input data preprocessing

The preprocessing steps applied to the network model are similar to those in the import EC process:

1. **Merchant line Mendrisio-Cagno target flow**: The phase-shifting transformer (PST) at Mendrisio is configured in active power regulation mode to maintain the contractual target flow.
2. **PiSa HVDC alignment**: The equivalent model's generators representing the PiSa HVDC links are aligned so that their active power set points are consistent and opposite.
3. **CRAC/CGM alignment (Busbar changes)**: Fictive nodes and switches are created in the network model to allow the optimizer to evaluate busbar change topological remedial actions defined in the CRAC.
4. **PSTs range enforcement**: The initial taps of phase-shifting transformers that fall outside their admissible range defined in the CRAC are adjusted to their minimal admissible tap.

## Computation

The RAO computation is run with the CASTOR algorithm (OpenRAO) using the non-costly optimization configuration (`SECURE_FLOW`). The algorithm seeks a secure state (positive margin) in the base case and after all monitored contingencies by optimizing preventive and curative remedial actions.

## Output data postprocessing

1. **CRAC/CGM alignment rollback**: The fictive nodes added during busbar change preprocessing are removed and the topology is restored on the network with applied preventive remedial actions.
2. **AC Load flow verification**: A full AC load flow calculation is executed on the network with applied preventive remedial actions to ensure electrical convergence.
3. **Exports**:
   - The final network with applied Preventive Remedial Actions (PRAs) is exported in UCTE format.
   - The IN RAO result file is generated and exported in XML format, summarizing the optimization status, preventive actions, and contingency flows.