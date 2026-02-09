---
sidebar_position: 2
---
# Process data

## Inputs

### File naming convention

The general file naming convention is:

**YYYYMMDD**-F**zzz**-v**x**-17XTSO-CS------W-to-22XCORESO------S.zip.

Where:
- **YYYY** is the timestamp year
- **MM** is the timestamp month
- **DD** is the timestamp day in month
- **zzz** is the file type (see sections below)
- **x** is the file version.

### CGM (F119)

The F119 document is a zip containing the 24 networks in UCTE format and an xml header linking the networks to timestamps.

The networks are in UCTE-DEF format, version 02. They follow specific file naming conventions that are used to automatically feed the platform when
new files arrive on the FTP server. The process is based on the merged D2CF grid models, to form a Common Grid Model (CGM).

The network files follow the naming convention: **YYYYMMDD_hhmm_**2D**a**_UX**V**_FEXPORTGRIDMODEL_CGM_17XTSO-CS------W.uct.

Where:
- **YYYY** is the timestamp year
- **MM** is the timestamp month
- **DD** is the timestamp day in month
- **hh** is the timestamp hour
- **mm** is the timestamp minutes (usually 30)
- **a** is the day of the week (1 for Monday)
- **V** is the file version.

For a detailed description of the UCTE-DEF format, you can refer to the [format specification](https://eepublicdownloads.entsoe.eu/clean-documents/pre2015/publications/ce/otherreports/UCTE-format.pdf).

### Reference program (F120)

The F120 document is an xml file containing the reference program, which is composed by the values of the power exchanges between 
the different market areas. In OpenRAO, this is used to compute loop-flows.

For a detailed description of the F120 file, you can refer to the documentation: 
[OpenRAO documentation](https://powsybl.readthedocs.io/projects/openrao/en/latest/input-data/specific-input-data/reference-program.html#reference-program).

### DC CGM (F139)

The F119 document is a zip containing the 24 networks in UCTE format and an xml header linking the networks to timestamps.
The difference with the F119 file is that 


> **?** Open questions:
> What is the difference?

In the naming, the string "FEXPORTGRIDMODEL_CGM" is replaced by "FINIT_EXPORTGRIDMODEL_DC_CGM".

### CBCORA (F301)

The F301 file is an xml containing the critical branches, contingencies and available remedial actions.

Its format, called FlowBasedConstraintDocument, is described in the
[OpenRAO documentation](https://powsybl.readthedocs.io/projects/openrao/en/latest/input-data/crac/fbconstraint.html).

### RAO request (F302)

The F302 document is an xml file containing a list of timestamps to be run and a list of [RaoParameters](https://powsybl.readthedocs.io/projects/openrao/en/stable/parameters.html).

### GLSK (F319)

The F319 document is an xml file containing the Generation and Load Shift Keys (GLSK) in UCTE format, detailed in 
the [PowSyBl-ENTSOE documentation](https://powsybl.readthedocs.io/projects/entsoe/en/latest/glsk/glsk-ucte.html).

### Virtual hubs (F327)

The F327 document is an xml file containing the virtual hubs, which are are one-node areas which should be considered as market areas when calculating loop-flows.

For a detailed description of the F327 file, you can refer to the documentation:
[OpenRAO documentation](https://powsybl.readthedocs.io/projects/openrao/en/latest/input-data/specific-input-data/virtual-hubs.html).

## Hardcoded data

### CracCreationParameters


### Configmap


## Outputs

### Core CNE (F299)

The F299 file is a zip file containing the Core CNE file per timestamp. The description of the format is available in 
the [OpenRAO documentation](https://powsybl.readthedocs.io/projects/openrao/en/latest/output-data/core-cne.html).

> **?** Open questions:
> What is the naming convention of the CNE files?

### ACK file (F302)

The F302 file is an xml file containing 

> **?** Open questions:
> What ?

### FlowBasedConstraintDocument (F303)

The F303 (FlowBasedConstraintDocument) file is an xml file containing the list of selected remedial actions and CNECs corresponding to curative states.

### Networks with PRAs (F304)

The F304 file is a zip file containing all post-RAO networks corresponding to the initial network with applied PRAs and a CGM header.

> **?** Open questions:
> What is the naming convention of the CNE files?

### RaoResponse file (F305)

The F305 file is an xml file containing the URL of the F299, F303 and F304 files for each timestamp.

### Metadata (F341)

The F341 file is a csv file containing the list of computation durations and hourly computation status. 
These individual metadata files are used to perform sanity checks and to gather general metadata information: end-to-end computation durations, overall status.

### Logs (F342)

The F342 file is a zip file containing the logs for each computation.

> **?** Open questions:
> What is the naming convention of the CNE files?