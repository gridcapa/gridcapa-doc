---
sidebar_position: 1
---
# Overview

## Core Capacity Calculation Process

The **Core Capacity Calculation Region (CCR)** spans most of continental Europe and includes 16 Transmission System Operators (TSOs).

![Core CCR](/img/CORE.png)

 It represents the largest CCR in Europe and plays a crucial role in ensuring the secure and efficient allocation of cross-border electricity capacity across central Europe.

### Key Features

- **Methodology**: Core uses a **flow-based capacity calculation approach**, which accounts for the physical realities of how electricity flows through the interconnected grid. This method enables a more efficient and accurate use of the transmission network compared to traditional border-based (NTC) methods.

- **Critical Network Elements (CNECs)**: TSOs define Critical Network Elements with Contingencies (CNECs), which are monitored during the capacity calculation to ensure security constraints are respected. These are selected based on operational experience and regular analysis.

- **Remedial Actions**: Core includes coordinated **preventive** and **curative** remedial actions:
  - *Preventive*: Implemented before real-time operations, such as topology changes are PST taps change.
  - *Curative*: Applied during real-time operations, in response to a contingency.
    These actions are coordinated among TSOs to increase available capacity and manage congestions.

- **Generation Shift Keys (GLSKs)**: Each TSO provides GLSKs that define how generation or load variations are distributed in their area, helping to simulate market behavior during capacity calculation.

- **Capacity Calculation Process**:
  - TSOs submit individual grid models and remedial action lists.
  - A **Common Grid Model (CGM)** is built from these inputs.
  - A **remedial actions optimisation** is run to select optimal set of RAs to ensure maximum secure exchanges.
  - The **flow-based calculation** evaluates simultaneous power exchanges and their impact on the network.
  - The available margins are computed based on constraints on CNECs, taking into account coordinated remedial actions.
  - Final flow-based parameters (PTDFs, RAMs, and critical branches) are delivered for market coupling.

- **Validation and Publication**: The calculated capacity values are validated by the TSOs and transmitted to market coupling operators for use in day-ahead and intraday electricity markets.

### Regulatory Framework

The Core capacity calculation process complies with **EU Regulation 2015/1222** on Capacity Allocation and Congestion Management (CACM), contributing to the harmonized and integrated internal electricity market in Europe.


