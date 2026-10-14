# Site index · format 2
Structure and the names of what each page offers. Values that change often — prices, hours, phone,
address — and body copy are deliberately not recorded here; read the page itself for those.

## index.html → /
title: Marigold | Modern Indian Restaurant in Eastchester, NY
purpose: Homepage of Marigold, a modern Indian restaurant in Eastchester, NY: video hero, welcome story, signature menu, specials, Google reviews, reservations, catering, private parties, online ordering, press, room gallery, catering/party inquiry form, FAQ, hours and map.
sections:
- `#top` "Modern Indian restaurant in the heart of Eastchester, NY" — full-screen video hero with play/pause and sound controls; the H1 and hero copy are visually hidden
- `#about` — welcome story (original site copy), plate image between two paragraphs, link to the Our Story page
- `#menu` — tabbed signature dishes with prices and a sticky photo preview, lunch and dual-pricing note
- `#craft` — three cards: award-winning Michelin chef, modern Indian cuisine, catering
- `#specials` "Happy hour, four days a week." — happy hour card with $7 appetizers, weekend early bird, link to the specials page
- `#reviews` "What our guests say" — Google rating with count-up and four guest review quotes
- `#reserve` — reservation band with Resy and Yelp buttons and the phone number
- `#catering` "Let the food be the star of your event." — catering feature: full-service and drop-off cards, event types, inquiry button
- `#parties` "Host your next celebration at Marigold." — private party feature with what is included and an inquiry button
- `#order` "Fine dining at home? Yes, it's possible." — online ordering band linking to the restaurant's ordering site
- `#press` "As featured in" — Forbes and Westchester Magazine press cards
- `#gallery` "Warm, intimate and unmistakably ours." — auto-scrolling filmstrip of dining room and dish photos
- `#inquire` "Tell us about your event." — catering / private-party inquiry form posting to the Kora forms API
- `#faq` "Frequently asked questions" — FAQ accordion
- `#visit` "434 White Plains Road, Eastchester." — address, contact, opening hours table with today highlighted, Google map
also: The inquiry form submit script is inline at the end of index.html, not in assets/site.js.
also: Hero copy and the H1 are visually hidden on purpose (owner wants a video-only hero).

## eastchester-marigold-food-menu.html → /eastchester-marigold-food-menu
title: Menu | Marigold Modern Indian Restaurant, Eastchester NY
purpose: Full Marigold menu: dinner, lunch and happy hour tabs with every dish and price.
sections:
- `#menu-hero` "Marigold Menu: Modern Indian Cuisine in Eastchester, NY" — photo hero with a single centred headline; descriptive H1 visually hidden
- `#full-menu` — Dinner / Lunch / Happy Hour tabs, dinner category bar with scroll-spy, dish lists with prices and photo lightbox, allergy and dual-pricing note
- `#menu-cta` — closing band with reserve, order online and catering buttons
also: The menu is generated from research/data/menu.clean.json by build_kora.py menu_page(); edit the data, not the HTML.

## eastchester-marigold-happy-hours-specials.html → /eastchester-marigold-happy-hours-specials
title: Specials & Happy Hour | Marigold, Eastchester NY
purpose: Specials page: weekly calendar, happy hour, weekend early bird and other specials.
sections:
- `#specials-hero` "Specials & Happy Hour at Marigold, Eastchester NY" — photo hero with a single centred headline
- `#week` "Something good, almost every day." — seven day cards with each day's specials and hours; today highlighted by script
- `#happy-hour` "Monday to Thursday, 4:30 to 7 PM." — happy hour card and the $7 appetizer cards with photos
- `#early-bird` "Three courses and a champagne toast." — weekend early bird flyer, facts and the 15% off note
- `#more-specials` "Hakka Noodles" — Wednesday Hakka Noodles card and a Google review prompt
- `#specials-cta` "Bring the whole table to happy hour." — closing band for groups with reserve and private parties buttons

## eastchester-marigold-reservations.html → /eastchester-marigold-reservations
title: Reservations | Marigold Indian Restaurant, Eastchester NY
purpose: Reservations hub: Resy, Yelp and phone booking options, hours, groups and FAQ.
sections:
- `#reservations-hero` "Reservations at Marigold Indian Restaurant, Eastchester NY" — photo hero with a single centred headline
- `#ways-to-book` "Choose whatever is easiest for you." — three booking cards (Resy recommended, Yelp, phone with live open status)
- `#plan-your-visit` "Lunch, dinner, or both." — lunch/dinner seating blocks and the opening hours table
- `#groups` "Six or more? Let's plan it together." — photo band for parties of six or more with occasion chips
- `#reservations-faq` "Reservation questions" — reservation FAQ accordion
- `#find-us` — address, contact details and Google map

## eastchester-marigold-reserve.html → /eastchester-marigold-reserve
title: Reserve with Yelp | Marigold, Eastchester NY
purpose: Reserve with Yelp: embedded Yelp booking widget with a phone and hours sidebar.
sections:
- `#yelp-hero` "Reserve a Table at Marigold, Eastchester NY, with Yelp" — photo hero with a single centred headline
- `#book-on-yelp` "Find your table" — three booking steps beside the embedded Yelp reservation widget, phone card and hours sidebar
- `#before-you-arrive` "A few things worth knowing." — three visit tips: happy hour, dietary notes, groups
- `#your-table` "Warm, intimate and made for lingering." — three room and dish photos with directions and menu links
also: The Yelp booking widget is a third-party iframe (yelp.com/reservations/marigold-eastchester/widget).

## eastchester-marigold-parties.html → /eastchester-marigold-parties
title: Private Parties & Events | Marigold, Eastchester NY
purpose: Private parties landing page: spaces, occasions, what is included, serving styles and booking steps.
sections:
- `#parties-hero` "Private Parties & Events at Marigold, Eastchester NY" — photo hero with a single centred headline
- `#host-with-us` "Groups of every size, one warm room." — intro with group tables, semi-private and full buyout options
- `#occasions` "Some of the moments we love to host." — six occasion cards on a green band
- `#what-we-provide` — six numbered inclusions
- `#packages` — banner photo and three serving styles (plated, buffet, family-style)
- `#guest-words` — guest testimonial quote
- `#next-steps` "Let's make your event unforgettable." — three booking steps with inquiry, call and email buttons
- `#parties-faq` "Planning a party at Marigold" — party FAQ accordion

## eastchester-marigold-party.html → /eastchester-marigold-party
title: Group Reservations & Party Inquiry | Marigold Eastchester
purpose: Group reservations page: dining room gallery and the private party inquiry form.
sections:
- `#party-hero` "Group Reservations & Private Party Inquiry at Marigold, Eastchester NY" — photo hero with a single centred headline
- `#the-space` "Take a look around the room." — six-photo dining room gallery with lightbox
- `#party-inquiry` "Book your private party today." — inquiry form preset to private party, posting to the Kora forms API, with contact details
also: The form submit script is inline at the end of the page.

## eastchester-marigold-cater.html → /eastchester-marigold-cater
title: Indian Catering for Events | Marigold, Eastchester NY
purpose: Catering landing page: services, events catered, menu by course, why Marigold, ordering steps and FAQ.
sections:
- `#cater-hero` "Indian Catering for Events by Marigold, Eastchester NY" — photo hero with a single centred headline
- `#services` "Full-service or drop-off, your choice." — full-service and drop-off catering cards with photos
- `#events-we-cater` — six event-type cards on a green band
- `#catering-menu` — banner photo, four course cards and dietary notes
- `#why-marigold` "Restaurant quality, wherever you are." — five numbered reasons
- `#catering-gallery` — four-photo strip of catering dishes
- `#how-to-order` "To start planning, tell us:" — checklist of details to send and a quote card with contacts
- `#catering-faq` "Good to know before you book" — catering FAQ accordion

## eastchester-marigold-catering.html → /eastchester-marigold-catering
title: Catering Inquiry | Fine Indian Catering, Eastchester NY
purpose: Catering inquiry page: guest-favorite dishes and the catering inquiry form.
sections:
- `#catering-hero` "Fine Indian Catering in Eastchester, NY: Catering Inquiry" — photo hero with a single centred headline
- `#catering-favorites` "Care and taste in every tray." — six round dish photos of catering favorites
- `#catering-inquiry` "Let's plan your menu." — inquiry form preset to catering, posting to the Kora forms API, with contact details
also: The form submit script is inline at the end of the page.

## eastchester-marigold-about-us.html → /eastchester-marigold-about-us
title: Our Story & Chef Ravi | Marigold, Eastchester NY
purpose: Our Story page about Marigold and Chef-Entrepreneur Ravi.
sections:
- `#about-hero` "About Marigold and Chef Ravi, Eastchester NY" — photo hero with a single centred headline
- `#meet-chef-ravi` — chef portrait and biography
- `#our-inspiration` — four regional dish cards (North, South, East, West)
- `#what-makes-us-special` "Four promises we keep, every service." — four photo cards about ingredients, ambience, dietary options and hospitality
- `#our-mission` — mission statement on a green band
- `#recognition` — three recognition stats: Google rating, Forbes, Michelin chef
- `#about-cta` — closing band with booking and directions buttons
also: Credit Chef Ravi only; no other chef names anywhere on the site (owner decision).

## eastchester-marigold-press.html → /eastchester-marigold-press
title: Press & Recognition | Marigold, Eastchester NY
purpose: Press page: the Forbes review, dishes it highlighted, other recognition and press contact.
sections:
- `#press-hero` "Marigold Press & Recognition, Eastchester NY" — photo hero with a single centred headline
- `#forbes` "Marigold named “one of the best in the tri-state region”" — Forbes feature card summarizing the review, with a link to the article
- `#as-reviewed` "Taste what Forbes tasted." — five dish cards the review highlighted
- `#more-recognition` "Loved by readers and regulars." — Westchester Magazine card and Google rating card
- `#press-cta` — press inquiries band with email and story links
also: The Forbes article is paraphrased; only a short headline phrase is quoted.

## eastchester-marigold-jobs.html → /eastchester-marigold-jobs
title: Jobs & Careers | Marigold Indian Restaurant, Eastchester NY
purpose: Jobs page: open roles and the job application form with resume upload.
sections:
- `#jobs-hero` "Jobs at Marigold Indian Restaurant, Eastchester NY" — photo hero with a single centred headline
- `#open-positions` "We are hiring!" — hiring intro and open role cards that preselect the form
- `#apply` "Join our team." — job application form with resume upload, posting multipart to the Kora forms submit-with-file API
also: The application submit script is inline at the end of the page and uses /api/v1/public/forms/submit-with-file.

## accessibility-page-01.html → /accessibility-page-01
title: Accessibility Statement | Marigold, Eastchester NY
purpose: Accessibility statement: WCAG AA commitment, site features, third-party content, feedback and assistance.
sections:
- `#a11y-hero` "Accessibility Statement" — plain green hero with the statement title
- `#statement` "Our commitment" — table of contents with scroll-spy and the statement sections with contact cards

## 404.html → /404
title: Page not found | Marigold, Eastchester NY
purpose: Platform not-found page (noindex) linking back to the homepage and the phone line.

## support files
Files that are not pages. A line marked [content] holds words or data a visitor reads, so a
change to the site's content can land there; the rest only make the site work or look right.
- `llms.txt` — business summary for AI crawlers: visit info, reserve and order links, specials, signature dishes, catering, press: Happy hour, Weekend early bird, Catering and private parties  [content]
- `robots.txt` — 90 bytes — too small to hold content
- `sitemap.xml` — sitemap listing every page (rewritten at deploy)
- `assets/site.js` — site behaviour: header state, mobile menu, reveals, menu tabs, video controls, open-now status, lightbox, scroll-spy

## shared (every page)
The header, navigation, mobile menu and footer are propagated from index.html to every other page by
`shell_propagation`. A change to any of them is made on index.html alone and copied automatically.
