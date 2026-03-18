---
sidebar_position: 2
---
# Process data

## Inputs
### CGM

The CGM is in UCTE-DEF format, version 02. It follows specific file naming conventions that are used to automatically feed the platform when
new files arrive on the FTP server.
- The D2CC process is based on D2CF files that follow the file naming convention: **YYYYMMDD**_**hhmm**_2D**x**_CO_Transit_CSE**v**.uct
- The IDCC run 2 process is based on IDCF files that follow the file naming convention: **YYYYMMDD**_**hhmm**_**yyx**_Transit_CSE**v**.uct

Where:
- **YYYY** is the timestamp year
- **MM** is the timestamp month
- **DD** is the timestamp day in month
- **hh** is the timestamp hour
- **mm** is the timestamp minutes (usually 30)
- **x** is the timestamp day of the week number (example: if the day is a Wednesday, x=3; if it's a Sunday, x=7)
- **yy** is the forecast hour of the IDCC run 2 process
- **v** is the file version

For a detailed description of the UCTE-DEF format, you can refer to the [format specification](https://eepublicdownloads.entsoe.eu/clean-documents/pre2015/publications/ce/otherreports/UCTE-format.pdf).

> **?** Open questions:
> - Differences with import EC data

### CRAC


The merged CRAC file must be named as follows: **YYYYMMDD_hhmm_2DX_CO_CRAC_CSEW.xml**

For more information on the CSE CRAC format, see the [OpenRAO documentation](https://powsybl.readthedocs.io/projects/openrao/en/latest/input-data/crac/cse.html).

> **?** Open questions:
> - To be added: Description of the format
> - Name for IDCC process
> - Differences with import EC data

## Hardcoded data

### RaoParameters

The computations are based on parameters, described in the [OpenRAO documentation](https://powsybl.readthedocs.io/projects/openrao/en/latest/parameters.html).

The values of the parameters for the Italy North export process are defined in the [gridcapa-deployment configuration](https://github.com/farao-community/gridcapa-deployment/blob/master/configuration/cse-export-runner-itools-config.yml).
Compared to this list, a few parameters might be modified during the computation, directly in the code.
Others, if not defined, are set to the default values listed in the documentation.

### CracCreationParameters

### Configmap

## Outputs

