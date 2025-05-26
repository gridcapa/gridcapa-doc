---
sidebar_position: 1
---
# Import EC

The Import EC process is the main capacity calculation process aimed at determining the Maximum Northern Italian Import (MNII).
It is run both two days before real-time operations (D2CC) and the day before real-time operations (IDCC).

The table below shows the typical timing of these processes (these timings are provided as an example of GridCapa task scheduling and may be adjusted as needed):

| Process                 | Time window                          | Launch mode | Number of timestamps                                                   |
|-------------------------|--------------------------------------|-------------|-----------------------------------------------------------------------|
| IN Import EC D2CC       | 18:30 - 01:30 (Europe/Brussels time) | Manual      | 8 timestamps (00:30, 03:30, 07:30, 10:30, 13:30, 16:30, 19:30, 22:30) |
| IN Import EC IDCC run 1 | N/A                                  | N/A         | Process on hold                                                       |
| IN Import EC IDCC run 2 | 02:30 - 05:30 (Europe/Brussels time) | Manual      | 4 timestamps (13:30, 16:30, 19:30, 22:30)                             |
