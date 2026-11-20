(hardware_overview)=

# Shrike — Hardware Overview

Shrike is a family of low-cost, low-power, breadboard-friendly FPGA development boards combining a **Renesas ForgeFPGA SLG47910** with a host microcontroller. Choose your board variant below — your selection will sync automatically across other pages.

:::::{tab-set}

::::{tab-item} Shrike / Shrike-lite
:sync: shrike-rp

## Hardware Features

- Renesas ForgeFPGA SLG47910 with 1,120 5-input LUTs
- Host MCU: RP2350 (**Shrike**) or RP2040 (**Shrike-lite**)
- PMOD connector (3.3 V)
- Reset button & Boot Select (`BOOTSEL`) button
- USB Type-C for power and programming
- 2 user LEDs (1 MCU LED, 1 FPGA LED)
- 23 MCU GPIOs and 14 FPGA GPIOs
- 6-bit FPGA–MCU interconnect link (+ EN and PWR control lines)
- Breadboard-compatible form factor

## GPIOs

Shrike and Shrike-lite provide **23 MCU I/Os** and **14 FPGA I/Os**, all operating at **3.3 V logic**. The header also exposes 3.3 V and 5 V power rails for external peripherals.

## PMOD Connector

The onboard PMOD connector supports standard 3.3 V PMOD peripherals.

:::{warning}
All I/O pins on Shrike and Shrike-lite (including the PMOD connector) are **3.3 V only** and are **not 5 V tolerant**. Supplying more than 3.3 V to any GPIO will permanently damage the onboard ICs.
:::

## USB Type-C Port

The board includes a USB Type-C connector used for both power and programming. Connect the board to your host computer with a USB Type-C data cable.

## User LEDs

The board provides two active-high user LEDs (driving the pin high turns the LED on; driving it low turns it off):

- **MCU LED (RP2350 / RP2040):** `GPIO 04`
- **FPGA LED (SLG47910):** `GPIO 16`

## Flash Memory

Shrike and Shrike-lite feature a **32 Mb (4 MB) QSPI Flash** (`W25Q32JV`) connected to the RP2350 / RP2040. It stores both the microcontroller firmware and FPGA bitstream files.

## Programming Model

Both ICs have independent programming flows:

- **Host MCU (RP2350 / RP2040):** Programmed using Arduino IDE (C/C++), MicroPython, CircuitPython, or the Raspberry Pi Pico C/C++ SDK.
- **FPGA (SLG47910):** Designed in Verilog and synthesized into a `.bin` bitstream using **Renesas Go Configure Software Hub**, then loaded by the MCU over SPI.

## Powering the Board

The board can be powered via **one** of two 5 V sources (regulated onboard down to 3.3 V for the MCU, FPGA, and PMOD connector):

1. The **USB Type-C** port
2. The **`5V` header pin** together with any **`GND`** pin

:::{caution}
**Never power the board simultaneously through USB Type-C and the `5V` header pin.** Applying both power sources at the same time can damage the board. Supply 5 V only to the `5V` input.
:::

::::

::::{tab-item} Shrike-fi
:sync: shrike-fi

## Hardware Features

- Renesas ForgeFPGA SLG47910 with 1,120 5-input LUTs
- Host MCU: Espressif **ESP32-S3** (2.4 GHz Wi-Fi 4 + Bluetooth 5 LE)
- PMOD connector (3.3 V)
- Reset button & Boot Select button
- Dual USB Type-C connectors for power and programming
- 2 user LEDs (1 MCU LED, 1 FPGA LED)
- 24 MCU GPIOs and 14 FPGA GPIOs
- 4-bit FPGA–MCU interconnect link (+ EN and PWR control lines)
- Optional unpopulated footprints for 8 MB QSPI PSRAM and onboard Li-ion BMS
- Breadboard-compatible form factor

## GPIOs

Shrike-fi provides **24 MCU I/Os** and **14 FPGA I/Os**, all operating at **3.3 V logic**. The header also exposes 3.3 V and 5 V power rails for external peripherals.

## PMOD Connector

The onboard PMOD connector supports standard 3.3 V PMOD peripherals.

:::{warning}
All I/O pins on Shrike-fi (including the PMOD connector) are **3.3 V only** and are **not 5 V tolerant**. Supplying more than 3.3 V to any GPIO will permanently damage the onboard ICs.
:::

## USB Type-C Ports

Shrike-fi includes two USB Type-C connectors for programming and power. Connect the board to your host computer with a USB Type-C data cable.

## User LEDs

The board provides two active-high user LEDs (driving the pin high turns the LED on; driving it low turns it off):

- **MCU LED (ESP32-S3):** `GPIO 21`
- **FPGA LED (SLG47910):** `GPIO 16`

## Wi-Fi and BLE

Powered by the ESP32-S3, Shrike-fi natively supports **2.4 GHz 802.11 b/g/n Wi-Fi 4** and **Bluetooth 5 (LE)**.

## Flash & Optional PSRAM

Shrike-fi includes onboard QSPI Flash connected to the ESP32-S3 to store firmware and FPGA bitstreams (and an optional 8 MB QSPI PSRAM footprint).

:::{note}
The base version of Shrike-fi ships with the PSRAM and Battery Management System footprints unpopulated (DNP). You can solder these components yourself using the BOM and designator reference below.
:::

## Optional Add-Ons

Shrike-fi includes footprints for two optional hardware add-ons:

### 1. PSRAM (`U10`)

Shrike-fi supports an optional **8 MB QSPI PSRAM**. Depending on the variant purchased, it may arrive pre-soldered or left unpopulated.

- **Part Number:** `LY68L6400SLIT`
- **PCB Designator:** `U10`

### 2. Battery Management System (BMS)

Shrike-fi includes an unpopulated onboard Li-ion battery charging and protection circuit (DNP on the base board). If you wish to populate it yourself, the complete BOM is listed below:

| Designator | Description | Value | Manufacturer Part Number | Package | Qty | Type |
| --- | --- | --- | --- | --- | --- | --- |
| `C9` | 100nF, 10V, X7R, ±10%, 0402, MLCC | 100nF | `CC0402KRX7R6BB104` | 0402 | 1 | Capacitor |
| `C10, C11, C12` | 10uF, 10V, X5R, ±10%, 0603, MLCC | 10uF | `CL10A106KP8NNNC` | 0603 | 3 | Capacitor |
| `D9` | Orange LED 0603 | ORANGE LED | `XL-1608UOC-06` | 0603 | 1 | LED |
| `D10` | Green LED 0603 | GREEN LED | `XL-1608UGC-04` | 0603 | 1 | LED |
| `J3` | 2-pin 2.5mm right-angle through-hole header | — | `XY-XHB2.54-2A21` | TH, P=2.5mm | 1 | Connector |
| `R5` | Resistor 100 ohm, 1%, 0402 | 100R | `RC0402FR-07100RL` | 0402 | 1 | Resistor |
| `R6, R7, R11, R12` | Resistor 1 kohm, 1%, 0402 | 1K | `RC0402FR-071KL` | 0402 | 4 | Resistor |
| `R8` | Resistor 402 ohm, ±1%, 62.5mW, 0402 | 402R | `0402WGF4020TCE` | 0402 | 1 | Resistor |
| `R9` | Resistor 0 ohm, 1%, 0402 | 0R | `RC0402FR-070RL` | 0402 | 1 | Resistor |
| `R10` | Resistor 0 ohm, ±1%, 125mW, 0805 | 0R | `0805W8F0000T5E` | 0805 | 1 | Resistor |
| `U2` | Lithium Battery Protection IC (DW01A) | DW01A | `DW01A` | SOT23-6 | 1 | IC |
| `U3` | Power Switch IC | — | `TPS2113ADRBR` | VSON-8 | 1 | IC |
| `U4` | Lithium Battery Charger, 1A, 5V (TP4056) | — | `TP4056` | SOP8 | 1 | IC |
| `U5` | Dual N-Channel -20V 6A MOSFET | — | `FS8205A` | TSSOP-8 | 1 | IC |

### 3. Part Designators

Use the [Shrike-fi Part Designators PDF](./images/Shrike_fi_designator.pdf) to locate the footprints when soldering the optional PSRAM or BMS parts.

## Programming Model

Both ICs have independent programming flows:

- **Host MCU (ESP32-S3):** Programmed using Arduino IDE (C/C++), MicroPython, or ESP-IDF.
- **FPGA (SLG47910):** Designed in Verilog and synthesized into a `.bin` bitstream using **Renesas Go Configure Software Hub**, then loaded by the MCU over SPI.

## Powering the Board

The board can be powered via **one** of two 5 V sources (regulated onboard down to 3.3 V for the ESP32-S3, FPGA, and PMOD connector):

1. The **USB Type-C** port
2. The **`5V` header pin** together with any **`GND`** pin

:::{caution}
**Never power the board simultaneously through USB Type-C and the `5V` header pin.** Applying both power sources at the same time can damage the board. Supply 5 V only to the `5V` input.
:::

::::

:::::
