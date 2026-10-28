---
sidebar_position: 1
---

# CIM CRAC user guide for SWE

## Acronyms

| Acronym | Description |
|---------|-------------|
| UID | Unique Identifier (`mRID`) |
| f | Facultative (Optional) |
| RA | Remedial Action |
| MR / CNEC | Monitored Resource / Critical Network Element with Contingency |
| MNEC | Monitored Network Element with Contingency (monitored without optimization) |
| Co | Contingency |
| CS | Constraint Series |
| PST | Phase Shift Transformer |
| HVDC | High Voltage Direct Current |
| CCR | Capacity Calculation Region |
| PRA | Preventive Remedial Action |
| CRA | Curative Remedial Action |
| SPS / Auto | Special Protection Scheme / Automatic Remedial Action |
| PATL | Permanent Admissible Transmission Limit |
| TATL | Temporary Admissible Transmission Limit |
| FRM | Flow Reliability Margin |

---

## General introduction

A CRAC (**C**ontingency list, **R**emedial **A**ctions and additional **C**onstraints) file defines all the operational constraints and corrective levers to be considered during remedial action optimization (RAO).

There are three primary concepts defined in a CRAC file:

1. **Monitored Resource (MR / CNEC)**: A network element (line, transformer) whose electrical flow or physical limit must be supervised.
2. **Contingency (Co)**: An outage or trip of one or multiple network elements to simulate.
3. **Remedial Action (RA)**: A preventive, automatic, or curative action (PST tap shift, HVDC setpoint variation, topological opening/closing, generation redispatching) that can be applied to relieve network overloads.

The interpretation of these elements depends on how they are structured inside `Series` containers:
- Some remedial actions are **Free to use** (available to resolve any overload).
- Other remedial actions are only applicable **after specific contingencies** or **on specific constraints** (or in a given country / area).

### Summary of elementary Series in CIM CRAC

| What do we want to represent? | XML element in CIM CRAC | RAO / Network Concept | Comments |
|-------------------------------|-------------------------|------------------------|----------|
| **A contingency** | `Contingency_Series` | An outage definition | Defines the list of network elements to trip simultaneously in `RegisteredResource` elements. |
| **An element to monitor (Flow CNEC)** | `Monitored_Series` | A monitored branch limit (CNEC / MNEC) | Defines the monitored element, its direction, and threshold values across different operating instants (Basecase, Outage, Auto, Curative). |
| **An angle monitoring constraint** | `AdditionalConstraint_Series` | An angle difference limit (Angle CNEC) | Defines an admissible maximum angular difference between two substations, monitored at curative stage. |
| **A remedial action** | `RemedialAction_Series` | A candidate or enforced RA | Defines the type of action (PST range, HVDC setpoint, topological switch, generation/load) and its availability rules. |

---

## Time validity and document structure

A CIM CRAC document (`CRAC_MarketDocument`) is defined for a given validity interval and contains `TimeSeries` composed of `Period` and `Point` blocks.

### Header and TimeSeries

Each `TimeSeries` specifies a curve type and a time resolution:
- **Sequential Fixed Size Blocks (`curveType="A01"`)**: Points are indexed from 1 to $N$ with a fixed resolution (e.g. `PT60M` for 60 minutes). Point `position="1"` covers the first hour, point `position="2"` covers the second hour, etc.
- **Variable Sized Blocks (`curveType="A03"`)**: Points define intervals starting at their relative `position` up to the next defined point or the end of the period.

```xml
<CRAC_MarketDocument xmlns="urn:iec62325.351:tc57wg16:451-n:CRACdocument:2:3">
    <mRID>CIM_CRAC_SWE_DA</mRID>
    <revisionNumber>1</revisionNumber>
    <type>B15</type>
    <process.processType>A48</process.processType>
    <sender_MarketParticipant.mRID codingScheme="A01">10X1001A1001A450</sender_MarketParticipant.mRID>
    <sender_MarketParticipant.marketRole.type>A36</sender_MarketParticipant.marketRole.type>
    <receiver_MarketParticipant.mRID codingScheme="A01">10X1001A1001A450</receiver_MarketParticipant.mRID>
    <receiver_MarketParticipant.marketRole.type>A04</receiver_MarketParticipant.marketRole.type>
    <createdDateTime>2026-10-27T10:00:00Z</createdDateTime>
    <time_Period.timeInterval>
        <start>2026-10-27T22:00Z</start>
        <end>2026-10-28T22:00Z</end>
    </time_Period.timeInterval>
    <domain.mRID codingScheme="A01">10YCB-FR-ES-PT-S</domain.mRID>
    <TimeSeries>
        <mRID>SWE_TS_1</mRID>
        <businessType>B54</businessType>
        <curveType>A01</curveType>
        <Period>
            <timeInterval>
                <start>2026-10-27T22:00Z</start>
                <end>2026-10-28T22:00Z</end>
            </timeInterval>
            <resolution>PT60M</resolution>
            <Point>
                <position>1</position>
                <!-- Series (B55, B56, B57) are placed here -->
            </Point>
        </Period>
    </TimeSeries>
</CRAC_MarketDocument>
```

---

## How to define a contingency?

A contingency is defined by a `Contingency_Series` inside a `Series` (typically `businessType` `B55`, `B56`, or `B57`).

### Contingency XML structure

| XML element | Description | Status | Comments |
|-------------|-------------|--------|----------|
| `Contingency_Series/mRID` | Unique identifier of the contingency | Mandatory | Unique ID of the outage (e.g. `REE-RTE-Co-1`). |
| `Contingency_Series/name` | Human-readable name | Optional | Descriptive label (e.g. `N-1 BAIXAS-VIC`). |
| `RegisteredResource` | Tripped network element | At least 1 | Can contain multiple resources for multiple/complex outages. |
| `RegisteredResource/mRID` | Equipment identifier | Mandatory | CGMES EQ identifier of the line, transformer, generator, etc. |
| `RegisteredResource/name` | Equipment name | Optional | Descriptive name. |
| `RegisteredResource/in_Domain.mRID` | Country / Control Area (From) | Optional | EIC code (e.g. `10YES-REE------0`). |
| `RegisteredResource/out_Domain.mRID` | Country / Control Area (To) | Optional | EIC code (e.g. `10YFR-RTE------C`). |

### Example: Simple Line Outage

#### Operational Need
Simulate the trip of the 400 kV tie-line Baixas – Vic (network ID: `_363fc03a-2307-5959-20f7-38c771355440`).

#### XML snippet

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

### FAQ - Contingencies

**How to define a complex contingency (trip of multiple elements)?**
> Simply add several `<RegisteredResource>` blocks within the same `<Contingency_Series>`. Each `RegisteredResource` represents one equipment to be disconnected upon outage.

**Can contingencies refer to a dictionary?**
> In standard workflows, individual TSO CRACs must include the `RegisteredResource` elements with the exact network equipment identifiers. If a contingency dictionary is used at CCR level, it should be merged with the CRAC before optimization.

---

## How to define a monitored element (Flow CNEC)?

Monitored elements are defined inside `Monitored_Series` blocks (typically in `Series` with `businessType` `B56` or `B57`).

### Monitored element XML structure

| XML element | Description | Status | Comments |
|-------------|-------------|--------|----------|
| `Monitored_Series/mRID` | Unique identifier of the constraint | Mandatory | Unique ID of the monitored element. |
| `Monitored_Series/name` | Human-readable name | Optional | Descriptive label. |
| `optimization_MarketObjectStatus.status` | Role in optimization | Mandatory | `A52`: CNEC (optimized)<br/>`A49`: MNEC (monitored only, margin must not decrease). |
| `RegisteredResource/mRID` | Equipment identifier | Mandatory | CGMES EQ identifier of the line (`ACLineSegment`) or transformer (`PowerTransformer`). |
| `RegisteredResource/in_AggregateNode.mRID` | Origin topological node | Optional | Used to specify directional monitoring. |
| `RegisteredResource/out_AggregateNode.mRID` | Extremity topological node | Optional | Required if `in_AggregateNode` is provided. |
| `Measurements` | Threshold definition | At least 1 | Contains threshold instant, unit, value, and direction. |
| `Measurements/measurementType` | Instant of monitoring | Mandatory | See table below (`A02`, `A07`, `A12`, `A13`). |
| `Measurements/unitSymbol` | Unit of threshold | Mandatory | `AMP` (Amperes), `P1` (% of PATL), `MAW` (Megawatts). |
| `Measurements/positiveFlowIn` | Direction of monitored flow | Optional | `A01`: Out $\rightarrow$ In<br/>`A02`: In $\rightarrow$ Out. |
| `Measurements/analogValues.value` | Threshold numerical value | Mandatory | Maximum acceptable value. |

### Instants and measurement types

| Need / Instant | `measurementType` Code | Operational Meaning |
|----------------|------------------------|---------------------|
| **Basecase / Permanent limit (PATL)** | `A02` | Normal state ($N$) before any contingency. |
| **Outage limit (TATL 60s / 1m)** | `A07` | Right after contingency, before any remedial action is applied. |
| **Automatic limit (TATL 61s / Auto)** | `A12` | After contingency and automatic RA (SPS), before curative RA. |
| **Curative limit (TATL 1200s / 20m)** | `A13` | Final state after all automatic and curative remedial actions. |

### Units and Values

| Unit Need | `unitSymbol` Code | Meaning / Calculation |
|-----------|-------------------|-----------------------|
| **Amperes** | `AMP` | Absolute current threshold in A. |
| **Percentage of PATL** | `P1` | Percentage of the network's nominal permanent limit ($100 = 100\%$). |
| **Active Power** | `MAW` | Active power threshold in MW. |

### Example: Monitored line with multiple instants

#### Operational need
Monitor the 225 kV line Cantegrit – Mouguerre in both directions:
- Basecase ($N$): 100% of PATL (`P1`)
- After Automatic RA: 2227.75 A (`AMP`)
- After Curative RA: 1890 A (`AMP`)

#### XML snippet

```xml
<Monitored_Series>
    <mRID>RTE-MR-1</mRID>
    <name>Cantegrit - Mouguerre 225kV</name>
    <optimization_MarketObjectStatus.status>A52</optimization_MarketObjectStatus.status>
    <RegisteredResource>
        <mRID codingScheme="A02">_CANTEL61MOUGU_ACLS</mRID>
        <name>CANTEGRIT MOUGUERRE1</name>
        <in_Domain.mRID codingScheme="A01">10YFR-RTE------C</in_Domain.mRID>
        <out_Domain.mRID codingScheme="A01">10YFR-RTE------C</out_Domain.mRID>
        <!-- Basecase limit (100% PATL) -->
        <Measurements>
            <measurementType>A02</measurementType>
            <unitSymbol>P1</unitSymbol>
            <analogValues.value>100</analogValues.value>
        </Measurements>
        <!-- Post-Automatic limit (2227.75 A) -->
        <Measurements>
            <measurementType>A12</measurementType>
            <unitSymbol>AMP</unitSymbol>
            <analogValues.value>2227.75</analogValues.value>
        </Measurements>
        <!-- Post-Curative limit (1890 A) -->
        <Measurements>
            <measurementType>A13</measurementType>
            <unitSymbol>AMP</unitSymbol>
            <analogValues.value>1890</analogValues.value>
        </Measurements>
    </RegisteredResource>
</Monitored_Series>
```

### FAQ - Monitored Elements

**How is the monitoring direction defined?**
> When `in_AggregateNode` and `out_AggregateNode` are provided at resource level:
> - `positiveFlowIn="A01"` monitors flow from `out_AggregateNode` to `in_AggregateNode`.
> - `positiveFlowIn="A02"` monitors flow from `in_AggregateNode` to `out_AggregateNode`.
> If `positiveFlowIn` is omitted, the element is monitored in **both directions**.

**What is the difference between A52 and A49?**
> - `A52` (Optimized): The RAO optimizer is allowed to use remedial actions to relieve overloads on this element.
> - `A49` (Monitored / MNEC): The element is not actively optimized, but the optimizer ensures that remedial actions taken for other elements do not degrade this element's margin.

**How is Flow Reliability Margin (FRM) handled?**
> If an FRM is defined via `measurementType="A03"`, the effective threshold used during optimization is automatically reduced: $\text{Threshold}_{\text{effective}} = \text{Threshold} - \text{FRM}$.

---

## How to define a remedial action?

Remedial actions are defined in `RemedialAction_Series` (typically in `Series` with `businessType="B56"`).

### Remedial action attributes

| XML element | Description | Status | Handled values |
|-------------|-------------|--------|----------------|
| `RemedialAction_Series/mRID` | Unique identifier of the RA | Mandatory | Unique ID (e.g. `REE-RA-139`). |
| `RemedialAction_Series/name` | Human-readable name | Optional | Descriptive label. |
| `businessType` | Business category | Mandatory | Always `B59` for remedial actions. |
| `applicationMode_MarketObjectStatus.status` | Operational Instant | Mandatory | `A18`: Preventive (PRA)<br/>`A20`: Automatic / SPS<br/>`A19`: Curative (CRA)<br/>`A27`: Preventive and Curative |
| `availability_MarketObjectStatus.status` | Optimization Status | Mandatory | `A39`: Candidate (could be used)<br/>`A40`: Enforced / Mandatory (shall be used) |
| `Party_MarketParticipant/mRID` | Operator / Owner | Optional | TSO EIC code (e.g. `10XES-REE------E`). If omitted, deduced from the RA `mRID` prefix. |
| `RegisteredResource` | Elementary action component | At least 1 | Defines the affected network equipment and setpoint/switch change. |

### Elementary action definition (`RegisteredResource`)

| Element in `RegisteredResource` | Description | Typical usage |
|---------------------------------|-------------|---------------|
| `mRID` | Equipment identifier | Network ID in CGMES EQ profile. |
| `pSRType.psrType` | Equipment type | `A06` (PST), `B24` (Transformer), `A02`/`A01` (Line/Tie-line), `A04` (Generator), `A05` (Load), `B22` (HVDC), `A07` (Breaker). |
| `marketObjectStatus.status` | Action type / Mode | `A21` (Open / Disconnect)<br/>`A22` (Close / Connect)<br/>`A23` (Stop generator)<br/>`A26` (Absolute setpoint / Range)<br/>`A43` (PMODE1 active power control for HVDC) |
| `resourceCapacity.defaultCapacity` | Target setpoint / Fixed tap | For discrete setpoints / tap positioning. |
| `resourceCapacity.minimumCapacity` | Minimum range bound | Lower limit for PST tap or HVDC flow. |
| `resourceCapacity.maximumCapacity` | Maximum range bound | Upper limit for PST tap or HVDC flow. |
| `resourceCapacity.unitSymbol` | Setpoint unit | `C62` (Tap position, dimensionless), `MAW` (Megawatts). |

---

### PST Range Actions

PST range actions allow the optimizer to choose any tap between a minimum and maximum value.

#### Operational need
REE allows optimizing the Arkale PST tap between tap 1 and tap 33 as a preventive remedial action (PST network ID: `_e071a1d4-fef5-1bd9-5278-d195c5597b6e`).

#### XML snippet

```xml
<RemedialAction_Series>
    <mRID>REE-RA-139</mRID>
    <name>Arkale PST Range</name>
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
        <marketObjectStatus.status>A26</marketObjectStatus.status>
        <resourceCapacity.minimumCapacity>1.0</resourceCapacity.minimumCapacity>
        <resourceCapacity.maximumCapacity>33.0</resourceCapacity.maximumCapacity>
        <resourceCapacity.unitSymbol>C62</resourceCapacity.unitSymbol>
    </RegisteredResource>
</RemedialAction_Series>
```

---

### HVDC Range Actions

In the CIM CRAC standard, an HVDC remedial action is modeled with bidirectional range capability (typically 0 to $+P_{\max}$ MW in each direction) across both bipoles/lines forming a group:
- Each direction is represented by a `RemedialAction_Series`.
- For each HVDC line, two `RegisteredResource` elements are included:
  1. A control mode resource with `marketObjectStatus="A43"` (PMODE1 active power control).
  2. A capacity range resource with `marketObjectStatus="A26"`, `minimumCapacity="0"`, `maximumCapacity="1000.0"`, `unitSymbol="MAW"`, and `in_AggregateNode` / `out_AggregateNode` to define orientation.

#### XML snippet (HVDC Range in one direction)

```xml
<RemedialAction_Series>
    <mRID>HVDC_FR_ES_DIR1</mRID>
    <name>HVDC INELFE FR to ES</name>
    <businessType>B59</businessType>
    <applicationMode_MarketObjectStatus.status>A20</applicationMode_MarketObjectStatus.status>
    <availability_MarketObjectStatus.status>A39</availability_MarketObjectStatus.status>
    <!-- Line 1 Control Mode -->
    <RegisteredResource>
        <mRID codingScheme="A02">_HVDC_LINE_1</mRID>
        <pSRType.psrType>B22</pSRType.psrType>
        <marketObjectStatus.status>A43</marketObjectStatus.status>
    </RegisteredResource>
    <!-- Line 1 Range [0, 1000 MW] -->
    <RegisteredResource>
        <mRID codingScheme="A02">_HVDC_LINE_1</mRID>
        <pSRType.psrType>B22</pSRType.psrType>
        <in_AggregateNode.mRID codingScheme="A02">_NODE_FR</in_AggregateNode.mRID>
        <out_AggregateNode.mRID codingScheme="A02">_NODE_ES</out_AggregateNode.mRID>
        <marketObjectStatus.status>A26</marketObjectStatus.status>
        <resourceCapacity.minimumCapacity>0</resourceCapacity.minimumCapacity>
        <resourceCapacity.maximumCapacity>1000.0</resourceCapacity.maximumCapacity>
        <resourceCapacity.defaultCapacity>200.0</resourceCapacity.defaultCapacity>
        <resourceCapacity.unitSymbol>MAW</resourceCapacity.unitSymbol>
    </RegisteredResource>
    <!-- Line 2 Control Mode -->
    <RegisteredResource>
        <mRID codingScheme="A02">_HVDC_LINE_2</mRID>
        <pSRType.psrType>B22</pSRType.psrType>
        <marketObjectStatus.status>A43</marketObjectStatus.status>
    </RegisteredResource>
    <!-- Line 2 Range [0, 1000 MW] -->
    <RegisteredResource>
        <mRID codingScheme="A02">_HVDC_LINE_2</mRID>
        <pSRType.psrType>B22</pSRType.psrType>
        <in_AggregateNode.mRID codingScheme="A02">_NODE_FR</in_AggregateNode.mRID>
        <out_AggregateNode.mRID codingScheme="A02">_NODE_ES</out_AggregateNode.mRID>
        <marketObjectStatus.status>A26</marketObjectStatus.status>
        <resourceCapacity.minimumCapacity>0</resourceCapacity.minimumCapacity>
        <resourceCapacity.maximumCapacity>1000.0</resourceCapacity.maximumCapacity>
        <resourceCapacity.defaultCapacity>200.0</resourceCapacity.defaultCapacity>
        <resourceCapacity.unitSymbol>MAW</resourceCapacity.unitSymbol>
    </RegisteredResource>
</RemedialAction_Series>
```

---

### Topological and network actions

Topological actions open or close switches/lines/transformers:
- Open action: `marketObjectStatus="A21"`
- Close action: `marketObjectStatus="A22"`

#### Operational need
RTE defines a curative opening of the Argia transformer (network ID: `ARGIAY771_PT`).

#### XML snippet

```xml
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
        <pSRType.psrType>B24</pSRType.psrType>
        <marketObjectStatus.status>A21</marketObjectStatus.status>
    </RegisteredResource>
</RemedialAction_Series>
```

---

## How to define usage rules?

Usage rules specify **when** and **where** a remedial action or monitored element is applicable. In CIM CRAC, usage rules are deduced from the combinations of `Contingency_Series`, `Monitored_Series`, and `RemedialAction_Series` contained within a single `Series`.

### Usage rules combinations

| `Contingency_Series` ($N$) | `Monitored_Series` ($M$) | `RemedialAction_Series` ($R$) | Operational Interpretation |
|---|---|---|---|
| **$N > 0$** | 0 | 0 | **$N$ Contingencies** defined for the study. |
| 0 | **$M > 0$** | 0 | **$M$ Generic Monitored Elements** (monitored in Basecase and after all contingencies). |
| **$N > 0$** | **$M > 0$** | 0 | **$M$ Specific Monitored Elements** (monitored specifically after each of the $N$ contingencies). |
| 0 | 0 | **$R > 0$** | **$R$ Free to use Remedial Actions** (available to relieve any constraint). |
| **$N > 0$** | 0 | **$R > 0$** | **$R$ Remedial Actions on Contingency** (available after each of the $N$ contingencies). |
| 0 | **$M > 0$** | **$R > 0$** | **$R$ Remedial Actions on Constraint** (available only if any of the $M$ constraints is overloaded). |
| **$N > 0$** | **$M > 0$** | **$R > 0$** | **$R$ Remedial Actions on (Contingency, Constraint) pair** (available after contingency $N$ only if constraint $M$ is overloaded). |
| 0 | 0 | **$R > 0$** + `Shared_Domain` | **$R$ Remedial Actions on Country / Area** (available to solve constraints in that specific country). |

---

### Example 1: Specific monitored elements after a contingency

#### Need
Monitor lines `BAIXAS - VIC 400kV` and `Argia - Mouguerre 2` specifically after contingency `N-1 ARGIA - HERNANI`.

```xml
<Series>
    <mRID>RTE-Series-CoMRList-1</mRID>
    <businessType>B57</businessType>
    <!-- Contingency -->
    <Contingency_Series>
        <mRID>REE-RTE-Co-4</mRID>
        <name>N-1 ARGIA - HERNANI</name>
        <RegisteredResource>
            <mRID codingScheme="A02">_0b3075b2-7980-988a-224b-407447636928</mRID>
        </RegisteredResource>
    </Contingency_Series>
    <!-- Monitored Element 1 -->
    <Monitored_Series>
        <mRID>RTE-MR-1</mRID>
        <name>BAIXAS - VIC 400kV</name>
        <optimization_MarketObjectStatus.status>A52</optimization_MarketObjectStatus.status>
        <RegisteredResource>
            <mRID codingScheme="A02">_VICHL71BAIXA_ACLS</mRID>
            <Measurements>
                <measurementType>A07</measurementType>
                <unitSymbol>AMP</unitSymbol>
                <analogValues.value>2309</analogValues.value>
            </Measurements>
        </RegisteredResource>
    </Monitored_Series>
    <!-- Monitored Element 2 -->
    <Monitored_Series>
        <mRID>RTE-MR-2</mRID>
        <name>Argia - Mouguerre 2</name>
        <optimization_MarketObjectStatus.status>A52</optimization_MarketObjectStatus.status>
        <RegisteredResource>
            <mRID codingScheme="A02">_ARGIAL62MOUGU_ACLS</mRID>
            <Measurements>
                <measurementType>A07</measurementType>
                <unitSymbol>AMP</unitSymbol>
                <analogValues.value>635</analogValues.value>
            </Measurements>
        </RegisteredResource>
    </Monitored_Series>
</Series>
```

---

### Example 2: Remedial action available after specific contingencies (SPS / Auto)

#### Need
REE allows automatic tripping of generator `TRIP GEN 2485-1I` in case of overload following contingencies `LA SERNA-MAGALLON-1 400 kV` or `SANTA ENGRACIA-BARCINA-1 400 kV`.

```xml
<Series>
    <mRID>REE-Series-CoRA-14</mRID>
    <businessType>B56</businessType>
    <!-- Contingency 1 -->
    <Contingency_Series>
        <mRID>REE-Co-10</mRID>
        <name>LA SERNA-MAGALLON-1 400 kV</name>
        <RegisteredResource>
            <mRID codingScheme="A02">_68c74a71-224a-245f-0b52-eac5045761eb</mRID>
        </RegisteredResource>
    </Contingency_Series>
    <!-- Contingency 2 -->
    <Contingency_Series>
        <mRID>REE-Co-11</mRID>
        <name>SANTA ENGRACIA-BARCINA-1 400 kV</name>
        <RegisteredResource>
            <mRID codingScheme="A02">_6a5d4cdf-2214-ef79-5ede-33651ce82f05</mRID>
        </RegisteredResource>
    </Contingency_Series>
    <!-- Automatic Remedial Action -->
    <RemedialAction_Series>
        <mRID>REE-RA-14</mRID>
        <name>TRIP GEN 2485-1I</name>
        <businessType>B59</businessType>
        <applicationMode_MarketObjectStatus.status>A20</applicationMode_MarketObjectStatus.status>
        <availability_MarketObjectStatus.status>A39</availability_MarketObjectStatus.status>
        <RegisteredResource>
            <mRID codingScheme="A02">_38cbb676-3922-62ef-4494-0a22ee4c9b27</mRID>
            <pSRType.psrType>A04</pSRType.psrType>
            <marketObjectStatus.status>A23</marketObjectStatus.status>
        </RegisteredResource>
    </RemedialAction_Series>
</Series>
```

---

### Example 3: Remedial action available on Country / Area (`Shared_Domain`)

#### Need
REE allows using preventive bus splitting `SPLIT CARMONA 220 kV` to solve any overload located in Spain.

```xml
<Series>
    <mRID>REE-Series-RA-47</mRID>
    <businessType>B56</businessType>
    <RemedialAction_Series>
        <mRID>REE-RA-47</mRID>
        <name>SPLIT CARMONA 220 kV</name>
        <businessType>B59</businessType>
        <applicationMode_MarketObjectStatus.status>A18</applicationMode_MarketObjectStatus.status>
        <availability_MarketObjectStatus.status>A39</availability_MarketObjectStatus.status>
        <RegisteredResource>
            <mRID codingScheme="A02">_86418b17-1d45-6188-7450-62bbc27e562e</mRID>
            <pSRType.psrType>A07</pSRType.psrType>
            <marketObjectStatus.status>A21</marketObjectStatus.status>
        </RegisteredResource>
        <!-- Scope of application: Spain -->
        <Shared_Domain>
            <mRID codingScheme="A01">10YES-REE------0</mRID>
        </Shared_Domain>
    </RemedialAction_Series>
</Series>
```

---

## Angle and voltage monitoring

### Angle CNECs (`AdditionalConstraint_Series`)

Angle constraints supervise angular differences between two substations in curative state. In CIM CRAC, an angle constraint is represented by an `AdditionalConstraint_Series` inside a `B56` series along with its associated contingency:
- `businessType="B87"`
- Max angular difference: `quantity.quantity` in degrees (`measurement_Unit.name="DD"`)
- Importing substation: `RegisteredResource` with `marketObjectStatus="A47"`
- Exporting substation: `RegisteredResource` with `marketObjectStatus="A46"`

#### Example

```xml
<Series>
    <mRID>REE-Angle-Series-1</mRID>
    <businessType>B56</businessType>
    <optimization_MarketObjectStatus.status>A52</optimization_MarketObjectStatus.status>
    <AdditionalConstraint_Series>
        <mRID>Angle-CARTELLE-ALTO-LINDOSO</mRID>
        <name>Angle Cartelle - Alto Lindoso</name>
        <businessType>B87</businessType>
        <measurement_Unit.name>DD</measurement_Unit.name>
        <quantity.quantity>30</quantity.quantity>
        <RegisteredResource>
            <mRID codingScheme="A02">_CARTELLE_VL_ID</mRID>
            <marketObjectStatus.status>A46</marketObjectStatus.status> <!-- Exporting -->
        </RegisteredResource>
        <RegisteredResource>
            <mRID codingScheme="A02">_ALTO_LINDOSO_VL_ID</mRID>
            <marketObjectStatus.status>A47</marketObjectStatus.status> <!-- Importing -->
        </RegisteredResource>
    </AdditionalConstraint_Series>
    <Contingency_Series>
        <mRID>REN-Co-1</mRID>
        <RegisteredResource>
            <mRID codingScheme="A02">_LINE_OUTAGE_ID</mRID>
        </RegisteredResource>
    </Contingency_Series>
</Series>
```

### Voltage monitoring

Voltage constraints monitor minimum (`A10`) and maximum (`A11`) voltages at a substation (`VoltageLevel`). In OpenRAO SWE workflows, voltage monitoring rules and thresholds are typically configured via CRAC creation parameters.

---

## Reference code lists

### `PSRType` Mapping by Equipment

| Network Equipment | `PSRType` Code | CGMES / Network Entity | Typical Actions |
|-------------------|----------------|------------------------|-----------------|
| **Phase Shift Transformer (PST)** | `A06` | `PowerTransformer` | Tap change (`A25`, `A26`), Open/Close |
| **Power Transformer** | `B24` | `PowerTransformer` | Open (`A21`), Close (`A22`) |
| **Line / Tie-Line** | `A02` / `A01` | `ACLineSegment` | Open (`A21`), Close (`A22`) |
| **Generator** | `A04` | `SynchronousMachine` | Redispatching (`A26` MW), Trip/Stop (`A23`) |
| **Load** | `A05` | `EnergyConsumer` | Load shedding (`A26` MW) |
| **HVDC Link** | `B22` | `HvdcLine` / `HvdcConverterStation` | Active power setpoint range (`A43` + `A26` MAW) |
| **Circuit Breaker / Switch** | `A07` | `Breaker` / `Disconnector` | Open (`A21`), Close (`A22`) |

### Status Codes Reference

| Field | Code | Meaning |
|-------|------|---------|
| `applicationMode_MarketObjectStatus` | `A18` | Preventive (PRA) |
| | `A20` | Automatic (SPS / Auto) |
| | `A19` | Curative (CRA) |
| | `A27` | Preventive & Curative |
| `availability_MarketObjectStatus` | `A39` | Could be used (Candidate for optimizer) |
| | `A40` | Shall be used (Mandatory / Enforced) |
| `optimization_MarketObjectStatus` | `A52` | Optimized (CNEC) |
| | `A49` | Monitored (MNEC) |
| `marketObjectStatus` | `A21` | Open / Disconnect |
| | `A22` | Close / Connect |
| | `A23` | Stop (Generation) |
| | `A25` | Relative setpoint / tap |
| | `A26` | Absolute setpoint / range |
| | `A43` | PMODE1 active power control (HVDC) |
| | `A46` | Exporting node (Angle CNEC) |
| | `A47` | Importing node (Angle CNEC) |
| `measurementType` | `A02` | Basecase ($N$) limit |
| | `A07` | Outage limit ($N-1$ before RA) |
| | `A12` | Post-Automatic limit |
| | `A13` | Post-Curative limit |
| | `A03` | Flow Reliability Margin (FRM) |
| | `A10` | Voltage Minimum |
| | `A11` | Voltage Maximum |
| `unitSymbol` | `AMP` | Amperes (A) |
| | `P1` | Percentage (%) |
| | `MAW` | Megawatts (MW) |
| | `C62` | Dimensionless (Tap) |
| | `DD` | Degrees (°) |
| | `KVT` | Kilovolts (kV) |
