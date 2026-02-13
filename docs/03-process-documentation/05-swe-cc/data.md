---
sidebar_position: 2
---
# Process data

## Inputs
### CGM

The CGM is in CGMES format. It follows specific file naming conventions that are used to automatically feed the platform when
new files appear on the FTP server.
- The D2CC process is based on D2CF files that follow the file naming convention: **YYYYMMDDThhmmZ**\_**2D**\_**ttt**\_**pp**\_**vvv**.xml
- The IDCC 1st run process is based on DACF files that follow the file naming convention: **YYYYMMDDThhmmZ**\_**1D**\_**ttt**\_**pp**\_**vvv**.xml
- The IDCC 2nd run process is based on IDCF files that follow the file naming convention: **YYYYMMDDThhmmZ**\_**xx**\_**ttt**\_**pp**\_**vvv**.xml

Where:
- **YYYY** is the timestamp year
- **MM** is the timestamp month
- **DD** is the timestamp day in month
- **hh** is the timestamp hour
- **mm** is the timestamp minutes (usually 30)
- **T** and **Z** are fixed letters indicating that the time format is in UTC time
- **xx** is ???
- **ttt** is the reference to the TSO (RTEFRANCE, REE or REN)
- **pp** is the CGMES profile (EQ, TP, SSH or SV)
- **vvv** is the file version

> **?** Open question: Check what xx stands for

Each CGMES profile for each country is zipped.

Additionally, two files named **YYYYMMDDThhmmZ**__**ENTSOE**\_**EQBD**\_**vvv**.xml and **YYYYMMDDThhmmZ**__**ENTSOE**\_**TPBD**\_**vvv**.xml
(with the conventions described above) are needed to complete the network description. These two files, called boundary sets, are uploaded less
frequently as they contain permanent definitions of the equipments and topology in the boundaries of the region.

For a detailed description of the CGMES format, you can refer to the format specification published on [ENTSO-E website](https://www.entsoe.eu/data/cim/cim-for-grid-models-exchange/),
or further explanations on [PowSyBl website](https://powsybl.readthedocs.io/projects/powsybl-core/en/stable/grid_exchange_formats/cgmes/index.html),


### CRAC

The merged CRAC file must be named as follows: **10VCORSWEPR-ENDE_18V0000000005KUU_SWE-CRAC-B15-A48-F011_**YYYYMMDD**-**bbb**.xml**

Where:
- **YYYY** is the timestamp year
- **MM** is the timestamp month
- **DD** is the timestamp day in month
- *bbb* is ???

> **?** Open question: Check what bbb stands for

The CRAC is in CIM format, described in the [related OpenRAO documentation](https://powsybl.readthedocs.io/projects/openrao/en/latest/input-data/crac/cim.html).

### GLSK

The merged GLSK file must be named as follows: **10VCORSWEPR-ENDE_18V0000000005KUU_SWE-GLSK-B22-A48-F008_**YYYYMMDD**-**bbb**.xml**

Where:
- **YYYY** is the timestamp year
- **MM** is the timestamp month
- **DD** is the timestamp day in month
- *bbb* is ???
-
> **?** Open question: Check what bbb stands for

The GLSK is in CIM format, described in the [related OpenRAO documentation](https://powsybl.readthedocs.io/projects/entsoe/en/v2.10.0/glsk/glsk-cim.html).

#### General description

#### GLSK types
##### Proportional

This GLSK type is defined with a _businessType_ B42 in a unique _SKBlock_TimeSeries_ (containing no reference to any generator). The _measurement_Unit.name_ used for these GLSKs is C62, meaning ???

> **?** Open question: Check what C62 stands for

The full description of the GLSK CIM is available in the [related OpenRAO documentation](https://powsybl.readthedocs.io/projects/entsoe/en/v2.10.0/glsk/glsk-cim.html) and in [Generation and Load Shift Key document UML model and schema (entsoe.eu)](https://eepublicdownloads.entsoe.eu/clean-documents/EDI/Library/cim_based/schema/Generation_and_Load_Shift_Key_document_UML_model_and_schema_v2.3.pdf).

##### Merit order GLSK: Generation nodes shift according to different merit order lists for up and down shifting

This GLSK type is defined with a _businessType_ B45, defined in one _SKBlock_TimeSeries_ for each generator. The generator is identified as a _RegisteredResource_, containing a _resourceCapacity.minimumCapacity_ and a _resourceCapacity.maximumCapacity_.
AN _attributeInstanceComponent.position_ defines the merit order.

> **?** Open question: Describe more

#### Implementation in SWE

##### French GSK

The French GSK is defined as a proportional GSK block. It contains nodes referencing only the node name.

> **?** Open question: proportional to ?

##### Spanish GSK

The Spanish GSK is defined as a merit order GSK.

##### Portuguese GSK

The Portuguese GSK is defined as a merit order GSK.

## Hardcoded data

### RaoParameters

The computations are based on parameters, described in the [OpenRAO documentation](https://powsybl.readthedocs.io/projects/openrao/en/latest/parameters.html).

The values of the parameters for the SWE processes are defined in the [gridcapa-deployment configuration](https://github.com/farao-community/gridcapa-deployment/blob/master/configuration/swe-runner-itools-config.yml).
Compared to this list, a few parameters might be modified during the computation, directly in the code.
Others, if not defined, are set to the default values listed in the documentation.

### CracCreationParameters

Some data is hardcoded in a CracCreationParameters.json file, that is read during the process.
This file contains the following information:
- range actions groups, to define that the range actions on the HVDC should be aligned,
- range action speeds, to simulate automatons in a realistic order,
- timeseries mRIDs, to split the CRAC following the borders,
- information for voltage monitoring: states, thresholds, contingency names and monitored network element IDs.
- some parameters (RA usage limits per instant).

For more detailed information, read the [related OpenRAO documentation](https://powsybl.readthedocs.io/projects/openrao/en/stable/input-data/crac/creation-parameters.html#cim-specific-parameters).

### SwePreprocessorParameters

The SwePreprocessorParameters.json file contains information for the creation of the HVDC line from the equivalent model:
- ID and electrical data of the HVDC line,
- data on the VSC stations to be created,
- ID of the elements of the equivalent model (groups, loads and AC lines),
- some parameters.

### Configmap

The configmap contains the IDs of the PSTs that should be removed from the regulation.

## Outputs

### CGMs

For each border and each direction, the CGM of the first unsecure exchange level is exported in CGMES format.

> **?** Open question: check if PRAs are applied

On demand, the CGM at the last secure exchange value can also be exported.

### CNE files

For each border and each direction, the CNE file of the first unsecure computation is exported in CIM format, see [related OpenRAO documentation](https://powsybl.readthedocs.io/projects/openrao/en/latest/output-data/swe-cne.html).
This file contains the detail of the RAO computation, including the flows and thresholds on the CNECs and the applied RAs. It also contains the results of the angle monitoring (for the Spain-Portugal border).
Optionally, the last secure CNE can also be exported.

### Voltage check results

For the border between France and Spain, the results of the voltage check are exported in json format. They contain the status of the computation (SECURE, UNSECURE, FAILURE) and the list of the unsecure constraint elements.
