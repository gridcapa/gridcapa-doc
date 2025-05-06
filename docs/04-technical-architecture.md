---
sidebar_position: 4
---
# Technical architecture

**GridCapa** is an open-source platform designed for capacity assessment in electricity networks. It is built around a modular, event-driven microservices architecture to support scalability, automation, and integration with industrial processes.

## Modular Microservices Architecture

GridCapa is composed of multiple loosely-coupled services, each with a specific role:

- `data-bridge` — monitors FTP input
- `task-manager` — orchestrates task lifecycle
- `process-runner` — performs computation
- `rao-runner` — solves optimization problems
- `gridcapa-app` — user interface (HMI)
- `gridcapa-export` — handles result exports

## Event-Driven Workflow Orchestration

- Communication between services is handled via **RabbitMQ**.
- Events (e.g. new file detected, task status change) trigger appropriate actions across the system.

## Input/Output File Management

- Input files are uploaded to an **FTP server** and moved to **MinIO object storage**.
- Output files and logs are exported back to the FTP server for external use.

## Task Lifecycle Management

Tasks go through several lifecycle stages:

- `READY` – all inputs available
- `PENDING` – waiting for a computation instance
- `RUNNING` – actively computing
- `SUCCESS` or `ERROR` – computation completed

## Flexible Task Execution

Tasks can be launched:

- **Automatically** when all inputs are ready and config allows auto-start
- **Manually** via the user interface

## Computation and Adaptation Layer

- `process-adapter` formats task info and routes it to the `process-runner`
- `process-runner`:
    - Preprocesses input data
    - Runs iterative logic (e.g. dichotomy)
    - Invokes `rao-runner` for optimization
    - Writes results to storage

## Real-Time Monitoring and Logging

- Logs are continuously collected and stored in the database
- UI updates in real time via WebSockets
- Optimization logs are filtered by `rao-logs-dispatcher`

## Output Handling and Export

- `gridcapa-export` copies result files and logs from MinIO to FTP
- Ensures availability of all outputs before completing the task
