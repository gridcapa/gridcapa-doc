---
sidebar_position: 1
---
# Import EC

Import EC process is the main Capacity calculation process aiming at calculating the maximum secure northern italian import (MNII).
It is run both two days before real time operations (D2CC) and the day before real time operations (IDCC)

Below is the timing of those processes run (those are shown as an example of GridCapa task management, as it could be changed on demand):

| Process                 | Time window                          | Launch mode | Number of timestamp                                                   |
|-------------------------|--------------------------------------|-------------|-----------------------------------------------------------------------|
| IN Import EC D2CC       | 18h30 - 01h30 (Europe/Brussels time) | Manual      | 8 timestamps (00h30, 03h30, 07h30, 10h30, 13h30, 16h30, 19h30, 22h30) |
| IN Import EC IDCC run 1 | N/A                                  | N/A         | Process on hold                                                       |
| IN Import EC IDCC run 2 | 02h30 - 05h30 (Europe/Brussels time) | Manual      | 4 timestamps (13h30, 16h30, 19h30, 22h30)                             |
