(generating_your_first_bitstream)=

# Shrike FPGA Bitstream Generation Guide 

Bitstream is a firmware that is used to programme the FPGA and map our design to it. Shrike uses a Renesas Forge FPGA SLGV SLG47910 1K Luts FPGA.The datasheet fr which can be found [here](https://www.renesas.com/en/products/slg47910) .


For generating the bitstream for shrike we will use these steps. 

  1. Setup 
  2. Design & Synthesis 
  3. IO Mapping and Placement and Routing (PNR)

I am here assuming that you have installed all the tools required if not check tools_setup_guide [HERE](./tools_setup_guide.md).

We will create a LED Blinking Project for this guide and we will start by launching the Go Configure Software Hub.  

## 1. Setup

1. Launch the GO Configure Software Hub and move to the Forge FPGA tab under the Develop Tab. 

<div align="center">

 <img src="./images/bitstream_gen/go_config_launch.png" alt="Go Configure Software Hub" width="90%">

</div>

2. Double click on the FPGA (SLG47910 (BB)) in our case.
NOTE: You can also just open the led blink project available in the Projects section of github that can be done from the open option in the bottom right corner and then navigate to the ffpga file of that project. 

<div align="center">

 <img src="./images/bitstream_gen/fpga_selection.png" alt="shrike" width="90%">

</div>

3. Now select the project name and project location of your choice. 

<div align="center">

 <img src="./images/bitstream_gen/project_path.png" alt="shrike" width="90%">

</div>

4. Now you will see the "Project setting" window select the first values in each box by clicking the arrow beside it.
It should look like this.

<div align="center">

 <img src="./images/bitstream_gen/project_setting.png" alt="shrike" width="90%">

</div>

5. Double click on the light blue square (FPGA Core) in and you should see this window. Now you are done with setup lets design our blink led hardware.    

<div align="center">

 <img src="./images/bitstream_gen/empty_main.png" alt="shrike" width="90%">

</div>

Check out this short video guide.

:::{raw} html
<div align="center">
  <video width="90%" controls>
    <source src="_static/media/go_config_launch.webm" type="video/webm">
    Your browser does not support the video tag.
  </video>
</div>
:::

## 2. Design

Now we will how we can design a led_blink hardware. 

So as of now we are aware that we need a led that should be blinked so lets declare that in verilog. 

```
module led_blink (output led,
                  output led_en);
endmodule
```

Now every output requires a output enable for forge FPGA thus we will define a led_en pin as well and we will keep it high ( value = 1) by default so that led signal ( IO) is always a output from the board.

We need to figure out a way to so how are we going to blink ( toggle ) this led , for convenience lets assume we want to blink it every second . So this tell's us that we need some kind of clock to check the time and how much time has passed. 

We have a clock on out FPGA it is a pulsating signal that creates a 50Mhz square wave, we have to use this to calculate one second to do so we can simply add a counter that counts till 50_000_000 cycles as that how much we will require to reach one second at a 50 Mhz frequency. 

Thus now we will create a hardware that blinks a led whenever its counter reaches 50_000_000 and the verilog for this will look like this 


```
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
  
  always @ (posedge clk) begin
    counter <= counter + 1'b1;
    if (counter == 50_000_000) begin
      LED_status <= !LED_status;
      counter <= 32'b0;
    end
  end

  assign LED = LED_status;

endmodule 

```




There are a lot other ways to blink an led as well and you can always use those however before writing verilog for shrike please checkout [Style Guide](./verilog_style_guide.md) for reference .

However here we are assuming that you are using the code mentioned above . Get this code in the main.v in the software.

<div align="center">

 <img src="./images/bitstream_gen/mainv_code.png" alt="shrike" width="90%">

</div>

Now the next step will be to synthesize the verilog for doing so click the button in the bottom left corner. It should take a minute and then you will a green tick beside it that should tell you that synthesis has happens without any error. 


Now we will move to IO planning and bitstream generation. 

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
