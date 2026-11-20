(shrike_pinouts)=

# Shrike Board Pinouts & Interconnect

Select your board variant below to view its pinout diagram, user LED assignments, and internal FPGA–MCU interconnect table.

:::::{tab-set}

::::{tab-item} Shrike / Shrike-lite
:sync: shrike-rp

![Shrike and Shrike-lite board pinout diagram](./images/shrike_pinouts.svg)

## FPGA–RP2040 / RP2350 Interconnect

To simplify communication between the host MCU (RP2040 / RP2350) and the ForgeFPGA, an **8-line internal bus** is routed on the PCB:

- **2 dedicated control lines (`EN`, `PWR`):** Always reserved to power-cycle, reset, and initialize the FPGA.
- **4 dual-purpose SPI / I/O lines:** Used as SPI configuration pins while loading the bitstream, then available as a general-purpose FPGA–MCU bus after configuration. These lines are routed internally with top-side test pads available for probing.
- **2 configurable I/O lines (FPGA pins `17` and `18`):** Routed both internally to MCU GPIOs `15` and `14` and out to the board header via 0 Ω jumper resistors (populated by default; see the board schematic for details).

:::{warning}
By default, the 0 Ω jumper resistors connecting FPGA pins `17`/`18` to RP2040/RP2350 pins `15`/`14` are populated. Do **not** drive them simultaneously as external header I/Os unless you de-solder those resistors.
:::

### User LEDs

- **MCU LED (RP2040 / RP2350):** `GPIO 04` (active high)
- **FPGA LED (SLG47910):** `GPIO 16` (active high)

### Interconnect Pin Mapping

| FPGA Pin | RP2350 / RP2040 Pin | MCU Function | FPGA Function |
| --- | --- | --- | --- |
| `EN` | `GPIO 13` | GPIO | `EN` (Enable) |
| `PWR` | `GPIO 12` | GPIO | `PWR` |
| `3` | `GPIO 2` | GPIO / SPI SCK | `SPI_SCLK` |
| `4` | `GPIO 1` | UART RX / GPIO | `SPI_SS` |
| `5` | `GPIO 3` | GPIO / SPI MOSI | `SPI_SI` (MOSI) |
| `6` | `GPIO 0` | UART TX / GPIO | `SPI_SO` (MISO) / `CONFIG` |
| `18` | `GPIO 14` | GPIO / I2C1 SDA | GPIO (via 0 Ω default) |
| `17` | `GPIO 15` | GPIO / I2C1 SCL | GPIO (via 0 Ω default) |

::::

::::{tab-item} Shrike-fi
:sync: shrike-fi

![Shrike-fi board pinout diagram](./images/shrike_fi_pinouts.svg)

## FPGA–ESP32-S3 Interconnect

To simplify communication between the **ESP32-S3** and the ForgeFPGA, a **6-line internal bus** is routed on the PCB:

- **2 dedicated control lines (`EN`, `PWR`):** Always reserved to power-cycle, reset, and initialize the FPGA.
- **4 dual-purpose SPI / I/O lines:** Used as SPI configuration pins while loading the bitstream, then available as a general-purpose FPGA–MCU bus after configuration. These lines are routed internally with top-side test pads available for probing.

### User LEDs

- **MCU LED (ESP32-S3):** `GPIO 21` (active high)
- **FPGA LED (SLG47910):** `GPIO 16` (active high)

### Interconnect Pin Mapping

| FPGA Pin | ESP32-S3 Pin | MCU Function | FPGA Function |
| --- | --- | --- | --- |
| `EN` | `GPIO 9` | GPIO | `EN` (Enable) |
| `PWR` | `GPIO 8` | GPIO | `PWR` |
| `3` | `GPIO 12` | GPIO | `SPI_SCLK` |
| `4` | `GPIO 10` | GPIO | `SPI_SS` |
| `5` | `GPIO 11` | GPIO | `SPI_SI` (MOSI) |
| `6` | `GPIO 13` | GPIO | `SPI_SO` (MISO) / `CONFIG` |

::::

:::::
