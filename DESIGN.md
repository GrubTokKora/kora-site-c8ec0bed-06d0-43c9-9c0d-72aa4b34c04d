<!-- Design decision for Marigold (PROD). Hand-built by Claude Code (Marigold/kora-source), homepage + 404. -->

# DESIGN.md: Marigold

archetype: saffron-teal-editorial
interaction_level: L2

typography:
  display: "Gloock"          # high-contrast editorial serif; no italics, emphasis by colour
  body: "Hanken Grotesk"
  note: The original site's Italiana + Barlow were retired at the owner's request.

palette:
  primary: "#FE6B25"   # exact CTA/logo orange from the original site (buttons, marquee, stamp)
  secondary: "#0D4948" # exact brand green from the original site (solid header, footer, bands)
  accent: "#FB5101"    # exact accent orange from the original site (eyebrows, prices, stars, emphasis)
  application: |
    Owner asked for the exact original colours (2026-10-14). White #FFFFFF ground (was cream #FBF6EE), paper #FFFCF7 and sand #F2E8D8
    bands, ink #1E1A16 text, muted #554B41, saffron gold #F2B441 on green. Card surfaces inside green bands use #0A3B3A.
    Header: solid #0D4948 with bold white nav links; mobile header shows bold Facebook / Instagram / Google icons.
    Buttons and every white-on-orange surface use #D04401 (same hue as #FE6B25, darkened for WCAG AA 4.66:1; owner-approved
    2026-10-14); hover #B33A01. #FE6B25 stays for logo-matching accents (rules, step numbers, icon hovers).

composition: |
  Announcement bar (rotating) > transparent header that turns solid and hides on scroll > clean full-screen
  video hero (original full-length film, play/pause + sound buttons bottom-left; H1 and hero copy are visually
  hidden but in the DOM, like the original site's video-only hero) > dish marquee > arched chef story (about) > tabbed menu with a
  sticky hover preview > 3 teal cards (award-winning Michelin chef / modern Indian cuisine / catering) >
  happy hour card + weekend early bird + rotating stamp > reviews (4.9 count-up, featured quote) > reservation
  band > catering feature > private parties feature > order-online band > press (Forbes, Westchester Magazine)
  > filmstrip gallery > catering/party inquiry form > FAQ > visit (hours with today highlighted, map) > footer
  + mobile action bar (Call / Reserve / Order online).

motion: |
  Hero video slow zoom-out and pauses when scrolled away; scroll reveals fade up with stagger; key images open
  with a clip-path wipe; gentle parallax on 5 images (desktop); marquee and filmstrip loops pause on hover;
  rotating rosette and stamp; FAQ height animation. Everything respects prefers-reduced-motion (video starts paused).

content_rules:
  - Credit Chef Ravi only (owner decision, 2026-10-14); no other chef names anywhere, including the menu.
  - Keep the "Award winning / Michelin chef" claim (owner decision).
  - Happy hour is Mon–Thu 4:30–7 PM (owner-confirmed).
  - Reservations go to Resy / Yelp / phone; no reservation form. Catering and private-party inquiries use the Kora form
    (form_type catering_inquiry | private_party_inquiry).
  - Menu typos fixed and duplicates removed (see Marigold/research/data/menu.clean.CHANGES.txt).
  - No links to spotapps.co (Kora's growth scan flags it as an ordering aggregator) and no links to marigold.restaurant.
