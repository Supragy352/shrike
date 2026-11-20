.. _shrike-home:

..
   Vicharak master documentation entry point.

####################
Shrike Documentation
####################

.. rst-class:: lead

   **Shrike** is a family of affordable, breadboard-friendly FPGA + microcontroller development boards designed by Vicharak for learners, makers, and hardware engineers exploring reconfigurable and heterogeneous computing.

Every board in the Shrike family pairs a **Renesas ForgeFPGA SLG47910** (1,120 5-input LUTs) with a host microcontroller that configures the FPGA over SPI and communicates with your digital design at runtime.

.. grid:: 1 1 3 3
   :gutter: 3
   :class-container: shrike-board-grid

   .. grid-item-card:: Shrike-lite
      :class-title: shrike-card-title

      **Host MCU:** Raspberry Pi RP2040

      **FPGA:** Renesas ForgeFPGA SLG47910

      Breadboard-friendly dual-core ARM Cortex-M0+ + FPGA board with USB-C and PMOD.

   .. grid-item-card:: Shrike
      :class-title: shrike-card-title

      **Host MCU:** Raspberry Pi RP2350

      **FPGA:** Renesas ForgeFPGA SLG47910

      Upgraded host MCU with ARM Cortex-M33 / RISC-V cores, 3.3 V PMOD, and USB-C.

   .. grid-item-card:: Shrike-fi
      :class-title: shrike-card-title

      **Host MCU:** Espressif ESP32-S3

      **FPGA:** Renesas ForgeFPGA SLG47910

      Built-in 2.4 GHz Wi-Fi 4 and Bluetooth 5 LE with optional PSRAM and Li-ion BMS footprints.

.. image:: ./../asset/shrike_block.svg
   :alt: Shrike architecture block diagram showing the host microcontroller connected to the Renesas ForgeFPGA SLG47910
   :width: 100%
   :align: center
   :class: shrike-hero-diagram

Explore the Documentation
-------------------------

.. grid:: 1 1 2 2
   :gutter: 3
   :class-container: shrike-nav-grid

   .. grid-item-card:: Getting Started
      :link: introduction
      :link-type: doc
      :shadow: sm

      New to Shrike? Learn how the MCU + FPGA architecture works, install your tools, and blink the onboard LED in minutes.

      *Introduction · Tools Setup · Blink LED →*

   .. grid-item-card:: Hardware Reference
      :link: hardware_overview
      :link-type: doc
      :shadow: sm

      Compare Shrike, Shrike-lite, and Shrike-fi specifications, power rules, PMOD connectors, and internal MCU–FPGA pin mappings.

      *Hardware Overview · Pinouts & Interconnect →*

   .. grid-item-card:: FPGA Development
      :link: generating_your_first_bitstream
      :link-type: doc
      :shadow: sm

      Create your first Verilog project in Renesas Go Configure Software Hub, synthesize bitstreams, and master ForgeFPGA synthesis rules.

      *First Bitstream · Verilog Reference →*

   .. grid-item-card:: MCU & Tools
      :link: shrike_cli_guide
      :link-type: doc
      :shadow: sm

      Flash bitstreams from the command line with ``mpremote`` and write single-source firmware targeting RP2040, RP2350, and ESP32-S3.

      *CLI Guide · Platform-Agnostic Firmware →*

   .. grid-item-card:: Examples Catalog
      :link: examples
      :link-type: doc
      :shadow: sm

      Browse ready-to-run FPGA + MCU examples including UART, SPI, PWM, quadrature decoding, soft-core CPUs, and video output.

      *Browse Examples →*

   .. grid-item-card:: Reading List & Community
      :link: reading_list
      :link-type: doc
      :shadow: sm

      Curated digital design books, HDL tutorials, datasheets, and community resources to deepen your FPGA skills.

      *Explore Reading List →*

.. note::

   Found an issue or want to improve these docs? Contributions and bug reports are welcome on the `Shrike GitHub repository <https://github.com/vicharak-in/shrike>`_, or join hardware discussions on the `Vicharak Discord <https://discord.com/invite/EhQy97CQ9G>`_.

.. toctree::
   :maxdepth: 2
   :caption: Getting Started
   :titlesonly:
   :hidden:

   Introduction <introduction>
   Tools Setup <tools_setup_guide>
   Getting Started (Blink LED) <getting_started>
   Generating Your First Bitstream <generating_your_first_bitstream>

.. toctree::
   :maxdepth: 2
   :caption: Hardware Reference
   :titlesonly:
   :hidden:

   Hardware Overview <hardware_overview>
   Board Pinouts & Interconnect <shrike_pinouts>

.. toctree::
   :maxdepth: 2
   :caption: FPGA Development
   :titlesonly:
   :hidden:

   ForgeFPGA Verilog & Synthesis Reference <verilog_style_guide>

.. toctree::
   :maxdepth: 2
   :caption: MCU & Tools
   :titlesonly:
   :hidden:

   Shrike CLI Guide (mpremote) <shrike_cli_guide>
   Platform-Agnostic Firmware Guide <PLATFORM_AGNOSTIC_FIRMWARE_GUIDE>

.. toctree::
   :maxdepth: 2
   :caption: Examples & Resources
   :titlesonly:
   :hidden:

   Examples Catalog <examples>
   Reading List <reading_list>
