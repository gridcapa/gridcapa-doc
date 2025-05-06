---
sidebar_position: 1
---
# Overview

## Italy North Capacity Calculation Process

The **Italy North Capacity Calculation Region (CCR)** comprises Italy and its neighboring countries to the north, including Austria, France, Slovenia, and Switzerland.

![IN CCR](/img/CSE.png)

The Transmission System Operators (TSOs) involved—**Terna** (Italy), **RTE** (France), **APG** (Austria), **ELES** (Slovenia), and **Swissgrid** (Switzerland)—collaborate to determine the available cross-border transmission capacity, ensuring both market efficiency and grid security.

### Key Features

- **Methodology**: The Italy North CCR employs a **coordinated Net Transfer Capacity (NTC)** approach. This method calculates the maximum exchangeable power between bidding zones without compromising the security of the grid.

- **Critical Network Elements (CNEs)**: TSOs identify and monitor CNEs that significantly influence cross-zonal power exchanges. These elements are selected based on sensitivity analyses and are reviewed periodically to reflect changing grid conditions.

- **Remedial Actions**: Both **preventive** and **curative** remedial actions are considered to maximize available capacity:
    - *Preventive actions*: Implemented before real-time operations, such as topology changes.
    - *Curative actions*: Applied during real-time operations, including redispatching and countertrading.

- **Generation and Load Shift Keys (GLSKs)**: Each TSO defines GLSKs to model how generation and load adjustments affect power flows, aiding in accurate capacity calculations.

- **Capacity Calculation Process**:
    - TSOs exchange individual grid models to create a **Common Grid Model (CGM)**.
    - Using the CGM, the coordinated capacity calculator assesses the system's ability to handle cross-border exchanges.
    - The process determines the **Total Transfer Capacity (TTC)**, from which the **Net Transfer Capacity (NTC)** is derived by subtracting the **Transmission Reliability Margin (TRM)**.

- **Validation and Publication**: Calculated capacities are validated by the TSOs and then provided to market operators for allocation in day-ahead and intraday market timeframes.

### Regulatory Framework

The Italy North capacity calculation methodology aligns with the **EU Regulation 2015/1222** on Capacity Allocation and Congestion Management (CACM), supporting the integration of European electricity markets.


## Timing
### CSE Import EC D2CC

Time window (Local Time): 18h30-01h30

Number of process Runner (CORESO PROD): 8 CSE Import EC D2CC runner

Launching calculations: Manual only

TS: 00:30 | 03:30 | 07:30 | 10:30 | 13:30 | 16:30 | 19:30 | 22:30

### CSE Import EC IDCC

#### Run 1
It should be run on DACF files, but the process is on hold until NI border is merged with the Central CC zone. 

#### Run 2
Process run on IDCF file

Time window (Local Time): 02h30-05h30

Number of process Runner (CORESO PROD): 8 CSE Import EC IDCC runner

Launching calculations: Manual only

TS: 13:30 | 16:30 | 19:30 | 22:30
