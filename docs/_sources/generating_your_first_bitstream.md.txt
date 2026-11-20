(generating_your_first_bitstream)=

# Shrike FPGA Bitstream Generation Guide

A **bitstream** is the configuration file that programs the FPGA and maps your digital design onto its logic fabric. Shrike uses a **Renesas ForgeFPGA SLG47910** (1,120 5-input LUTs) — see the [SLG47910 product page and datasheet](https://www.renesas.com/en/products/slg47910).

Generating a bitstream for Shrike follows three main stages:

1. **Setup** — Create a new ForgeFPGA project in Go Configure Software Hub.
2. **Design & Synthesis** — Write your Verilog module and synthesize it.
3. **I/O Planning & PNR** — Map ports to physical pins and generate the `.bin` bitstream.

:::{note}
This guide assumes you have already installed **Renesas Go Configure Software Hub**. If not, follow **[Tools Setup](./tools_setup_guide.md)** first.
:::

Below, we will create an **LED Blink** FPGA project from scratch.

## 1. Setup

1. Launch **Go Configure Software Hub** and open the **ForgeFPGA** tab under **Develop**.

   ![Go Configure Software Hub showing the ForgeFPGA option under the Develop tab](./images/bitstream_gen/go_config_launch.png)

2. Double-click the **`SLG47910 (BB)`** device.

   :::{tip}
   You can also open a ready-made LED blink project from the [`examples/`](https://github.com/vicharak-in/shrike/tree/main/examples) directory in the Shrike repository using **Open** in the bottom-right corner and selecting its `.ffpga` file.
   :::

   ![Selecting the SLG47910 (BB) ForgeFPGA device in Go Configure Software Hub](./images/bitstream_gen/fpga_selection.png)

3. Choose a project name and directory location.

   ![Choosing the project name and directory path in Go Configure](./images/bitstream_gen/project_path.png)

4. In the **Project Settings** dialog, select the first available option in each dropdown by clicking the arrow beside it so it matches the screenshot below.

   ![Configured Project Settings window for SLG47910 in Go Configure](./images/bitstream_gen/project_setting.png)

5. Double-click the light blue **FPGA Core** block to open the Verilog editor (`main.v`). Setup is now complete.

   ![Empty main.v editor opened from the ForgeFPGA Core block](./images/bitstream_gen/empty_main.png)

Watch this short walkthrough of the setup steps above:

:::{raw} html
<div class="shrike-video-wrap">
  <video controls preload="metadata">
    <source src="_static/media/go_config_launch.webm" type="video/webm">
    Your browser does not support the video tag.
  </video>
</div>
:::

## 2. Design & Synthesis

Now let's design the `blink` hardware module in Verilog.

First, declare the LED output port. On ForgeFPGA, every physical output pin also requires an **output enable** (`_en`) signal — driving it high (`1'b1`) configures the pad as an output:

```verilog
module led_blink (
  output led,
  output led_en
);
endmodule
```

To toggle the LED once per second, we use the FPGA's onboard **50 MHz** internal oscillator (`clk`) and count `50_000_000` clock cycles per toggle.

Here is the complete Verilog module for `main.v`:

```verilog
(* top *) module blink(
  (* iopad_external_pin, clkbuf_inhibit *) input clk,
  (* iopad_external_pin *) output LED,
  (* iopad_external_pin *) output LED_en,
  (* iopad_external_pin *) output clk_en
);

  reg [31:0] counter;
  reg LED_status;

  assign LED_en = 1'b1;
  assign clk_en = 1'b1;

  always @(posedge clk) begin
    counter <= counter + 1'b1;
    if (counter == 50_000_000) begin
      LED_status <= !LED_status;
      counter <= 32'b0;
    end
  end

  assign LED = LED_status;

endmodule
```

:::{tip}
Before writing larger Verilog designs for Shrike, check the **[ForgeFPGA Verilog & Synthesis Reference](./verilog_style_guide.md)** to learn how `(* top *)`, `(* iopad_external_pin *)`, and `(* clkbuf_inhibit *)` attributes work.
:::

Paste the code above into `main.v` inside Go Configure Software Hub:

![Complete blink Verilog module entered in main.v inside Go Configure](./images/bitstream_gen/mainv_code.png)

Next, click **Synthesize** in the bottom-left panel. Synthesis typically takes a few seconds to a minute and displays a green checkmark when it completes without errors.

Now you are ready for I/O planning and bitstream generation.

## 3. I/O Planning and PNR

Now that we have synthesized the Verilog, let's connect the signals to the physical I/O pins:

1. Open the **I/O Planner** from the top bar in Go Configure Software Hub.

   ![Opening the I/O Planner from the Go Configure toolbar](./images/bitstream_gen/io_planner.png)

2. Map the clock signals first — filter the selection using the **CLK** and **OSC_ctrl** tabs, then map `clk` to `OSC_CLK` and `clk_en` to `OSC_EN`.

   ![Mapping clk to OSC_CLK and clk_en to OSC_EN in I/O Planner](./images/bitstream_gen/clk_io_map.png)

3. Map the LED output signals — filter to **GPIO** only (uncheck other groups). Because the onboard FPGA LED is on pin `16`, map `LED` to `GPIO16_OUT` and `LED_en` to `GPIO16_OE`.

   ![Mapping LED to GPIO16_OUT and LED_en to GPIO16_OE in I/O Planner](./images/bitstream_gen/led_io_map.png)

4. Save your I/O Planner settings and click **Generate Bitstream** in the bottom-left panel. Wait for the green checkmark indicating bitstream generation succeeded.

   ![Bitstream generation completed with green checkmark](./images/bitstream_gen/bitstream_done.png)

:::{note}
The bitstream file to upload to your Shrike board is named `FPGA_bitstream_MCU.bin` inside your project's `ffpga/build/bitstream/` directory. Do not upload other files from that folder, or the FPGA will not configure. You are free to rename `FPGA_bitstream_MCU.bin` after copying it.
:::

## Next Steps

- **Flash your new bitstream:** Follow Step 4 in **[Getting Started (Blink LED)](./getting_started.md)** (or use the [Shrike CLI Guide](./shrike_cli_guide.md)) to load `FPGA_bitstream_MCU.bin` onto your Shrike board.
- **Go deeper with ForgeFPGA Verilog:** Continue to the **[ForgeFPGA Verilog & Synthesis Reference](./verilog_style_guide.md)** to learn about synthesis attributes, output enables, and bidirectional (`inout`) pins.
