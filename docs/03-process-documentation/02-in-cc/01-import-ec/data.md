---
sidebar_position: 2
---
# Process Data

## Inputs
### CGM

The CGM is in UCTE-DEF format, version 02. It follows some file name conventions that are used to automatically feed the platform when
new files arrive on FTP server.
- D2CC process is based on D2CF files, that follow the file name convention: **YYYYMMDD**_**hhmm**_2D**x**_UX**v**.uct
- IDCC run 2 process is based on IDCF files, that follow the file name convention: **YYYYMMDD**_**hhmm**_**yyx**_UX**v**.uct

where:
- **YYYY** is timestamp year
- **MM** is timestamp month
- **DD** is timestamp day in month
- **hh** is timestamp hour
- **mm** is timestamp minutes (usually 30)
- **x** is timestamp day of the week number (exemple : if the day is a wednesday, x=3, if it's a sunday x=7)
- **yy** is forcast hour of IDCC run 2 process
- **v** is file version

For a detailed description of UCTE-DEF format, you can refer to the [format specification])(https://eepublicdownloads.entsoe.eu/clean-documents/pre2015/publications/ce/otherreports/UCTE-format.pdf)

### CRAC

TODO

To be added:
- description of the format 
- N-2 (Suite au black-out en Italie en 2003, la maîtrise des risques de Terna impose la surveillance systématique des N-2 sur support commun en conditions favorables.)

The merged CRAC file must be named as follows: YYYYMMDD_hhmm_2DX_CO_CRAC_CSEW.xml


https://powsybl.readthedocs.io/projects/openrao/en/latest/input-data/crac/cse.html

### GLSK

#### General description

The Generation and Load Shift Key (GLSK) files are used for transforming any change in the balance of one control area into a change of injections in the nodes of that control area. They are elaborated on the basis of the forecast information about the generating units and loads. In order to avoid newly formed unrealistic congestions caused by the process of generation shift, TSOs should be able to define both Generation Shift Key (GSK) and Load Shift Key (LSK):
- GSKs constitute a list specifying those generators that shall contribute to the shift. 
- LSKs constitute a list specifying those load that shall contribute to the shift in order to take into account the contribution of generators connected to lower voltage levels (implicitly contained in the load figures of the nodes connected to the 220 and 400 kV grid). 

If GSK and LSK are defined, a participation factor is also given:
- G(a) Participation factor for generation nodes 
- L(a) Participation factor for load nodes

The sum of G(a) and L(a) for each area has to be to 1 (i.e. 100%).

The GLSK files are defined for:
- An area 
- A time interval: GSK is dedicated to individual daily hours in order to model differences between peak and off‐peak conditions per TSO.

The list of GSK nodes contains one or more node defined by:
- The name of UCTE Node 
- The maximum power production of the node (optional for prop and fact, mandatory for the other methods)
- The minimum power production of the node (optional for prop and fact, mandatory for the other methods)

#### GLSK types
##### PropGSKBlock: proportionally to base case generation or load
The shift is in defined generation/load nodes, proportionally to the base case generation/load. 
- Pg(n) Active generation in node n, belonging to area a (nodes n defined in GSK list)
- Pl(n) Active load in node n, belonging to area a (nodes n defined in LSK list)

The participation of node n in the shift, among selected generator nodes (GSK) is given by:

$Kg(n,a) = G(a)\frac{Pg(n)}{\sum_{n}{Pg(n)}}$

The participation of node n in the shift, among selected load nodes (LSK) is given by:

$Kl(n,a) = L(a)\frac{Pl(n)}{\sum_{n}{Pl(n)}}$

In the GLSK file, the proportional GLSK is defined by the tag **PropGSKBlock**.

##### Reserve GLSK: proportionally to the remaining available capacity

All power plants, which are chosen for the shift, are modified proportionally to the remaining available capacity, as presented hereafter in equations (1) and (2).

(1)

$P_i^{inc} = P_i+\Delta E\frac{P_i^{max}-P_i}{\sum_{i=1}^n{(P_i^{max}-P_i)}}$

(2)

$P_i^{dec} = P_i+\Delta E\frac{P_i^{min}-P_i}{\sum_{i=1}^n{(P_i^{min}-P_i)}}$

where:
- $P_i$ = Actual power production
- $P_i^{min}$ = Minimal power production
- $P_i^{max}$ = Maximal power production
- $\Delta E$ = Power to be shifted
- $P_i^{inc}$ = New power production after positive shift
- $P_i^{dec}$ = New power production after negative shift

In the GLSK file, the reserve GLSK is defined by the tag **ReserveGSKBlock**.

##### Merit order GLSK: generating nodes shift according to different merit order lists for shifting up and down
The chosen generation nodes shifts up or down according to the correspondent merit order list GSKup or GSKdown, as described following:
- Upward list contains the generation nodes which performs the total positive shift. 
- Downward list contains the generation nodes which performs the total negative shift. 
- Merit order factor defines the number of generation node to be shifted simultaneously. 
- It means that the first group (number defined with Merit order factor) of generating nodes are shifted together and if it is not sufficient, the next group generating nodes are used to complete the total shift, and so on. 
- The total shift is distributed to the last group of Merit order factor generation nodes proportionally to their available margin as defined for Reserve shift.

An issue with the merit order GLSK is that when a shift is performed upwards, then the dichotomy goes downwards, there is a lack of symmetry meaning that the result is different from directly shifting downwards. Besides, this GLSK type is not linear.

In the GLSK file, the merit order GLSK is defined by the tag **MeritOrderGSKBlock**.

##### FACT: according to the participation factors

The shift is in defined generation/load nodes (PV or PQ nodes), according to the participation factors:
- kg(n) Participation factor for generation in node n, belonging to area a 
- kl(n) Participation factor for load in node n, belonging to area a 

The participation of node n in the shift, among selected gen. nodes (GSK) is given by:



The participation of node n in the shift, among selected load nodes (LSK) is given by:

#### Implementation on IN Import EC
The merged GLSK file contains TimeSeries defining the GLSK for each country.
##### Swiss GSK

The Swiss GSK has a particular structure: it can contain German generators, when it has a PropGSKBlock with attribute \<MaximumShift\>. In this case, the GSK is called "Hybrid GSK".

Such a hybrid GSK xml file contains two blocks:
- PropGSKBlock: for German nodes, with an order code 1, and a \<MaximumShift\> value, 
- ReserveGSKBlock: for Swiss nodes, with an order code2, containing a Pmin and a Pmax value.

##### French GSK

The French GSK is defined as a proportional GSK block (PropGSKBlock). Hence, it contains nodes referencing only the name

##### Austrian GSK

The Austrian GLSK contains ManualGSKBlock

##### Slovenian GSK

The Slovenian GLSK contains one or several proportional GSK blocks and one or several proportional LSK block. Each block contains a Factor field, that defines the shift proportion to be applied on each block. The sum of the Factors is equal to 1. For the Slovenian GLSK, are two GLSKs defined in the merged file: one contained in TimeSeries for the import direction, another one in TimeSeriesExport for the export (discussed in another section).

##### Italian GSK

The Italian Merit order GLSK contains two blocks with a factor set to 1 in both cases: an Up block containing Pmax values for each node, and a Down block with Pmin values.

### Vulcanus

The Vulcanus document is an xls file specifying border exchanges for a day. It contains the scheduled exchanges, also called reference exchanges. The file presents data with a frequency of 15 minutes.

The file must be named according to the following rule: vulcanus_DDMMYYYY_96.xls (NB: 96 as the number of 15 minutes steps in a 24h day).

#### Reference exchange for D2CC

For D2CC process, the Day Ahead Schedules are on Sheet 7 (some columns are written in the direction of Italian export, so the corresponding (often negative) value has to be multiplied by -1).

#### Reference exchange for IDCC

For IDCC process, the Intraday Schedules are on Sheet 31 (some columns are written in the direction of Italian export, so the corresponding (often negative) value has to be multiplied by -1).

### NTC annual

The NTC annual file is an xml file describing the long-term reference values, defined annually by a Technical Task Force. Typically, a value is defined depending on the season, the day of the week and the hour of the day.

The NTC annual file contains:
- a section for the Italian import direction (\<NTCvaluesImport\>) and another one for the export (\<NTCvaluesExport\>), each of them specifying:
  - the annual NTC values (FR, CH, AT, SI) for each hour of the year, used as backup if no other input data is available, 
  - the scheduled flows for each hour of the year on the special lines (Greuth-Tarvisio between AT-IT, and Mendrisio-Cagno, Campocologno-Villaditirano, Campocologno-Tirano between CH-IT). 
- a section specifying the splitting factors for each hour of the year, 
- the Transmission Reliability Margin (TRM) value at the very bottom of the file.

For the special lines, several parameters define a particular treatment:
- modelized: some special lines are note modelized in the intraday network. Thus, an offset called MNII is applied on the final TTC result, taking only into account the special lines with modelized="false", 
- merchant_line: only the lines with merchant_line ="true" are taken into account in the computation of the reduced splitting factors in order to exclude them (NTC - flow on merchant lines), because the merchant lines should not be taken into account in the final NTC,
- \<NTC type=\>: if "absolute", the value replaces the one from the previous ECHEANCE, if "relative", the value has to be added to the previous one.

This data should be considered as the basis for the import, but can be overwritten or completed by the other inputs. It is typically used as backup data if the NTC red file is not available.

The file has to be named in the following format: YYYY_2DX_NTC_annual_CSEW.xml

### NTC red
The NTC reductions file is an xml file describing the weekly values of NTC values and scheduled flows, computed through a formula that takes into account the latest information on unavailable lines. More in detail, in case of unavailablility of an AC or HVDC line close to the border, the value of the annual NTC is updated with a predetermined value depending on which lines are unavailable. (FORFAIT)

The NTC reductions file is similar to the NTC annual file in terms of format.

This file is used as backup in case of computation failure, or as initial value for the D2CC process (first step of the dichotomy). It is also the reference value for the splitting factors computation.


The file has to be named in the following format: YYYYMMDD_2DX_NTC_reductions_CSEW.xml, where X is the day of the week (1 for Monday) and Y the version number.

### NTC2
The NTC2 files are xml files containing the NTC value updated with the D-2 computation results. They contain two CapacityTimeSeries, but only the one with the Italian InArea should be considered (Italian import). There is one NTC2 file for each country except Italy (AT, CH, FR, SI).

They are used as the initial value for the IDCC process (first step of the dichotomy).

The NTC2 files are only available for the IDCC process, as they contain D-2 data.


The files have to be named in the following format: NTC2_YYYYMMDD_2DX_PP-ITZ.xml (with X being the day of the week and PP the name of the control area, for instance CH), contained in a folder called 22V-TERNA-ECPPRG_10V-RRRRRRRRRRRR_CCC-NTC2_YYYYMMDDVKK (with RRRRRRRRRRRR being a code for the control area, such as SWISS-ECP-P7 and KK the version number).

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
After initial shift

### Final CGM

### TTC res