(verilog_style_guide)=
(forgefpga_synthesis_reference)=

# ForgeFPGA Verilog & Synthesis Reference

Writing Verilog for the **Renesas ForgeFPGA SLG47910** in **Go Configure Software Hub** (which uses **Yosys** for synthesis) differs in a few important ways from Vivado or Quartus Prime. This reference covers the mandatory synthesis attributes, output-enable signals, bidirectional (`inout`) pin patterns, and clock-enable wiring required for Shrike FPGA designs.

## Required Synthesis Attributes

Yosys requires specific Verilog attributes in your **top-level module** so that ports map cleanly to physical pins and are preserved through synthesis optimization.

| Attribute | Where to Use | Purpose |
| --- | --- | --- |
| `(* top *)` | Top-level `module` declaration | Marks the design's top-level module for the synthesizer. |
| `(* iopad_external_pin, clkbuf_inhibit *)` | Top-level clock `input` port | Marks the external/oscillator clock input port on the top module. |
| `(* iopad_external_pin *)` | Every top-level I/O port mapped to a pin | Preserves the port name and prevents Yosys from optimizing away top-level I/O signals. |

:::{note}
Apply `(* iopad_external_pin *)` and `(* iopad_external_pin, clkbuf_inhibit *)` **only on the top-level module's ports**, not on internal submodules.
:::

### Example Top-Level Module Header

```verilog
(* top *) module i2c_blink #(
    parameter I2C_SLAVE_ADR = 7'h32
) (
    (* iopad_external_pin, clkbuf_inhibit *) input  i_clk,
    (* iopad_external_pin *)                 input  i_rst,
    (* iopad_external_pin *)                 input  i_scl,
    (* iopad_external_pin *)                 input  i_sda,
    (* iopad_external_pin *)                 output o_sda,
    (* iopad_external_pin *)                 output o_led,

    // Output enable and clock enable signals
    (* iopad_external_pin *)                 output o_sda_oe,
    (* iopad_external_pin *)                 output o_clk_en,
    (* iopad_external_pin *)                 output o_led_en
);
```

## Output Enable (`_oe`) Signals

Each GPIO cell on the Renesas ForgeFPGA includes an I/O mux that selects between input and output mode. Because of this architecture:

- **Dedicated inputs** do not need an enable signal (pins default to input mode).
- **Every output pin** requires a paired output-enable (`_oe`) signal mapped to the corresponding `GPIOx_OE` port in the I/O Planner.
- Drive the `_oe` signal high (`1'b1`) whenever the pin acts as an output. For unidirectional outputs that are always driven, assign the enable permanently to `1'b1`.

![ForgeFPGA GPIO output cell showing data output and output-enable select mux](./images/output.png)

## Bidirectional (`inout`) Pins

Go Configure Software Hub does not directly synthesize Verilog `inout` port types the way Vivado or Quartus do. Instead, split every bidirectional pin (such as I2C `SDA`) into three separate top-level signals:

```verilog
(* iopad_external_pin *) input  i_sda;     // Input path (GPIOx_IN)
(* iopad_external_pin *) output o_sda;     // Output path (GPIOx_OUT)
(* iopad_external_pin *) output o_sda_oe;  // Output enable (GPIOx_OE)
```

- Drive `o_sda_oe = 1'b1` when outputting data onto the pin via `o_sda`.
- Drive `o_sda_oe = 1'b0` to release the pin to input mode and read incoming data from `i_sda`.

![ForgeFPGA bidirectional GPIO cell showing split input, output, and output-enable signals](./images/inout.png)

## Internal Oscillator Clock Enable (`clk_en`)

The SLG47910 ForgeFPGA includes an internal **50 MHz oscillator** routed to the logic fabric. To activate it, expose a clock-enable output signal on your top-level module (mapped to `OSC_EN` in the I/O Planner) and drive it high (`1'b1`) whenever the oscillator should run:

```verilog
assign o_clk_en = 1'b1;
```

![ForgeFPGA internal oscillator block showing OSC_EN clock enable and OSC_CLK output](./images/clk.png)
