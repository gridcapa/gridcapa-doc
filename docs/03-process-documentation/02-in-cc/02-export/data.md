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
- **YYYY** is the timestamp year,
- **MM** is the timestamp month,
- **DD** is the timestamp day in month,
- **hh** is the timestamp hour,
- **mm** is the timestamp minutes (usually 30),
- **x** is the timestamp day of the week number (example: if the day is a Wednesday, x=3; if it's a Sunday, x=7),
- **yy** is the forecast hour of the IDCC run 2 process,
- **v** is the file version.

For a detailed description of the UCTE-DEF format, you can refer to the [format specification](https://eepublicdownloads.entsoe.eu/clean-documents/pre2015/publications/ce/otherreports/UCTE-format.pdf).

### CRAC

The CRAC is in a specific format, that follows specific file naming conventions that are used to automatically feed the platform when
new files arrive on the FTP server.

- The D2CC process is based on merged CRACs that follow the file naming convention: **YYYYMMDD**_**hhmm**_2D**x**_CO_CRAC_Transit_CSE**v**.xml
- The IDCC run 2 process is based on IDCF files that follow the file naming convention: **YYYYMMDD**_**hhmm**_yy**x**_CO_CRAC_Transit_CSE**v**.xml

- **YYYY** is the timestamp year,
- **MM** is the timestamp month,
- **DD** is the timestamp day in month,
- **hh** is the timestamp hour,
- **mm** is the timestamp minutes (usually 30),
- **x** is the timestamp day of the week number (example: if the day is a Wednesday, x=3; if it's a Sunday, x=7),
- **yy** is the forecast hour of the IDCC run 2 process,
- **v** is the file version.

For more information on the IN CRAC format, see the [OpenRAO documentation](https://powsybl.readthedocs.io/projects/openrao/en/latest/input-data/crac/cse.html).

## Hardcoded data

### RaoParameters

The computations are based on parameters, described in the [OpenRAO documentation](https://powsybl.readthedocs.io/projects/openrao/en/latest/parameters.html).

The values of the parameters for the Italy North export process are defined in the [gridcapa-deployment configuration](https://github.com/farao-community/gridcapa-deployment/blob/master/configuration/cse-export-runner-itools-config.yml).
Compared to this list, a few parameters might be modified during the computation, directly in the code.
Others, if not defined, are set to the default values listed in the documentation.

### CracCreationParameters

The CracCreationParameters configuration contains the RA usage limits in curative for each TSO in the area.
For more information, see the [OpenRAO documentation](https://powsybl.readthedocs.io/projects/openrao/en/stable/input-data/crac/creation-parameters.html#).

### Configmap

The configmap contains specific configuration data for special network elements:
- references to the Mendrisio-Cagno merchant line,
- references to the PiSa HVDC link and associated remedial actions.

## Outputs

### IN RAO result

The result of the RAO computation is exported in a file named TTC_Calculation_**YYYYMMDD_hhmm**_2D**x**_CO_RAO_Transit_CSE**v**.xml.

- **YYYY** is the timestamp year,
- **MM** is the timestamp month,
- **DD** is the timestamp day in month,
- **hh** is the timestamp hour,
- **mm** is the timestamp minutes (usually 30),
- **x** is the timestamp day of the week number (example: if the day is a Wednesday, x=3; if it's a Sunday, x=7),
- **v** is the file version.

The file is formatted in XML according to the IN RAO result format:
- **Timestamp / Time**: Target computation timestamp
- **Status**: Status of the computation (`SECURE`, `UNSECURE`, or `FAILED`)
- **Results**:
  - *Preventive actions*: Set of preventive remedial actions selected by the optimizer (e.g., PST tap changes, HVDC setpoints)
  - *Preventive branch results*: Monitored branches and calculated flows in preventive state
  - *Outage results*: For each contingency, the contingency definition, the curative remedial actions activated, and the branch flows after contingency and after curative remedial actions.

### RAO logs

The logs of the RAO computation are exported in a file named rao_logs.txt.

The detail of the logs is described in the [OpenRAO documentation](https://powsybl.readthedocs.io/projects/openrao/en/stable/output-data/rao-logs.html).

### Network 

The network file with applied Preventive Remedial Actions (PRAs) is exported in a file named **YYYYMMDD_hhmm**_2D**x**_ce_Transit_RAO_CSE**v**.uct.

- **YYYY** is the timestamp year,
- **MM** is the timestamp month,
- **DD** is the timestamp day in month,
- **hh** is the timestamp hour,
- **mm** is the timestamp minutes (usually 30),
- **x** is the timestamp day of the week number (example: if the day is a Wednesday, x=3; if it's a Sunday, x=7),
- **v** is the file version.
