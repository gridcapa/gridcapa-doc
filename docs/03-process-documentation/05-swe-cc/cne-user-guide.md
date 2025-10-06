---
sidebar_position: 1
---
# CNE user guide for SWE

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

| What do we want to represent? | XML element corresponding in the CRAC | Comments                                                                                                                                |
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

| What do we want to represent?                                      | XML element corresponding in the CRAC   | Comments                                                  |
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

## Business types

### B56

This Constraint_Series focuses on the applied remedial actions.

| What do we want to represent?                      | What kind of series does the Constraint_Series contain?                                                                             |
|----------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| The preventive remedial actions                    | \[1;N\] RemedialAction_Series (A18 in applicationMode.MarketObjectStatus.status) (if no PRA, this Constraint_Series is not created) |
| The remedial actions (SPS and CRA) after an outage | 1 Contingency Series and \[0;N\] RemedialAction_Series (A19 or A20 in applicationMode.MarketObjectStatus.status)                    |

### B57

This Constraint_Series focuses on the flows on the monitored elements.

| What do we want to represent?             | What kind of series does the Constraint_Series contain? |
|-------------------------------------------|---------------------------------------------------------|
| Flow in basecase                          |                                                         |
| Flow in basecase if no PRA                | TODO                                                    |
| Flows after outage                        |                                                         |
| Flows after SPS                           |                                                         |
| Flows after CRA                           |                                                         |
| Flows after SPS if SPSs but no CRA        |                                                         |
| Flows after outage if CRAs but no SPS     |                                                         |
| Flows after CRA if CRAs but no SPS        |                                                         |
| Flows after outage if neither SPS nor CRA |                                                         |

## Questions

- In how many Constraint_Series does a given Contingency_Series appear?

- Each Contingency_Series is related to exactly two Constraint_Series: one having a businessType B56, and the other one B57.


- What is described by a Constraint_Series without Contingency_Series?

- Such a Constraint_Series describes the flows, thresholds and/or (preventive) remedial actions in basecase.
Thus, one or two Constraint_Series contain no Contingency_Series in each CNE file:
->  exactly one, of type B57, if no preventive remedial action is applied: indeed, the RA-oriented Constraint_Series (B56) is deleted because it would be empty (no Co in basecase, no RA applied and no MR in B56)
-> exactly two (one B56 and one B57) if at least one preventive remedial action is applied.

- Are the preventive remedial actions repeated?

- The preventive remedial actions (if any) are only written in one Constraint_Series of type B56 (the one corresponding to the basecase, and containing no Contingency_Series - see the previous questions), but in all the Constraint_Series of type B57. This choice is made in order to decrease the size of the CNE file.

- Can Constraint_Series both with type B56 and B57 contain Monitored_Series?

- No, only the ones with type B57 can contain Monitored_Series. The ones with type B56 do not need Monitored_Series, as they focus on applied RAs.

- Do all Constraint_Series with type B57 contain Monitored_Series?

Yes, because no computation is made on a Contingency if no Monitored Element is defined.

- Can Constraint_Series both with type B56 and B57 contain RemedialAction_Series?

Yes. In particular, the ones with type B57 contain RemedialAction_Series in order to make it easier to understand the thresholds after RAs.

- Do all Constraint_Series with type B56 contain RemedialAction_Series? Do all Constraint_Series with type B57 contain RemedialAction_Series?

No, the answer is the same for both questions: if no remedial action is applied, the corresponding Constraint_Series contains no RemedialAction_Series.
Thus, in these cases, the Constraint_Series contains:
-> only a Contingency_Series (B56 after contingency, with no automatic nor curative RA)
-> only Monitored_Series (B57 in basecase, with no PRA)
-> one Contingency_Series and one or several Monitored_Series (B57 after contingency, with no automatic nor curative RA).

- Can a Constraint_Series contain only a Contingency_Series? In which case?

Yes, if the Constraint_Series is with type B56, and no remedial action is applied.

- To sum it up, what Constraint_Series exist?

Focus on applied remedial actions (B56)
- PRA = RA series
- SPS and CRA = CoRA series (SPS + CRA)

Focus on flows (B57)
- In basecase = MR (flow + PATL) + RA (PRA) 
- If no PRA: 
  - In basecase = MR (flow + PATL)
  - After Outage = Co + MR (flow + TATL after outage) + RA (PRA)
  - After SPS = Co + MR (flow + TATL after SPS) + RA (PRA + SPS)
  - After CRA = Co + MR (flow + TATL after CRA) + RA (PRA + SPS + CRA)
  - If SPSs but no CRA :
    - After SPS = Co + MR (flow + TATL after SPS + TATL after CRA) + RA (PRA + SPS)
  - If CRAs but no SPS :
    - After Outage = Co + MR (flow + TATL after Outage + TATL after SPS) + RA (PRA)
    - After CRA = Co + MR (flow + TATL after CRA) + RA (PRA + CRA)
  - If neither SPS nor CRA :
    - After Outage = Co + MR (flow + TATL after Outage + TATL after SPS+ TATL after CRA) + RA (PRA)

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
