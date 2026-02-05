---
sidebar_position: 2
---
# Process data

## Inputs
### CGM (F119)

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

### GLSK (F319)

### Reference exchange: refprog (F120)

### RAO request (F302)

### Virtual hubs (F327)

## Hardcoded data

### CracCreationParameters


### Configmap


## Outputs

### Initial CGM

### Final CGM

### TTC Res
