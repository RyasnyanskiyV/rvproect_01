# Alpha Mask Scripts

## Main script

`TECH_ALPHA_MASK_GENERATOR_RAGGED_EDGES_v1.jsx`

After Effects 2022 ExtendScript panel for generating technological alpha masks with blocky ragged edges.

## Features

- transparent alpha-mask composition;
- default timing: 2 sec reveal, 2 sec work zone, 2 sec disappear;
- random square/rectangle technological mask structure;
- new random ragged perimeter on every seed;
- adjustable comp size, FPS, rows, columns, reveal preset, out preset;
- adjustable `Edge Depth %` and `Rough` controls;
- render-ready for `RGB+Alpha` or `Alpha Only`.

## Usage

In After Effects:

1. Open `File > Scripts > Run Script File...`.
2. Select `TECH_ALPHA_MASK_GENERATOR_RAGGED_EDGES_v1.jsx`.
3. Click `Generate Ragged Mask` or `New Random Ragged`.
4. Render the generated composition with alpha.

White cells are the visible mask; transparent areas remain empty.
