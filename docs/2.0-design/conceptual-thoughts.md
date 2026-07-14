# Design Concepts for 2.0

The current version of the app is based around the contrast pairs list, in both the WCAG and APCA modes. Colours are always displayed in pairs as they don't really exist beyond this arrangement (accepting the left-hand stack of swatches).

The 2.0 app is fundamentally changing this to an arrangement of individual swatches that allow a more focused application of the contrast auditing functionality. The intention is to cut out all the noise of never-used combinations and provide contrast information for real-world applications of the palette colours.

The grouping into roles is important for this. There also needs to be a mechanism for quickly showing contrasts between two colours while still maintaining the role groups arrangement. Some kind of overlay connecting the two swatches (a line between them with a floating contrast result component halfway? Or a dedicated test panel: select two colours and the test panel becomes the focus).

To complement the roles focus, we also need some kind of semi-realistic component/page mockup. Here's what foreground/background/etc colours look like when applied to actual text, spaces and components. Two colours side-by-side, or even basic text against a background in the case of the APCA mode doesn't really give a proper feel for how the colours would really work.

The colour swatch generation process also needs redesigned. The naming and assigning of roles is almost as important now as setting the correct hex value. Maybe an "unassigned" list of swatches that can then be dragged and dropped into the various role zones. That would assume a certain amount of real estate avaible to show all the zones at once, though. Maybe tags clickable during the creation process would be a more practical approach.