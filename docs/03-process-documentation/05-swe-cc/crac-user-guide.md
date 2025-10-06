`---
sidebar_position: 1
---
# CIM CRAC user guide for SWE

## General introduction

A CRAC file contains a list of elements that will be used for remedial action optimization. There are three types of elements that can be defined in a CRAC file:
- An element to monitor (MR)
- A contingency to simulate (Co)
- A remedial action that can be applied (RA)

The interpretation of these elements depends on how they are associated one to another. (e.g.: some remedial actions can only be applied after a specific contingency)

First, the definition of each element is detailed then, the interpretation by the RAO tool OSIRIS is described according to possible associations.

The contingencies and remedial actions represent modifications applied to the network state and after these modifications a new load-flow calculation is launched.

The monitored elements represent the elements whose margins must be taken into account during the calculation: the goal can be either to increase these margins or to make sure they don’t decrease.

### Definition of elementary series

| What do we want to represent? | XML element corresponding in the CRAC | Comments                                                                                                                                                                                                                                                           |
|-------------------------------|---------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| A contingency                 | A Contingency_Series                  |      A Contingency_Series corresponds to ONE contingency                                                                                                                                                                                                           |
| An element to monitor         | A Monitored_Series                    | A Monitored_Series corresponds to ONE network element to monitor (different thresholds can be associated to one Monitored_Series). Generic or specific monitored element is deduced based on the context in which the Monitored Series is defined in the CRAC file |
| An element to monitor angles  | An AdditionalConstraint_Series        | Specific element to monitor angles.                                                                                                                                                                                                                                |
| A remedial action available   | A RemedialAction_Series               | A RemedialAction_Series corresponds to ONE Remedial action in the SL. The usage rules of the RA are deduced based on the context in which the RemedialAction_Series is defined                                                                                     |

## How to define a contingency?

### Description

One contingency is defined by one Contingency_Series. This element contains all the information regarding the contingency: the UID of the contingency, the name of the contingency (f), the UIDs of the network elements to trip, the names of the network elements to trip (f).

| What do we want to represent?               | XML element corresponding in the CRAC | Comments     |
|---------------------------------------------|---------------------------------------|--------------|
| A contingency                               | Contingency_Series                    |              |
| The UID of the contingency                  | mRID                                  |              |
| The name of the contingency                 | Name                                  | Facultative  |
|                                             | Registered_Resource                   | At least one |
| The UID of the network element to trip      | Registered_Resource/mRID              |              |
| The name of the network element to trip     | Registered_Resource/Name              | Facultative  |
| The location of the network element to trip | Registered_Resource/in_Domain         | Facultative  |
| The location of the network element to trip | Registered_Resource/out_Domain        | Facultative  |

### Example 

TODO


### FAQ

How can we define complex contingencies?
> To define one contingency corresponding to the trip of several elements, one Contingency_Series containing several Registered_Resource (one per network element to trip) should be defined.

## How to define an element to monitor?

One monitored element is defined by one Monitored_Series. This element contains all the information regarding the element to monitor: the UID of the constraint, the name of the constraint (f), the UID of the network element to monitor, the name of the network element to monitor (f), the direction of the monitoring (if not monitored in both directions) and the description of the thresholds (instants and values).

A threshold associated to one monitored element is defined by a Measurement. Several Measurement can be defined for one monitored element. This element contains all the information regarding the threshold: the instant, the value, the unit, the direction (f).

Several physical quantities can be monitored in the CRAC file but only flow through lines (Amperes or Megawatts) is handled by OSIRIS and so imported in the security limit. The monitoring of voltage levels and angle differences can be described in the CRAC but cannot be imported in the security limit so far. The details on the implementation of voltage and angle monitoring can be found in the annexes.

Here we detail the interpretation of monitored elements for flows.

### Description

| What do we want to represent?                                              | XML element corresponding in the CRAC               | Comments          |
|----------------------------------------------------------------------------|-----------------------------------------------------|-------------------|
| A monitored element                                                        | Monitored_Series                                    |                   |
| The UID of the  monitored element                                          | mRID                                                |                   |
| The name of the  monitored element                                         | Name                                                | Facultative       |
| The owner of the monitored element                                         | Party_MarketParticipant/mRID                        | Facultative       |
| The part of the process using this element                                 | optimization_MarketObjectStatus.status              | Mandatory         |
|                                                                            | Registered_Resource                                 | Exactly one       |
| The UID of the network element to monitor                                  | Registered_Resource/mRID                            |                   |
| The name of the network element to monitor                                 | Registered_Resource/Name                            | Facultative       |
| The location of the network element                                        | Registered_Resource/in_Domain                       | Facultative       |
| The location of the network element                                        | Registered_Resource/out_Domain                      | Facultative       |
| The origin node if the element is monitored only in one direction          | Registered_Resource/In_AggregatedNode               | Facultative       |
| The extremity node                                                         | Registered_Resource/Out_AggregatedNode              | Facultative       |
| One per threshold and per direction to monitor                             | Registered_Resource/Measurements                    | At least one      |
| Instant associated to the threshold                                        | Registered_Resource/Measurements/measurementType    | See mapping table |
| Unit of the threshold                                                      | Registered_Resource/Measurements/unitSymbol         | See mapping table |
| The direction to monitor if the element is monitored only in one direction | Registered_Resource/Measurements/positiveFlowIn     | Facultative       |
| Value of the threshold                                                     | Registered_Resource/Measurements/analogValues.value |                   |

### Example

TODO

### FAQ

What kind of thresholds can be defined?

> Threshold instant is defined by the measurementType code.

> | Need                                                                                                                                   | measurementType Code | Instant |
> |----------------------------------------------------------------------------------------------------------------------------------------|----------------------|---------|
> | Flow                                                                                                                                   | A01                  | Flow    |
> | Maximum current admissible in basecase (PATL)                                                                                          | A02                  |   N      |
> | Maximum current admissible after the contingency and before any RA could be applied                                                    | A07          |      Outage (60s)   |
> | Maximum current admissible after the contingency and after the application of Automatic RA but before any Curative RA could be applied | A12          |    Auto (61s)     |
> | Maximum current admissible after the contingency and after all the RA have been applied                                                | A13          |       Curative (1200s)  |

> Threshold unit is defined by the unitSymbol code.

> | Need                                                          | unitSymbol Code | Threshold Type |
> |---------------------------------------------------------------|-----------------|----------------|
> | Maximum current in Amperes                                    | AMP             | A              |
> | Maximum current in percent of the PATL defined in the network | P1              | %PATL          |
> | Maximum active power in Megawatts                             | MAW             | MW             |

Can multiple thresholds be defined for a same instant for an element?

> Yes, several thresholds can be defined for any instant.

What type of network element can be monitored?

> Lines can be monitored using ACLineSegment mRID. PST and transformers can be monitored using PowerTransformer mRID. These mRIDs are found in the EQ profile of the CGMES network.

How to specify the direction of the monitoring?

> To specify the direction of monitoring, attributes in and out AggregateNode have to be defined at RegisteredResource level. These fields define the origin and extremity nodes used as reference for this RegisteredResource. The fields must contain the mRID of the Topological nodes at both ends of the monitored element. These mRIDs are found in the EQ profile of the CGMES network.
> Then, each measurement is associated to a direction using the positiveFlowIn attribute. Two codes are implemented in the security limit.
>
> | Need                                       | positiveFlowIn Code |
> |--------------------------------------------|---------------------|
> | Monitor flow from Out to In AggregateNode  | A01                 |
> | Monitor flow from In to Out AggregateNode  | A02                 |
> 
> If two thresholds with the two different directions are defined in a single Monitored_Series, then two different monitored elements are created in the security limit.

Can we define complex elements to monitor?

> Even if the format allows to define several RegisteredResource per Monitored_Series, this functionality is not handled by the security limit for the moment.

How to monitor an element only after a specific contingency?

> See section "How to define usage rules?".

How to define a Flow Reliability Margin (FRM) and how is it handled in the Security Limit?

> The FRM can be defined with a measurementType “A03”. It isn’t directly imported in the Security Limit but instead of the value of the threshold, the value “threshold – FRM” is imported.

How to define an element whose margin must not be optimized but must rather not decrease? (“monitoring”)

> The code A49 must be used for the optimization_MarketOjectStatus.status.

What happens if the optimization_MarketOjectStatus.status is not A49 or A52 or if there is not this element?

> The monitored element is not imported.
> TODO: check

## How to define a remedial action

One remedial action is defined by one RemedialAction_Series. It can be composed of several elementary actions. This element contains all the information necessary to define a remedial action: the UID of the remedial action, the name of the remedial action (f), the UID of the network elements involved in the action, their names (f), the type of the network elements, the description of the action (start, stop, open, close, modify set point…), the type of RA (preventive, automatic or curative) and the status of the RA (enforced or not).

### Description



| What do we want to represent?                             | XML element corresponding in the CNE      | Comments                        |
|-----------------------------------------------------------|-------------------------------------------|---------------------------------|
| An applied Remedial Action                                | RemedialAction_Series                     |                                 |
| The UID of the remedial action                            | mRID                                      |                                 |
| The name of the RA                                        | Name                                      | Facultative                     |
|                                                           | businessType                              |                                 |
| The instant of application of the RA                      | applicationMode_MarketObjectStatus.status |                                 |
| The status of the RA (enforced)                           | availability_MarketObjectStatus.status    | See restrictions below          |
| The owner of the RA                                       | Party_MarketParticipant                   |                                 |
|                                      | Party_MarketParticipant/mRID              | X code of the TSO from EIC list |
| One elementary action (in case of range Remedial Actions) | Registered_Resource                       | At least one                    |

Please find below how to build a Registered_Resource.

| One elementary action composing the RA        | Registered_Resource               | Comments                        |
|-----------------------------------------------|-----------------------------------|---------------------------------|
| The UID of the network element to act on      | mRID                              |                                 |
| The name of the network element to act on     | Name                              | Facultative                     |
| The type of the network element               | pSRType.psrType                   |                                 |
| The location of the network element to act on | in_Domain                         | Facultative                     |
| The location of the network element to act on | out_Domain                        | Facultative                     |
| The description of the action                 | marketObjectStatus.status         | Open, stop, change set point... |
| The new set point                             | resourceCapacity.defaultCapacity  | Facultative                     |
| The minimum set point                         | resourceCapacity.minimumCapacity  | Facultative                     |
| The maximum set point                         | resourceCapacity.maximumCapacity  | Facultative                     |
| The unit of the setpoints                     | resourceCapacity.unitSymbol       | Facultative                     |

### Example

### FAQ 

What kind of elementary action can we model?

> An elementary action can be defined on a PST, a transformer, a line, a group, an HVDC link or a breaker. The pSRType value depends on the network element type. Please find in the annexes (code list) the possible values of the pSRType and the associated EQ elements which mRID must be used.
> The kind of available actions depends on the type of network element. Here is a table summing up the possible action types
> 
> | Network element type               | PST | Transformer | Line | Group | HVDC | Breaker |
> |------------------------------------|-----|-------------|------|-------|------|---------|
> | Start/Close                        |     |             | X    | X     |      | X       |
> | Stop/Open                          |     |             | X    | X     |      | X       |
> | Change the Setpoint / Impedance    | X   | X           | X    | X     | X    |         |
> | Optimize the set point / Impedance | X   |             | (*)  |       | (*)  |         |
> (*) the optimization of the set point of an HVDC link is possible in the format but not yet in the security limit.
> 
> Actions are defined using the attribute Action_MarketObjectStatus.status and depending on the type of action resourceCapacity.maximumCapacity / minimumCapacity / defaultCapacity / unitSymbol. The type of action is deduced from the association of attributes.
>
> | Attribute                          | Action MarketObjectStatus | Maximum Capacity | Minimum Capacity | Default Capacity | Unit Symbol |
> |------------------------------------|---------------------------|------------------|------------------|------------------|-------------|
> | Start/Close                        | X                         |                  |                  |                  |             |
> | Stop/Open                          | X                         |                  |                  |                  |             |
> | Change the Setpoint / Impedance    | X                         |                  |                  | X                | X           |
> | Optimize the set point / Impedance | X                         | X                | X                |                  | X           |
> 
> In the case of a new set point (chosen or optimized), the target value can expressed with respect to the current value (marketObjectStatus set to “relative to previous optimization step”) or with respect to the value before optimization (marketObjectStatus set to “relative to initial network state”). The target value can also be defined in an absolute way (marketObjectStatus set to “absolute”).
> Please note that only “relative to previous optimization step” and “absolute” are handled by the security limit.
> In the annexes, you will find examples of RA description in the CRAC as well as the list of codes handled by the security limit.

How to define a remedial action consisting in several elementary actions?

> A Remedial action is defined by a RemedialAction_Series. Then, each RegisteredResource is used to define an elementary action. There can be as many RegisteredResource as wanted for a single RemedialAction_Series.

How to define a remedial action available at multiple instants?

> The applicationMode_MarketObjectStatus.status attribute is mandatory for CRAC import in Convergence. It corresponds to the instant at which the RA is available. The handled values for this attribute correspond are: preventive RA, automatic RA, curative RA or preventive and curative RA.
> To define a RA available on any other combination of instants, the RA should be defined in two different RemedialAction_Series using the same information but different values of application Mode.

Is it possible to force the application of a remedial action?

> The availability_MarketObjectStatus.status attribute is mandatory for CRAC import in Convergence. When set to “could be used”, the application of the RA is left at choice of the optimizer. When set to “shall be used”, the RA is enforced.
> Please note that only RA available after a contingency could be enforced in the actual version of the security limit.

Why are some hypotheses created next to the Security Limit?

> The security limit doesn’t contain all the information imported from the CRAC. Some of this information, relative to remedial actions (other than PST range and HVDC range), is stored as hypotheses and the Security Limit refers to these hypotheses.

## How to define usage rules?

The usage rules are deduced from the content of a Series. The association of unitary elements (Co, MR and/or RA) results in a given usage rule. The following table details the possible interpretation of the content of a Series.

| Contigency Series | Monitored Series | RemedialAction Series | Usage Rule                                                                                                         |
|-------------------|------------------|-----------------------|--------------------------------------------------------------------------------------------------------------------|
| N                 | 0                | 0                     | N contingencies                                                                                                    |
| 0                 | M                | 0                     | M generic monitored elements                                                                                       |
| N                 | M                | 0                     | M specific monitored elements, each monitored after all the N contingencies                                        |
| 0                 | 0                | R                     | R free to use remedial actions                                                                                     |
| N                 | 0                | R                     | R remedial actions, each of them available after each of the N contingencies                                       |
| 0                 | M                | R                     | R remedial actions, each of them available after each of the M constraints                                         |
| N                 | M                | R                     | R remedial actions, each of them available after each of the combinations of the N contingencies and M constraints |

### Specific monitored element or generic monitored element

A generic monitored element is an element monitored after all the contingencies simulated in the RAO study. To define a generic monitored element, the corresponding Monitored_Series has to be defined in a Series without any Contingency_Series.

To define an element monitored specifically after a given contingency, the corresponding Monitored_Series has to be defined in a Series including the Contingency_Series corresponding to the contingency. If the element has to be monitored after several contingencies, then the Series should contain the Monitored_Series and all the Contingency_Series corresponding to the contingencies. If several elements have to be specifically monitored after the same contingency, then the Series should contain all the Monitored_Series and the Contingency_Series as illustrated in the following example.

Example : TODO

### Remedial action free to use

A remedial action free to use is a remedial action available after any constraint. To define a RA free to use, the corresponding RemedialAction_Series has to be defined in a Series which does not contain any Contingency_Series nor Monitored_Series.

If several RA are free to use, they can be defined in the same Series.

Example : TODO

### Remedial action available after a given contingency

A remedial action can be available only in case of constraint after a given contingency.  To define a RA after a contingency, the corresponding RemedialAction_Series has to be defined in a Series which contains the corresponding Contingency_Series but does not contain any Monitored_Series.

If several RA are available after this contingency, they can be defined in the same Series. If the RA is available after several contingencies, then the Series should contain the RemedialAction_Series and all the Contingency_Series.

Example : TODO

### Remedial action available after a given constraint

A remedial action can be available only in case of a given constraint in N state of after any contingencies.  To define a RA available after a constraint, the corresponding RemedialAction_Series has to be defined in a Series which contains the corresponding Monitored_Series but does not contain any Contingency_Series.

If several RA are available after this constraint, they can be defined in the same Series. If the RA is available after several constraints, then the Series should contain the RemedialAction_Series and all the Monitored_Series.

### Remedial action available after a given contingency and a given constraint

A remedial action can be available only in case of a given constraint after a given contingency.  To define a RA available after a contingency and a constraint, the corresponding RemedialAction_Series has to be defined in a Series which contains the corresponding Monitored_Series and the corresponding Contingency_Series.

If several RA are available after this pair of contingency and constraint, they can be defined in the same Series. If the RA is available after several pairs of contingency and constraint, then the Series should contain the RemedialAction_Series, all the Contingency_Series and Monitored_Series.

Example : TODO

### Remedial action available after any constraint in a given country

A remedial action can be available to solve any constraint in a given country. To define a RA available after a constraint in a given country, the corresponding RemedialAction_Series has to be defined in a Series which does not contain any Contingency_Series nor Monitored_Series and to include the attribute Shared_Domain in the RemedialAction_Series.

Example : TODO

## Appendices

### How to monitor voltage at a substation

- RegisteredResource mRID must refer to a VoltageLevel mRID
- At this substation, a minimum and maximum voltage can be defined using Measurements of type minimum voltage (A10) or maximum voltage (A11)
- The unit of a voltage threshold could be in percent of the base voltage (P1) or in kilovolts (KVT)

### How to monitor an angle difference

Angle monitoring is done by creating an AdditionalConstraint_Series. See the example below.

TODO

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


TODO: delete this:

|  |            |           |
|--|------------|-----------|
|  |            |           |
|  |            |           |
|  |            |           |
|  |            |           |
`