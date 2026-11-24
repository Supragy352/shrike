(getting_started)=

# Getting Started (Blink LED)

In this guide, you will flash Shrike's host microcontroller and blink the onboard FPGA LED using a pre-built bitstream (`led_blink.bin`).

:::{note}
If you have not installed Arduino IDE, Thonny IDE, or `esptool` yet, complete **[Tools Setup](./tools_setup_guide.md)** first.
:::

Choose your preferred microcontroller environment below — all three are beginner-friendly and you can switch between them at any time.

:::::::{tab-set}

::::::{tab-item} Arduino IDE (C/C++)
:sync: mcu-arduino

If you already know Arduino and prefer working in **Arduino IDE 2.x**, follow the steps below to configure board support, LittleFS upload support, and the Shrike library. (Need Arduino IDE? See [Tools Setup](./tools_setup_guide.md).)

## Step 1. Add Board Support

Arduino IDE does not bundle RP2040, RP2350, or ESP32-S3 cores by default. Add the board manager URL for your Shrike variant under **File → Preferences → Additional Boards Manager URLs**:

:::::{tab-set}

::::{tab-item} Shrike / Shrike-lite
:sync: shrike-rp

```text
https://github.com/earlephilhower/arduino-pico/releases/download/global/package_rp2040_index.json
```

::::

::::{tab-item} Shrike-fi
:sync: shrike-fi

```text
https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
```

::::

:::::

If you already have another URL listed, separate multiple URLs with a comma (`,`).

![Adding the Shrike board manager URL in Arduino IDE Preferences](./images/shrike_arduino/board_URL.png)

Next, open **Tools → Board → Boards Manager**:

:::::{tab-set}

::::{tab-item} Shrike / Shrike-lite
:sync: shrike-rp

Search for **pico** and install **Raspberry Pi Pico/RP2040/RP2350 by Earle F. Philhower, III** (see [earlephilhower/arduino-pico](https://github.com/earlephilhower/arduino-pico)).

![Installing the Earle Philhower RP2040/RP2350 board package in Arduino Boards Manager](./images/shrike_arduino/board_manager.png)

::::

::::{tab-item} Shrike-fi
:sync: shrike-fi

Search for **ESP32** and install **esp32 by Espressif Systems**.

::::

:::::

## Step 2. Install the LittleFS Upload Tool

On Shrike, the host MCU stores FPGA bitstreams in its onboard flash using the **LittleFS** filesystem and loads them into the FPGA at runtime.

1. Download the latest release ZIP of [arduino-littlefs-upload](https://github.com/earlephilhower/arduino-littlefs-upload/releases).
2. Follow the [Arduino IDE 2 LittleFS plugin installation guide](https://randomnerdtutorials.com/arduino-ide-2-install-esp32-littlefs/) (works for both RP2040/RP2350 and ESP32-S3 boards).
3. Restart Arduino IDE. You can verify installation by opening the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and searching for **LittleFS**.

For full plugin details, see the [arduino-littlefs-upload repository](https://github.com/earlephilhower/arduino-littlefs-upload).

## Step 3. Install the Shrike Library

Open **Library Manager** in Arduino IDE, search for **Shrike**, and install the official **Shrike** library developed by Vicharak.

![Installing the Shrike library in Arduino IDE Library Manager](./images/shrike_arduino/shrike_lib.png)

## Step 4. Flash Your First FPGA Bitstream

1. In Arduino IDE, open **File → Examples → Shrike → shrike_flash** and save a copy to a folder of your choice.
2. Inside that saved sketch folder, create a subfolder named `data` (lowercase).
3. Download the pre-built LED blink bitstream [`led_blink.bin`](https://github.com/vicharak-in/shrike/blob/main/test/bitstreams/v1_4/led_blink.bin) and place it inside the `data/` folder.
4. Click **Verify (Compile)** to make sure the sketch builds without errors.
5. Connect your board in bootloader mode (**hold the `BOOT` button while plugging in USB** — only needed on first Arduino flash or when switching from MicroPython/CircuitPython).
6. Configure your board settings under **Tools**:

:::::{tab-set}

::::{tab-item} Shrike / Shrike-lite
:sync: shrike-rp

- **Board:** `VICHARAK Shrike Lite` or `VICHARAK Shrike`
- **Flash Size:** `4MB (Sketch: 2MB, FS: 2MB)`
- **CPU Speed:** `125 MHz`

::::

::::{tab-item} Shrike-fi
:sync: shrike-fi

- **Board:** `Generic ESP32-S3` (or matching ESP32-S3 variant)
- **Flash Size:** `8MB (Sketch: 4MB, FS: 4MB)`

::::

:::::

7. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`), run **Build LittleFS**, and then run **Upload LittleFS** to copy `data/led_blink.bin` to flash.
8. Click **Upload** to flash the sketch. Once uploaded, the onboard blue FPGA LED should start blinking.

:::{tip}
Credit and gratitude to [Earle F. Philhower, III](https://github.com/earlephilhower/) for maintaining `arduino-pico` and `arduino-littlefs-upload`. If you run into upload or compile issues, reach out on the [Vicharak Discord](https://discord.com/invite/EhQy97CQ9G).
:::

::::::

::::::{tab-item} MicroPython
:sync: mcu-python

Shrike uses a custom MicroPython firmware image that includes the built-in `shrike` module for flashing and resetting the FPGA.

## Step 1. Flash the Shrike MicroPython Firmware

:::::{tab-set}

::::{tab-item} Shrike / Shrike-lite
:sync: shrike-rp

1. Download the `.uf2` firmware matching your board variant from [Shrike Releases](https://github.com/vicharak-in/shrike/releases/).
2. Hold the **`BOOT`** button while connecting Shrike to your computer over USB. The board mounts as a USB mass-storage drive.
3. Drag and drop the downloaded `.uf2` file onto that drive.
4. The drive disconnects automatically once flashing finishes.

Need a visual reference for UF2 drag-and-drop? See this [generic RP2040 UF2 flashing walkthrough](https://www.youtube.com/watch?v=os4mv_8jWfU).

:::{note}
After flashing the `.uf2`, Shrike reconnects as both a serial (`ttyACM` / `COM`) device and a USB mass-storage device (default label `5221-0000`, which you can rename normally on Windows or via `fatlabel` on Linux).
:::

::::

::::{tab-item} Shrike-fi
:sync: shrike-fi

1. Download the ESP32-S3 `.bin` firmware from [Shrike Releases](https://github.com/vicharak-in/shrike/releases/).
2. Install `esptool` (see [Tools Setup](./tools_setup_guide.md) or the [Python `venv` guide](https://docs.python.org/3/library/venv.html)):

   ```bash
   pip install esptool
   ```

3. Erase existing flash:

   ```bash
   python -m esptool erase_flash
   ```

4. Write the Shrike-fi MicroPython firmware:

   ```bash
   python -m esptool --chip esp32s3 -b 460800 --before default_reset --after hard_reset write_flash --flash_mode dio --flash_size 4MB --flash_freq 80m 0x0 firmware.bin
   ```

::::

:::::

## Step 2. Download the Test Bitstream

Download the pre-built `led_blink.bin` matching your board revision from [`test/bitstreams`](https://github.com/vicharak-in/shrike/tree/main/test/bitstreams).

## Step 3. Connect with Thonny IDE (or CLI)

You can upload bitstreams and run MicroPython code either via **Thonny IDE** (below) or via the terminal using **`mpremote`** (see the [Shrike CLI Guide](./shrike_cli_guide.md)).

1. Open **Thonny** (see [Tools Setup](./tools_setup_guide.md) if not yet installed) and connect Shrike over USB **without** holding `BOOT`.
2. Select the MicroPython interpreter for your board in the bottom-right corner of Thonny.
3. Open **View → Files** so you can see both your computer's files and Shrike's onboard filesystem.

## Step 4. Upload and Flash the Bitstream

1. In Thonny's **Files** pane, right-click `led_blink.bin` on your computer and choose **Upload to /**.
2. Create a new Python script in Thonny:

   ```python
   import shrike

   shrike.flash("led_blink.bin")
   ```

3. Save the script to your Shrike board and run it (name it `main.py` to auto-flash the FPGA on every boot). The onboard FPGA LED should start blinking.

:::{note}
When using your own custom Go Configure project, the bitstream file to copy is named `FPGA_bitstream_MCU.bin` inside your project's `ffpga/build/bitstream/` directory. You may rename the file after copying it, as long as you pass the same name to `shrike.flash(...)`.
:::

::::::

::::::{tab-item} CircuitPython

CircuitPython (by Adafruit) is a beginner-friendly Python implementation closely related to MicroPython. Shrike provides a custom CircuitPython `.uf2` build with the built-in `shrike` FPGA library.

## Step 1. Flash the Shrike CircuitPython Firmware

1. Download the CircuitPython `.uf2` matching your board from [Shrike Releases](https://github.com/vicharak-in/shrike/releases/).
2. Hold the **`BOOT`** button while connecting Shrike to your computer over USB.
3. Drag and drop the `.uf2` file onto the mounted bootloader drive.
4. Once copied, the drive unmounts and Shrike reboots as a CircuitPython mass-storage drive.

Need a visual reference? See this [generic RP2040 UF2 flashing walkthrough](https://www.youtube.com/watch?v=os4mv_8jWfU).

## Step 2. Copy the Test Bitstream

1. Download `led_blink.bin` for your board revision from [`test/bitstreams`](https://github.com/vicharak-in/shrike/tree/main/test/bitstreams).
2. Copy `led_blink.bin` directly onto Shrike's mounted USB drive.

## Step 3. Connect with Thonny IDE

1. Open **Thonny** (see [Tools Setup](./tools_setup_guide.md)) and connect Shrike over USB **without** holding `BOOT`.
2. Select the **CircuitPython** interpreter from the bottom-right corner of Thonny.

## Step 4. Flash the Bitstream

Create a new Python script in Thonny:

```python
import shrike

shrike.flash("led_blink.bin")
```

Save the file to your Shrike drive as `code.py` so CircuitPython runs it automatically on boot (or run it directly from Thonny).

:::{note}
When using your own custom Go Configure project, copy `FPGA_bitstream_MCU.bin` from your project's `ffpga/build/bitstream/` directory. You can rename it freely as long as the filename passed to `shrike.flash(...)` matches.
:::

::::::

:::::::

## Next Steps

Now that you have verified your board with the pre-built `led_blink.bin` bitstream, continue to **[Generating Your First Bitstream](./generating_your_first_bitstream.md)** to write and synthesize your own Verilog design in Go Configure Software Hub.
