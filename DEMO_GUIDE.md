# Presentation walkthrough

## A three-minute story

**0:00–0:25 — The problem**

“Most air-quality apps give us a number. BREATHEWISE turns environmental information into daily decisions for families and communities.”

Open Command center. Point to the **Demo** label, the US AQI gauge, forecast trend, lower-exposure window and source timestamp. Say explicitly: “These are illustrative demonstration values; the live connection uses regional model estimates, not fabricated sensor measurements.”

**0:25–0:55 — Personal relevance**

Open Family shield. Add an Outdoor worker profile. Show how the precautions differ from an adult profile. Then open Daily planner and generate a schedule for the sample activities. Show local-time morning/school/evening constraints and indoor alternatives.

**0:55–1:25 — Decisions with trade-offs**

Open Safer routes and compare the sample Kolkata journey. Switch from car to cycling and compare again. Explain why a lower emissions mode may still involve longer outdoor exposure. Show the mode-scenario table and the “not for navigation / no street-level safety claim” labels.

**1:25–1:55 — Home and impact**

In Clean air home, choose Kitchen and Cooking smoke; move budget and room area to show the filtration target and source-control guidance. In Eco impact, switch solo-car travel to a bus, adjust electricity savings and show the visible formulas.

**1:55–2:25 — Conversation with context**

Ask: “What should my family know about today’s air?” Show the response engine label. If Gemini is configured, explain context and session history; otherwise explicitly present the rules fallback and describe the supported server-side Gemini integration.

**2:25–3:00 — Community and trust**

Open Community, generate the report, then open Data & transparency. Close with: “The innovation is actionable, explainable decisions. We show what the data supports and where evidence ends.”

## Differentiators to emphasize

- An exposure/time/emission trade-off instead of a falsely certified “safe route.”
- Family sensitivity plus local-time activity planning.
- Practical source-control and budget-aware indoor guidance.
- Transparent, reproducible carbon math.
- Provider forecasts separated from AI interpretation.
- A functional demo that remains useful during provider outages.

## Before a live presentation

Run `npm test` and `npm run build`; use demo mode if the venue network is uncertain. If showing Gemini, verify an actual response says **Gemini**, not just that a key is configured. Verify Supabase sign-in only if you intend to demonstrate it. Avoid entering real health information or personal street addresses during a public demonstration.
