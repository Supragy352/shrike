(shrike_cli_guide)=

# Shrike CLI Guide (`mpremote`)

If you prefer staying in the terminal like our team at [Vicharak](https://vicharak.in), you can upload files, run MicroPython scripts, and flash FPGA bitstreams to Shrike directly from the command line using MicroPython's official **`mpremote`** tool.

:::{note}
Before using the CLI workflow, flash the Shrike MicroPython firmware onto your board by following Step 1 in **[Getting Started (Blink LED)](./getting_started.md)**.
:::

## 1. Setting Up Python `venv` and `mpremote`

`mpremote` is a Python package installed via `pip`. Create and activate a Python virtual environment (or reuse an existing one — see the [Python `venv` documentation](https://docs.python.org/3/library/venv.html)), then install `mpremote`:

```bash
pip install mpremote
```

:::{tip}
If you run into installation or serial-port issues, reach out on the [Vicharak Discord](https://discord.com/invite/EhQy97CQ9G) or open an issue on [Shrike GitHub](https://github.com/vicharak-in/shrike/issues).
:::

Now let's test the connection by blinking an LED from the terminal.

## 2. Blinking the CPU LED

To check out how `mpremote` works, we will first blink the LED connected to the RP2040/RP2350 and then flash the `led_blink.bin` bitstream onto the FPGA.

To blink the onboard MCU LED on Shrike / Shrike-lite (RP2040 / RP2350), save the following Python script as `test_led.py` on your computer:

```python
from machine import Pin
import time

led = Pin(4, Pin.OUT)  # Onboard MCU LED on GPIO 4 (Shrike / Shrike-lite)

while True:
    led.toggle()       # Switch LED state
    time.sleep(0.5)
```

Run the script on the board with:

```bash
mpremote run test_led.py
```

If you have multiple Shrike or RP2040 boards connected, specify the serial port explicitly:

```bash
mpremote connect port:<port path> run test_led.py
```

You should see the onboard MCU LED blinking on Shrike.

You can also open an interactive MicroPython REPL on the board by running:

```bash
mpremote
```

## 3. Uploading the Bitstream to Shrike

To flash the FPGA with a bitstream, first copy the `.bin` file to Shrike's onboard filesystem using `mpremote cp`. You can download the pre-built `led_blink.bin` matching your board revision from [`test/bitstreams`](https://github.com/vicharak-in/shrike/tree/main/test/bitstreams/).

```bash
mpremote cp led_blink.bin :
```

:::{note}
Do not omit the trailing `:` — it tells `mpremote` to copy the file onto the board's root filesystem.
:::

Verify the file was copied:

```bash
mpremote ls
```

## 4. Flashing the FPGA

To load the uploaded bitstream into the FPGA, run the following Python script:

```python
import shrike

# shrike.flash("<bitstream_name>.bin")
shrike.flash("led_blink.bin")
```

You can run this script with `mpremote run` as in Step 2, or open the REPL with `mpremote` and enter the lines interactively.

Once the FPGA is flashed, you should see the onboard FPGA LED blinking.

## Further Reading

- [`mpremote` official documentation](https://docs.micropython.org/en/latest/reference/mpremote.html)
- [MicroPython `mpremote` tips & workflow discussion](https://github.com/orgs/micropython/discussions/9096)