---
sidebar_position: 2
---
# Process Data

## Inputs
### CGM

The CGM is in CGMES format. It follows specific file naming conventions that are used to automatically feed the platform when
new files arrive on the FTP server.
- The D2CC process is based on D2CF files that follow the file naming convention: **YYYYMMDDThhmmZ**_**2D**_**ttt**_**pp**_**vvv**.uct
  -TODO The IDCC run 2 process is based on IDCF files that follow the file naming convention: **YYYYMMDD**_**hhmm**_**ttt**_UX**v**.uct

Where:
- **YYYY** is the timestamp year
- **MM** is the timestamp month
- **DD** is the timestamp day in month
- **hh** is the timestamp hour
- **mm** is the timestamp minutes (usually 30)
- **T** and **Z** are fixed letters indicating that the time format is in UTC time
- **ttt** is the reference to the TSO (RTEFRANCE, REE or REN)
- **pp** is the CGMES profile (EQ, TP, SSH or SV)
- **vvv** is the file version

For a detailed description of the CGMES format, you can refer to the format specification published on [ENTSO-E website](https://www.entsoe.eu/data/cim/cim-for-grid-models-exchange/).

### CRAC

The merged CRAC file must be named as follows: **10VCORSWEPR-ENDE_18V0000000005KUU_SWE-CRAC-B15-A48-F011_**YYYYMMDD**-**ccc**.xml**

Where:
- **YYYY** is the timestamp year
- **MM** is the timestamp month
- **DD** is the timestamp day in month
- *ccc* is TODO

The CRAC is in CIM format, described in the [related OpenRAO documentation](https://powsybl.readthedocs.io/projects/openrao/en/latest/input-data/crac/cim.html).

### GLSK

The merged GLSK file must be named as follows: **10VCORSWEPR-ENDE_18V0000000005KUU_SWE-GLSK-B22-A48-F008_**YYYYMMDD**-**ccc**.xml**

Where:
- **YYYY** is the timestamp year
- **MM** is the timestamp month
- **DD** is the timestamp day in month
- *ccc* is TODO

The GLSK is in CIM format, described in the [related OpenRAO documentation](https://powsybl.readthedocs.io/projects/entsoe/en/v2.10.0/glsk/glsk-cim.html).

#### General description

#### GLSK types
##### Proportional

TODO check, and copy from IN
This GLSK type is defined with a _businessType_ B42 in a unique _SKBlock_TimeSeries_ (containing no reference to any generator). The _measurement_Unit.name_ used for these GLSKs is C62, meaning TODO

##### Merit order GLSK: Generation nodes shift according to different merit order lists for up and down shifting

This GLSK type is defined with a _businessType_ B45, defined in one _SKBlock_TimeSeries_ for each generator. The generator is identified as a _RegisteredResource_, containing a _resourceCapacity.minimumCapacity_ and a _resourceCapacity.maximumCapacity_.
AN _attributeInstanceComponent.position_ defines the merit order.

TODO: change this text with what is used for SWE - is it the same GLSK for upward and downward ?
In this method, the chosen generation nodes shift up or down according to the corresponding merit order list (GSKup or GSKdown), as described below:

- The upward list contains generation nodes that perform the total positive shift
- The downward list contains generation nodes that perform the total negative shift
- The merit order factor defines the number of generation nodes to be shifted simultaneously
- This means that the first group of generating nodes (number defined by the merit order factor) are shifted together, and if this is not sufficient, the next group of generating nodes is used to complete the total shift, and so on
- The total shift is distributed to the last group of merit order factor generation nodes proportionally to their available margin, as defined for the Reserve shift method

An important consideration with the merit order GLSK is that when a shift is performed upwards and then the dichotomy goes downwards, there is a lack of symmetry, meaning that the result differs from directly shifting downwards. Additionally, this GLSK type is not linear.


#### Implementation in SWE

##### French GSK

The French GSK is defined as a proportional GSK block. It contains nodes referencing only the node name.
TODO: proportional to?

##### Spanish GSK

The Spanish GSK is defined as a merit order GSK.

##### Portuguese GSK

The Portuguese GSK is defined as a merit order GSK.

## Outputs

### CGMs

For each border and each direction, the CGM of the first unsecure exchange level is exported in CGMES format. (TODO: check if PRAs are applied)
On demand, the CGM at the last secure exchange value can also be exported.

### CNE files

For each border and each direction, the CNE file of the first unsecure computation is exported in CIM format, see [related OpenRAO documentation](https://powsybl.readthedocs.io/projects/openrao/en/latest/output-data/swe-cne.html).
This file contains the detail of the RAO computation, including the flows and thresholds on the CNECs and the applied RAs. It also contains the results of the angle monitoring (for the Spain-Portugal border).
Optionally, the last secure CNE can also be exported.

### Voltage check results

For the border between France and Spain, the results of the voltage check are exported in json format. They contain the status of the computation (SECURE, UNSECURE, FAILURE) and the list of the unsecure constraint elements.

