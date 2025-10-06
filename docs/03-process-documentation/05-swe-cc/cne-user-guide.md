---
sidebar_position: 1
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
- zero, one or serveral Monitored_Series,
- zero, one or several RemedialAction_Series.

- As all the other elements of a CNE file, the Constraint_Series must contain an UID, which is generated randomly without a meaning. It also contains a businessType, which can be either B56 or B57.

| What do we want to represent?                                      | XML element corresponding in the CNE   | Comments                                                  |
|--------------------------------------------------------------------|-----------------------------------------|-----------------------------------------------------------|
| A combination of remedial actions and/or flows after a contingency | Constraint_Series                       |                                                           |
| The UID of the Constraint_Series                                   | mRID                                    | Randomly generated, unique and with no particular meaning |
| The nature of the Constraint_Series                                | businessType                            | B56 (applied RAs) or B57 (flows)                          |
| The contingency of the Constraint_Series                           | Contingency_Series                      | 0 (basecase) - 1 (N-1 situations)                         |
| The flows and thresholds of the monitored elements                 | Monitored_Series                        | 0 (B56) - 1 or several (B57)                              |
| The remedial actions applied after the contingency                 | RemedialAction_Series                   | 0, 1 or several                                           |

#### Elementary blocks

A Constraint_Series contains zero or one Contingency_Series, which defines the described situation (basecase or N-1).
The Constraint_Series can contain one or several Monitored_Series, describing the flow and thresholds in that situation.
The Constraint_Series can contain one or several RemedialAction_Series, listing the remedial actions applied in that situation.

#### Basecase or N-1

A Constraint_Series after each contingency (N-1) contains exactly one Contingency_Series.
A Constraint_Series in basecase contains no Contingency_Series.

#### Preventive remedial actions

The selected preventive remedial actions are applied before all the contingencies. Thus, they could appear in all the Constraint_Series. However, in order to avoid their repetition, and decrease the size of the CNE file, the preventive remedial actions are only displayed in the Constraint_Series corresponding to the basecase, when the businessType (see below) of the Constraint_Series is B56.

#### PST range remedial actions

The detail of the PST range remedial actions (such as the chosen tap, for instance) is given in a RegisteredResource inside the RemedialAction contained in the Constraint_Series B56 (see below).

### Business types

#### B56

This Constraint_Series focuses on the applied remedial actions.

| What do we want to represent?                      | What kind of series does the Constraint_Series contain?                                                                             |
|----------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| The preventive remedial actions                    | \[1;N\] RemedialAction_Series (A18 in applicationMode.MarketObjectStatus.status) (if no PRA, this Constraint_Series is not created) |
| The remedial actions (SPS and CRA) after an outage | 1 Contingency Series and \[0;N\] RemedialAction_Series (A19 or A20 in applicationMode.MarketObjectStatus.status)                    |

#### B57

This Constraint_Series focuses on the flows on the monitored elements.

| What do we want to represent?             | What kind of series does the Constraint_Series contain?                                                                                           |
|-------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| Flow in basecase                          | 1 Contingency_Series & \[0;N\] RemedialAction_Series (PRA)                                                                                        |
| Flow in basecase if no PRA                | \[1;M\] Monitored_Series (flow + PATL)                                                                                                            |
| Flows after outage                        | 1 Contingency_Series & \[1;M\] Monitored_Series (flow + TATL after outage) & \[0;N\] RemedialAction_Series (PRA)                                  |
| Flows after SPS                           | 1 Contingency_Series & \[1;M\] Monitored_Series (flow + TATL after SPS) & \[0;N\] RemedialAction_Series (PRA + SPS)                               |
| Flows after CRA                           | 1 Contingency_Series & \[1;M\] Monitored_Series (flow + TATL after CRA) & \[0;N\] RemedialAction_Series (PRA + SPS + CRA)                         |
| Flows after SPS if SPSs but no CRA        | 1 Contingency_Series & \[1;M\] Monitored_Series (flow + TATL after SPS + TATL after CRA) & \[0;N\] RemedialAction_Series (PRA + SPS)              |
| Flows after outage if CRAs but no SPS     | 1 Contingency_Series & \[1;M\] Monitored_Series (flow + TATL after Outage + TATL after SPS) & \[0;N\] RemedialAction_Series (PRA)                 |
| Flows after CRA if CRAs but no SPS        | 1 Contingency_Series & \[1;M\] Monitored_Series (flow + TATL after CRA) & \[0;N\] RemedialAction_Series (PRA + CRA)                               |
| Flows after outage if neither SPS nor CRA | 1 Contingency_Series & \[1;M\] Monitored_Series (flow + TATL after Outage + TATL after SPS+ TATL after CRA) & \[0;N\] RemedialAction_Series (PRA) |

### Questions

- In how many Constraint_Series does a given Contingency_Series appear?

> Each Contingency_Series is related to exactly two Constraint_Series: one having a businessType B56, and the other one B57.

- What is described by a Constraint_Series without Contingency_Series?

> Such a Constraint_Series describes the flows, thresholds and/or (preventive) remedial actions in basecase.
> Thus, one or two Constraint_Series contain no Contingency_Series in each CNE file:
> -  exactly one, of type B57, if no preventive remedial action is applied: indeed, the RA-oriented Constraint_Series (B56) is deleted because it would be empty (no Co in basecase, no RA applied and no MR in B56)
> - exactly two (one B56 and one B57) if at least one preventive remedial action is applied.

- Are the preventive remedial actions repeated?

> The preventive remedial actions (if any) are only written in one Constraint_Series of type B56 (the one corresponding to the basecase, and containing no Contingency_Series - see the previous questions), but in all the Constraint_Series of type B57. This choice is made in order to decrease the size of the CNE file.

- Can Constraint_Series both with type B56 and B57 contain Monitored_Series?

> No, only the ones with type B57 can contain Monitored_Series. The ones with type B56 do not need Monitored_Series, as they focus on applied RAs.

- Do all Constraint_Series with type B57 contain Monitored_Series?

> Yes, because no computation is made on a Contingency if no Monitored Element is defined.

- Can Constraint_Series both with type B56 and B57 contain RemedialAction_Series?

> Yes. In particular, the ones with type B57 contain RemedialAction_Series in order to make it easier to understand the thresholds after RAs.

- Do all Constraint_Series with type B56 contain RemedialAction_Series? Do all Constraint_Series with type B57 contain RemedialAction_Series?

> No, the answer is the same for both questions: if no remedial action is applied, the corresponding Constraint_Series contains no RemedialAction_Series.
> Thus, in these cases, the Constraint_Series contains:
> - only a Contingency_Series (B56 after contingency, with no automatic nor curative RA)
> - only Monitored_Series (B57 in basecase, with no PRA)
> - one Contingency_Series and one or several Monitored_Series (B57 after contingency, with no automatic nor curative RA).

- Can a Constraint_Series contain only a Contingency_Series? In which case?

> Yes, if the Constraint_Series is with type B56, and no remedial action is applied.

- To sum it up, what Constraint_Series exist?

> Focus on applied remedial actions (B56)
> - PRA = RA series
> - SPS and CRA = CoRA series (SPS + CRA)
>
> Focus on flows (B57)
> - In basecase = MR (flow + PATL) + RA (PRA) 
> - If no PRA: 
>   - In basecase = MR (flow + PATL)
> - After Outage = Co + MR (flow + TATL after outage) + RA (PRA)
> - After SPS = Co + MR (flow + TATL after SPS) + RA (PRA + SPS)
> - After CRA = Co + MR (flow + TATL after CRA) + RA (PRA + SPS + CRA)
> - If SPSs but no CRA :
>   - After SPS = Co + MR (flow + TATL after SPS + TATL after CRA) + RA (PRA + SPS)
> - If CRAs but no SPS :
>   - After Outage = Co + MR (flow + TATL after Outage + TATL after SPS) + RA (PRA)
>   - After CRA = Co + MR (flow + TATL after CRA) + RA (PRA + CRA)
> - If neither SPS nor CRA :
>   - After Outage = Co + MR (flow + TATL after Outage + TATL after SPS+ TATL after CRA) + RA (PRA)

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

TODO

### FAQ

How to know the list of tripped elements of a contingency?
> The contingency is detailed in the CRAC file only. The link between the contingency in the CNE file and the CRAC file is made through the UID of the contingency.

## How are monitored elements represented?

### Description

One monitored element is defined by one Monitored_Series. This element contains all the information regarding the element to monitor: the UID of the constraint, the name of the constraint (f), the UID of the network element to monitor, the name of the network element to monitor (f), the direction of the monitoring (if not monitored in both directions) and the description of the flows and thresholds (instants and values).
A flow or a threshold associated to one monitored element are defined by a Measurement. Several Measurements can be defined for one monitored element (one for the flow, one or several for the thresholds). A Measurement contains all the information regarding the threshold: the instant, the value, the unit, the direction (f).
Several physical quantities can be monitored in the CRAC file but only flow through lines (Amperes or Megawatts) is handled by OSIRIS and so  exported after the optimization. The monitoring of voltage levels and angle differences can be described in the CNE document, but must be added by post-processing.
Here is detailed the interpretation of monitored elements for flows.

| What do we want to represent?                                              | XML element corresponding in the CNE                   | Comments                                      |
|----------------------------------------------------------------------------|--------------------------------------------------------|-----------------------------------------------|
| A monitored element                                                        | Monitored_Series                                       |                                               |
| The UID of the  monitored element                                          | mRID                                                   |                                               |
| The name of the  monitored element                                         | Name                                                   | Facultative                                   |
|                                                                            | Registered_Resource                                    | Exactly one                                   |
| The UID of the network element to monitor                                  | Registered_Resource/mRID                               |                                               |
| The name of the network element to monitor                                 | Registered_Resource/Name                               | Facultative                                   |
| The origin node if the element is monitored only in one direction          | Registered_Resource/In_AggregatedNode                  |                                               |
| The extremity node                                                         | Registered_Resource/Out_AggregatedNode                 |                                               |
| PTDF in an area                                                            | Registered_Resource/PTDF_Domain                        | Facultative (depends on the computation type) |
| Code of the area                                                           | Registered_Resource/PTDF_Domain/mRID                   |                                               |
| Value of the PTDF                                                          | Registered_Resource/PTDF_Domain/pTDF_Quantity.quantity |                                               |
| One per threshold and per direction to monitor                             | Registered_Resource/Measurements                       | At least one                                  |
| Flow, or Instant associated to the threshold                               | Registered_Resource/Measurements/measurementType       | See mapping table                             |
| Unit of the flow/threshold                                                 | Registered_Resource/Measurements/unitSymbol            | See mapping table                             |
| The direction to monitor if the element is monitored only in one direction | Registered_Resource/Measurements/positiveFlowIn        | Facultative                                   |
| Value of the flow/threshold                                                | Registered_Resource/Measurements/analogValues.value    |                                               |

### Example

TODO

### FAQ

What kind of thresholds can be defined? How is the flow defined?

TODO: check if there are other values implemented now

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

TODO: check

> In this case, only the most restrictive threshold is used by the RAO computation, and only this one is written in the CNE export.

How is the direction of the monitoring specified?

> To specify the direction of monitoring, attributes in and out AggregateNode are defined at RegisteredResource level. These fields define the origin and extremity nodes used as reference for this RegisteredResource.
> 
> Then, each measurement is associated to a direction using the positiveFlowIn attribute. Two codes are implemented in the security limit.
>
> | Need                                       | positiveFlowIn Code | 
> |--------------------------------------------|---------------------|
> | Monitor flow from Out to In AggregateNode  | A01                 |
> | Monitor flow from In to Out AggregateNode  | A02                 |
> 
> The direction displayed in the CNE export corresponds to the positive flow on the line (because of xsd limitations). Thus, in case of bidirectional thresholds, only the one in direction of the flow is exported.
> 

## How are remedial actions represented?

Only the applied remedial actions are displayed in a CNE document. Their representation in the CNE document is not detailed: only minimal information is given, in order to be able to  reach the details of the remedial actions in the CRAC file. This minimal information is the UID of the remedial action, the name of the remedial action (f) and the instant of application.

However, for range remedial actions, a more detailed description is needed: indeed, the selected tap or setpoint within the allowed range has to be precised. Then, the remedial action is described through a new remedial action, with a UID equal to the initial UID, but completed with @x@, where x is the selected tap number. This complete description is given in Constraint_Series with businessType B56, through a RegisteredResource located in the RemedialAction_Series and containing the UID and name of the equipment (PST or HVDC line), its type, and the unit and value of the tap/setpoint selected.

NB: The applied range remedial actions are not detailed in the B57 Constraint_Series, in order to avoid repetition.

### Description


| What do we want to represent?                                 | XML element corresponding in the CNE      | Comments     |
|---------------------------------------------------------------|-------------------------------------------|--------------|
| An applied Remedial Action                                    | RemedialAction_Series                     |              |
| The UID of the remedial action                                | mRID                                      |              |
| The name of the RA                                            | Name                                      | Facultative  |
| The instant of application of the RA                          | applicationMode_MarketObjectStatus.status |              |
| One elementary action (in case of range Remedial Actions)     | Registered_Resource                       | Zero or one  |

Please find below how to build a Registered_Resource.

| One elementary action composing the RA     | Registered_Resource              | Comments              |
|--------------------------------------------|----------------------------------|-----------------------|
| The UID of the network element to act on   | mRID                             |                       |
| The name of the network element to act on  | Name                             | Facultative           |
| The type of the network element            | pSRType.psrType                  |                       |
| The type of description of the action      | marketObjectStatus.status        | Absolute, relative... |
| The chosen set point                       | resourceCapacity.defaultCapacity |                       |
| The unit of the setpoints                  | resourceCapacity.unitSymbol      |                       |

In particular:
- pSRType.psrType = A06: the range remedial action is applied on a PST
- resourceCapacity.unitSymbol = C62: without unit (unit of the taps)
- marketObjectStatus.status = A26 : absolute

### Example

TODO

### FAQ

No question is reported yet...

## What general information is available?

The header of a CNE document contains some hardcoded general information, not detailed in this document. Besides, it contains exactly one TimeSeries, containing exactly one Period, that contains one Point.

A Point gathers all the Constraint_Series, as well as a Reason. The code and text inside the Reason contain information about the status of the computation:

TODO: check and update codes

| Reason code | Reason text            |
|-------------|------------------------|
| Z13         | Situation is secure    |
| Z03         | Situation is unsecure  |
| B27         | RAO computation failed |
| B40         | Load flow divergence   |
| 999         | Other failure          |

## Appendices

TODO?

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
