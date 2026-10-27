---
sidebar_position: 4
---
# CIM CNE user guide

## General introduction

A CNE file contains a list of elements that represent the result of a remedial action optimization. There are three types of elements that can be defined in a CNE file:
- A simulated contingency (Co)
- A monitored element (MR)
- An applied remedial action (RA)

The interpretation of these elements depends on how they are associated one to another.

NB: The CNE file presented below is corresponding to the result of one specific computation of the remedial action optimizer. Several results can be combined, in order to create a new file (which is also a CNE document).

NB2: The CNE format can be used for displaying other results (Security Analysis, merging, etc.). These exports are not explained in this document.

NB3: This guide is compliant with CNE version 2.1, 2.2 and 2.3 (and maybe also others, if no essential modification is done in the xsd of the CNE).

First, the definition of each element is detailed then, the interpretation by GridCapa is described according to possible associations.

## Definition of elementary blocks

| What do we want to represent? | XML element corresponding in the CNE | Comments                                                                                                                                |
|-------------------------------|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| A Contingency                 | A Contingency_Series                 | A Contingency_Series corresponds to ONE contingency                                                                                     |
| A Monitored Element           | A Monitored_Series                   | A Monitored_Series corresponds to ONE network element being monitored (different thresholds can be associated to one Monitored_Series). |
| An applied Remedial Action    | A RemedialAction_Series              | A RemedialAction_Series corresponds to ONE Remedial action from the CRAC.                                                               |

## Constraint_Series: How to describe the relation between elementary blocks?

### Content

The elementary blocks (Contingency_Series, Monitored_Series and RemedialAction_Series) are written in Constraint_Series.

A Constraint_Series must contain a combination of:
- zero or one Contingency_Series,
- zero, one or several Monitored_Series,
- zero, one or several RemedialAction_Series,
- zero or one Reason (in case of computation failure).

As all the other elements of a CNE file, the Constraint_Series must contain an UID (`mRID`), which is generated randomly without a meaning. It also contains a `businessType`, which can be either `B56` or `B57`.

| What do we want to represent?                                      | XML element corresponding in the CNE   | Comments                                                                                    |
|--------------------------------------------------------------------|-----------------------------------------|---------------------------------------------------------------------------------------------|
| A combination of remedial actions and/or flows after a contingency | Constraint_Series                       |                                                                                             |
| The UID of the Constraint_Series                                   | mRID                                    | Randomly generated, unique and with no particular meaning                                   |
| The nature of the Constraint_Series                                | businessType                            | B56 (applied RAs) or B57 (monitored elements & flows)                                       |
| The contingency of the Constraint_Series                           | Contingency_Series                      | 0 (basecase) - 1 (N-1 situations)                                                           |
| The flows and thresholds of the monitored elements                 | Monitored_Series                        | 0 (B56) - 0, 1 or several (B57)                                                             |
| The remedial actions applied after the contingency                 | RemedialAction_Series                   | 0, 1 or several (with full RegisteredResource in B56; reference only in B57)                 |
| Error/divergence reason                                            | Reason                                  | 0 - 1 (present if the contingency calculation failed)                                       |

#### Elementary blocks

A Constraint_Series contains zero or one Contingency_Series, which defines the described situation (basecase or N-1).
The Constraint_Series can contain zero, one or several Monitored_Series, describing the flows and thresholds in that situation.
The Constraint_Series can contain zero, one or several RemedialAction_Series, listing the remedial actions applied in that situation.

#### Basecase or N-1

A Constraint_Series after each contingency (N-1) contains exactly one Contingency_Series.
A Constraint_Series in basecase contains no Contingency_Series.

#### Preventive remedial actions

The selected preventive remedial actions are applied before all contingencies.
- In `B56` Constraint_Series: they are only written in the basecase `B56` Constraint_Series.
- In `B57` Constraint_Series: their references are included in the basecase `B57` Constraint_Series as well as in all contingency `B57` Constraint_Series, to list all remedial actions having an effect on the monitored elements.

#### Range remedial actions (PST and HVDC)

- For **PST range actions**:
  - In `B56` Constraint_Series: the `mRID` of the `RemedialAction_Series` is formatted as `<id>@<tap>@` (where `tap` is the optimal tap position), its `name` is the action's name, and it contains a `RegisteredResource` detailing the PST network element (ID, name, `pSRType.psrType` = `A06`, `marketObjectStatus.status` = `A26` for absolute tap, `resourceCapacity.defaultCapacity` = tap value, and `resourceCapacity.unitSymbol` = `C62` for dimensionless).
  - In `B57` Constraint_Series: only the reference (`mRID` `<id>@<tap>@` and `name`) is exported without `RegisteredResource`, to keep the CNE file compact.
- For **HVDC range actions**:
  - In both `B56` and `B57` Constraint_Series: the optimal setpoint (in MW) is encoded directly in the `mRID` and `name` attributes formatted as `<id>@<setpoint>@`. No `RegisteredResource` is exported for HVDC actions.
- For **Network actions (topological)**:
  - In both `B56` and `B57` Constraint_Series: they are exported with their native `mRID` and `name` without `RegisteredResource`.

### Business types

#### B56

This Constraint_Series focuses on the applied remedial actions. Exactly one `B56` Constraint_Series is created for the basecase, and exactly one `B56` Constraint_Series is created per contingency.

| What do we want to represent?                            | What kind of series does the Constraint_Series contain?                                                                                                                                                                          |
|----------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| The preventive remedial actions in basecase              | 0 Contingency_Series & [0;N] RemedialAction_Series (`A18` in `applicationMode_MarketObjectStatus.status`, with `RegisteredResource` for PST range actions)                                                                    |
| The remedial actions (Auto and Curative) after an outage | 1 Contingency_Series and [0;N] RemedialAction_Series (`A20` for Auto, `A19` for Curative; with `RegisteredResource` for PST range actions) OR 1 Reason (code `B18`) if the contingency calculation diverged / failed          |

#### B57

This Constraint_Series focuses on the monitored flows and thresholds and references the remedial actions active in that situation. Exactly one `B57` Constraint_Series is created for the basecase, and exactly one `B57` Constraint_Series is created per contingency.

| What do we want to represent?             | What kind of series does the Constraint_Series contain?                                                                                                                                                                        |
|-------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Monitored constraints in basecase         | 0 Contingency_Series & [0;M] Monitored_Series (limiting flow `A01` + PATL threshold `A02`) & [0;N] RemedialAction_Series (references of active PRAs, without `RegisteredResource`)                                           |
| Monitored constraints after contingency   | 1 Contingency_Series & [0;M] Monitored_Series (limiting flow `A01` + limiting threshold) & [0;N] RemedialAction_Series (references of active PRA + Auto + Curative RAs) OR 1 Reason (code `B18`) if computation diverged |

### Questions

- In how many Constraint_Series does a given Contingency_Series appear?

> Each Contingency_Series is related to exactly two Constraint_Series: one having a businessType B56, and the other one B57.

- What is described by a Constraint_Series without Contingency_Series?

> Such a Constraint_Series describes the basecase situation (flows, thresholds and/or preventive remedial actions).
> There are exactly two Constraint_Series without Contingency_Series in each CNE file: one of type B56 (containing applied preventive remedial actions, or empty if none) and one of type B57 (containing basecase monitored elements and references to active PRAs).

- Are the remedial actions repeated?

> The detailed remedial actions (with `RegisteredResource` for PSTs describing the tap) are only written in the `B56` Constraint_Series (in basecase for PRAs, and in the corresponding contingency series for Auto and Curative RAs).
> In `B57` Constraint_Series, remedial actions are referenced (without `RegisteredResource`) to indicate all actions (preventive, auto, curative) that have an effect on the monitored elements in that state.
> The preventive remedial actions (if any) are only written in one Constraint_Series of type B56 (the basecase one, containing no Contingency_Series), but referenced in all relevant Constraint_Series of type B57. This choice is made in order to decrease the size of the CNE file while keeping full traceability of actions impacting each monitored element.

- Can Constraint_Series both with type B56 and B57 contain Monitored_Series?

> No, only the ones with type B57 contain Monitored_Series. The ones with type B56 do not contain monitored series, as they focus exclusively on applied RAs.

- Do all Constraint_Series with type B57 contain Monitored_Series?

> Yes, as long as monitored elements (CNECs) are defined in the CRAC for the corresponding state (basecase or contingency).

- Can Constraint_Series both with type B56 and B57 contain RemedialAction_Series?

> Yes:
> - In `B56`, RemedialAction_Series contain full details on applied RAs for that specific instant (preventive in basecase, auto and curative after contingency; with `RegisteredResource` for PSTs).
> - In `B57`, RemedialAction_Series contain references to all RAs (preventive, auto, curative) that are active and have an effect on the monitored constraints in that state (without `RegisteredResource`).

- Do all Constraint_Series with type B56 contain RemedialAction_Series? Do all Constraint_Series with type B57 contain RemedialAction_Series?

> No, the answer is the same for both: if no remedial action is applied or active in a given situation, the corresponding `Constraint_Series` contains no `RemedialAction_Series`.
> Thus, in these cases:
> - A `B56` in basecase without PRA contains no `RemedialAction_Series`.
> - A `B56` after contingency without Auto or Curative RA contains only the `Contingency_Series`.
> - A `B57` in basecase without PRA contains only `Monitored_Series`.
> - A `B57` after contingency without active PRA, Auto or Curative RA contains only the `Contingency_Series` and `Monitored_Series`.

- Can a Constraint_Series contain only a Contingency_Series? In which case?

> Yes, a `B56` Constraint_Series after a contingency contains only a `Contingency_Series` when no automatic or curative remedial action is activated for that contingency (and the computation did not fail).

- What happens if a contingency calculation fails or diverges?

> If a contingency calculation fails or diverges, a `Reason` tag (with `code="B18"` and `text="Rao failure"`) is added to both the `B56` and `B57` Constraint_Series of that contingency. In `B57`, the `Monitored_Series` are exported without measurements.

- To sum it up, what Constraint_Series exist?

> **Focus on applied remedial actions (B56):**
> - In basecase: 1 Constraint_Series B56 containing [0;N] RemedialAction_Series (PRA).
> - After contingency: 1 Constraint_Series B56 containing 1 Contingency_Series and [0;N] RemedialAction_Series (Auto + Curative) (or 1 Reason B18 if failure).
>
> **Focus on monitored constraints (B57):**
> - In basecase: 1 Constraint_Series B57 containing [0;M] Monitored_Series (limiting flow + PATL) and [0;N] RemedialAction_Series references (PRA).
> - After contingency: 1 Constraint_Series B57 containing 1 Contingency_Series, [0;M] Monitored_Series (limiting flow + limiting threshold), and [0;N] RemedialAction_Series references (PRA + Auto + Curative) (or 1 Reason B18 if failure).

## How are the contingencies represented?

### Description

One contingency is defined by one Contingency_Series. This element only contains a reference to the contingency: the UID of the contingency; and, optionally, the name of the contingency (f).
Through its UID, more information about the contingency (list of the tripped elements) can be looked up in the CRAC file.

| What do we want to represent? | XML element corresponding in the CNE | Comments    |
|-------------------------------|--------------------------------------|-------------|
| A Contingency                 | A Contingency_Series                 |             |
| The UID of the contingency    | mRID                                 |             |
| The name of the contingency   | Name                                 | Facultative |

### Example

```xml
<Contingency_Series>
    <mRID>Co-1</mRID>
    <name>Contingency 1 name</name>
</Contingency_Series>
```

### FAQ

How to know the list of tripped elements of a contingency?
> The contingency is detailed in the CRAC file only. The link between the contingency in the CNE file and the CRAC file is made through the UID of the contingency.

## How are monitored elements represented?

### Description

One monitored element is defined by one Monitored_Series. This element contains all the information regarding the element to monitor: the UID of the constraint, the name of the constraint (f), the UID of the network element to monitor, the name of the network element to monitor (f), the direction of the monitoring (if not monitored in both directions) and the description of the flows and thresholds (instants and values).
A flow or a threshold associated to one monitored element are defined by a Measurement. Several Measurements can be defined for one monitored element (one for the flow, one or several for the thresholds). A Measurement contains all the information regarding the threshold: the instant, the value, the unit, the direction (f).

This section details the representation of branch flow constraints (in Amperes), which constitute the standard use case. (For other types of constraints such as angle or voltage monitoring, see the Additional Constraints section at the end of this document).

| What do we want to represent?                                              | XML element corresponding in the CNE                   | Comments                                                                  |
|----------------------------------------------------------------------------|--------------------------------------------------------|---------------------------------------------------------------------------|
| A monitored element                                                        | Monitored_Series                                       |                                                                           |
| The UID of the  monitored element                                          | mRID                                                   |                                                                           |
| The name of the  monitored element                                         | Name                                                   | Facultative                                                               |
|                                                                            | RegisteredResource                                     | Exactly one                                                               |
| The UID of the network element to monitor                                  | RegisteredResource/mRID                                | Native network ID (with `codingScheme="A02"`)                             |
| The name of the network element to monitor                                 | RegisteredResource/name                                | Facultative                                                               |
| The origin node if the element is monitored only in one direction          | RegisteredResource/in_AggregateNode.mRID                | Origin voltage level ID (with `codingScheme="A02"`)                       |
| The extremity node                                                         | RegisteredResource/out_AggregateNode.mRID               | Extremity voltage level ID (with `codingScheme="A02"`)                    |
| PTDF in an area                                                            | RegisteredResource/PTDF_Domain                         | Facultative (not exported in SWE region as margins are not relative)      |
| Code of the area                                                           | RegisteredResource/PTDF_Domain/mRID                    |                                                                           |
| Value of the PTDF                                                          | RegisteredResource/PTDF_Domain/pTDF_Quantity.quantity  |                                                                           |
| One per threshold and per direction to monitor                             | RegisteredResource/Measurements                        | At least one                                                              |
| Flow, or Instant associated to the threshold                               | RegisteredResource/Measurements/measurementType        | See mapping table                                                         |
| Unit of the flow/threshold                                                 | RegisteredResource/Measurements/unitSymbol             | See mapping table (`AMP`)                                                 |
| The direction to monitor if the element is monitored only in one direction | RegisteredResource/Measurements/positiveFlowIn         | `A01` (direct / positive flow) or `A02` (opposite / negative flow)        |
| Value of the flow/threshold                                                | RegisteredResource/Measurements/analogValues.value     | Absolute value of the flow/threshold                                      |

### Example

Here is an example of a basecase `Monitored_Series` with a flow measurement (`A01`) and a PATL threshold (`A02`):

```xml
<Monitored_Series>
    <mRID>CNEC-1</mRID>
    <name>CNEC-1-name</name>
    <RegisteredResource>
        <mRID codingScheme="A02">DDE2AA11 NNL3AA11 1</mRID>
        <name>CNEC-1</name>
        <in_AggregateNode.mRID codingScheme="A02">DDE2AA1</in_AggregateNode.mRID>
        <out_AggregateNode.mRID codingScheme="A02">NNL3AA1</out_AggregateNode.mRID>
        <Measurements>
            <measurementType>A01</measurementType>
            <unitSymbol>AMP</unitSymbol>
            <positiveFlowIn>A01</positiveFlowIn>
            <analogValues.value>1220.0</analogValues.value>
        </Measurements>
        <Measurements>
            <measurementType>A02</measurementType>
            <unitSymbol>AMP</unitSymbol>
            <positiveFlowIn>A02</positiveFlowIn>
            <analogValues.value>40.0</analogValues.value>
        </Measurements>
    </RegisteredResource>
</Monitored_Series>
```

And an example after contingency with multiple thresholds (Outage `A07`, Auto `A12`, Curative `A13`):

```xml
<Monitored_Series>
    <mRID>CNEC-2</mRID>
    <name>CNEC-2-name</name>
    <RegisteredResource>
        <mRID codingScheme="A02">FFR1AA11 FFR2AA11 1</mRID>
        <name>CNEC-2</name>
        <in_AggregateNode.mRID codingScheme="A02">FFR1AA1</in_AggregateNode.mRID>
        <out_AggregateNode.mRID codingScheme="A02">FFR2AA1</out_AggregateNode.mRID>
        <Measurements>
            <measurementType>A01</measurementType>
            <unitSymbol>AMP</unitSymbol>
            <positiveFlowIn>A01</positiveFlowIn>
            <analogValues.value>4220.0</analogValues.value>
        </Measurements>
        <Measurements>
            <measurementType>A12</measurementType>
            <unitSymbol>AMP</unitSymbol>
            <positiveFlowIn>A02</positiveFlowIn>
            <analogValues.value>12.0</analogValues.value>
        </Measurements>
        <Measurements>
            <measurementType>A13</measurementType>
            <unitSymbol>AMP</unitSymbol>
            <positiveFlowIn>A02</positiveFlowIn>
            <analogValues.value>13.0</analogValues.value>
        </Measurements>
    </RegisteredResource>
</Monitored_Series>
```

### FAQ

What kind of thresholds can be defined? How is the flow defined?

> Threshold instant is defined by the measurementType code.

> | Need                                                                                                                                   | measurementType Code | Instant |
> |----------------------------------------------------------------------------------------------------------------------------------------|----------------------|---------|
> | Flow                                                                                                                                   | A01                  | Flow    |
> | Maximum current admissible in basecase (PATL)                                                                                          | A02                  |   N      |
> | Maximum current admissible after the contingency and before any RA could be applied                                                    | A07          |      Outage (60s)   |
> | Maximum current admissible after the contingency and after the application of Automatic RA but before any Curative RA could be applied | A12          |    Auto (61s)     |
> | Maximum current admissible after the contingency and after all the RA have been applied                                                | A13          |       Curative (1200s)  |

> Threshold unit is defined by the unitSymbol code.

> | Need                               | unitSymbol Code | Threshold Type |
> |------------------------------------|-----------------|----------------|
> | Maximum current in Amperes         | AMP             | A              |
> | Maximum active power in Megawatts  | MAW             | MW             |

How many Measurements are contained by a RegisteredResource?

> A RegisteredResource contains at least 2 Measurements: one has a measurementType code A01 (flow), and the other one has a code corresponding to a threshold (see table above). However, when the flow (rounded to the unit) does not change from an instant to another, two or more Measurements corresponding to thresholds can be associated to a single A01 Measurement. In this case, the measurements must have different measurementTypes, because only one threshold is used for each instant.

What happens when several thresholds were defined for a single instant in the CRAC?

> In this case, only the most restrictive threshold is used by the RAO computation, and only this one is written in the CNE export.

How is the direction of the monitoring specified?

> To specify the direction of monitoring, attributes `in_AggregateNode.mRID` and `out_AggregateNode.mRID` are defined at `RegisteredResource` level. These fields define the origin and extremity nodes used as reference for this `RegisteredResource`.
>
> Then, each measurement indicates its sign/direction using the `positiveFlowIn` attribute:
>
> | Need                                                        | positiveFlowIn Code | Description                                                          |
> |-------------------------------------------------------------|---------------------|----------------------------------------------------------------------|
> | Direct flow / Positive measurement (`In -> Out`)            | A01                 | Measurement value is positive (`actual value = analogValues.value`)  |
> | Opposite flow / Negative measurement (`Out -> In`)          | A02                 | Measurement value is negative (`actual value = -analogValues.value`) |
>
> In case of bidirectional thresholds, only the limiting threshold in the direction of the flow is exported.


## How are remedial actions represented?

Only the applied remedial actions are displayed in a CNE document. Their representation depends on the action type and the containing `Constraint_Series` (`B56` vs `B57`):

- **Topological (Network) remedial actions**: Exported with minimal information (UID, name, and application instant) referencing the action in the CRAC. They do not contain a `RegisteredResource`.
- **PST range remedial actions**: Require the selected tap position.
  - In `B56` Constraint_Series: The `mRID` of the `RemedialAction_Series` is formatted as `<id>@<tap>@` (where `tap` is the optimal tap position). A `RegisteredResource` is included to describe the underlying PST equipment (equipment UID, name, type `A06`, status `A26` for absolute tap, capacity value `tap`, and unit `C62` for dimensionless).
  - In `B57` Constraint_Series: Only the reference (`mRID` `<id>@<tap>@`, `name`, and instant status) is exported without `RegisteredResource`, to keep the CNE file compact.
- **HVDC range remedial actions**: Require the selected active power setpoint.
  - In both `B56` and `B57` Constraint_Series: The optimal setpoint (in MW) is encoded directly in the `mRID` and `name` attributes formatted as `<id>@<setpoint>@`. No `RegisteredResource` is generated for HVDC actions.

### Description

| What do we want to represent?                             | XML element corresponding in the CNE      | Comments                                                                |
|-----------------------------------------------------------|-------------------------------------------|-------------------------------------------------------------------------|
| An applied Remedial Action                                | RemedialAction_Series                     |                                                                         |
| The UID of the remedial action                            | mRID                                      | Native ID, completed with `@tap@` for PST or `@setpoint@` for HVDC      |
| The name of the RA                                        | Name                                      | Native name, completed with `@setpoint@` for HVDC (Facultative)         |
| The instant of application of the RA                      | applicationMode_MarketObjectStatus.status | `A18` (Preventive), `A20` (Auto), `A19` (Curative)                      |
| Detailed PST equipment description (in `B56` series only) | RegisteredResource                        | Zero or one (present only for PST range actions in `B56` series)        |

Please find below how the `RegisteredResource` is built for PST range actions:

| One elementary action composing the RA    | RegisteredResource element       | Value / Comments                                 |
|-------------------------------------------|----------------------------------|--------------------------------------------------|
| The UID of the network element to act on  | mRID                             | PST native mRID (with `codingScheme="A02"`)      |
| The name of the network element to act on | Name                             | PST native name (Facultative)                    |
| The type of the network element           | pSRType.psrType                  | `A06` (PST)                                      |
| The type of description of the action     | marketObjectStatus.status        | `A26` (Absolute tap value)                       |
| The chosen set point (tap)                | resourceCapacity.defaultCapacity | Optimal tap position (integer)                   |
| The unit of the setpoint                  | resourceCapacity.unitSymbol      | `C62` (Dimensionless / tap unit)                 |

### Example

#### PST Range Remedial Action (in `B56` Constraint_Series)

In `B56`, the PST range action contains the calculated optimal tap in `mRID` (`PRA_1@-7@`) and includes a `RegisteredResource` describing the equipment:

```xml
<RemedialAction_Series>
    <mRID>PRA_1@-7@</mRID>
    <name>PRA_1</name>
    <applicationMode_MarketObjectStatus.status>A18</applicationMode_MarketObjectStatus.status>
    <RegisteredResource>
        <mRID codingScheme="A02">BBE2AA11 BBE3AA11 1</mRID>
        <name>RA1-name</name>
        <pSRType.psrType>A06</pSRType.psrType>
        <marketObjectStatus.status>A26</marketObjectStatus.status>
        <resourceCapacity.defaultCapacity>-7</resourceCapacity.defaultCapacity>
        <resourceCapacity.unitSymbol>C62</resourceCapacity.unitSymbol>
    </RegisteredResource>
</RemedialAction_Series>
```

#### Remedial Actions in `B57` Constraint_Series (Reference only)

In `B57`, remedial actions are referenced without `RegisteredResource`:

```xml
<!-- PST reference with optimal tap -->
<RemedialAction_Series>
    <mRID>PRA_1@-7@</mRID>
    <name>PRA_1</name>
    <applicationMode_MarketObjectStatus.status>A18</applicationMode_MarketObjectStatus.status>
</RemedialAction_Series>

<!-- HVDC reference with optimal setpoint in MW -->
<RemedialAction_Series>
    <mRID>HVDC-direction11@100.0@</mRID>
    <name>HVDC-direction11@100.0@</name>
    <applicationMode_MarketObjectStatus.status>A20</applicationMode_MarketObjectStatus.status>
</RemedialAction_Series>

<!-- Network / Topological action -->
<RemedialAction_Series>
    <mRID>na1</mRID>
    <name>na1-name</name>
    <applicationMode_MarketObjectStatus.status>A19</applicationMode_MarketObjectStatus.status>
</RemedialAction_Series>
```

### FAQ

What do the codes in `applicationMode_MarketObjectStatus.status` represent?

> The application instant is defined by standard ENTSO-E market object status codes:
> - **A18**: Preventive remedial action (applied in basecase before any outage).
> - **A20**: Automatic remedial action (Special Protection Scheme / SPS, applied right after contingency).
> - **A19**: Curative remedial action (applied after contingency and after automatic actions).

How are PST and HVDC range actions distinguished from topological remedial actions?

> - **Topological actions**: Exported using their original CRAC `mRID` and `name` without `@` suffixes or `RegisteredResource`.
> - **PST range actions**: Formatted with `<id>@<tap>@` in `mRID`, and contain a `RegisteredResource` with `pSRType.psrType="A06"` and `resourceCapacity.unitSymbol="C62"` in `B56` Constraint_Series.
> - **HVDC range actions**: Formatted with `<id>@<setpoint>@` in both `mRID` and `name` (where setpoint is in MW), without `RegisteredResource`.

Why is `RegisteredResource` omitted in `B57` Constraint_Series?

> In `B57` Constraint_Series, remedial actions are listed as references to indicate all actions (preventive, auto, curative) that have an effect on the monitored CNECs in that state. To avoid unnecessary data duplication and keep the file size compact, the full `RegisteredResource` details are only included in the `B56` Constraint_Series.

## What general information is available?

### Header

The header of a CNE document contains metadata identifying the document, sender, receiver, and applicability period:

| Field                                         | XML element                                  | Value / Comments                                                                        |
|-----------------------------------------------|----------------------------------------------|-----------------------------------------------------------------------------------------|
| Document ID                                   | `mRID`                                       | Unique document identifier                                                              |
| Revision number                               | `revisionNumber`                             | Document version number                                                                 |
| Document type                                 | `type`                                       | `B06` (Critical Network Element Market Document)                                        |
| Process type                                  | `process.processType`                        | `Z01` (Day-ahead capacity determination for SWE region)                                 |
| Sender ID                                     | `sender_MarketParticipant.mRID`              | ENTSO-E EICode (with `codingScheme="A01"`)                                              |
| Sender role                                   | `sender_MarketParticipant.marketRole.type`   | `A04` (System Operator), `A36` (Capacity Coordinator), `A44` (RSC)                      |
| Receiver ID                                   | `receiver_MarketParticipant.mRID`            | ENTSO-E EICode (with `codingScheme="A01"`)                                              |
| Receiver role                                 | `receiver_MarketParticipant.marketRole.type` | `A04`, `A36` or `A44`                                                                   |
| Creation timestamp                            | `createdDateTime`                            | UTC date and time of document generation                                                |
| Time interval                                 | `time_Period.timeInterval`                   | Start and end dates of applicability (`start` / `end`)                                  |

### TimeSeries and Point

The body of the CNE document contains exactly one `TimeSeries` (with `businessType="B54"` and `curveType="A01"`), containing exactly one `Period` (resolution `PT60M`), that contains one `Point` (`position="1"`).

A `Point` gathers all the `Constraint_Series` (`B56` and `B57`), as well as an overall `Reason` tag indicating the status of the computation:

| Reason code | Reason text            | Comments                                                    |
|-------------|------------------------|-------------------------------------------------------------|
| Z13         | Network is secure      | Computation succeeded and all constraints are respected     |
| Z03         | Network is unsecure    | Computation succeeded but some constraints remain violated  |
| B18         | Rao failure            | RAO computation failed or load flow diverged                |

## Additional Constraints (Angle and Voltage Monitoring)

In the vast majority of cases, capacity calculation and security analysis focus exclusively on branch flow constraints. However, OpenRAO and the CNE format can also handle additional types of constraints when configured in the CRAC.

### Angle CNECs (`AdditionalConstraint_Series`)

When angle monitoring is configured in the CRAC, angle constraints are exported inside the contingency `B57` Constraint_Series using `AdditionalConstraint_Series` elements rather than `Monitored_Series`:

- **Scope**: Angle CNECs are only exported after contingencies (in `B57` Constraint_Series with a `Contingency_Series`). They are not exported in the preventive basecase.
- **Instant**: Only angle CNECs defined at the **curative** instant are exported.

| What do we want to represent?           | XML element in CNE                                      | Comments                                              |
|-----------------------------------------|---------------------------------------------------------|-------------------------------------------------------|
| An additional constraint                | `AdditionalConstraint_Series`                           | Grouped inside contingency `B57` Constraint_Series    |
| UID of the constraint                   | `mRID`                                                  | Unique identifier of the angle CNEC from native CRAC  |
| Business type of the constraint         | `businessType`                                          | Fixed value `B87` for Angle CNEC                      |
| Name of the constraint                  | `name`                                                  | Name of the angle CNEC from native CRAC (Facultative) |
| Monitored angle value                   | `quantity.quantity`                                     | Resulting phase shift angle value (in degrees)        |

#### Example

```xml
<AdditionalConstraint_Series>
    <mRID>REN-AC-2</mRID>
    <businessType>B87</businessType>
    <name>Angle-ALTO-LINDOSO-CARTELLE-EXPORT</name>
    <quantity.quantity>-39.8</quantity.quantity>
</AdditionalConstraint_Series>
```

### Voltage Monitoring

Voltage constraints (e.g. high/low voltage limits at monitored buses) are not exported in the SWE CNE format by OpenRAO.

## Appendices

### Sample CNE XML Structure

Below is an excerpt illustrating the structure of a complete SWE CNE document, showing the root element, `TimeSeries`, `Period`, `Point`, and both `B56` (applied remedial actions) and `B57` (monitored elements and RA references) `Constraint_Series` for basecase and post-contingency states:

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<CriticalNetworkElement_MarketDocument xsi:schemaLocation="iec62325-451-n-cne_v2_3.xsd" xmlns="urn:iec62325.351:tc57wg16:451-n:cnedocument:2:3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <mRID>documentId</mRID>
    <revisionNumber>1</revisionNumber>
    <type>B06</type>
    <process.processType>Z01</process.processType>
    <sender_MarketParticipant.mRID codingScheme="A01">senderId</sender_MarketParticipant.mRID>
    <sender_MarketParticipant.marketRole.type>A04</sender_MarketParticipant.marketRole.type>
    <receiver_MarketParticipant.mRID codingScheme="A01">receiverId</receiver_MarketParticipant.mRID>
    <receiver_MarketParticipant.marketRole.type>A36</receiver_MarketParticipant.marketRole.type>
    <createdDateTime>2024-12-19T11:04:18Z</createdDateTime>
    <time_Period.timeInterval>
        <start>2021-08-27T15:22Z</start>
        <end>2021-08-27T16:22Z</end>
    </time_Period.timeInterval>
    <TimeSeries>
        <mRID>CNE_RAO_CASTOR-TimeSeries-1</mRID>
        <businessType>B54</businessType>
        <curveType>A01</curveType>
        <Period>
            <timeInterval>
                <start>2021-04-02T12:00Z</start>
                <end>2021-04-02T13:00Z</end>
            </timeInterval>
            <resolution>PT60M</resolution>
            <Point>
                <position>1</position>
                <!-- Basecase B56: Applied Preventive Remedial Actions -->
                <Constraint_Series>
                    <mRID>6495270-91d7-4e19-bdba-b1e2f11cd59e</mRID>
                    <businessType>B56</businessType>
                    <RemedialAction_Series>
                        <mRID>PRA_1@-7@</mRID>
                        <name>PRA_1</name>
                        <applicationMode_MarketObjectStatus.status>A18</applicationMode_MarketObjectStatus.status>
                        <RegisteredResource>
                            <mRID codingScheme="A02">BBE2AA11 BBE3AA11 1</mRID>
                            <name>RA1-name</name>
                            <pSRType.psrType>A06</pSRType.psrType>
                            <marketObjectStatus.status>A26</marketObjectStatus.status>
                            <resourceCapacity.defaultCapacity>-7</resourceCapacity.defaultCapacity>
                            <resourceCapacity.unitSymbol>C62</resourceCapacity.unitSymbol>
                        </RegisteredResource>
                    </RemedialAction_Series>
                </Constraint_Series>
                <!-- Contingency B56: Applied Auto / Curative RAs -->
                <Constraint_Series>
                    <mRID>512172b-361c-44cc-8100-dc531f328ee3</mRID>
                    <businessType>B56</businessType>
                    <Contingency_Series>
                        <mRID>Co-1</mRID>
                        <name>Contingency 1 name</name>
                    </Contingency_Series>
                    <RemedialAction_Series>
                        <mRID>HVDC-direction11@100.0@</mRID>
                        <name>HVDC-direction11@100.0@</name>
                        <applicationMode_MarketObjectStatus.status>A20</applicationMode_MarketObjectStatus.status>
                    </RemedialAction_Series>
                </Constraint_Series>
                <!-- Basecase B57: Monitored flows, PATL & PRA references -->
                <Constraint_Series>
                    <mRID>604e063-9929-4da9-a96d-bc4c088d19f6</mRID>
                    <businessType>B57</businessType>
                    <Monitored_Series>
                        <mRID>CNEC-1</mRID>
                        <name>CNEC-1-name</name>
                        <RegisteredResource>
                            <mRID codingScheme="A02">DDE2AA11 NNL3AA11 1</mRID>
                            <name>CNEC-1</name>
                            <in_AggregateNode.mRID codingScheme="A02">DDE2AA1</in_AggregateNode.mRID>
                            <out_AggregateNode.mRID codingScheme="A02">NNL3AA1</out_AggregateNode.mRID>
                            <Measurements>
                                <measurementType>A01</measurementType>
                                <unitSymbol>AMP</unitSymbol>
                                <positiveFlowIn>A01</positiveFlowIn>
                                <analogValues.value>1220.0</analogValues.value>
                            </Measurements>
                            <Measurements>
                                <measurementType>A02</measurementType>
                                <unitSymbol>AMP</unitSymbol>
                                <positiveFlowIn>A02</positiveFlowIn>
                                <analogValues.value>40.0</analogValues.value>
                            </Measurements>
                        </RegisteredResource>
                    </Monitored_Series>
                    <RemedialAction_Series>
                        <mRID>PRA_1@-7@</mRID>
                        <name>PRA_1</name>
                        <applicationMode_MarketObjectStatus.status>A18</applicationMode_MarketObjectStatus.status>
                    </RemedialAction_Series>
                </Constraint_Series>
                <!-- Contingency B57: Monitored flows, post-contingency thresholds & all active RA references -->
                <Constraint_Series>
                    <mRID>cc05136-a928-485b-858e-aa7804881337</mRID>
                    <businessType>B57</businessType>
                    <Contingency_Series>
                        <mRID>Co-1</mRID>
                        <name>Contingency 1 name</name>
                    </Contingency_Series>
                    <Monitored_Series>
                        <mRID>CNEC-1</mRID>
                        <name>CNEC-1-name</name>
                        <RegisteredResource>
                            <mRID codingScheme="A02">DDE2AA11 NNL3AA11 1</mRID>
                            <name>CNEC-1</name>
                            <in_AggregateNode.mRID codingScheme="A02">DDE2AA1</in_AggregateNode.mRID>
                            <out_AggregateNode.mRID codingScheme="A02">NNL3AA1</out_AggregateNode.mRID>
                            <Measurements>
                                <measurementType>A01</measurementType>
                                <unitSymbol>AMP</unitSymbol>
                                <positiveFlowIn>A01</positiveFlowIn>
                                <analogValues.value>2220.0</analogValues.value>
                            </Measurements>
                            <Measurements>
                                <measurementType>A07</measurementType>
                                <unitSymbol>AMP</unitSymbol>
                                <positiveFlowIn>A01</positiveFlowIn>
                                <analogValues.value>15.0</analogValues.value>
                            </Measurements>
                        </RegisteredResource>
                    </Monitored_Series>
                    <RemedialAction_Series>
                        <mRID>PRA_1@-7@</mRID>
                        <name>PRA_1</name>
                        <applicationMode_MarketObjectStatus.status>A18</applicationMode_MarketObjectStatus.status>
                    </RemedialAction_Series>
                    <RemedialAction_Series>
                        <mRID>HVDC-direction11@100.0@</mRID>
                        <name>HVDC-direction11@100.0@</name>
                        <applicationMode_MarketObjectStatus.status>A20</applicationMode_MarketObjectStatus.status>
                    </RemedialAction_Series>
                </Constraint_Series>
                <Reason>
                    <code>Z13</code>
                    <text>Network is secure</text>
                </Reason>
            </Point>
        </Period>
    </TimeSeries>
</CriticalNetworkElement_MarketDocument>
```

## Acronyms

| UID  | Unique identifier                        |
|------|------------------------------------------|
| f    | Facultative                              |
| RA   | Remedial action                          |
| SL   | Security Limit                           |
| MR   | Monitored Resource                       |
| Co   | Contingency                              |
| CS   | Constraint Series                        |
| PST  | Phase Shift Transformers                 |
| CCR  | Capacity Calculation Region              |
| PRA  | Preventive Remedial Action               |
| CRA  | Curative Remedial Action                 |
| SPS  | Special Protection Scheme = automatic RA |
| PATL | Permanent Admissible Transmissible Limit |
| TATL | Temporary Admissible Transmissible Limit | 
