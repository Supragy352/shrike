# Shrike Documentation

> **Tip:** Browse the compiled documentation site at **[vicharak-in.github.io/shrike](https://vicharak-in.github.io/shrike/)** for full search, tabbed board selectors, and sidebar navigation.

This directory contains the Sphinx + MyST Markdown source files for the Shrike family (`Shrike-lite`, `Shrike`, and `Shrike-fi`).

## Documentation Structure

### Getting Started
1. [Introduction](./introduction.md) — How Shrike combines an MCU and FPGA
2. [Tools Setup](./tools_setup_guide.md) — Installing Renesas Go Configure Software Hub and MCU tools
3. [Getting Started (Blink LED)](./getting_started.md) — First blink with Arduino IDE, MicroPython, or CircuitPython
4. [Generating Your First Bitstream](./generating_your_first_bitstream.md) — Writing, synthesizing, and mapping your first Verilog design

### Hardware Reference
- [Hardware Overview](./hardware_overview.md) — Board features, power, flash, and optional Shrike-fi add-ons
- [Board Pinouts & Interconnect](./shrike_pinouts.md) — Pinout diagrams and FPGA–MCU interconnect tables

### FPGA Development
- [Verilog & Synthesis Guide](./verilog_style_guide.md) — Renesas ForgeFPGA / Yosys attributes, output enables, `inout`, and clocks

### MCU & Tools
- [Shrike CLI Guide (`mpremote`)](./shrike_cli_guide.md) — Flashing and running scripts from the terminal
- [Platform-Agnostic Firmware Guide](./PLATFORM_AGNOSTIC_FIRMWARE_GUIDE.md) — Writing one sketch/script for RP2040, RP2350, and ESP32-S3

### Examples & Resources
- [Examples Catalog](./examples.md) — Teaching examples organized by category and difficulty
- [Reading List](./reading_list.md) — Curated FPGA learning resources and related open hardware

## Building Locally

```bash
cd docs
pip install -r requirements.txt
make html
# Or strict check (warnings as errors):
make html-strict
```

## Renesas SLG47910 References

- [ForgeFPGA SLG47910 Datasheet](https://www.renesas.com/en/document/dst/slg47910-datasheet?r=25546631)
- [Go Configure ForgeFPGA Workshop User Guide](https://www.renesas.com/en/document/gde/forgefpga-workshop-user-guide?r=25546631)
- [ForgeFPGA Software Simulation User Guide](https://www.renesas.com/en/document/mas/forgefpga-software-simulation-user-guide?r=25546631)
