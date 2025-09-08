---
sidebar_position: 2
---
# Process Data

## Inputs
### CGM

The CGM is in UCTE-DEF format, version 02. It follows specific file naming conventions that are used to automatically feed the platform when
new files arrive on the FTP server.
- The D2CC process is based on D2CF files that follow the file naming convention: **YYYYMMDD**_**hhmm**_2D**x**_UX**v**.uct
- The IDCC run 2 process is based on IDCF files that follow the file naming convention: **YYYYMMDD**_**hhmm**_**yyx**_UX**v**.uct

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

### CRAC

**TODO**

To be added:
- Description of the format 
- N-2 (Following the blackout in Italy in 2003, Terna's risk management requires systematic monitoring of N-2 contingencies on common support under favorable conditions.)

The merged CRAC file must be named as follows: **YYYYMMDD_hhmm_2DX_CO_CRAC_CSEW.xml**

For more information on the CSE CRAC format, see the [OpenRAO documentation](https://powsybl.readthedocs.io/projects/openrao/en/latest/input-data/crac/cse.html).

### GLSK

#### General description

The Generation and Load Shift Key (GLSK) files are used for transforming any change in the balance of one control area into a change of injections in the nodes of that control area. They are developed based on forecast information about generating units and loads. To avoid creating unrealistic congestions during the generation shift process, TSOs should be able to define both Generation Shift Key (GSK) and Load Shift Key (LSK):
- GSKs constitute a list specifying which generators shall contribute to the shift. 
- LSKs constitute a list specifying which loads shall contribute to the shift in order to account for the contribution of generators connected to lower voltage levels (implicitly contained in the load figures of nodes connected to the 220 and 400 kV grid). 

When both GSK and LSK are defined, participation factors are also provided:
- G(a): Participation factor for generation nodes 
- L(a): Participation factor for load nodes

The sum of G(a) and L(a) for each area must equal 1 (i.e., 100%).

The GLSK files are defined for:
- A specific area 
- A time interval: GSKs are dedicated to individual daily hours to model differences between peak and off-peak conditions for each TSO.

The list of GSK nodes contains one or more nodes defined by:
- The name of the UCTE Node 
- The maximum power production of the node (optional for proportional and factor methods, mandatory for other methods)
- The minimum power production of the node (optional for proportional and factor methods, mandatory for other methods)

#### GLSK types
##### PropGSKBlock: Proportional to base case generation or load
In this method, the shift is applied to defined generation/load nodes proportionally to their base case generation/load values:
- $P_g(n)$: Active generation in node $n$ belonging to area $a$ (nodes $n$ defined in the GSK list)
- $P_l(n)$: Active load in node $n$ belonging to area $a$ (nodes $n$ defined in the LSK list)

The participation of node $n$ in the shift among selected generator nodes (GSK) is given by:

$K_g(n,a) = G(a)\frac{P_g(n)}{\sum_{n}{P_g(n)}}$

The participation of node $n$ in the shift among selected load nodes (LSK) is given by:

$K_l(n,a) = L(a)\frac{P_l(n)}{\sum_{n}{P_l(n)}}$

In the GLSK file, the proportional GLSK is defined by the tag **PropGSKBlock**.

##### Reserve GLSK: Proportional to the remaining available capacity

In this method, all power plants chosen for the shift are modified proportionally to their remaining available capacity, as presented in equations (1) and (2) below:

Equation (1) - For positive shift (increasing generation):

$P_i^{inc} = P_i + \Delta E \frac{P_i^{max} - P_i}{\sum_{i=1}^n{(P_i^{max} - P_i)}}$

Equation (2) - For negative shift (decreasing generation):

$P_i^{dec} = P_i + \Delta E \frac{P_i^{min} - P_i}{\sum_{i=1}^n{(P_i^{min} - P_i)}}$

Where:
- $P_i$ = Current power production
- $P_i^{min}$ = Minimum power production
- $P_i^{max}$ = Maximum power production
- $\Delta E$ = Power to be shifted
- $P_i^{inc}$ = New power production after positive shift
- $P_i^{dec}$ = New power production after negative shift

In the GLSK file, the reserve GLSK is defined by the tag **ReserveGSKBlock**.

##### Merit order GLSK: Generation nodes shift according to different merit order lists for up and down shifting

In this method, the chosen generation nodes shift up or down according to the corresponding merit order list (GSKup or GSKdown), as described below:

- The upward list contains generation nodes that perform the total positive shift
- The downward list contains generation nodes that perform the total negative shift
- The merit order factor defines the number of generation nodes to be shifted simultaneously
- This means that the first group of generating nodes (number defined by the merit order factor) are shifted together, and if this is not sufficient, the next group of generating nodes is used to complete the total shift, and so on
- The total shift is distributed to the last group of merit order factor generation nodes proportionally to their available margin, as defined for the Reserve shift method

An important consideration with the merit order GLSK is that when a shift is performed upwards and then the dichotomy goes downwards, there is a lack of symmetry, meaning that the result differs from directly shifting downwards. Additionally, this GLSK type is not linear.

In the GLSK file, the merit order GLSK is defined by the tag **MeritOrderGSKBlock**.

##### FACT: According to the participation factors

In this method, the shift is applied to defined generation/load nodes (PV or PQ nodes) according to explicitly provided participation factors:
- $k_g(n)$: Participation factor for generation in node $n$ belonging to area $a$ 
- $k_l(n)$: Participation factor for load in node $n$ belonging to area $a$ 

The participation of node $n$ in the shift among selected generator nodes (GSK) is given by:

**[Note: Formula missing in the original documentation]**

The participation of node $n$ in the shift among selected load nodes (LSK) is given by:

**[Note: Formula missing in the original documentation]**

In the GLSK file, this type of GLSK is defined by the tag **FactorGSKBlock**.

#### Implementation in IN Import EC
The merged GLSK file contains TimeSeries elements defining the GLSK for each country.

##### Swiss GSK

The Swiss GSK has a particular structure: it can contain German generators when it has a PropGSKBlock with the attribute \<MaximumShift\>. In this case, the GSK is called a "Hybrid GSK".

Such a hybrid GSK XML file contains two blocks:
- **PropGSKBlock**: For German nodes, with an order code 1 and a \<MaximumShift\> value 
- **ReserveGSKBlock**: For Swiss nodes, with an order code 2, containing Pmin and Pmax values

##### French GSK

The French GSK is defined as a proportional GSK block (PropGSKBlock). It contains nodes referencing only the node name.

##### Austrian GSK

The Austrian GLSK contains ManualGSKBlock elements.

##### Slovenian GSK

The Slovenian GLSK contains one or more proportional GSK blocks and one or more proportional LSK blocks. Each block contains a Factor field that defines the shift proportion to be applied to each block. The sum of all Factors equals 1. 

For the Slovenian GLSK, two separate GLSKs are defined in the merged file: one contained in TimeSeries for the import direction, and another in TimeSeriesExport for the export direction (discussed in another section).

##### Italian GSK

The Italian Merit order GLSK contains two blocks with a factor set to 1 in both cases:
- An Up block containing Pmax values for each node
- A Down block containing Pmin values

### Vulcanus

The Vulcanus document is an Excel (.xls) file that specifies border exchanges for a day. It contains the scheduled exchanges, also called reference exchanges. The file presents data with a frequency of 15 minutes.

The file must be named according to the following convention: **vulcanus_DDMMYYYY_96.xls** (Note: 96 represents the number of 15-minute intervals in a 24-hour day).

#### Reference exchange for D2CC

For the D2CC process, the Day-Ahead Schedules are located on Sheet 7. Some columns are written in the direction of Italian export, so the corresponding values (often negative) must be multiplied by -1 to obtain the correct direction.

#### Reference exchange for IDCC

For the IDCC process, the Intraday Schedules are located on Sheet 31. As with the D2CC process, some columns are written in the direction of Italian export, so the corresponding values (often negative) must be multiplied by -1 to obtain the correct direction.

### NTC Annual

The NTC annual file is an XML file that describes the long-term reference values, defined annually by a Technical Task Force. Typically, values are defined based on the season, day of the week, and hour of the day.

The NTC annual file contains:
- A section for the Italian import direction (\<NTCvaluesImport\>) and another for the export direction (\<NTCvaluesExport\>), each specifying:
  - The annual NTC values (FR, CH, AT, SI) for each hour of the year, used as backup if no other input data is available 
  - The scheduled flows for each hour of the year on the special lines (Greuth-Tarvisio between AT-IT, and Mendrisio-Cagno, Campocologno-Villaditirano, Campocologno-Tirano between CH-IT) 
- A section specifying the splitting factors for each hour of the year 
- The Transmission Reliability Margin (TRM) value at the very bottom of the file

For the special lines, several parameters define particular treatments:
- **modelized**: Some special lines are not modeled in the intraday network. Thus, an offset called MNII is applied to the final TTC result, taking into account only the special lines with modelized="false" 
- **merchant_line**: Only lines with merchant_line="true" are considered in the computation of the reduced splitting factors to exclude them (NTC - flow on merchant lines), because merchant lines should not be included in the final NTC
- **\<NTC type=\>**: If "absolute", the value replaces the one from the previous ECHEANCE; if "relative", the value is added to the previous one

This data should be considered as the basis for the import but can be overwritten or supplemented by other inputs. It is typically used as backup data if the NTC red file is not available.

The file must be named according to the following format: **YYYY_2DX_NTC_annual_CSEW.xml**

### NTC Reductions

The NTC reductions file (NTC red) is an XML file that describes the weekly values of NTC values and scheduled flows. These values are computed using a formula that accounts for the latest information on unavailable lines. Specifically, when an AC or HVDC line close to the border is unavailable, the annual NTC value is updated with a predetermined value (FORFAIT) that depends on which lines are unavailable.

The NTC reductions file follows a similar format to the NTC annual file.

This file serves multiple purposes:
- As a backup in case of computation failure
- As the initial value for the D2CC process (first step of the dichotomy)
- As the reference value for splitting factors computation

The file must be named according to the following format: **YYYYMMDD_2DX_NTC_reductions_CSEW.xml**, where X is the day of the week (1 for Monday) and Y is the version number.

### NTC2
The NTC2 files are XML files containing NTC values updated with the D-2 computation results. Each file contains two CapacityTimeSeries, but only the one with the Italian InArea should be considered (Italian import). There is one NTC2 file for each country except Italy (AT, CH, FR, SI).

These files are used as the initial values for the IDCC process (first step of the dichotomy).

The NTC2 files are only available for the IDCC process, as they contain D-2 data.

The files must be named according to the following format: **NTC2_YYYYMMDD_2DX_PP-ITZ.xml** (where X is the day of the week and PP is the name of the control area, for instance CH). These files are contained in a folder named **22V-TERNA-ECPPRG_10V-RRRRRRRRRRRR_CCC-NTC2_YYYYMMDDVKK** (where RRRRRRRRRRRR is a code for the control area, such as SWISS-ECP-P7, and KK is the version number).

TODO: Que faire de cette info ? Low consumption days ? Ce sont des journées partagées en 4 tranches horaires, durant lesquelles la capacité d’import italien est fortement limitée pour des contraintes internes de tensions hautes et de stabilité en Italie. Cela se produit lorsqu’une faible consommation est combinée à une importante production renouvelable. L’import est ainsi limité afin de démarrer des groupes thermiques permettant de résoudre les contraintes en question. Autant que possible les consignations impactantees sont placées sur des jours de faible consommation dans le but de limiter l’impact sur la capacité.

### Target CH

In the D2CC process only, the Target CH file gives information to determine the target flow on the 380 kV Mendrisio-Cagno merchant line, in particular in case of outages of specific lines.

The computation of the special line’s fixed flow:
- Yearly Fixed Flow per Special Line 
  - It is the value of the flow which is supposed to be fixed during the calculations. It can be a target flow for the lines for which a target flow is defined (e.g. Mendrisio – Cagno) or the flow of a not modeled line which is supposed not to vary during the TTC calculation. 
  - This value can be set equal to the NTC of the line or a different value can be chosen, anyway it is provided as an input which is independent from the NTC of the line 
- Yearly Fixed Flow table of Merchant Line 380 kV Cagno-Mendrisio
  - It defines, for example, if line 220 kV Magadino-Soazza is planned to be out-of-service in two days, the target flow on the ML is only 150 MW in Winter instead of Yearly NTCCagno-Mendrisio Value [TTF]. 
  - Swissgrid provides this Yearly Fixed Flow table annually or in case of an update in form of the XML-File “yyyy_Targets_CH_vx.xml” based on its experience. The planned outages, which have an influence on the maximal allowed flow through the Merchant Line, are electrically close to the Merchant Line.
- Definition of Fixed Flow daily values associated to some lines:
- For special lines (e.g. merchant lines, lines with target flow, lines not modeled in CGM) a daily value for the Fixed Flow can be provided for each hour of the day as an absolute value of Fixed Flow reduction per Special Line. or via a relative value of Fixed Flow reduction per Special Line . If no daily value is given as input for a given hour (h) it is assumed Fixed Flow per Special Line, h = Yearly Fixed Flow per Special Line,h 
- For special lines (e.g. merchant lines, lines with target flow, lines not modeled in CGM) a daily value for the NTC can be provided for each hour of the day. If no daily value is given as input for a given hour (h) it is assumed NTC per Special Line, h = Yearly NTC per Special Line, h

The file is named: YYYYMMDD_Targets_CH_*.xml.

TODO: faire une section pour les special lines quelque part ailleurs ? (il y en a aussi un peu dans les NTC)

## Outputs

### Initial CGM
The Initial CGM is the network file after the initial shift to reference NTC values. It represents the starting point for the dichotomy process.

### Final CGM
The Final CGM is the network file with activated preventive remedial actions from the last secure step of the dichotomy. It represents the final state of the network at the calculated TTC value.

### TTC Res
The TTC Res (Results) file contains detailed information about the capacity calculation results, including the calculated TTC and MNII values, limiting elements, applied remedial actions, and flows on critical network elements.
