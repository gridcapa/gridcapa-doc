---
sidebar_position: 1
---
# Export

The IN export process focuses on alternative network configurations, compared to the import EC process. It determines the max Italian import in situations where at least one of the Northern countries imports from Italy. 
It is partly run on GridCapa: several RAO computations are launched with GridCapa, but the full process is performed externally.

It is run both two days before real-time operations (D2CC) and the day before real-time operations (IDCC).

The table below shows the typical timing of these processes (these timings are provided as an example of GridCapa task scheduling and may be adjusted as needed):

| Process        | Time window                          | Launch mode | Number of timestamps                                                  |
|----------------|--------------------------------------|-------------|-----------------------------------------------------------------------|
| IN Export D2CC | 19:00 - 02:00 (Europe/Brussels time) | Automatic   | 8 timestamps (00:30, 03:30, 07:30, 10:30, 13:30, 16:30, 19:30, 22:30) |
| IN Export IDCC | 03:00 - 06:00 (Europe/Brussels time) | Automatic   | 4 timestamps (13:30, 16:30, 19:30, 22:30)                             |