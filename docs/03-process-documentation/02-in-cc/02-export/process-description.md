---
sidebar_position: 3
---
# Process description

Contrarily to the import EC processes, the export process only run a RAO computation but does not perform a full dichotomy.

## Input data preprocessing

The preprocessing from the import EC processes on the merchant line Mendrisio-Cagno target flow and on PiSa HVDC are applied for the export processes.

## Computation

The RAO computation is run in the same conditions as for the import EC processes, except that there is no shift performed before (and no dichotomy).

## Output data postprocessing

The PRAs are applied to the output network, which is then exported.