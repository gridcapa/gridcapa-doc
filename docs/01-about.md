---
sidebar_position: 1
---
# About
## What is GridCapa ?
GridCapa is an open-source software solution developed to support grid operators and coordination centers in conducting detailed capacity assessments of electricity networks. It enables the evaluation of network operating safety and the ability to accommodate additional power exchanges without compromising reliability.

Designed for integration into real-world planning and decision-making processes, GridCapa provides a transparent, modular, and customizable framework that can be adapted to utility-specific data models and operational constraints. Its availability on GitHub ensures long-term maintainability, peer-reviewed code quality, and the flexibility to extend or automate workflows to meet evolving industrial needs.

## Functional scope

**GridCapa** is built on top of **PowSyBl** to implement coordination and validation processes through the following modular functional components:

### Input Data Import

Supports standard European formats, including:

- Grid models in UCTE-DEF or CGMES formats
- GLSK files
- CRAC files
- Other custom inputs specific to the process

### Process-Specific Preprocessing

Tailored preprocessing operations, such as:

- Inserting missing devices (e.g., HVDC links)
- Adding fictitious elements to support remedial action modeling
- Adjusting device setpoints

### Iterative Power Exchange Shifting

Gradual modification of cross-border or internal power flows for capacity assessment.

### Remedial Action Optimization

Optimization of preventive, curative, and automatic remedial actions to maintain system security.

### Output Data Export

Generation of results including:

- Updated grid models (with applied remedial actions, if any)
- Other outputs specific to the selected process

### Process Monitoring

Includes tracking of input data availability, logging, and overall workflow supervision.

### User Interface (HMI)

Enables basic interaction with workflows, including:

- Launching calculations for individual timestamps or full business days
- Modifying process parameters