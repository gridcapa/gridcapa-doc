---
sidebar_position: 2
---
# Process data

## Inputs
### CGM (F119)

zip 

Contains 24 UCT and a xml header linking UCT to timestamps.

The CGM is in UCTE-DEF format, version 02. It follows specific file naming conventions that are used to automatically feed the platform when
new files arrive on the FTP server. The process is based on D2CF (TODO: check) files that follow the file naming convention: 
**YYYYMMDD**-F119-v**x**XXXXXXXXXX.zip

Where:
- **YYYY** is the timestamp year
- **MM** is the timestamp month
- **DD** is the timestamp day in month
- **hh** is the timestamp hour
- **mm** is the timestamp minutes (usually 30)
- **x** is the file version.

For a detailed description of the UCTE-DEF format, you can refer to the [format specification](https://eepublicdownloads.entsoe.eu/clean-documents/pre2015/publications/ce/otherreports/UCTE-format.pdf).

### CBCORA (F301)

The CBCORA file contains the critical branches, contingencies and available remedial actions. 
See : https://powsybl.readthedocs.io/projects/openrao/en/latest/input-data/crac/fbconstraint.html


xml
### GLSK (F319)

xml

### Reference program: refprog (F120)

See:
https://powsybl.readthedocs.io/projects/openrao/en/v5.5.2/input-data/reference-program.html

xml

### RAO request (F302)

Contains a list of timestamps to be run and a list of rao parameters.

xml

### Virtual hubs (F327)

See : https://powsybl.readthedocs.io/projects/openrao/en/v5.5.2/input-data/virtual-hubs.html

xml

### DC CGM (F139)

## Hardcoded data

### CracCreationParameters


### Configmap


## Outputs

# TODO: check if all present

### Core CNE (F299)
zip containing the CNE per timestamp

https://powsybl.readthedocs.io/projects/openrao/en/latest/output-data/core-cne.html

### ACK file (F302)

xml

### FlowBasedConstraintDocument (F303)

FlowBasedConstraintDocument. Contains  lists of remedial actions and CNECs corresponding to curative states. (xml)

### Networks with PRAs (F304)

zip that contains N post-rao networks  (UCT) corresponding to initial network with applied PRAs and a CGM header 

### RaoResponse file (F305)

RaoResponse file. Lists per timestamp the URL to optimized UCT, CNE, and FlowBasedConstraintDocument (xml)

### Metadata (F341)

Metadata file listing computation durations and hourly computation status (csv)

### Logs (F342)

Zip containing N log files

https://gopro-collaboratif.rte-france.com/display/GRC/Core+CC+Process+documentation