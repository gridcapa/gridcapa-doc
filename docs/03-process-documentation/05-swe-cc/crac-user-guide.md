---
sidebar_position: 1
---

# CIM CRAC user guide for SWE

## Acronyms

| Acronym | Description                              |
|---------|------------------------------------------|
| UID     | Unique identifier                        |
| f       | Facultative                              |
| RA      | Remedial action                          |
| SL      | Security Limit                           |
| MR      | Monitored Resource                       |
| Co      | Contingency                              |
| CS      | Constraint Series                        |
| PST     | Phase Shift Transformers                 |
| CCR     | Capacity Calculation Region              |
| PRA     | Preventive Remedial Action               |
| CRA     | Curative Remedial Action                 |
| SPS     | Special Protection Scheme = automatic RA |
| PATL    | Permanent Admissible Transmissible Limit |
| TATL    | Temporary Admissible Transmissible Limit |

## General introduction

A CRAC file contains a list of elements that will be used for remedial action optimization. There are three types of elements that can be defined in a CRAC file:

- An element to monitor (MR)
- A contingency to simulate (Co)
- A remedial action that can be applied (RA)

The interpretation of these elements depends on how they are associated one to another (e.g.: some remedial actions can only be applied after a specific contingency).

First, the definition of each element is detailed then, the interpretation by the RAO tool OSIRIS is described according to possible associations.

The contingencies and remedial actions represent modifications applied to the network state and after these modifications a new load-flow calculation is launched.

The monitored elements represent the elements whose margins must be taken into account during the calculation: the goal can be either to increase these margins or to make sure they don’t decrease.

### a. Definition of elementary Series

| What do we want to represent? | XML element corresponding in the CRAC | Element corresponding in the security limit | Comments |
|-------------------------------|---------------------------------------|---------------------------------------------|----------|
| A contingency | `Contingency_Series` | An element in the contingencies list | A `Contingency_Series` corresponds to ONE contingency |
| An element to monitor | `Monitored_Series` | An element in the monitored elements list or the specific monitored elements list | A `Monitored_Series` corresponds to ONE network element to monitor (different thresholds can be associated to one `Monitored_Series`). Generic or specific monitored element is deduced based on the context in which the Monitored Series is defined in the CRAC file |
| An element to monitor angles | `AdditionalConstraint_Series` | Not imported | Specific element to monitor angles. Checked after the RAO and not imported in the security limit |
| A remedial action available | `RemedialAction_Series` | A remedial action | A `RemedialAction_Series` corresponds to ONE Remedial action in the SL. The usage rules of the RA are deduced based on the context in which the `RemedialAction_Series` is defined |

### b. Interpretation as a Security Limit

A CRAC file can refer to a given time period not limited to one timestamp whereas Convergence can only do individual calculations. Thereby, the CRAC must be imported as many times as the number of timestamps to launch calculations on the whole period.

Convergence uses only one Security Limit per calculation, so if the data is split between several CRAC files (one per TSO), a merged CRAC must be created before being imported in Convergence.

## How to define a contingency?

### From technical need to security limit through the CRAC file

One contingency is defined by one `Contingency_Series`. This element contains all the information regarding the contingency: the UID of the contingency, the name of the contingency (f), the UIDs of the network elements to trip, the names of the network elements to trip (f).

| What do we want to represent? | XML element corresponding in the CRAC | Element corresponding in the security limit | Comments |
|-------------------------------|---------------------------------------|---------------------------------------------|----------|
| A contingency | `Contingency_Series` | An element in the contingencies list | |
| The UID of the contingency | `mRID` | Stored but not displayed (could be seen in the SL deep export) | |
| The name of the contingency | `name` | The Name of the contingency in the contingencies list | Facultative |
| | `RegisteredResource` | One element of the Tripped elements list | At least one |
| The UID of the network element to trip | `RegisteredResource/mRID` | The Equipment identification of the tripped element | |
| The name of the network element to trip | `RegisteredResource/name` | Not read | Facultative |
| The location of the network element to trip | `RegisteredResource/in_Domain` | Not read | Facultative |
| The location of the network element to trip | `RegisteredResource/out_Domain` | Not read | Facultative |

### Example

#### Need
Simulate the trip of the line Baixas – Vic (mRID in the network = `_363fc03a-2307-5959-20f7-38c771355440`).

#### CRAC file

```xml
<Contingency_Series>
    <mRID>REE-RTE-Co-1</mRID>
    <name>N-1 BAIXAS-VIC</name>
    <RegisteredResource>
        <mRID codingScheme="A02">_363fc03a-2307-5959-20f7-38c771355440</mRID>
        <name>VICXVI BA111 400</name>
        <in_Domain.mRID codingScheme="A01">10YES-REE------0</in_Domain.mRID>
        <out_Domain.mRID codingScheme="A01">10YFR-RTE------C</out_Domain.mRID>
    </RegisteredResource>
</Contingency_Series>
```

#### Security limit representation

- **Contingency Name**: `N-1 BAIXAS-VIC`
- **Tripped elements**:
  - **Equipment name**: `[UID]_363fc03a-2307-5959-20f7-38c771355440`
  - **Equipment identification**: `_363fc03a-2307-5959-20f7-38c771355440`

### FAQ

**Can we use a contingency dictionary?**

> A contingency dictionary can be used by the CCR. Then TSO’s individual CRACs refer to elements in Co dictionary. Please note that Convergence cannot read a `Contingency_Series` without `RegisteredResource` so in that case the CRAC must be merged with the CO dictionary before being imported in Convergence.

**How can we define complex contingencies?**

> To define one contingency corresponding to the trip of several elements, one `Contingency_Series` containing several `RegisteredResource` (one per network element to trip) should be defined.

## How to define an element to monitor?

One monitored element is defined by one `Monitored_Series`. This element contains all the information regarding the element to monitor: the UID of the constraint, the name of the constraint (f), the UID of the network element to monitor, the name of the network element to monitor (f), the direction of the monitoring (if not monitored in both directions) and the description of the thresholds (instants and values).

A threshold associated to one monitored element is defined by a `Measurement`. Several `Measurement` can be defined for one monitored element. This element contains all the information regarding the threshold: the instant, the value, the unit, the direction (f).

Several physical quantities can be monitored in the CRAC file but only flow through lines (Amperes or Megawatts) is handled by OSIRIS and so imported in the security limit. The monitoring of voltage levels and angle differences can be described in the CRAC but cannot be imported in the security limit so far. The details on the implementation of voltage and angle monitoring can be found in the annexes.

Here we detail the interpretation of monitored elements for flows.

### From technical need to security limit through the CRAC file

| What do we want to represent? | XML element corresponding in the CRAC | Element corresponding in the security limit | Comments |
|-------------------------------|---------------------------------------|---------------------------------------------|----------|
| A monitored element | `Monitored_Series` | An element in the monitored elements list | |
| The UID of the monitored element | `mRID` | Stored but not displayed (could be seen in the SL deep export) | |
| The name of the monitored element | `name` | The Name of the monitored element in the monitored elements list | Facultative |
| The owner of the monitored element | `Party_MarketParticipant/mRID` | Not read | Facultative |
| The part of the process using this element | `optimization_MarketObjectStatus.status` | Only elements flagged “for optimization” are imported in the Security Limit | Mandatory |
| | `RegisteredResource` | One network element to monitor aka Constraint | Exactly one |
| The UID of the network element to monitor | `RegisteredResource/mRID` | The Equipment identification of the monitored element | |
| The name of the network element to monitor | `RegisteredResource/name` | Not read | Facultative |
| The location of the network element | `RegisteredResource/in_Domain` | Not read | Facultative |
| The location of the network element | `RegisteredResource/out_Domain` | Not read | Facultative |
| The origin node if the element is monitored only in one direction | `RegisteredResource/in_AggregateNode.mRID` | Used to define the direction of monitoring along with positiveFlowIn attribute | Facultative |
| The extremity node | `RegisteredResource/out_AggregateNode.mRID` | Must be used if in_AggregateNode is defined | Facultative |
| One per threshold and per direction to monitor | `RegisteredResource/Measurements` | One Threshold associated to one direction to monitor | At least one |
| Instant associated to the threshold | `RegisteredResource/Measurements/measurementType` | Instant | See mapping table |
| Unit of the threshold | `RegisteredResource/Measurements/unitSymbol` | Threshold type | See mapping table |
| The direction to monitor if the element is monitored only in one direction | `RegisteredResource/Measurements/positiveFlowIn` | Translated into “from origin to extremity” or “from extremity to origin”, if absent, then “both directions” is used | Facultative |
| Value of the threshold | `RegisteredResource/Measurements/analogValues.value` | Max value | |

### Example

#### Need
Monitor the line Cantegrit - Mouguerre (mRID in the network = `_CANTEL61MOUGU_ACLS`) in both directions with a maximum current in basecase of 100% of Imax, after Automatic RA of 2227.75 A and after Curative RA of 1890 A. No threshold to monitor right after the contingency.

#### CRAC file

```xml
<Monitored_Series>
    <mRID>RTE-MR-1</mRID>
    <name>Cantegrit - Mouguerre 225kV</name>
    <RegisteredResource>
        <mRID codingScheme="A02">_CANTEL61MOUGU_ACLS</mRID>
        <name>CANTEGRIT MOUGUERRE1</name>
        <in_Domain.mRID codingScheme="A01">10YFR-RTE------C</in_Domain.mRID>
        <out_Domain.mRID codingScheme="A01">10YFR-RTE------C</out_Domain.mRID>
        <Measurements>
            <unitSymbol>P1</unitSymbol>
            <analogValues.value>100</analogValues.value>
        </Measurements>
        <Measurements>
            <measurementType>A12</measurementType>
            <unitSymbol>AMP</unitSymbol>
            <analogValues.value>2227.75</analogValues.value>
        </Measurements>
        <Measurements>
            <measurementType>A13</measurementType>
            <unitSymbol>AMP</unitSymbol>
            <analogValues.value>1890</analogValues.value>
        </Measurements>
    </RegisteredResource>
</Monitored_Series>
```

#### Security limit representation

- **Constraint Name**: `Cantegrit - Mouguerre 225kV`
- **Equipment Identification**: `_CANTEL61MOUGU_ACLS`
- **Direction**: Both directions
- **Thresholds**:
  - **N (Basecase)**: `100 % PATL`
  - **Auto**: `2,227.75 A`
  - **Curative**: `1,890 A`

### FAQ

**What kind of thresholds can be defined?**

> Threshold instant is defined by the `measurementType` code. At the moment, 4 codes are implemented in Convergence:
>
> | Need | measurementType Code | Instant |
> |------|----------------------|---------|
> | Maximum current admissible in basecase (PATL) | A02 | N |
> | Maximum current admissible after the contingency and before any RA could be applied | A07 | Outage (60s) |
> | Maximum current admissible after the contingency and after the application of Automatic RA but before any Curative RA could be applied | A12 | Auto (61s) |
> | Maximum current admissible after the contingency and after all the RA have been applied | A13 | Curative (1200s) |
>
> Threshold unit is defined by the `unitSymbol` code. At the moment, 3 codes are implemented in Convergence:
>
> | Need | unitSymbol Code | Threshold Type |
> |------|-----------------|----------------|
> | Maximum current in Amperes | AMP | A |
> | Maximum current in percent of the PATL defined in the network | P1 | %PATL |
> | Maximum active power in Megawatts | MAW | MW |

**Can multiple thresholds be defined for a same instant for an element?**

> Yes, the Security Limit can contain several thresholds for any instant.

**What type of network element can be monitored?**

> Lines can be monitored using `ACLineSegment` mRID. PST and transformers can be monitored using `PowerTransformer` mRID. These mRIDs are found in the EQ profile of the CGMES network.

**How to specify the direction of the monitoring?**

> To specify the direction of monitoring, attributes `in_AggregateNode` and `out_AggregateNode` have to be defined at `RegisteredResource` level. These fields define the origin and extremity nodes used as reference for this `RegisteredResource`. The fields must contain the mRID of the Topological nodes at both ends of the monitored element. These mRIDs are found in the EQ profile of the CGMES network.
>
> Then, each measurement is associated to a direction using the `positiveFlowIn` attribute. Two codes are implemented in the security limit:
>
> | Need | positiveFlowIn Code |
> |------|---------------------|
> | Monitor flow from Out to In AggregateNode | A01 |
> | Monitor flow from In to Out AggregateNode | A02 |
>
> If two thresholds with the two different directions are defined in a single `Monitored_Series`, then two different monitored elements are created in the security limit.

**Can we define complex elements to monitor?**

> Even if the format allows to define several `RegisteredResource` per `Monitored_Series`, this functionality is not handled by the security limit for the moment.

**How to monitor an element only after a specific contingency?**

> See section "How to define usage rules? - Specific monitored element or generic monitored element".

**How to define a Flow Reliability Margin (FRM) and how is it handled in the Security Limit?**

> The FRM can be defined with a `measurementType` “A03”. It isn’t directly imported in the Security Limit but instead of the value of the threshold, the value “threshold – FRM” is imported.

**How to define an element whose margin must not be optimized but must rather not decrease? (“monitoring”)**

> The code `A49` must be used for the `optimization_MarketObjectStatus.status`. In the Security limit, specific information relative to this element is added in the “Constraint precisions” part.

**What happens if the `optimization_MarketObjectStatus.status` is not A49 or A52 or if there is not this element?**

> The monitored element is not imported in the Security Limit.

## How to define a remedial action?

One remedial action is defined by one `RemedialAction_Series`. It can be composed of several elementary actions. This element contains all the information necessary to define a remedial action: the UID of the remedial action, the name of the remedial action (f), the UID of the network elements involved in the action, their names (f), the type of the network elements, the description of the action (start, stop, open, close, modify set point…), the type of RA (preventive, automatic or curative) and the status of the RA (enforced or not).

### From technical need to security limit through CRAC file

| What do we want to represent? | XML element corresponding in the CRAC | Element corresponding in the security limit | Comments |
|-------------------------------|---------------------------------------|---------------------------------------------|----------|
| A Remedial Action | `RemedialAction_Series` | An element in the RA list | |
| The UID of the remedial action | `mRID` | Stored but not displayed (could be seen in the SL deep export) | |
| The name of the RA | `name` | The Name of the remedial action in the RA list | Facultative |
| | `businessType` | Not read | |
| The instant of application of the RA | `applicationMode_MarketObjectStatus.status` | | |
| The status of the RA (enforced) | `availability_MarketObjectStatus.status` | | See restrictions below |
| The owner of the RA | `Party_MarketParticipant` | | |
| | `Party_MarketParticipant/mRID` | TSO owning the RA | X code of the TSO from EIC list |
| One elementary action | `RegisteredResource` | One elementary hypothesis composing the complex hypothesis corresponding to the RA | At least one |

Please find below how to build a `RegisteredResource` for a remedial action:

| One elementary action composing the RA | XML element in RegisteredResource | Element corresponding in the security limit | Comments |
|----------------------------------------|-----------------------------------|---------------------------------------------|----------|
| The UID of the network element to act on | `mRID` | The Equipment identification of the network element to modify | |
| The name of the network element to act on | `name` | Not read | Facultative |
| The type of the network element | `pSRType.psrType` | Not read | |
| The location of the network element to act on | `in_Domain` | Not read | Facultative |
| The location of the network element to act on | `out_Domain` | Not read | Facultative |
| The description of the action | `marketObjectStatus.status` | The type of hypothesis needed | Open, stop, change set point… |
| The new set point | `resourceCapacity.defaultCapacity` | Target set point | Facultative |
| The minimum set point | `resourceCapacity.minimumCapacity` | Minimum set point | Facultative |
| The maximum set point | `resourceCapacity.maximumCapacity` | Maximum set point | Facultative |
| The unit of the setpoints | `resourceCapacity.unitSymbol` | Not read | Facultative |

### Example

#### Need
REE allows to choose Arkale PST tap in between 1 and 33 as a preventive remedial action (PST mRID = `_e071a1d4-fef5-1bd9-5278-d195c5597b6e`).

#### CRAC file

```xml
<RemedialAction_Series>
    <mRID>REE-RA-139</mRID>
    <businessType>B59</businessType>
    <applicationMode_MarketObjectStatus.status>A18</applicationMode_MarketObjectStatus.status>
    <availability_MarketObjectStatus.status>A39</availability_MarketObjectStatus.status>
    <Party_MarketParticipant>
        <mRID codingScheme="A01">10XES-REE------E</mRID>
    </Party_MarketParticipant>
    <RegisteredResource>
        <mRID codingScheme="A02">_e071a1d4-fef5-1bd9-5278-d195c5597b6e</mRID>
        <name>ARKALE1220220</name>
        <pSRType.psrType>A06</pSRType.psrType>
        <in_Domain.mRID codingScheme="A01">10YES-REE------0</in_Domain.mRID>
        <out_Domain.mRID codingScheme="A01">10YES-REE------0</out_Domain.mRID>
        <marketObjectStatus.status>A26</marketObjectStatus.status>
    </RegisteredResource>
</RemedialAction_Series>
```

#### Security limit representation

- **Name**: `[ARKALE]-[ARKALE]-1 220/220KV`
- **Operator**: `10XES-REE------E`
- **Remedial type**: PST range remedial
- **Absolute limits**: `1 / 33`
- **Relative limits**: `-∞ / +∞`

### FAQ

**What kind of elementary action can we model?**

> An elementary action can be defined on a PST, a transformer, a line, a group, an HVDC link or a breaker. The `pSRType` value depends on the network element type. Please find in the annexes (code list) the possible values of the `pSRType` and the associated EQ elements which mRID must be used.
>
> The kind of available actions depends on the type of network element:
>
> | Network element type | PST | Transformer | Line | Group | HVDC | Breaker |
> |----------------------|-----|-------------|------|-------|------|---------|
> | Start/Close | | | X | X | | X |
> | Stop/Open | | | X | X | | X |
> | Change the Setpoint / Impedance | X | X | X | X | X | |
> | Optimize the set point / Impedance | X | | (*) | | (*) | |
>
> (*) *The optimization of the set point of an HVDC link is possible in the format but not yet in the security limit.*
>
> Actions are defined using the attribute `Action_MarketObjectStatus.status` and depending on the type of action `resourceCapacity.maximumCapacity` / `minimumCapacity` / `defaultCapacity` / `unitSymbol`. The type of action is deduced from the association of attributes:
>
> | Attribute | Action MarketObjectStatus | Maximum Capacity | Minimum Capacity | Default Capacity | Unit Symbol |
> |-----------|---------------------------|------------------|------------------|------------------|-------------|
> | Start/Close | X | | | | |
> | Stop/Open | X | | | | |
> | Change the Set point / Impedance | X | | | X | X |
> | Optimize the set point | X | X | X | | X |
>
> In the case of a new set point (chosen or optimized), the target value can be expressed with respect to the current value (`marketObjectStatus` set to “relative to previous optimization step”) or with respect to the value before optimization (`marketObjectStatus` set to “relative to initial network state”). The target value can also be defined in an absolute way (`marketObjectStatus` set to “absolute”).
>
> Please note that only “relative to previous optimization step” and “absolute” are handled by the security limit.
>
> In the annexes, you will find examples of RA description in the CRAC as well as the list of codes handled by the security limit.

**How to define a remedial action consisting in several elementary actions?**

> A Remedial action is defined by a `RemedialAction_Series`. Then, each `RegisteredResource` is used to define an elementary action. There can be as many `RegisteredResource` as wanted for a single `RemedialAction_Series`.

**How to define a remedial action available at multiple instants?**

> The `applicationMode_MarketObjectStatus.status` attribute is mandatory for CRAC import in Convergence. It corresponds to the instant at which the RA is available. The handled values for this attribute are: preventive RA (`A18`), automatic RA (`A20`), curative RA (`A19`) or preventive and curative RA.
>
> To define a RA available on any other combination of instants, the RA should be defined in two different `RemedialAction_Series` using the same information but different values of application Mode.

**Is it possible to force the application of a remedial action?**

> The `availability_MarketObjectStatus.status` attribute is mandatory for CRAC import in Convergence. When set to “could be used” (`A39`), the application of the RA is left at choice of the optimizer. When set to “shall be used” (`A40`), the RA is enforced.
>
> Please note that only RA available after a contingency could be enforced in the actual version of the security limit.

**Why are some hypotheses created next to the Security Limit?**

> The security limit doesn’t contain all the information imported from the CRAC. Some of this information, relative to remedial actions (other than PST range and HVDC range), is stored as hypotheses and the Security Limit refers to these hypotheses.

## How to define usage rules?

The usage rules are deduced from the content of a `Series`. The association of unitary elements (Co, MR and/or RA) results in a given usage rule. The following table details the possible interpretation of the content of a `Series`:

| Contingency Series | Monitored Series | RemedialAction Series | Usage Rule |
|--------------------|------------------|-----------------------|------------|
| N | 0 | 0 | N contingencies |
| 0 | M | 0 | M generic monitored elements |
| N | M | 0 | M specific monitored elements, each monitored after all the N contingencies |
| 0 | 0 | R | R free to use remedial actions |
| N | 0 | R | R remedial actions, each of them available after each of the N contingencies |
| 0 | M | R | R remedial actions, each of them available after each of the M constraints |
| N | M | R | R remedial actions, each of them available after each of the combinations of the N contingencies and M constraints |

### Specific monitored element or generic monitored element

A generic monitored element is an element monitored after all the contingencies simulated in the RAO study. To define a generic monitored element, the corresponding `Monitored_Series` has to be defined in a `Series` without any `Contingency_Series`.

To define an element monitored specifically after a given contingency, the corresponding `Monitored_Series` has to be defined in a `Series` including the `Contingency_Series` corresponding to the contingency. If the element has to be monitored after several contingencies, then the `Series` should contain the `Monitored_Series` and all the `Contingency_Series` corresponding to the contingencies. If several elements have to be specifically monitored after the same contingency, then the `Series` should contain all the `Monitored_Series` and the `Contingency_Series` as illustrated in the following example.

#### Need
Monitor BAIXAS - VIC 400kV and Argia - Mouguerre 2 specifically after the contingency N-1 ARGIA - HERNANI.

#### CRAC file

```xml
<Series>
    <mRID>RTE-Series-CoMRList-1</mRID>
    <businessType>B57</businessType>
    <Contingency_Series>
        <mRID>REE-RTE-Co-4</mRID>
        <name>N-1 ARGIA - HERNANI</name>
        <RegisteredResource>
            <mRID codingScheme="A02">_0b3075b2-7980-988a-224b-407447636928</mRID>
            <name>XHE AR11 HERNANI 1 400</name>
            <in_Domain.mRID codingScheme="A01">10YES-REE------0</in_Domain.mRID>
            <out_Domain.mRID codingScheme="A01">10YFR-RTE------C</out_Domain.mRID>
        </RegisteredResource>
    </Contingency_Series>
    <Monitored_Series>
        <mRID>RTE-MR-1</mRID>
        <name>BAIXAS - VIC 400kV</name>
        <RegisteredResource>
            <mRID codingScheme="A02">_VICHL71BAIXA_ACLS</mRID>
            <name>BAIXAS - VIC 400kV</name>
            <in_Domain.mRID codingScheme="A01">10YFR-RTE------C</in_Domain.mRID>
            <out_Domain.mRID codingScheme="A01">10YES-REE------0</out_Domain.mRID>
            <Measurements>
                <unitSymbol>AMP</unitSymbol>
                <analogValues.value>2309</analogValues.value>
            </Measurements>
        </RegisteredResource>
    </Monitored_Series>
    <Monitored_Series>
        <mRID>RTE-MR-2</mRID>
        <name>Argia - Mouguerre 2</name>
        <RegisteredResource>
            <mRID codingScheme="A02">_ARGIAL62MOUGU_ACLS</mRID>
            <name>Argia - Mouguerre 2</name>
            <in_Domain.mRID codingScheme="A01">10YFR-RTE------C</in_Domain.mRID>
            <out_Domain.mRID codingScheme="A01">10YFR-RTE------C</out_Domain.mRID>
            <Measurements>
                <measurementType>A07</measurementType>
                <unitSymbol>AMP</unitSymbol>
                <analogValues.value>635</analogValues.value>
            </Measurements>
        </RegisteredResource>
    </Monitored_Series>
</Series>
```

#### Security limit representation

- **Contingency**: `N-1 ARGIA - HERNANI`
- **Specific monitored elements**:
  - `BAIXAS - VIC 400kV` (`[UID]_VICHL71BAIXA_ACLS`) - Both directions | Outage: 2309 A
  - `Argia - Mouguerre 2` (`[UID]_ARGIAL62MOUGU_ACLS`) - Both directions | Outage: 635 A

### Remedial action free to use

A remedial action free to use is a remedial action available after any constraint. To define a RA free to use, the corresponding `RemedialAction_Series` has to be defined in a `Series` which does not contain any `Contingency_Series` nor `Monitored_Series`.

If several RA are free to use, they can be defined in the same `Series`.

#### Need
RTE allows to use the curative RA CRA_OPEN_AT_ARGIA after any constraint.

#### CRAC file

```xml
<Series>
    <mRID>RTE-Series-RAList-1</mRID>
    <businessType>B56</businessType>
    <RemedialAction_Series>
        <mRID>RTE-RA-10</mRID>
        <name>CRA OPEN AT ARGIA</name>
        <businessType>B59</businessType>
        <applicationMode_MarketObjectStatus.status>A19</applicationMode_MarketObjectStatus.status>
        <availability_MarketObjectStatus.status>A39</availability_MarketObjectStatus.status>
        <Party_MarketParticipant>
            <mRID codingScheme="A01">10XFR-RTE------E</mRID>
        </Party_MarketParticipant>
        <RegisteredResource>
            <mRID codingScheme="A02">ARGIAY771_PT</mRID>
            <name>Transformer ARGIA</name>
            <in_Domain.mRID codingScheme="A01">10YFR-RTE------C</in_Domain.mRID>
            <out_Domain.mRID codingScheme="A01">10YFR-RTE------C</out_Domain.mRID>
            <marketObjectStatus.status>A21</marketObjectStatus.status>
        </RegisteredResource>
    </RemedialAction_Series>
</Series>
```

#### Security limit representation

| Remedial action | Instant | Usage | Contingency | Constraint | Country |
|-----------------|---------|-------|-------------|------------|---------|
| CRA OPEN AT ARGIA | Curative | Free to use | - | - | - |

### Remedial action available after a given contingency

A remedial action can be available only in case of constraint after a given contingency. To define a RA after a contingency, the corresponding `RemedialAction_Series` has to be defined in a `Series` which contains the corresponding `Contingency_Series` but does not contain any `Monitored_Series`.

If several RA are available after this contingency, they can be defined in the same `Series`. If the RA is available after several contingencies, then the `Series` should contain the `RemedialAction_Series` and all the `Contingency_Series`.

#### Need
REE allows to use the automatic RA TRIP GEN 2485-1I in case of any constraint after the contingencies LA SERNA-MAGALLON-1 400 kV and SANTA ENGRACIA-BARCINA-1 400 kV.

#### CRAC file

```xml
<Series>
    <mRID>REE-Series-CoRA-0_14</mRID>
    <businessType>B56</businessType>
    <name>Contingencies-Remedial_Actions_14</name>
    <Contingency_Series>
        <mRID>REE-Co-10</mRID>
        <name>LA SERNA-MAGALLON-1 400 kV</name>
        <RegisteredResource>
            <mRID codingScheme="A02">_68c74a71-224a-245f-0b52-eac5045761eb</mRID>
            <name>LA SERNA MAGALLON_1_400</name>
            <in_Domain.mRID codingScheme="A01">10YES-REE------0</in_Domain.mRID>
            <out_Domain.mRID codingScheme="A01">10YES-REE------0</out_Domain.mRID>
        </RegisteredResource>
    </Contingency_Series>
    <Contingency_Series>
        <mRID>REE-Co-1</mRID>
        <name>SANTA ENGRACIA-BARCINA-1 400 kV</name>
        <RegisteredResource>
            <mRID codingScheme="A02">_6a5d4cdf-2214-ef79-5ede-33651ce82f05</mRID>
            <name>SENGRACI GARO-BAR 1 400</name>
            <in_Domain.mRID codingScheme="A01">10YES-REE------0</in_Domain.mRID>
            <out_Domain.mRID codingScheme="A01">10YES-REE------0</out_Domain.mRID>
        </RegisteredResource>
    </Contingency_Series>
    <RemedialAction_Series>
        <mRID>REE-RA-14</mRID>
        <name>TRIP GEN 2485-1I</name>
        <businessType>B59</businessType>
        <applicationMode_MarketObjectStatus.status>A20</applicationMode_MarketObjectStatus.status>
        <availability_MarketObjectStatus.status>A39</availability_MarketObjectStatus.status>
        <Party_MarketParticipant>
            <mRID codingScheme="A01">10XES-REE------E</mRID>
        </Party_MarketParticipant>
        <RegisteredResource>
            <mRID codingScheme="A02">_38cbb676-3922-62ef-4494-0a22ee4c9b27</mRID>
            <name>CASTEJON 1I</name>
            <in_Domain.mRID codingScheme="A01">10YES-REE------0</in_Domain.mRID>
            <out_Domain.mRID codingScheme="A01">10YES-REE------0</out_Domain.mRID>
            <marketObjectStatus.status>A23</marketObjectStatus.status>
        </RegisteredResource>
    </RemedialAction_Series>
</Series>
```

#### Security limit representation

| Remedial action | Instant | Usage | Contingency | Constraint | Country |
|-----------------|---------|-------|-------------|------------|---------|
| TRIP GEN 2485-1I | SPS | On outage | LA SERNA-MAGALLON-1 400 kV | - | - |
| TRIP GEN 2485-1I | SPS | On outage | SANTA ENGRACIA-BARCINA-1 400 kV | - | - |

### Remedial action available after a given constraint

A remedial action can be available only in case of a given constraint in N state or after any contingencies. To define a RA available after a constraint, the corresponding `RemedialAction_Series` has to be defined in a `Series` which contains the corresponding `Monitored_Series` but does not contain any `Contingency_Series`.

If several RA are available after this constraint, they can be defined in the same `Series`. If the RA is available after several constraints, then the `Series` should contain the `RemedialAction_Series` and all the `Monitored_Series`.

### Remedial action available after a given contingency and a given constraint

A remedial action can be available only in case of a given constraint after a given contingency. To define a RA available after a contingency and a constraint, the corresponding `RemedialAction_Series` has to be defined in a `Series` which contains the corresponding `Monitored_Series` and the corresponding `Contingency_Series`.

If several RA are available after this pair of contingency and constraint, they can be defined in the same `Series`. If the RA is available after several pairs of contingency and constraint, then the `Series` should contain the `RemedialAction_Series`, all the `Contingency_Series` and `Monitored_Series`.

#### Need
REE allows to use the automatic RA SPLIT CARMONA 400 kV in case of constraint on `ALJARAFE_SANTIPON_1_220` or `DON RODRIGO-ALJARAFE-1 220 kV` after the contingency `ALMARAZ-MORATA-1 400 kV` or `ALMARAZ-MORATA-2 400 kV`.

#### CRAC file

```xml
<Series>
    <mRID>REE-Series-MRCoRA-0_138</mRID>
    <businessType>B56</businessType>
    <name>Monitored_Resources-Contingencies-Remedial_Actions_138</name>
    <Contingency_Series>
        <mRID>REE-Co-111</mRID>
        <name>ALMARAZ-MORATA-1 400 kV</name>
        <RegisteredResource>
            <mRID codingScheme="A02">_280fac45-ad03-5896-5cb1-14774fa5b047</mRID>
            <name>ALMARAZ_MORATA_1_400</name>
            <in_Domain.mRID codingScheme="A01">10YES-REE------0</in_Domain.mRID>
        </RegisteredResource>
    </Contingency_Series>
    <Contingency_Series>
        <mRID>REE-Co-112</mRID>
        <name>ALMARAZ-MORATA-2 400 kV</name>
        <RegisteredResource>
            <mRID codingScheme="A02">_8af215f9-7535-0f5b-47a4-5146f2cb1d4a</mRID>
            <name>ALMARAZ_MORATA_2_400</name>
            <in_Domain.mRID codingScheme="A01">10YES-REE------0</in_Domain.mRID>
        </RegisteredResource>
    </Contingency_Series>
    <Monitored_Series>
        <mRID>REE-MR-1</mRID>
        <name>DON RODRIGO-ALJARAFE-1 220 kV</name>
        <RegisteredResource>
            <mRID codingScheme="A02">_73cafa04-afdf-0369-a65b-847c92a86702</mRID>
            <name>DRODRIGO_ALJARAFE_1_220</name>
            <in_Domain.mRID codingScheme="A01">10YES-REE------0</in_Domain.mRID>
            <Measurements>
                <measurementType>A12</measurementType>
                <unitSymbol>P1</unitSymbol>
                <analogValues.value>115</analogValues.value>
            </Measurements>
        </RegisteredResource>
    </Monitored_Series>
    <Monitored_Series>
        <mRID>REE-MR-2</mRID>
        <name>ALJARAFE_SANTIPON_1_220</name>
        <RegisteredResource>
            <mRID codingScheme="A02">_336d02aa-fb9a-3af3-f08c-075bdbcb2a26</mRID>
            <name>ALJARAFE_SANTIPON_1_220</name>
            <in_Domain.mRID codingScheme="A01">10YES-REE------0</in_Domain.mRID>
            <out_Domain.mRID codingScheme="A01">10YES-REE------0</out_Domain.mRID>
            <Measurements>
                <measurementType>A12</measurementType>
                <unitSymbol>P1</unitSymbol>
                <analogValues.value>115</analogValues.value>
            </Measurements>
        </RegisteredResource>
    </Monitored_Series>
    <RemedialAction_Series>
        <mRID>REE-RA-138</mRID>
        <name>SPLIT CARMONA 400 kV</name>
        <businessType>B59</businessType>
        <applicationMode_MarketObjectStatus.status>A20</applicationMode_MarketObjectStatus.status>
        <availability_MarketObjectStatus.status>A39</availability_MarketObjectStatus.status>
        <Party_MarketParticipant>
            <mRID codingScheme="A01">10XES-REE------E</mRID>
        </Party_MarketParticipant>
        <RegisteredResource>
            <mRID codingScheme="A02">_d76f5310-6993-9f84-d383-b0b31558b64a</mRID>
            <name>CARMONA_CARMONA_1_400</name>
            <in_Domain.mRID codingScheme="A01">10YES-REE------0</in_Domain.mRID>
            <marketObjectStatus.status>A21</marketObjectStatus.status>
        </RegisteredResource>
    </RemedialAction_Series>
</Series>
```

#### Security limit representation

| Remedial action | Instant | Usage | Contingency | Constraint | Country |
|-----------------|---------|-------|-------------|------------|---------|
| SPLIT CARMONA 400 kV | SPS | On constraint | ALMARAZ-MORATA-1 400 kV | ALJARAFE_SANTIPON_1_220 | - |
| SPLIT CARMONA 400 kV | SPS | On constraint | ALMARAZ-MORATA-1 400 kV | DON RODRIGO-ALJARAFE-1 220 kV | - |
| SPLIT CARMONA 400 kV | SPS | On constraint | ALMARAZ-MORATA-2 400 kV | ALJARAFE_SANTIPON_1_220 | - |
| SPLIT CARMONA 400 kV | SPS | On constraint | ALMARAZ-MORATA-2 400 kV | DON RODRIGO-ALJARAFE-1 220 kV | - |

### Remedial action available after any constraint in given country

A remedial action can be available to solve any constraint in a given country. To define a RA available after a constraint in a given country, the corresponding `RemedialAction_Series` has to be defined in a `Series` which does not contain any `Contingency_Series` nor `Monitored_Series` and to include the attribute `Shared_Domain` in the `RemedialAction_Series`.

#### Need
REE allows to use the preventive RA SPLIT CARMONA 220 kV in case of constraint in Spain.

#### CRAC file

```xml
<Series>
    <RemedialAction_Series>
        <mRID>REE-RA-47</mRID>
        <name>SPLIT CARMONA 220 kV</name>
        <businessType>B59</businessType>
        <applicationMode_MarketObjectStatus.status>A18</applicationMode_MarketObjectStatus.status>
        <availability_MarketObjectStatus.status>A39</availability_MarketObjectStatus.status>
        <RegisteredResource>
            <mRID codingScheme="A02">_86418b17-1d45-6188-7450-62bbc27e562e</mRID>
            <name>CARMONA CARMONA 1 220</name>
            <pSRType.psrType>A07</pSRType.psrType>
            <in_Domain.mRID codingScheme="A01">10YES-REE------0</in_Domain.mRID>
            <out_Domain.mRID codingScheme="A01">10YES-REE------0</out_Domain.mRID>
            <marketObjectStatus.status>A21</marketObjectStatus.status>
        </RegisteredResource>
        <Shared_Domain>
            <mRID codingScheme="A01">10YES-REE------0</mRID>
        </Shared_Domain>
    </RemedialAction_Series>
</Series>
```

#### Security limit representation

| Remedial action | Instant | Usage | Contingency | Constraint | Country |
|-----------------|---------|-------|-------------|------------|---------|
| SPLIT CARMONA 220 kV | N | On constraint (area) | - | - | ESPAGNE |

## Annexes

### How to monitor Voltage at a substation?

In the CRAC, one can define the voltage at a substation as a monitored element. Even if possible in the CRAC, this is ignored by the CRAC import function as it cannot be included in the security limit. Specific python import function should be developed case-by-case.

The same `Monitored_Series` structure will be used with some modifications:
- `RegisteredResource/mRID` must refer to a `VoltageLevel` mRID
- At this substation, a minimum and maximum voltage can be defined using `Measurements` of type minimum voltage (`A10`) or maximum voltage (`A11`)
- The unit of a voltage threshold could be in percent of the base voltage (`P1`) or in kilovolts (`KVT`)

#### Need
Monitor the voltage at Hernani substation (mRID of the voltage level = `_13d56d9e-e7a1-4bf5-8f2b-58dc86d0cd78`). Minimum admissible voltage is equal to 380 kV and maximum admissible voltage to 430 kV.

#### CRAC file

```xml
<Monitored_Series>
    <RegisteredResource>
        <mRID codingScheme="A02">_13d56d9e-e7a1-4bf5-8f2b-58dc86d0cd78</mRID>
        <name>HERNANI 400</name>
        <in_Domain.mRID codingScheme="A01">10YES-REE------0</in_Domain.mRID>
        <out_Domain.mRID codingScheme="A01">10YES-REE------0</out_Domain.mRID>
        <Measurements>
            <measurementType>A10</measurementType>
            <unitSymbol>KVT</unitSymbol>
            <analogValues.value>380</analogValues.value>
        </Measurements>
        <Measurements>
            <measurementType>A11</measurementType>
            <unitSymbol>KVT</unitSymbol>
            <analogValues.value>430</analogValues.value>
        </Measurements>
    </RegisteredResource>
</Monitored_Series>
```

### How to monitor an angle difference?

In the CRAC, one can define the angle in between two substations as a monitored element. Even if possible in the CRAC, this is ignored by the CRAC import function as it cannot be included in the security limit. Specific python import function should be developed case-by-case.

Angle monitoring is done by creating an `AdditionalConstraint_Series`.

#### Need
Monitor the angle between Cartelle (mRID of the voltage level = `_CARTELLE_VL_ID`) and Alto Lindoso substations (mRID of the voltage level = `_ALTO_LINDOSO_VL_ID`). Maximum admissible value is 30° from Cartelle to Alto Lindoso.

#### CRAC file

```xml
<AdditionalConstraint_Series>
    <mRID>REN-AC-2</mRID>
    <name>Angle-CARTELLE-ALTO-LINDOSO</name>
    <businessType>B87</businessType>
    <threshold_Quantity.quantity>30</threshold_Quantity.quantity>
    <threshold_Quantity.unitSymbol>DD</threshold_Quantity.unitSymbol>
    <positiveFlowIn>A01</positiveFlowIn>
    <In_AggregateNode>_CARTELLE_VL_ID</In_AggregateNode>
    <Out_AggregateNode>_ALTO_LINDOSO_VL_ID</Out_AggregateNode>
</AdditionalConstraint_Series>
```

### Exhaustive list of RA description

#### Remedial Action on a PST
- Go to tap N
- Optimize tap between Nmin and Nmax
- Optimize tap between current tap + $\Delta N$
- Optimize tap between initial tap + $\Delta N$
- Close the PST
- Open the PST

#### Remedial Action on a group
- Stop the group
- Go to the set point P
- Go to current set point + $\Delta P$

#### Remedial Action on a line or on a transformer
- Close the line/transformer
- Open the line/transformer
- Modify the impedance of the line

#### Remedial Action on a HVDC link
- Go to set point P
- Go to current set point + $\Delta P$

#### RA defined in the CRAC but not imported in CVG
- Change HVDC operating mode
- Change/Optimize linear shunt compensator
- Optimize FACTS set point
- Range or setpoint relative to initial network state (except for PSTs)

## Code list

### Series\Contingency_Series

| XML attribute | Content |
|---------------|---------|
| `mRID` | Identifier of the Co (stored but not displayed) |
| `name` | Name of the Co (used in the user’s interface to identify the Co) |
| `RegisteredResource` | At least one per `Contingency_Series`. See below |

### Series\Contingency_Series\RegisteredResource

| XML attribute | Content |
|---------------|---------|
| `mRID` | mRID from the EQ |
| `name` | Name for the EQ (not read) - Facultative |
| `in_Domain.mRID` | Y EIC code of the country of the in Terminal (not read) – Facultative (used for reporting purposes) |
| `out_Domain.mRID` | Y EIC code of the country of the out Terminal (not read) – Facultative (used for reporting purposes) |

### Series\Monitored_Series

| XML attribute | Content |
|---------------|---------|
| `mRID` | Identifier of the MR (stored but not displayed) |
| `name` | Name of the MR (used in the user’s interface to identify the MR) |
| `RegisteredResource` | Exactly one per `Monitored_Series`. See below |

### Series\Monitored_Series\RegisteredResource

| XML attribute | Content |
|---------------|---------|
| `mRID` | mRID from the EQ |
| `name` | Name for the EQ (not read) - Facultative |
| `in_Domain.mRID` | Y EIC code of the country of the in Terminal (not read) – Facultative (used for reporting purposes) |
| `out_Domain.mRID` | Y EIC code of the country of the out Terminal (not read) – Facultative (used for reporting purposes) |
| `in_AggregateNode.mRID` | mRID of the in Terminal from the EQ – Facultative (used to specify the monitoring direction; if `in_AggregateNode` is used then `out_AggregateNode` is mandatory) |
| `out_AggregateNode.mRID` | mRID of the out Terminal from the EQ – Facultative |
| `Measurement` | At least one per `RegisteredResource` |

### Series\Monitored_Series\RegisteredResource\Measurement

| XML attribute | Content |
|---------------|---------|
| `measurementType` | `A02`: PATL (Max current in N)<br/>`A07`: TATL after contingency<br/>`A12`: TATL after automatic remedial action<br/>`A13`: TATL after automatic and curative remedial action<br/>`A10`: Minimum Voltage<br/>`A11`: Maximum Voltage |
| `unitSymbol` | `AMP`: Amperes<br/>`P1`: Percent of PATL as in EQ / Percent of base voltage<br/>`KVT`: kilovolts |
| `positiveFlowIn` | `A01`: from out to in AggregateNode<br/>`A02`: from in to out AggregateNode |
| `analogValues.value` | Value of the threshold to monitor |

### Remedial Action Series - Network element mapping

| Network element type | PST | Transformer | Line | Group | HVDC | Breaker |
|----------------------|-----|-------------|------|-------|------|---------|
| **mRID type** | Power Transformer | Power Transformer | AC Line Segment | Synchronous Machine | ? | Breaker |
| **PSRType** | `A06` | `B24` | `A02`/`A12` | `A04` | `B22` | `A07` |
