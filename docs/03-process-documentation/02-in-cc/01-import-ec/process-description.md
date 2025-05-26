---
sidebar_position: 3
---
# Process description
## Input data preprocessing
### Merchant line Mendrisio-Cagno target flow
The Mendrisio-Cagno interconnection line between Switzerland and Italy is a Merchant Line (i.e. operated by private investors) which power exchange and capacity is handled by specific contracts.
For this reason, Mendrisio PST is used to enforce the active power flow on the interconnection line to a specified target which is provided as an input of the process.

First, the target flow on the interconnection (and the PST) is calculated.
- **For D2CC**, Mendrisio-Cagno target flow calculation is based on the following input files:
    D2CC inputs contain many values that are admissible as target flow for Mendrisio Cagno merchant line:
    - The one defined in NTC annual file. 
    - The many defined in Target CH file if associated outage is actually applied on the CGM.
    The minimum value among all the admissible target flow is kept, with a potential offset (that can be either positive or negative) which value is the load associated to Mendrisio node in the CGM.
- **For IDCC**, Mendrisio-Cagno target flow is directly retrieved from NTC annual input.

When the target flow is correctly calculated, it is applied as a regulation value for Mendrisio PST, and the flow regulation is then activated. It ensures that the loadflow and sensitivity computation engines will change PST taps automatically in order to ensure that the flow on the PST is always approximately equal to the target flow.

> **ℹ️** By default, UCTE import PowSyBl does not put PSTs as regulated, this is why Mendrisio PST as to be manually set as regulated. 
> Some tests have been done in the past to set PSTs regulation as active by default if some regulations are specified in the UCTE network, but this way CSE networks was not converging anymore in AC and this prevented to go further in this direction. It may be reassessed in the future, when resilience of the loadflow engine will be improved.

### PiSa HVDC alignment
The PiSA HVDC line is an HVDC interconnection between France and Italy composed of two HVDC links.

As UCT format does not allow to model such a device in the CGM, an equivalent model is used, composed of three AC lines and two generators for each HVDC link.

![PiSa equivalent model](/img/in-import-ec/pisaModel.png)

Each HVDC link can be operated in two modes:
- Fixed set point: all AC lines are disconnected, and the generators are configured with a power set point equal to the target flow of the link (each side of the HVDC must have approximately opposite target flow, with a sign depending on the direction of flow on the border)
- AC emulation: any AC line is connected (only one should be connected at any time, depending of the angle droop gain coefficient actually used for regulation), and the generators power set point is equal to 0.

It may be possible that, for some reason, initial modelling of PiSa HVDC is not correctly aligned. As a response to this issue, the equivalent model's generators power set point are aligned. The generator with maximum power set point in absolute value is considered as the reference for the HVDC set point: the other generator's power set point is set to the opposite value.

All HVDC aligned set points are saved as they will be used at the end of the process during TTC res export.

> ⚠️ For IDCC process, an extra preprocessing is applied forcing the HVDC in fixed set point mode, with a set point value depending on available remedial actions in CRAC. This process is described in section PiSa setpoint.

> **?** Open questions:
> - In D2CC, the HVDC seems to be implicitely operated in fixed set point, but it is never checked that AC lines are open. Should we open them, to ensure there is no issue ?
### CRAC/CGM alignment
#### Busbar change
Some topological remedial actions defined in CRAC file consist on moving a branch connection from a given node to another one. As CGM is not detailed enough - with all switches needed to model such an operation - a preprocessing is done to ensure that those remedial actions are correctly taken into account during the optimisation.

First if the final node does not exist in the initial network file, it is created by the pre-processing.

Then, in order to avoid having to change the network topology, a fictive node is created. It allows to turn the busbar change remedial action into sets of switch opening/closing remedial actions.

![Topological RAs preprocessing](/img/in-import-ec/topologicalRAsPreprocessing.png)

These modifications are saved in order to be able to remove these fictive nodes before exporting Final CGM.

> **?** Open questions:
> - Initial CGM output (i.e. output after initial shift) does not seem to be post processed to remove these fictive nodes created to model the bus bar change. Is it normal ?

#### PiSa setpoint

For IDCC process only, if HVDC link is operated in AC emulation, the following treatment is applied:
- the HVDC link is switched to fixed set point mode ; the equivalent model's generators are connected and the equivalent model's AC lines are disconnected. 
- the generators' set point is calculated based on their diagram limits in the CGM and available "HVDC" remedial actions on the equivalent generators in CRAC file. We consider the intersection of each of the generators's admissible active power range, both in CGM and available RAs. The chosen set point is the maximum set point from France to Italy in this intersection.

> **?** Open questions:
> - Why is IDCC treatment different than D2CC one ? Is it justified or only due to the fact that equivalent model in D2CC input is always in fixed setpoint ? In this case the code should be simplified to ensure there is no unneeded distinction between those two processes.

#### PSTs range enforcement

CASTOR is not be able to optimize a PST if its initial tap is out of admissible range defined in the CRAC.

In order to mitigate the risk of suboptimality implied by removing a flexibility in the optimisation, it has been chosen to pre-process the network in order to change the initial tap of PSTs that are out of their admissible ranges (and only these ones).
These PSTs will be set to their minimal admissible tap.

As it is a pre-processing directly on network file, this modification will be hidden in the final RAO result, but must be considered as a remedial action, even if not modified afterwards during the RAO step. In order to make this change appear in the computation result, these PST taps changes are saved to be used at the end of the process during TTC res export.

> **?** Open questions:
> - For sake of simplicity, it has been chosen to always go to the minimal tap of the admissible range, even if the initial tap was over the maximal tap of the range. As PST is optimized it may not have any impact on the result, but modifying this logic to the more intuitive one of going to the "nearest tap in the range" could improve convergence of the loadflow.

### Splitting factors

Northern Italian Border capacity calculation  aims is to provide a maximum northern italian import transfer capacity. In order to simulate an import increase on northern italian border, export from the border countries (France, Switzerland, Austria, and Slovenia) are increased proportionnaly, with a fix proportion throughout the process called splitting factor.

Splitting factors are calculated based on NTC values by country defined in NTC annual file, and potentially replaced or shifted based on elements from NTC reduction file. For each country, the splitting factor is calculated as follow.

$$SF_{init}(\textrm{country}) = \frac{NTC_{ref}(\textrm{country})}{\sum_{c \in \textrm{countries}}{NTC_{ref}(\textrm{country})}}$$

However, the existence of merchant lines with fix contractual flows on some borders makes that this definition of splitting factors must be adapted to remove from the reference NTC the flows on merchant lines. This gives the following definition for the reduced splitting factors.

$$SF_{reduced}(\textrm{country}) = \frac{NTC_{ref}(\textrm{country})-P_\textrm{merchant line}(\textrm{country})}{\sum_{c \in \textrm{countries}}{\left( NTC_{ref}(\textrm{c}) - P_\textrm{merchant line}(c)\right)}}$$

> **?** Open questions:
> - Why aren't splitting factors defined in NTC annual used ?

### Modified CGM export to MinIO
The initial UCTE network file that has been imported from CGM input file has been modified by the action of some of the previous pre-processing steps. It is this modified CGM that must be used as network object during the entire capacity calculation process.

The modified network is exported in XIIDM format to be shared by GridCapa micro-services. It is saved as an artefact of the task on MinIO at path **CSE/IMPORT_EC/\<process_type\>/\<year\>/\<month\>/\<day\>/\<hour\>_\<minute\>/ARTIFACTS/network_pre_processed.xiidm** of MinIO.

## Initial shift to previous NTC
The initial shift is an operation before the dichotomy process that aims to upgrade the input network from vulcanus exchange level to NTC level.

### Initial NTC retrieval

The following notation will be used for the NTC values defined in the different NTC file inputs :
- The NTC value defined for country c in NTC annual file is noted $NTC_{annual}(c)$
- The NTC value defined for country c in NTC red file is noted $NTC_{red}(c)$
- The NTC value defined for country c in NTC2 file is noted $NTC_2(c)$

For France, Switzerland, Austria, and Slovenia, the initial NTC for the calculation $NTC(c)$ is retrieved as follows:
- **For D2CC**,
  - $NTC(c) = NTC_{red}(c)$ if $NTC_{red}(c)$ available and of absolute type
  - $NTC(c) = NTC_{annual}(c) + NTC_{red}(c)$ if $NTC_{red}(c)$ available and of relative type
  - $NTC(c) = NTC_{annual}(c)$ otherwise
- **For IDCC**,
  - $NTC(c) = NTC_2(c)$ if $NTC_2(c)$ available
  - $NTC(c) = NTC_{red}(c)$ if $NTC_{red}(c)$ available and of absolute type
  - $NTC(c) = NTC_{annual}(c) + NTC_{red}(c)$ if $NTC_{red}(c)$ available and of relative type
  - $NTC(c) = NTC_{annual}(c)$ otherwise

For Italy, the initial NTC for the calculation $NTC(IT)$ is retrieved as follows :

$NTC(IT) = - (NTC(FR) + NTC(CH) + NTC(AT) + NTC(SL))$

### Flows on non modelled lines retrieval

The following notation will be used for the non modelled lines flow values defined in the different NTC file inputs :
- The flow value defined for country c in NTC annual file is noted $P_\textrm{nml annual}(c) = \sum_{nml}{P_{fixed}(c)}$ 
- The flow value defined for country c in NTC red file is noted $P_\textrm{nml red}(c) = \sum_{nml}{P_{fixed}(c)}$


They correspond to the fixed flows values of special-lines with the attribute “modelized” set to false in those input files. 
- $P_\textrm{nml}(c) = P_\textrm{nml red}(c)$ if $P_\textrm{nml red}(c)$ available and of absolute type 
- $P_\textrm{nml}(c) = P_\textrm{nml annual}(c) + P_\textrm{nml red}(c)$ if $P_\textrm{nml red}(c)$ available and of relative type 
- $P_\textrm{nml}(c) = P_\textrm{nml annual}(c)$ otherwise

### Shift

The initial shift uses each country GLSK and applies a one time shift with following volumes, for each country :

$\Delta_p(c) = NTC(c) - NTC_{ref}(c) - P_\textrm{nml}(c)$

If any generator or load in the GLSK is disconnected, it will be automatically connected. The shift is iterative, i.e. it will not necessarily respect initial shifting factors if any of its blocks is saturated earlier than others.

### GLSK limitation

In case of GLSK limitation, there are two possibilities.

If GLSK limitation is reached on Italy, all other shift values are amended proportionally to the reachable shift on Italy (aim i to keep same shift proportions on all  other countries)

If we note $\Delta P_{max}(IT)$ the maximum available shift on the GLSK, the new shifts $\Delta P'(c)$ for all countries are defined as follow. 
- $\Delta P'(IT) = \Delta P_{max}(IT)$
- $\Delta P'(c) = \Delta P(c) * \Delta P_{max}(IT) / \Delta P(IT)$ for $c$ in [FR, CH, AT, SL]

If GLSK limitation is on any other country a simple warning log is emitted.

> **?** Open questions:
> - In case of GLSK limitation on other country, it will create a sum of shifts which is not 0, though implying that part of this unequilibrium will be fixed by loadflow compensation. 
>   - The issue was known as described in this page GLSK limitations :
      "On the other hand, if the limiting country is any of the following: Switzerland, France, Slovenia, or Austria, tests are currently being conducted by coreso (as of 1st June 2023) to clarify the behavior. However, it is possible that the delta on NIB loads will be automatically balanced using specific LF (Load Flow) parameters. This aspect is still under development and will be updated once the requirements become clearer."
>   - In case of GLSK limitation in Italy, it seems that orphan network variant aren't cleared in the process. To be analysed.

### Loadflow / divergence

In case of loadflow divergence (before or after shift), process is considered as failed.

### Initial CGM export to MinIO

The initial CGM network file output is the result of initial shift to reference NTC.

- **For D2CC**, it is exported in UCTE format to be retrievable through GridCapa UI as an output. It can also be retrieved as an output of the task on MinIO at path **CSE/IMPORT_EC/D2CC/\<year\>/\<month\>/\<day\>/\<hour\>_\<minute\>/OUTPUTS/\<year\>\<month\>\<day\>_\<hour\>\<minute\>_2D\<dayOfWeek\>_CO_CSE1.uct** of MinIO.
- **For IDCC**, it is exported in UCTE format to be retrievable through GridCapa UI as an output. It can also be retrieved as an output of the task on MinIO at path **CSE/IMPORT_EC/IDCC/\<year\>/\<month\>/\<day\>/\<hour\>_\<minute\>/OUTPUTS/\<year\>\<month\>\<day\>_\<hour\>\<minute\>_\<generationHour\>\<dayOfWeek\>_Initial_CSE1.uct** of MinIO.

## Dichotomy
### Initial step
### Shift
### GLSK limitation
### RAO
#### Secure
#### Unsecure
#### Divergence
### Step update strategy
## Output data postprocessing
### CRAC/CGM alignment rollback
When dichotomy ends successfully, The final network file with activated preventive remedial actions is exported as an output of the process.

In order to remove fictive nodes added during busbar change remedial actions pre processing, a post processing is applied that remove fictive nodes and switch and move associated branch on correct real node. 

### Shifted CGM export
The shifted CGM network file output is the final network file with activated preventive remedial actions on last secure step of the dichotomy.

- **For D2CC**, it is exported in UCTE format to be retrievable through GridCapa UI as an output. It can also be retrieved as an output of the task on MinIO at path **CSE/IMPORT_EC/D2CC/\<year\>/\<month\>/\<day\>/\<hour\>_\<minute\>/OUTPUTS/\<year\>\<month\>\<day\>_\<hour\>\<minute\>_2D\<dayOfWeek\>_CO_Final_CSE1.uct** of MinIO.
- **For IDCC**, it is exported in UCTE format to be retrievable through GridCapa UI as an output. It can also be retrieved as an output of the task on MinIO at path **CSE/IMPORT_EC/IDCC/\<year\>/\<month\>/\<day\>/\<hour\>_\<minute\>/OUTPUTS/\<year\>\<month\>\<day\>_\<hour\>\<minute\>_\<generationHour\>\<dayOfWeek\>_CSE1.uct** of MinIO.

### TTC res export

#### In case of process success

The TTC res output is an XML file that contains the detailed results of the process including:
- calculated TTC and MNII 
- limiting CNEC 
- remedial actions selected (preventive and curative), 
- flows calculated on CNECs in the different state of the chronology (preventive, after outage, after curative), 
- exchange values on each borders 
- actual splitting factors

**For D2CC**, it is exported to be retrievable through GridCapa UI as an output. It can also be retrieved as an output of the task on MinIO at path **CSE/IMPORT_EC/D2CC/\<year\>/\<month\>/\<day\>/\<hour\>_\<minute\>/OUTPUTS/TTC_Calculation_\<year\>\<month\>\<day\>_\<hour\>\<minute\>_2D0_CO_Final_CSE1.xml* of MinIO.
**For IDCC**, it is exported to be retrievable through GridCapa UI as an output. It can also be retrieved as an output of the task on MinIO at path **CSE/IMPORT_EC/IDCC/\<year\>/\<month\>/\<day\>/\<hour\>_\<minute\>/OUTPUTS/\<year\>\<month\>\<day\>_\<hour\>\<minute\>_XBID2_TTCRes_CSE1.xml** of MinIO.

#### In case of failure

In case of failure of the process, a specific TTC res output is generated including some details about the reason of the failure.

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Timestamp>
    <Time v="2024-12-16T09:30Z"/>
    <Reason>
        <ReasonCode v="A93"/>
        <ReasonText v="IT issues on CE side"/>
    </Reason>
    <Valid v="0"/>
    <CGMfile v="20241216_1030_2D1_CO_CSE1.uct"/>
    <GSKfile v="20241216_1030_2D1_CO_GSK_CSE1.xml"/>
    <CRACfile v="20241216_1030_2D1_CO_CRAC_CSE1.xml"/>
    <BASECASEfile v="20241216_1030_2D1_CO_CSE1.uct"/>
    <Inputfiles>
        <NTCRedfiles>
            <File>
                <Filename v="20241216_2D1_NTC_reductions_CSE1.xml"/>
                <Country v="IT"/>
                <CreationDateTime v="ntcReductionCreationDatetime"/>
                <Backupfile v="A02"/>
            </File>
        </NTCRedfiles>
        <IDCFfiles>
            <File>
                <Filename v="20241216_1030_2D1_UX0.uct"/>
                <Country v="UX"/>
                <CreationDateTime v=""/>
                <Backupfile v="A02"/>
            </File>
        </IDCFfiles>
    </Inputfiles>
</Timestamp>
```

Reason element can change depending on the kind of failure that may occur:
- In case no secure TTC is found (i.e. all exchanges values are unsecure), reason code is "A98" and reason text "No secure TTC found"
- In case any RAO failure, reason code is "A93" and reason text "IT issues on CE side"
- In case of loadflow divergence during initial shift, reason code is "A42" and reason text "Load flow divergence during calculation"
- In case of interruption, reason code is "B18" and reason text is empty

> **?** Open questions:
> - The TTC_res generation code base contains another failure case that is never used in the process code base : INVALID_FILES. Should we investigate it ? Remove it ?