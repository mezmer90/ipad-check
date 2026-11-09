/* Checklist data for the used iPad (A16) inspection. */
window.IPC_DATA = (function () {
  var PHOTO = "From seller photos, reconfirm in person.";
  var WIFI_NA = "N/A: this is a Wi-Fi model ({part}), so there is no IMEI or SIM.";
  var PRESET = {
    i1: { st: "ok", note: "{part}, India Wi-Fi model. " + PHOTO + " Tap Model Number to see A3354." },
    i3: { pending: true, note: "Pending: still signed in as {acct}. Seller must sign out and erase in front of you." },
    i5: { st: "ok", note: "Limited Warranty to {warranty} per seller screen. " + PHOTO },
    i6: { st: "na", note: WIFI_NA },
    i8: { st: "ok", note: "{storage}. " + PHOTO },
    i9: { pending: true, note: "Pending: account on the iPad is {acct}. Seller's name should match this and the invoice, or they should explain why not." },
    p2: { st: "ok", note: "No visible damage in seller photos. " + PHOTO },
    p4: { st: "ok", note: "No visible damage in seller photos. " + PHOTO },
    s1: { st: "na", note: WIFI_NA }, s2: { st: "na", note: WIFI_NA }, s3: { st: "na", note: WIFI_NA }, s4: { st: "na", note: WIFI_NA },
    y1: { st: "ok", note: "Normal, 96% maximum capacity, 91 cycles, 80% limit on. " + PHOTO },
    y2: { st: "ok", note: "First use Jan 2026 fits a warranty ending {warranty}. " + PHOTO },
    y3: { st: "ok", note: "Battery Health shows Normal. " + PHOTO },
    o1: { note: "Seller photos show iPadOS 27.0. Still run Software Update to confirm it checks fine." },
    o3: { pending: true, note: "Pending: do this at the meetup, before any payment." },
    h1: { pending: true, note: "Pending: {acct}'s Apple Account must be removed before you pay." }
  };
  /* test: which built-in test covers the item */
  var SECTIONS = [
    { id: "before", title: "Before you meet", items: [
      { id: "b1", sev: "imp", t: "Seller shared model and serial number", how: "Ask for a screenshot of Settings > General > About. Model number should be A3354 (Wi-Fi) or A3355 (Wi-Fi + Cellular). A3356 is a China mainland model." },
      { id: "b2", sev: "imp", t: "Serial checked on checkcoverage.apple.com", how: "Enter the serial at checkcoverage.apple.com. It should show iPad (A16) and the warranty or AppleCare+ status. A different model or a story that does not match is a red flag." },
      { id: "b3", sev: "imp", t: "Price is sane for storage and model", how: "See the price notes in the This iPad tab. Compare with other used listings for the same storage and Wi-Fi or Cellular." },
      { id: "b4", sev: "imp", t: "Original invoice and box are available", how: "Ask if the invoice is from Apple or an authorised reseller and shows the serial number. Ask where it was bought." },
      { id: "b5", sev: "imp", t: "Seller seems genuine", how: "Real name, consistent chat history, a clear reason for selling, and happy to let you test everything before paying." },
      { id: "b6", sev: "imp", t: "Meetup planned in a safe public place", how: "Daytime, a busy place with Wi-Fi or your hotspot, ideally with a friend. Avoid going to an unknown private address." },
      { id: "b7", sev: "nice", t: "Testing kit packed", how: "This app on your phone, a USB-C charger or power bank, USB-C cable, a USB-C pen drive, earphones, and an Apple Pencil if you own one." }
    ]},
    { id: "identity", title: "Identity and ownership", items: [
      { id: "i1", sev: "deal", t: "Model number is A3354 or A3355", how: "Settings > General > About > Model Number. Tap it to switch from the part number to the A number." },
      { id: "i2", sev: "deal", t: "Serial matches on device, box and invoice", how: "Settings > General > About > Serial Number should read {serial}. Compare it with the box label and the invoice, character by character." },
      { id: "i3", sev: "deal", t: "Find My and Activation Lock are off", how: "Settings > [seller name] > Find My > Find My iPad must be Off. Best proof: seller signs out of their Apple Account and you erase the iPad in front of you. Setup must not ask for the previous owner's Apple Account." },
      { id: "i9", sev: "imp", t: "Seller is the account and invoice owner", how: "Compare the name on the Apple Account, the invoice and the seller's own name." },
      { id: "i4", sev: "deal", t: "No device management (MDM)", how: "Settings > General > VPN & Device Management should show no management profile, and setup should show no Remote Management screen. A managed iPad usually belongs to a company or school." },
      { id: "i5", sev: "imp", t: "Warranty status matches the seller's claims", how: "The checkcoverage.apple.com result should match what the seller said about purchase date and AppleCare+." },
      { id: "i6", sev: "deal", t: "IMEI is clean (Cellular model only)", how: "Settings > General > About > IMEI. Check it on sancharsaathi.gov.in (Know Your Mobile) or SMS KYM <15 digit IMEI> to 14422." },
      { id: "i7", sev: "imp", t: "Parts and Service History is clean", how: "Settings > General > About. This section only appears if a part was replaced or is not working as expected. On this model it covers Touch ID. Unknown means a non-genuine or unverified part." },
      { id: "i8", sev: "imp", t: "Storage matches the listing", how: "Settings > General > About > Capacity." }
    ]},
    { id: "body", title: "Physical body and display", items: [
      { id: "p1", sev: "deal", t: "Frame is not bent", how: "Lay it screen up on a flat table and press the corners. It should not rock. Look along each edge for curves." },
      { id: "p2", sev: "deal", t: "No cracks or chips in the screen glass", how: "Check under bright light, especially corners and edges." },
      { id: "p3", sev: "deal", t: "Screen is not lifting or bulging", how: "Look for gaps between glass and frame or a raised area. This can mean a swollen battery or a reopened device." },
      { id: "p4", sev: "imp", t: "No dents or deep scratches on the body", how: "Check corners, edges and the back. Note anything for price negotiation." },
      { id: "p5", sev: "imp", t: "No dead or stuck pixels", how: "Run the colour test. Look for dots that stay one colour.", test: "colours" },
      { id: "p6", sev: "imp", t: "No backlight bleed or patches", how: "Full brightness, black screen in the colour test, in a dim spot. Look for bright edges, yellow tint, blotches or pressure marks.", test: "colours" },
      { id: "p7", sev: "deal", t: "Touch works on every part of the screen", how: "Run the touch grid until it reaches 100%, or draw across the whole screen in Notes.", test: "touch" },
      { id: "p8", sev: "imp", t: "No signs of repair or opening", how: "Uneven glass seating or glue marks can mean it was opened." },
      { id: "p9", sev: "nice", t: "True Tone and auto brightness work", how: "Control Center > press and hold brightness > True Tone toggles the colour warmth." }
    ]},
    { id: "buttons", title: "Buttons and Touch ID", items: [
      { id: "t1", sev: "imp", t: "Top button works", how: "Press to sleep and wake. It should click cleanly and not stick." },
      { id: "t2", sev: "imp", t: "Volume buttons work", how: "Both buttons on the side change volume with a clean click." },
      { id: "t3", sev: "deal", t: "Touch ID enrolls and unlocks", how: "After the erase, add your fingerprint during setup or in Settings > Touch ID & Passcode. Lock and unlock several times." },
      { id: "t4", sev: "nice", t: "Screenshot combo works", how: "Press top button and volume up together." }
    ]},
    { id: "ports", title: "Ports and charging", items: [
      { id: "c1", sev: "deal", t: "Charges over USB-C", how: "Plug in a charger. The battery icon should show charging. The cable should sit firmly." },
      { id: "c2", sev: "imp", t: "Charging is steady", how: "Battery percentage should rise over 5 to 10 minutes. Gently wiggle the cable: charging should not cut in and out." },
      { id: "c3", sev: "nice", t: "Port is clean and undamaged", how: "Use a flashlight. Look for lint, corrosion or damage inside the port." },
      { id: "c4", sev: "nice", t: "Data works over USB-C", how: "Plug in a USB-C pen drive and open it in the Files app. This model uses USB 2.0 speeds, so slow transfers are normal." }
    ]},
    { id: "audio", title: "Speakers and microphones", items: [
      { id: "a1", sev: "imp", t: "Both stereo speakers work", how: "Run Left, Right and Sweep in the speaker test holding the iPad in landscape. No crackle at high volume.", test: "speakers" },
      { id: "a2", sev: "imp", t: "Microphone records clearly", how: "Use the mic test or Voice Memos: record, play back, should be clear and not muffled.", test: "mic" },
      { id: "a3", sev: "nice", t: "Video recording has sound", how: "Record a short video while talking and play it back." },
      { id: "a4", sev: "nice", t: "Bluetooth audio works", how: "Pair earphones and play something." }
    ]},
    { id: "cameras", title: "Cameras", items: [
      { id: "k1", sev: "imp", t: "Front camera works", how: "The front camera sits on the landscape edge. Use the camera test, then take a photo and a video in the Camera app. Check focus and look for spots or haze.", test: "camera" },
      { id: "k2", sev: "nice", t: "Center Stage follows you", how: "On a FaceTime video call, open Control Center > Video Effects > Center Stage. Move around and the frame should follow." },
      { id: "k3", sev: "imp", t: "Rear camera works", how: "Use the camera test, then take photos in the Camera app, tap to focus near and far, record 4K video. No blur patches, dust spots, or clicking from the lens.", test: "camera" },
      { id: "k4", sev: "imp", t: "Camera lens glass is not cracked", how: "Check the rear lens closely under light." },
      { id: "k5", sev: "nice", t: "No rear flash is normal", how: "This model's rear camera has no flash. The front camera uses Retina Flash, where the screen lights up." }
    ]},
    { id: "wireless", title: "Wi-Fi, Bluetooth and location", items: [
      { id: "w1", sev: "deal", t: "Wi-Fi connects and browses", how: "Join your hotspot, open fast.com and a video. Connection should not drop." },
      { id: "w2", sev: "imp", t: "Bluetooth finds and pairs devices", how: "Settings > Bluetooth. Pair earphones, a speaker or a keyboard." },
      { id: "w3", sev: "imp", t: "Location is roughly correct in Maps", how: "This Wi-Fi model locates using Wi-Fi, so it needs a Wi-Fi connection." },
      { id: "w4", sev: "nice", t: "Rotation and sensors work", how: "Screen rotates when turned. Use the motion test or the Measure app Level.", test: "motion" }
    ]},
    { id: "cellular", title: "Cellular (not on this iPad)", collapsed: true, items: [
      { id: "s1", sev: "imp", t: "eSIM only, no SIM tray", how: "Cellular models have no physical SIM tray." },
      { id: "s2", sev: "imp", t: "Cellular settings present", how: "Settings > Cellular on Cellular models." },
      { id: "s3", sev: "imp", t: "Seller's eSIM plan removed", how: "Settings > Cellular on Cellular models." },
      { id: "s4", sev: "imp", t: "No carrier restrictions", how: "Only relevant to Cellular models." }
    ]},
    { id: "accessories", title: "Apple Pencil and keyboard", items: [
      { id: "e1", sev: "nice", t: "Know which Pencils work", how: "Works with Apple Pencil (USB-C) and Apple Pencil (1st generation) using the USB-C to Apple Pencil Adapter. Not with Apple Pencil (2nd generation) or Apple Pencil Pro." },
      { id: "e2", sev: "imp", t: "Pencil writes smoothly (if available)", how: "Pair it and use the Pencil pad test or Notes. Check lines follow the tip, palm rejection works, and there are no dead spots.", test: "pencil" },
      { id: "e3", sev: "nice", t: "Keyboard works (if included)", how: "Magic Keyboard Folio attaches to the Smart Connector on the left side. Test every key and the trackpad." },
      { id: "e4", sev: "nice", t: "Included accessories look genuine", how: "Check cable, adapter and Pencil for Apple markings and build quality." }
    ]},
    { id: "battery", title: "Battery", items: [
      { id: "y1", sev: "imp", t: "Battery Health looks good", how: "Settings > Battery > Battery Health. Apple designs iPad batteries to keep 80 percent capacity at 1000 complete cycles." },
      { id: "y2", sev: "imp", t: "First use date fits the seller's story", how: "Compare the first use date in Battery Health with the invoice date." },
      { id: "y3", sev: "imp", t: "No service recommendation", how: "Battery Health should not show a message recommending service." },
      { id: "y4", sev: "imp", t: "Drain test is normal", how: "Full brightness, play a video for 10 to 15 minutes. A fast drop, jumps in percentage or sudden shutdown are warning signs." },
      { id: "y5", sev: "imp", t: "Does not overheat", how: "It may get warm while charging or under load but should not get hot to hold." }
    ]},
    { id: "software", title: "Software", items: [
      { id: "o1", sev: "imp", t: "iPadOS can update", how: "Settings > General > Software Update should check fine." },
      { id: "o2", sev: "imp", t: "No signs of jailbreak", how: "No unfamiliar app stores or system tweak apps." },
      { id: "o3", sev: "deal", t: "Erased and set up in front of you", how: "Settings > General > Transfer or Reset iPad > Erase All Content and Settings. The seller enters their Apple Account password if asked. Setup must show no Activation Lock and no Remote Management screen." },
      { id: "o4", sev: "nice", t: "Runs smoothly", how: "Open a few apps, switch between them, scroll. No lag, freezing or crashes." }
    ]},
    { id: "handover", title: "Final handover and payment", items: [
      { id: "h1", sev: "deal", t: "Seller removed the iPad from their Apple Account", how: "The seller signs out on the iPad and removes it from their device list. Erase must be done before you pay." },
      { id: "h2", sev: "deal", t: "No advance or token payment", how: "Pay only after every check passes and the iPad is erased and in your hands." },
      { id: "h3", sev: "imp", t: "Pay by UPI or bank transfer to the seller's own name", how: "Confirm the name shown in your UPI app matches the seller before you send. Keep the transaction screenshot." },
      { id: "h4", sev: "imp", t: "Invoice and a simple sale note collected", how: "Original invoice, plus a short signed note with seller name, contact, serial {serial}, price and date." },
      { id: "h5", sev: "nice", t: "Box, cable, adapter and accessories collected", how: "Everything that was listed in the ad." },
      { id: "h6", sev: "imp", t: "Signed in with your Apple Account and Find My on", how: "Set it up with your own account and turn on Find My iPad right away." }
    ]}
  ];
  return { PRESET: PRESET, SECTIONS: SECTIONS };
})();
