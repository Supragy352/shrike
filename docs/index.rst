.. _shrike-home:

..
   Vicharak master file, created by
   sphinx-quickstart on Tue May  9 19:32:34 2023.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

.. rst-class:: lead

##############################################
 Welcome to Shrike documentation!
##############################################

Shrike is a family of low cost affordable FPGA development board along with a host microcontroller. 
Currently the family features these three members -: 

1. Shrike-lite (FPGA with RP2040) 
2. Shrike      (FPGA with RP2350)
3. Shrike-fi   (FPGA with ESP32-S3)
 
And a lot version under development.


We at vicharak have kept in mind need of a learner, maker and a hobbyist while designing this art. This dev board will be your stepping stone in the field of FPGA , reconfigurable and heterogenous computing.

.. image:: ./../asset/shrike_block.svg
   :width: 100%
   :align: center

.. toctree::
   :maxdepth: 2
   :caption: Getting Started
   :titlesonly:

   Introduction <introduction>
   Tools Setup <tools_setup_guide>
   Getting Started (Blink LED) <getting_started>
   Generating Your First Bitstream <generating_your_first_bitstream>

.. toctree::
   :maxdepth: 2
   :caption: Hardware Reference
   :titlesonly:

   Hardware Overview <hardware_overview>
   Board Pinouts & Interconnect <shrike_pinouts>

.. toctree::
   :maxdepth: 2
   :caption: FPGA Development
   :titlesonly:

   Verilog & Synthesis Guide <verilog_style_guide>

.. toctree::
   :maxdepth: 2
   :caption: MCU & Tools
   :titlesonly:

   Shrike CLI Guide (mpremote) <shrike_cli_guide>

.. toctree::
   :maxdepth: 2
   :caption: Examples & Resources
   :titlesonly:

   Examples Catalog <examples>
   Reading List <reading_list>

.. note::

   We welcome contributions and bug reports through our `GitHub
   repository <https://github.com/vicharak-in/shrike>`_.

