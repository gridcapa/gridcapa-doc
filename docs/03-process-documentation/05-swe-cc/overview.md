---
sidebar_position: 1
---
# Overview

## South West Europe (SWE) Capacity Calculation Process

The **South West Europe (SWE) Capacity Calculation Region (CCR)** encompasses France, Spain, and Portugal.

![SWE CCR](/img/SWE.png)

Its capacity calculation process is a coordinated effort by the Transmission System Operators (TSOs) of these countries—**RTE**, **REE**, and **REN**—to determine the available cross-border transmission capacity for electricity markets while ensuring grid security.

### Key Features

- **Methodology**: The SWE CCR employs a **coordinated Net Transfer Capacity (NTC)** approach, tailored to the region's specific grid characteristics, including High Voltage Direct Current (HVDC) links and Flexible AC Transmission Systems (FACTS) devices.

- **Critical Network Elements (CNEs)**: TSOs identify and monitor CNEs that significantly influence cross-zonal power exchanges. These elements are selected based on a sensitivity analysis, which is updated at least annually.

- **Remedial Actions**: Both **preventive** and **curative** remedial actions are considered. These include non-costly measures (e.g., topology changes, HVDC modulation) that can be used for solving flow constraints, voltage constraints, or even angle constraints.
      Some automatons that automatically use remedial actions in response to constraint on the grid are also modeled.
      The list of applicable remedial actions is reviewed regularly to adapt to changing grid conditions.

- **Generation and Load Shift Keys (GLSKs)**: Each TSO defines GLSKs based on their best forecast of market behavior, reflecting expected generation and load patterns.

- **Capacity Calculation Process**:
    - The coordinated capacity calculator merges individual grid models to form a Common Grid Model (CGM).
    - A **Remedial Action Optimization (RAO)** algorithm assesses various cross-zonal exchange scenarios, applying available remedial actions to ensure security.
    - The process determines the **Total Transfer Capacity (TTC)**, from which the **Net Transfer Capacity (NTC)** is derived by subtracting the **Transmission Reliability Margin (TRM)**.

- **Validation and Publication**: Calculated capacities are validated by the TSOs and then provided to market operators for allocation in day-ahead and intraday market timeframes.

### Regulatory Framework

The SWE capacity calculation methodology aligns with the **EU Regulation 2015/1222** on Capacity Allocation and Congestion Management (CACM), ensuring compliance with European electricity market integration objectives.

